
export type Cell = 0 | 1 | 2; 
// 0 = vide, 1 = joueur humain, 2 = IA

export const ROWS = 6;
export const COLS = 7;
export const ALIGN = 4;

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

export function applyMove(board: Cell[][], col: number, player: Cell): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      board[row][col] = player;
      return row;
    }
  }
  throw new Error("Colonne pleine");
}

export function isBoardFull(board: Cell[][]): boolean {
  return board[0].every(cell => cell !== 0);
}

export function checkWin(board: Cell[][], player: Cell): boolean {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;

      for (const [dr, dc] of directions) {
        let count = 0;
        for (let i = 0; i < ALIGN; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (
            nr >= 0 && nr < ROWS &&
            nc >= 0 && nc < COLS &&
            board[nr][nc] === player
          ) count++;
        }
        if (count === ALIGN) return true;
      }
    }
  }
  return false;
}

