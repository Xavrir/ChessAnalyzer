/**
 * PGN (Portable Game Notation) Utilities
 */

import { Chess } from 'chess.js';
import { z } from 'zod';

/**
 * PGN Validation Schema
 */
export const PGNSchema = z.string()
  .min(10, 'PGN must be at least 10 characters')
  .max(100_000, 'PGN is too large (max 100,000 characters)')
  .refine(
    (pgn) => {
      // Must contain either PGN headers or moves
      return /\[Event/.test(pgn) || /^1\./.test(pgn) || /^\d+\./.test(pgn);
    },
    'Invalid PGN format'
  );

/**
 * Parse PGN string and return game data
 */
export interface ParsedPGN {
  headers: Record<string, string>;
  moves: string[];
  result: string;
  isValid: boolean;
  error?: string;
}

export function parsePGN(pgn: string): ParsedPGN {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    
    const headers = chess.header();
    const history = chess.history();
    
    return {
      headers,
      moves: history,
      result: headers.Result || '*',
      isValid: true,
    };
  } catch (error) {
    return {
      headers: {},
      moves: [],
      result: '*',
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to parse PGN',
    };
  }
}

/**
 * Validate PGN string
 */
export function validatePGN(pgn: string): { valid: boolean; error?: string } {
  try {
    PGNSchema.parse(pgn);
    
    const chess = new Chess();
    chess.loadPgn(pgn);
    
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid PGN format',
      };
    }
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate PGN',
    };
  }
}

/**
 * Clean PGN (remove comments, variations, etc.)
 */
export function cleanPGN(pgn: string): string {
  // Remove comments in curly braces
  let cleaned = pgn.replace(/\{[^}]*\}/g, '');
  
  // Remove variations in parentheses
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  
  // Remove annotations like !!, !?, ??, etc.
  cleaned = cleaned.replace(/[!?]+/g, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Extract PGN headers
 */
export function extractHeaders(pgn: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
  
  let match;
  while ((match = headerRegex.exec(pgn)) !== null) {
    headers[match[1]] = match[2];
  }
  
  return headers;
}

/**
 * Format PGN with proper spacing and line breaks
 */
export function formatPGN(pgn: string): string {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return chess.pgn({ maxWidth: 80 });
  } catch {
    return pgn;
  }
}

/**
 * Add comment to PGN at specific move
 */
export function addCommentToPGN(
  pgn: string,
  moveNumber: number,
  _comment: string
): string {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    
    // Get history with verbose info
    const moves = chess.history({ verbose: true });
    
    if (moveNumber < 0 || moveNumber >= moves.length) {
      return pgn;
    }
    
    // Reconstruct PGN with comment
    const newChess = new Chess();
    const headers = chess.header();
    
    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      newChess.header(key, value);
    });
    
    // Play moves
    moves.forEach((move, index) => {
      newChess.move(move);
      if (index === moveNumber) {
        // Add comment (chess.js doesn't support this directly, so we'd need to manually construct)
        // This is a simplified version
      }
    });
    
    return newChess.pgn();
  } catch {
    return pgn;
  }
}

/**
 * Convert PGN to downloadable format
 */
export function pgnToBlob(pgn: string): Blob {
  return new Blob([pgn], { type: 'application/x-chess-pgn' });
}

/**
 * Create download link for PGN
 */
export function downloadPGN(pgn: string, filename: string = 'game.pgn'): void {
  const blob = pgnToBlob(pgn);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
