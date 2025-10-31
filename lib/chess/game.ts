/**
 * Chess Game Utilities
 * Wrapper functions around chess.js for common operations
 */

import { Chess, Square, Move, PieceSymbol } from 'chess.js';

/**
 * Check if a move is legal
 */
export function isMoveLegal(chess: Chess, from: Square, to: Square): boolean {
  const moves = chess.moves({ square: from, verbose: true });
  return moves.some(move => move.to === to);
}

/**
 * Get all legal moves from a square
 */
export function getLegalMoves(chess: Chess, square: Square): Square[] {
  const moves = chess.moves({ square, verbose: true });
  return moves.map(move => move.to);
}

/**
 * Get piece color at a square
 */
export function getPieceColor(chess: Chess, square: Square): 'w' | 'b' | null {
  const piece = chess.get(square);
  return piece ? piece.color : null;
}

/**
 * Check if a square is under attack
 */
export function isSquareAttacked(chess: Chess, square: Square, by: 'w' | 'b'): boolean {
  return chess.isAttacked(square, by);
}

/**
 * Get all pieces of a specific color
 */
export function getPiecesByColor(chess: Chess, color: 'w' | 'b'): Array<{ square: Square; type: PieceSymbol }> {
  const board = chess.board();
  const pieces: Array<{ square: Square; type: PieceSymbol }> = [];
  
  board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      if (square && square.color === color) {
        const squareName = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` as Square;
        pieces.push({ square: squareName, type: square.type });
      }
    });
  });
  
  return pieces;
}

/**
 * Format move in algebraic notation
 */
export function formatMove(move: Move): string {
  return move.san || `${move.from}-${move.to}`;
}

/**
 * Get move number (1-indexed)
 */
export function getMoveNumber(moveIndex: number): number {
  return Math.floor(moveIndex / 2) + 1;
}

/**
 * Check if it's white's turn for this move
 */
export function isWhiteMove(moveIndex: number): boolean {
  return moveIndex % 2 === 0;
}

/**
 * Validate FEN string
 */
export function isValidFEN(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate PGN string
 */
export function isValidPGN(pgn: string): boolean {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract game info from PGN
 */
export function extractPGNHeaders(pgn: string): Record<string, string> {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return chess.header();
  } catch {
    return {};
  }
}

/**
 * Get game result as string
 */
export function getGameResult(chess: Chess): string {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? '0-1' : '1-0';
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return '1/2-1/2';
  }
  return '*';
}

/**
 * Get game status description
 */
export function getGameStatus(chess: Chess): string {
  if (chess.isCheckmate()) {
    return `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`;
  }
  if (chess.isStalemate()) {
    return 'Stalemate - Draw!';
  }
  if (chess.isThreefoldRepetition()) {
    return 'Draw by threefold repetition';
  }
  if (chess.isInsufficientMaterial()) {
    return 'Draw by insufficient material';
  }
  if (chess.isDraw()) {
    return 'Draw';
  }
  if (chess.isCheck()) {
    return `${chess.turn() === 'w' ? 'White' : 'Black'} is in check!`;
  }
  return `${chess.turn() === 'w' ? 'White' : 'Black'} to move`;
}
