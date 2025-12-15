import { pool } from "../db.ts";

export async function finishGame(
  gameId: number,
  winnerId: number | null,
  result: "win" | "loss" | "draw"
) {
  await pool.query(
    `UPDATE games SET status='finished', finished_at=NOW() WHERE id=$1`,
    [gameId]
  );

  await pool.query(
    `INSERT INTO game_results (game_id, winner_user_id, duration_seconds, moves_count, result)
     VALUES ($1, $2, 0, (SELECT COUNT(*) FROM game_moves WHERE game_id=$1), $3)`,
    [gameId, winnerId, result]
  );
}
