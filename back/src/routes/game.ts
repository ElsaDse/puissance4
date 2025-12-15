import type { FastifyPluginAsync } from 'fastify';
import { pool } from './../db.ts';


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

    fastify.get("/players", async (req, reply)=>{
        const game_id = Number((req.query as { game_id: string }).game_id);
        try{
            const res = await pool.query(
                `
                    SELECT 
                        games.mode, 
                        game_settings.starter_user_id,
                        users.id,
                        users.username,
                        CASE 
                            WHEN users.id = games.host_user_id THEN game_settings.player1_color
                            WHEN users.id = games.opponent_user_id THEN game_settings.player2_color
                        END AS color
                    FROM games 
                    JOIN game_settings  ON game_settings.game_id = games.id
                    JOIN users  ON users.id = games.host_user_id OR users.id = games.opponent_user_id
                    WHERE games.id = $1;
                `,
                [game_id]
            );
            if(res.rows.length===0){
                return reply.status(404).send({ error: "Partie non trouvé" });
            }
            const players=res.rows.map(row =>({
                id: row.id,
                name: row.username,
                color: row.color,
            }))
            const mode = res.rows[0].mode;
            const starter_user_id = res.rows[0].starter_user_id;
            
            return reply.send({ 
                players: players, 
                starterPlayer: starter_user_id,
                mode: mode 
            });
        } catch(err){
            console.error(err);
        }
    });

}