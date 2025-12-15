import { pool } from "./../db.ts";
import { createEmptyBoard, applyMove, checkWin, isBoardFull, type Cell } from "./gridServices.ts";
import { easyAI, mediumAI, hardAI } from "./iaServices.ts";
import { finishGame } from "./resultService.ts";

export async function evaluateGameState(
  board: Cell[][],
  gameId: number,
  humanId: number
) {
  if (checkWin(board, 1)) {
    await finishGame(gameId, humanId, "win");
    return { finished: true, result: "win" };
  }

  if (checkWin(board, 2)) {
    await finishGame(gameId, null, "loss");
    return { finished: true, result: "loss" };
  }

  if (isBoardFull(board)) {
    await finishGame(gameId, null, "draw");
    return { finished: true, result: "draw" };
  }

  return { finished: false };
}
