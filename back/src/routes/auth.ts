import type { FastifyPluginAsync } from 'fastify';
import { pool } from './../db.ts';


const authRoutes: FastifyPluginAsync = async (fastify) => {

    // Login ou création automatique
    fastify.post('/login', async (request, reply) => {
        console.log("BODY: ", request.body)
        const { username, password } = request.body as { username: string; password: string };
        try{
            const res = await pool.query(
                'SELECT * FROM users WHERE username=$1 AND password_hash=$2',
                [username, password]
            );

            if (res.rows.length <= 0) {
                try{
                    //créer un utilisateur
                    const createRes = await pool.query(
                        'INSERT INTO users(username, password_hash) VALUES($1, $2) RETURNING id, username, is_guest',
                        [username, password ]
                    );
                    return { user: createRes.rows[0] };
                } catch(err){
                    console.log(err)
                }
            }
            return { user: res.rows[0] };
        } catch(err){
            console.error(err)
        }
    });

    // Guest login
    fastify.post('/guest', async (request, reply) => {
        try{
            const username = `guest_${Math.floor(Math.random() * 10000)}`;
            const res = await pool.query(
                'INSERT INTO users(username, is_guest) VALUES($1, TRUE) RETURNING id, username, is_guest',
                [username]
            );
            return { user: res.rows[0] };
        } catch(err){
            console.error(err)
        }
    });
};

export default authRoutes;
