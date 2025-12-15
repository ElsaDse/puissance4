
import { type Cell, isBoardFull, applyMove, checkWin } from "./gridServices.ts";

// Types pour minimax
interface MoveScore {
  column: number;
  score: number;
}

// ==================== EASY ====================
export function easyAI(board: Cell[][]): number {
  const validCols = getValidColumns(board);
  // 70% coup aléatoire, 30% coup gagnant si possible
  if (Math.random() < 0.3) {
    for (const col of validCols) {
      const copy = deepCopy(board);
      applyMove(copy, col, 2);
      if (checkWin(copy, 2)) return col;
    }
  }
  return validCols[Math.floor(Math.random() * validCols.length)];
}

// ==================== MEDIUM ====================
export function mediumAI(board: Cell[][]): number {
  const validCols = getValidColumns(board);

  // 1. Victoire immédiate
  for (const col of validCols) {
    const copy = deepCopy(board);
    applyMove(copy, col, 2);
    if (checkWin(copy, 2)) return col;
  }

  // 2. Bloquer victoire immédiate de l'adversaire
  for (const col of validCols) {
    const copy = deepCopy(board);
    applyMove(copy, col, 1);
    if (checkWin(copy, 1)) return col;
  }

  // 3. Préférer le centre (meilleur contrôle)
  const centerCols = [3, 2, 4, 1, 5, 0, 6];
  for (const col of centerCols) {
    if (validCols.includes(col)) return col;
  }

  return validCols[0];
}

// ==================== HARD (Minimax + Alpha-Beta) ====================
export function hardAI(board: Cell[][]): number {
  const validCols = getValidColumns(board);
  if (validCols.length === 0) throw new Error("Aucun coup possible");

  let bestCol = validCols[0];
  let bestScore = -Infinity;

  // Ordre des colonnes : centre d'abord pour meilleur pruning
  const orderedCols = [3, 2, 4, 1, 5, 0, 6].filter(c => validCols.includes(c));

  for (const col of orderedCols) {
    const copy = deepCopy(board);
    applyMove(copy, col, 2);
    const score = minimaxAlphaBeta(copy, 8, -Infinity, Infinity, false); // profondeur 8-9
    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
}

// Minimax avec Alpha-Beta Pruning + retour de colonne
function minimaxAlphaBeta(
  board: Cell[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): number {
  if (depth === 0 || isBoardFull(board)) return evaluateBoard(board);
  if (checkWin(board, 2)) return 1000 + depth;     // IA gagne → meilleur score plus tôt
  if (checkWin(board, 1)) return -1000 - depth;    // Humain gagne → pire score

  const validCols = getValidColumns(board);

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const col of validCols) {
      const copy = deepCopy(board);
      applyMove(copy, col, 2);
      const evalScore = minimaxAlphaBeta(copy, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // β-cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of validCols) {
      const copy = deepCopy(board);
      applyMove(copy, col, 1);
      const evalScore = minimaxAlphaBeta(copy, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // α-cutoff
    }
    return minEval;
  }
}

// ==================== HEURISTIQUE SIMPLE MAIS EFFICACE ====================
function evaluateBoard(board: Cell[][]): number {
  let score = 0;

  // Bonus pour les cases centrales
  const centerCol = 3;
  for (let row = 0; row < 6; row++) {
    if (board[row][centerCol] === 2) score += 3;
    if (board[row][centerCol] === 1) score -= 2;
  }

  // Bonus pour alignements potentiels (simplifié)
  score += countPotentialAlignments(board, 2) * 10;
  score -= countPotentialAlignments(board, 1) * 10;

  return score;
}

function countPotentialAlignments(board: Cell[][], player: Cell): number {
  let count = 0;
  // Horizontal, vertical, diagonales
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of directions) {
        let streak = 0;
        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 6 && nc < 7 && nc >= 0 && board[nr][nc] === player) {
            streak++;
          }
        }
        if (streak >= 2) count += streak;
      }
    }
  }
  return count;
}

// ==================== UTILITAIRES ====================
function getValidColumns(board: Cell[][]): number[] {
  return board[0]
    .map((cell, col) => (cell === 0 ? col : -1))
    .filter(col => col !== -1);
}

function deepCopy(board: Cell[][]): Cell[][] {
  return board.map(row => [...row]);
}