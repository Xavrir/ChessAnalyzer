/**
 * Enhanced Mock Stockfish Engine
 * 
 * Provides realistic chess analysis without real WASM integration.
 * Uses chess.js to evaluate positions heuristically.
 * 
 * This mock is designed to demonstrate all analysis features with
 * realistic-looking evaluations and best moves.
 */

import { Chess, Square } from 'chess.js';

/**
 * Simple position evaluation function
 * Returns evaluation in centipawns (positive = white advantage)
 */
export function evaluatePosition(fen: string): number {
  const game = new Chess(fen);
  
  // Material evaluation
  const pieceValues: { [key: string]: number } = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 0
  };
  
  let score = 0;
  const board = game.board();
  
  // Count material
  for (const row of board) {
    for (const square of row) {
      if (square) {
        const value = pieceValues[square.type.toLowerCase()] || 0;
        score += square.color === 'w' ? value : -value;
      }
    }
  }
  
  // Add position bonuses
  // Center control bonus
  const centerSquares = ['e4', 'd4', 'e5', 'd5'];
  for (const sq of centerSquares) {
    const piece = game.get(sq as Square);
    if (piece) {
      const bonus = 10;
      score += piece.color === 'w' ? bonus : -bonus;
    }
  }
  
  // Mobility bonus (number of legal moves)
  const whiteMoves = game.moves().length;
  game.load(fen); // Reset
  const blackTurn = fen.split(' ')[1] === 'b';
  
  if (!blackTurn) {
    score += whiteMoves * 2; // White to move, their mobility
  } else {
    score -= whiteMoves * 2; // Black to move, their mobility
  }
  
  // Check for check/checkmate
  if (game.isCheckmate()) {
    return blackTurn ? 10000 : -10000; // Mate score
  }
  if (game.isCheck()) {
    score += blackTurn ? 20 : -20;
  }
  
  // Add some realistic variation
  score += Math.floor((Math.random() - 0.5) * 20);
  
  return score;
}

/**
 * Find the best move using minimax-like heuristic
 */
export function findBestMove(fen: string): string {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });
  
  if (moves.length === 0) return 'e2e4'; // Fallback
  
  let bestMove = moves[0];
  let bestEval = -Infinity;
  const isWhite = game.turn() === 'w';
  
  // Evaluate each move
  for (const move of moves) {
    game.load(fen);
    game.move(move);
    
    const eval_ = evaluatePosition(game.fen());
    const adjustedEval = isWhite ? eval_ : -eval_;
    
    // Prefer captures
    let bonus = 0;
    if (move.captured) {
      const captureValues: { [key: string]: number } = {
        'p': 100, 'n': 300, 'b': 300, 'r': 500, 'q': 900
      };
      bonus = captureValues[move.captured] || 0;
    }
    
    // Prefer checks
    game.load(fen);
    game.move(move);
    if (game.isCheck()) bonus += 50;
    
    const totalEval = adjustedEval + bonus;
    
    if (totalEval > bestEval) {
      bestEval = totalEval;
      bestMove = move;
    }
  }
  
  return bestMove.from + bestMove.to + (bestMove.promotion || '');
}

/**
 * Generate realistic principal variation
 */
export function generatePV(fen: string, depth: number = 5): string {
  const moves: string[] = [];
  const game = new Chess(fen);
  
  for (let i = 0; i < Math.min(depth, 10); i++) {
    if (game.isGameOver()) break;
    
    const bestMove = findBestMove(game.fen());
    const moveObj = game.moves({ verbose: true }).find(
      m => (m.from + m.to + (m.promotion || '')) === bestMove
    );
    
    if (!moveObj) break;
    
    moves.push(bestMove);
    game.move(moveObj);
  }
  
  return moves.join(' ');
}
