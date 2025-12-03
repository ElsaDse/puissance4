import { pool } from './db.ts';

async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Connexion réussie ! Heure serveur :', res.rows[0]);
    } catch (err) {
        console.error('❌ Erreur de connexion :', err);
    } finally {
        await pool.end();
    }
}

testConnection();

//console.log("Elsa fileURLToPath")
