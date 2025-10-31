/**
 * FEN (Forsyth-Edwards Notation) Utilities
 */

import { Chess } from 'chess.js';
import { z } from 'zod';

/**
 * FEN Validation Schema
 */
export const FENSchema = z.string()
  .regex(
    /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s(-|[KQkq]{1,4})\s(-|[a-h][36])\s\d+\s\d+$/,
    'Invalid FEN format'
  );

/**
 * Standard starting position FEN
 */
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/**
 * Validate FEN string
 */
export function validateFEN(fen: string): { valid: boolean; error?: string } {
  try {
    FENSchema.parse(fen);
    new Chess(fen);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid FEN format',
      };
    }
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate FEN',
    };
  }
}

/**
 * Parse FEN into components
 */
export interface ParsedFEN {
  piecePlacement: string;
  activeColor: 'w' | 'b';
  castling: string;
  enPassant: string;
  halfmove: number;
  fullmove: number;
}

export function parseFEN(fen: string): ParsedFEN | null {
  try {
    const parts = fen.split(' ');
    
    if (parts.length !== 6) {
      return null;
    }
    
    return {
      piecePlacement: parts[0],
      activeColor: parts[1] as 'w' | 'b',
      castling: parts[2],
      enPassant: parts[3],
      halfmove: parseInt(parts[4], 10),
      fullmove: parseInt(parts[5], 10),
    };
  } catch {
    return null;
  }
}

/**
 * Get only the board position from FEN (first component)
 */
export function getBoardFromFEN(fen: string): string {
  return fen.split(' ')[0];
}

/**
 * Get active color from FEN
 */
export function getActiveColorFromFEN(fen: string): 'w' | 'b' {
  const parts = fen.split(' ');
  return (parts[1] === 'b' ? 'b' : 'w') as 'w' | 'b';
}

/**
 * Check if FEN represents starting position
 */
export function isStartingPosition(fen: string): boolean {
  return getBoardFromFEN(fen) === getBoardFromFEN(STARTING_FEN);
}

/**
 * Compare two FENs (ignoring move counters)
 */
export function areFENsEqual(fen1: string, fen2: string, ignoreCounters: boolean = true): boolean {
  if (!ignoreCounters) {
    return fen1 === fen2;
  }
  
  const parts1 = fen1.split(' ');
  const parts2 = fen2.split(' ');
  
  // Compare first 4 components (position, color, castling, en passant)
  return parts1.slice(0, 4).join(' ') === parts2.slice(0, 4).join(' ');
}

/**
 * Create FEN from components
 */
export function createFEN(components: ParsedFEN): string {
  return [
    components.piecePlacement,
    components.activeColor,
    components.castling,
    components.enPassant,
    components.halfmove.toString(),
    components.fullmove.toString(),
  ].join(' ');
}

/**
 * Get FEN after making a move (without modifying original chess instance)
 */
export function getFENAfterMove(fen: string, from: string, to: string): string | null {
  try {
    const chess = new Chess(fen);
    chess.move({ from, to });
    return chess.fen();
  } catch {
    return null;
  }
}

/**
 * Count pieces in FEN
 */
export function countPieces(fen: string): {
  white: number;
  black: number;
  total: number;
} {
  const board = getBoardFromFEN(fen);
  let white = 0;
  let black = 0;
  
  for (const char of board) {
    if (/[RNBQKP]/.test(char)) {
      white++;
    } else if (/[rnbqkp]/.test(char)) {
      black++;
    }
  }
  
  return {
    white,
    black,
    total: white + black,
  };
}

/**
 * Check if position is likely drawn by insufficient material
 */
export function hasInsufficientMaterial(fen: string): boolean {
  try {
    const chess = new Chess(fen);
    return chess.isInsufficientMaterial();
  } catch {
    return false;
  }
}

/**
 * Get material count from FEN
 */
export interface MaterialCount {
  white: {
    pawns: number;
    knights: number;
    bishops: number;
    rooks: number;
    queens: number;
  };
  black: {
    pawns: number;
    knights: number;
    bishops: number;
    rooks: number;
    queens: number;
  };
}

export function getMaterialCount(fen: string): MaterialCount {
  const board = getBoardFromFEN(fen);
  
  const count: MaterialCount = {
    white: { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 },
    black: { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 },
  };
  
  for (const char of board) {
    switch (char) {
      case 'P': count.white.pawns++; break;
      case 'N': count.white.knights++; break;
      case 'B': count.white.bishops++; break;
      case 'R': count.white.rooks++; break;
      case 'Q': count.white.queens++; break;
      case 'p': count.black.pawns++; break;
      case 'n': count.black.knights++; break;
      case 'b': count.black.bishops++; break;
      case 'r': count.black.rooks++; break;
      case 'q': count.black.queens++; break;
    }
  }
  
  return count;
}
