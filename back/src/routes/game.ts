import type { FastifyPluginAsync } from 'fastify';
import { pool } from './../db.ts';
import { evaluateGameState } from '../services/gameServices.ts';
import { applyMove, type Cell, createEmptyBoard } from '../services/gridServices.ts';
import { easyAI, hardAI, mediumAI } from '../services/iaServices.ts';


export const gameRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post("/create", async (req, reply) => {
        console.log("BODY: ", req.body)
        const { host_user_id, color, opponent_color } = req.body as {host_user_id: number, color: string, opponent_color:string};
        try{
            const result = await pool.query(`INSERT INTO games(host_user_id, mode, status) VALUES ($1, 'pvp','waiting') RETURNING id`,
                [host_user_id]
            );
            const gameId = result.rows[0].id;
            const res= await pool.query(`INSERT INTO game_settings(game_id, player1_color, player2_color)VALUES ($1,$2, $3)`,
                [gameId, color, opponent_color]
            );
            return{game: {id:gameId, }}
        } catch(err) {
            console.error(err)
        }
    });

    fastify.put("/join", async (req, reply) => {
        const { game_id, oponent_user_id } = req.body as {game_id:number, oponent_user_id: number};
        try{
            const hostRes = await pool.query("SELECT host_user_id FROM games WHERE id=$1 AND status='waiting'",
                [game_id]
            );
            if(hostRes.rows.length===0){
                return reply.status(404).send({ error: "Partie introuvable ou déjà commencée" });
            }

            const host_user_id= hostRes.rows[0].host_user_id
            const starterUserId = Math.random() < 0.5 ? host_user_id : oponent_user_id;

            await pool.query(`UPDATE games
                SET opponent_user_id = $1, status='in_progress'
                WHERE id=$2 `,
                [oponent_user_id, game_id]
            );
            await pool.query(`UPDATE game_settings
                SET starter_user_id = $1
                WHERE game_id=$2 `,
                [starterUserId, game_id]
            );
            return{currentPlayer: starterUserId}
        } catch(err) {
            console.error(err)
        }
    });

    
    fastify.get("/state", async (req, reply) => {
        const gameId = Number((req.query as { game_id: string }).game_id);

        const gameRes = await pool.query(`
            SELECT 
            g.mode,
            g.difficulty,
            g.host_user_id,
            g.opponent_user_id,
            g.status,
            gs.starter_user_id,
            gs.player1_color,
            gs.player2_color
            FROM games g
            JOIN game_settings gs ON gs.game_id = g.id
            WHERE g.id = $1
        `, [gameId]);

        if (gameRes.rows.length === 0) {
            return reply.status(404).send({ error: "Game not found" });
        }

        const game = gameRes.rows[0];

        /*  Si sauvegardée → reprendre */
        if (game.status === "saved") {
            await pool.query(
                `UPDATE games SET status='in_progress' WHERE id=$1`,
                [gameId]
            );
        }

        // HOST
        const hostRes = await pool.query(
            `SELECT id, username FROM users WHERE id = $1`,
            [game.host_user_id]
        );

        const players = [
            {
            id: hostRes.rows[0].id,
            name: hostRes.rows[0].username,
            color: game.player1_color,
            }
        ];

        //  IA
        if (game.mode === "ia") {
            players.push({
            id: -1,
            name: "Ordinateur",
            color: game.player2_color,
            });
        }

        //  PVP
        if (game.mode === "pvp" && game.opponent_user_id) {
            const oppRes = await pool.query(
            `SELECT id, username FROM users WHERE id = $1`,
            [game.opponent_user_id]
            );

            players.push({
            id: oppRes.rows[0].id,
            name: oppRes.rows[0].username,
            color: game.player2_color,
            });
        }

         /* Coups */
        const movesRes = await pool.query(
            `
            SELECT user_id, col_index, row_index
            FROM game_moves
            WHERE game_id=$1
            ORDER BY id ASC
            `,
            [gameId]
        );

        if(movesRes.rows.length>0){
            

            /*  Reconstruct grid */
            const grid = Array.from({ length: 6 }, () => Array(7).fill("E"));

            movesRes.rows.forEach((move) => {
                const playerId= move.user_id===null?-1:move.user_id
                const player = players.find(p => p.id === playerId);
                if (player) {
                grid[move.row_index][move.col_index] = player.color;
                }
            });

            /*  Qui doit jouer ? */
            let currentPlayer;
            if (movesRes.rows.length === 0) {
                currentPlayer = game.starter_user_id ?? -1;
            } else {
                const lastMove = movesRes.rows[movesRes.rows.length - 1];
                currentPlayer =
                lastMove.user_id === players[0].id
                    ? players[1].id
                    : players[0].id;
            }


            return reply.send({
                gameId,
                mode: game.mode,
                difficulty: game.difficulty,
                players:players,
                grid:grid,
                currentPlayer:currentPlayer
            });

        }

        return reply.send({
            gameId,
            mode: game.mode,
            starterPlayer: game.starter_user_id===null? -1: game.starter_user_id,
            players: players
        });
    });


    fastify.post("/create/ia", async (req, reply) => {
        const { userId, difficulty, color } = req.body as {
            userId: number;
            difficulty: "easy" | "medium" | "hard";
            color: 'R'|'Y'
        };

         /* Chercher une partie sauvegardée */
        const savedGame = await pool.query(
            `
            SELECT id
            FROM games
            WHERE host_user_id=$1 AND mode='ia' AND difficulty=$2 AND status='saved'
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [userId, difficulty]
        );

        if (savedGame.rows.length > 0) {
            return reply.send({
            id: savedGame.rows[0].id,
            resumed: true
            });
        }

        // Créer la partie
        const gameRes = await pool.query(
            `INSERT INTO games (
            host_user_id,
            mode,
            difficulty,
            status
            )
            VALUES ($1, 'ia', $2, 'in_progress')
            RETURNING id, created_at`,
            [userId, difficulty]
        );

        const gameId = gameRes.rows[0].id;

        // Choisir qui commence (50/50)
        const starterUserId = Math.random() < 0.5 ? userId :null;
        let iaColor: string= ''
        if(color=== 'R') iaColor='Y'
        else if(color=== 'Y') iaColor='R'
        // Game settings
        await pool.query(
            `INSERT INTO game_settings (
            game_id,
            starter_user_id,
            player1_color,
            player2_color
            )
            VALUES ($1, $2, $3, $4)`,
            [gameId, starterUserId, color, iaColor]
        );

        return reply.send({
            id: gameId,
            starterUserId: starterUserId===null? -1: starterUserId,
            difficulty: difficulty
        });
    });

    fastify.post("/play/ia", async (req, reply) => {
        const { gameId, userId } = req.body as {
            gameId: number;
            userId: number;
        };

         const moves = await pool.query(
            `SELECT * FROM game_moves WHERE game_id=$1 ORDER BY move_number ASC`,
            [gameId]
        );

        //reconstruire la grille
        const board = createEmptyBoard();
        for (const move of moves.rows) {
            const player: Cell = move.user_id===null ? 2 : 1;
            //board[move.row_index][move.col_index]= player 
            applyMove(board, move.col_index, player);
        }

        //charger la partie
        const game = await pool.query(`SELECT difficulty FROM games WHERE id=$1`, [gameId]);
        const difficulty = game.rows[0].difficulty;

        //coup ia
        let colIa: number;
        if (difficulty === "easy") colIa = easyAI(board);
        else if (difficulty === "medium") colIa = mediumAI(board);
        else colIa = hardAI(board);

        const rowIa = applyMove(board, colIa, 2);
        //board[rowIa][colIa] = 2;

        await pool.query(
            `INSERT INTO game_moves (game_id, user_id, col_index, row_index)
            VALUES ($1, NULL, $2, $3)`,
            [gameId, colIa, rowIa]
        );

        // Vérifier victoire IA / draw
        const aiState = await evaluateGameState(board, gameId, userId);

        // Récupérer les infos de la partie + settings
        const gameQuery = await pool.query(
            `SELECT gs.player1_color, gs.player2_color
            FROM game_settings gs 
            WHERE gs.game_id = $1`,
            [gameId]
        );

        const grid = board.map(row =>
            row.map(cell => {
                if (cell === 0) return 'E';
                if (cell === 1) return gameQuery.rows[0].player1_color;
                if (cell === 2) return gameQuery.rows[0].player2_color; 
                return 'E';
            })
        );
        if (aiState.finished) {
            return reply.send({
                grid: grid,
                finished: true,
                result: aiState.result
            });
        }

        // Partie continue
        return reply.send({
            grid: grid,
            x: colIa,
            y: rowIa,
            finished: false,
        });

    });

    fastify.post("/move", async (req, reply) => {
        const { gameId, userId, col, row } = req.body as {
            gameId: number;
            userId: number;
            col: number;
            row: number;
        };

        try{

            const gameRes = await pool.query(
                `SELECT status FROM games WHERE id=$1`,
                [gameId]
            );

            if (gameRes.rowCount === 0) {
                return reply.status(404).send({ error: "Game not found" });
            }

            if (gameRes.rows[0].status !== "in_progress") {
                return reply.status(400).send({ error: "Game not active" });
            }

            await pool.query(
                `INSERT INTO game_moves (game_id, user_id, col_index, row_index)
                VALUES ($1, $2, $3, $4)`,
                [gameId, userId, col, row]
            );
        } catch(err){
            console.error(err)
        } 

        return reply.send({message: "insertion ok"})
    });

    fastify.post("/game_over", async (req, reply) => {
        const {gameId, winnerUserId, durationSeconds, isDraw} = req.body as {
            gameId: number;
            winnerUserId: number | null;
            durationSeconds: number;
            isDraw: boolean;
        };

        try {

            // Vérifier l'état actuel de la partie
            const gameRes = await pool.query(
                `SELECT status, host_user_id, opponent_user_id 
                FROM games 
                WHERE id = $1`,
                [gameId]
            );
            if (gameRes.rowCount === 0) return;
            const game = gameRes.rows[0];
            if (game.status !== 'in_progress' && game.status !== 'waiting') {
                console.log("Partie déjà terminée ou invalide");
                return;
            }

            //  Compter les coups
            const movesRes = await pool.query(
            `SELECT COUNT(*) FROM game_moves WHERE game_id=$1`,
            [gameId]
            );

            const movesCount = Number(movesRes.rows[0].count);

            //  Mettre à jour la partie
            await pool.query(
                `
                UPDATE games
                SET status='finished',
                    finished_at=NOW()
                WHERE id=$1
                `,
                [gameId]
            );

            //  Résultat
            let result: string;
            let winner_user_id: number | null = winnerUserId;
            if (isDraw) {
                result = 'draw';
                winner_user_id = game.host_user_id;
            } else if (winnerUserId === game.host_user_id) {
                result = 'win';
            }else{
                result='loss'
                winner_user_id = game.host_user_id;
            }
            //  Insérer le résultat
            await pool.query(
                `
                INSERT INTO game_results (
                    game_id,
                    winner_user_id,
                    duration_seconds,
                    moves_count,
                    result
                )
                VALUES ($1, $2, $3, $4, $5)
                `,
                [gameId, winner_user_id, durationSeconds, movesCount, result]
            );

            return reply.send({ success: true });

        } catch (err) {
            console.error(err);
        }
    });

    fastify.post("/save", async (req, reply) => {
        const { gameId } = req.body as { gameId: number };

        // Vérifier la game
        const game = await pool.query(
            `SELECT status FROM games WHERE id=$1`,
            [gameId]
        );

        if (game.rowCount === 0) {
            return reply.code(404).send({ error: "Game not found" });
        }

        if (game.rows[0].status === "finished") {
            return reply.code(400).send({ error: "Impossible de sauvegarder une partie terminée" });
        }

        // Sauvegarde
        await pool.query(
            `UPDATE games
            SET status = 'saved'
            WHERE id = $1`,
            [gameId]
        );

        return reply.send({ success: true });
    });

    fastify.get("/stats", async (_req, reply) => {
        const res = await pool.query(`
            SELECT
            u.username,
            COUNT(gr.id)::int AS games,
            COUNT(CASE WHEN gr.winner_user_id = u.id THEN 1 END)::int AS wins,
            COALESCE(AVG(gr.duration_seconds), 0)::int AS avg_time
            FROM users u
            JOIN games g ON g.host_user_id = u.id
            JOIN game_results gr ON gr.game_id = g.id
            GROUP BY u.id, u.username
            ORDER BY wins DESC
        `);

        const stats = res.rows.map(row => ({
            username: row.username,
            games: row.games,
            wins: row.wins,
            avgTime: formatSeconds(row.avg_time)
        }));

        return reply.send(stats);
    });

    fastify.post("/delete", async (req, reply) => {
        const { gameId } = req.body as { gameId: number };

        try {
            await pool.query(`DELETE FROM games WHERE id = $1`, [gameId]);
            return reply.send({ success: true });
        } catch (error) {
            console.error("Erreur suppression :", error);
            return reply.status(500).send({ error: "Impossible de supprimer la partie" });
        }
    });



}


/* util */
function formatSeconds(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}