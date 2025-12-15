import { Server } from "socket.io";
import { pool } from "../db.ts";

// Gestion des rooms en mémoire
type Room = {
  hostId: string;
  opponentId?: string;
  currentPlayerId?: string;
}

//
const rooms: Record<number, Room> = {};

//Initialise les WebSockets pour le jeu
export function initGameSockets(io: Server) {
    io.on("connection", (socket) => {
        console.log("Client WS connecté:", socket.id);

        // Hôte rejoint la room
        socket.on("host_join_room",( gameId: number) => {
            rooms[gameId] = { hostId: socket.id };
            socket.join(`game_${gameId}`);
            console.log(`Hôte ${socket.id} dans la room ${gameId}`);
        });

        // Adversaire rejoint la room
        socket.on("opponent_join_room", ({gameId}: { gameId: number }) => {
            if (!rooms[gameId]) return;
            rooms[gameId].opponentId = socket.id;
            socket.join(`game_${gameId}`);
            console.log(`Adversaire ${socket.id} rejoint ${gameId}`);

            // prévenir l’hôte que l’adversaire est là
            io.to(rooms[gameId].hostId).emit("player_joined");
        });

        // Ecoute l'évènement drop_token
        socket.on("drop_token", async ({ gameId, x, y, player_id }) => {
            try {
                //  Insère le move en BDD
                const query = `
                    INSERT INTO game_moves (game_id, user_id, col_index, row_index)
                    VALUES ($1, $2, $3, $4)
                    RETURNING move_number
                `;
                const res= await pool.query(query, [gameId, player_id, x, y]);
                if(res.rows.length===0) throw new Error('Insertion échouée: Partie ou joueur invalid?')

                socket.to(`game_${gameId}`).emit("play_move", { x, y, player_id});
            } catch (err) {
                console.error("Erreur enregistrement move :", err);
            }
            
        });

        //Ecoute la victoire
        socket.on("game_over", async({gameId, winnerId, durationSeconds, isDraw})=>{
            try{
                // 1. Vérifier l'état actuel de la partie
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

                // Compter le nombre de coups
                const movesRes = await pool.query(
                    `SELECT COUNT(*) AS count FROM game_moves WHERE game_id = $1`,
                    [gameId]
                );
                const movesCount = parseInt(movesRes.rows[0].count, 10);

                //maj la table games
                await pool.query(`UPDATE games 
                    SET status = 'finished', 
                    finished_at = NOW()
                    WHERE id = $1`,
                    [gameId]
                );

                //insérer dans games_results
                let result: string;
                let winner_user_id: number | null = winnerId;
                if (isDraw) {
                    result = 'draw';
                    winner_user_id = game.host_user_id;
                } else if (winnerId === game.host_user_id) {
                    result = 'win';
                }else{
                    result='loss'
                }
                await pool.query(
                    `INSERT INTO game_results 
                        (game_id, winner_user_id, duration_seconds, moves_count, result)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [gameId, winner_user_id, durationSeconds, movesCount, result]
                );
            } catch (err){
                console.error("Erreur lors de la fin de partie :", err);
            }
        });
    

        socket.on("disconnect", () => {
            console.log("Client WS déconnecté:", socket.id);
        });
    });
}
