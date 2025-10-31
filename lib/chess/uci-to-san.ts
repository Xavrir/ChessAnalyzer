/**
 * UCI to SAN Converter
 * Converts UCI notation (e.g., "e2e4") to Standard Algebraic Notation (e.g., "e4")
 */

import { Chess, Square } from 'chess.js';

/**
 * Convert a UCI move to SAN notation
 * 
 * @param fen - The FEN position before the move
 * @param uciMove - The move in UCI format (e.g., "e2e4", "e7e8q")
 * @returns The move in SAN format (e.g., "e4", "e8=Q") or the UCI move if conversion fails
 * 
 * @example
 * uciToSan("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "e2e4") // "e4"
 * uciToSan("r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "e1g1") // "O-O"
 */
export function uciToSan(fen: string, uciMove: string): string {
  if (!uciMove || uciMove.length < 4) {
    return uciMove;
  }

  try {
    const chess = new Chess(fen);
    
    // Extract from and to squares
    const from = uciMove.substring(0, 2) as Square;
    const to = uciMove.substring(2, 4) as Square;
    
    // Extract promotion piece if present
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
    
    // Make the move
    const move = chess.move({
      from,
      to,
      promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    });
    
    if (move) {
      return move.san;
    }
    
    // If move failed, return original UCI
    return uciMove.toUpperCase();
  } catch (error) {
    // If conversion fails, return UCI in uppercase
    console.warn(`Failed to convert UCI "${uciMove}" to SAN:`, error);
    return uciMove.toUpperCase();
  }
}

/**
 * Convert multiple UCI moves to SAN notation
 * 
 * @param fen - The starting FEN position
 * @param uciMoves - Array of UCI moves
 * @returns Array of SAN moves
 */
export function uciMovesToSan(fen: string, uciMoves: string[]): string[] {
  const sanMoves: string[] = [];
  let currentFen = fen;
  
  for (const uciMove of uciMoves) {
    const san = uciToSan(currentFen, uciMove);
    sanMoves.push(san);
    
    // Update FEN for next move
    try {
      const chess = new Chess(currentFen);
      const from = uciMove.substring(0, 2) as Square;
      const to = uciMove.substring(2, 4) as Square;
      const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
      
      chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });
      
      currentFen = chess.fen();
    } catch (error) {
      // If move fails, keep current FEN
      console.warn(`Failed to apply UCI "${uciMove}":`, error);
    }
  }
  
  return sanMoves;
}

/**
 * Format a SAN move with move number for display
 * 
 * @param san - The move in SAN format
 * @param moveNumber - The move number (full move, not half move)
 * @param isWhite - Whether it's white's move
 * @returns Formatted move string (e.g., "1. e4" or "1... e5")
 */
export function formatMoveWithNumber(san: string, moveNumber: number, isWhite: boolean): string {
  if (isWhite) {
    return `${moveNumber}. ${san}`;
  } else {
    return `${moveNumber}... ${san}`;
  }
}

/**
 * Format an array of SAN moves with move numbers
 * 
 * @param sanMoves - Array of SAN moves
 * @param startMoveNumber - Starting move number (default 1)
 * @returns Formatted string of moves (e.g., "1. e4 e5 2. Nf3 Nc6")
 */
export function formatMovesWithNumbers(sanMoves: string[], startMoveNumber: number = 1): string {
  const parts: string[] = [];
  
  for (let i = 0; i < sanMoves.length; i++) {
    const moveNumber = startMoveNumber + Math.floor(i / 2);
    const isWhite = i % 2 === 0;
    
    if (isWhite) {
      parts.push(`${moveNumber}. ${sanMoves[i]}`);
    } else {
      // Add black's move without the move number prefix
      parts.push(sanMoves[i]);
    }
  }
  
  return parts.join(' ');
}
