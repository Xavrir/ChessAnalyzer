/**
 * Chess Opening Database
 * 
 * Detects chess openings based on move sequences.
 * Uses a comprehensive database of common openings with ECO codes.
 */

export interface OpeningInfo {
  eco: string;        // ECO code (A00-E99)
  name: string;       // Opening name
  variation?: string; // Variation name (if applicable)
  moves: string;      // Move sequence in SAN notation
}

/**
 * Opening database organized by move sequences
 * Format: "moves" -> OpeningInfo
 */
const OPENINGS_DATABASE: Record<string, OpeningInfo> = {
  // King's Pawn Openings (C00-C99, B00-B99)
  "1.e4": {
    eco: "B00",
    name: "King's Pawn Opening",
    moves: "1.e4"
  },
  "1.e4 e5": {
    eco: "C20",
    name: "King's Pawn Game",
    moves: "1.e4 e5"
  },
  "1.e4 e5 2.Nf3": {
    eco: "C40",
    name: "King's Knight Opening",
    moves: "1.e4 e5 2.Nf3"
  },
  "1.e4 e5 2.Nf3 Nc6": {
    eco: "C44",
    name: "King's Pawn Game",
    moves: "1.e4 e5 2.Nf3 Nc6"
  },
  "1.e4 e5 2.Nf3 Nc6 3.Bb5": {
    eco: "C60",
    name: "Ruy Lopez",
    variation: "Spanish Opening",
    moves: "1.e4 e5 2.Nf3 Nc6 3.Bb5"
  },
  "1.e4 e5 2.Nf3 Nc6 3.Bc4": {
    eco: "C50",
    name: "Italian Game",
    moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4"
  },
  "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5": {
    eco: "C50",
    name: "Italian Game",
    variation: "Giuoco Piano",
    moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5"
  },
  "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6": {
    eco: "C55",
    name: "Italian Game",
    variation: "Two Knights Defense",
    moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6"
  },
  "1.e4 e5 2.Nf3 Nf6": {
    eco: "C42",
    name: "Petrov's Defense",
    variation: "Russian Game",
    moves: "1.e4 e5 2.Nf3 Nf6"
  },
  "1.e4 c5": {
    eco: "B20",
    name: "Sicilian Defense",
    moves: "1.e4 c5"
  },
  "1.e4 c5 2.Nf3": {
    eco: "B20",
    name: "Sicilian Defense",
    moves: "1.e4 c5 2.Nf3"
  },
  "1.e4 c5 2.Nf3 d6": {
    eco: "B50",
    name: "Sicilian Defense",
    moves: "1.e4 c5 2.Nf3 d6"
  },
  "1.e4 c5 2.Nf3 Nc6": {
    eco: "B30",
    name: "Sicilian Defense",
    variation: "Old Sicilian",
    moves: "1.e4 c5 2.Nf3 Nc6"
  },
  "1.e4 c5 2.Nf3 e6": {
    eco: "B40",
    name: "Sicilian Defense",
    variation: "French Variation",
    moves: "1.e4 c5 2.Nf3 e6"
  },
  "1.e4 c6": {
    eco: "B10",
    name: "Caro-Kann Defense",
    moves: "1.e4 c6"
  },
  "1.e4 e6": {
    eco: "C00",
    name: "French Defense",
    moves: "1.e4 e6"
  },
  "1.e4 d5": {
    eco: "B01",
    name: "Scandinavian Defense",
    variation: "Center Counter",
    moves: "1.e4 d5"
  },
  "1.e4 Nf6": {
    eco: "B00",
    name: "Alekhine's Defense",
    moves: "1.e4 Nf6"
  },
  
  // Queen's Pawn Openings (D00-D99, A40-A99)
  "1.d4": {
    eco: "A40",
    name: "Queen's Pawn Opening",
    moves: "1.d4"
  },
  "1.d4 d5": {
    eco: "D00",
    name: "Queen's Pawn Game",
    moves: "1.d4 d5"
  },
  "1.d4 d5 2.c4": {
    eco: "D06",
    name: "Queen's Gambit",
    moves: "1.d4 d5 2.c4"
  },
  "1.d4 d5 2.c4 e6": {
    eco: "D30",
    name: "Queen's Gambit Declined",
    moves: "1.d4 d5 2.c4 e6"
  },
  "1.d4 d5 2.c4 c6": {
    eco: "D10",
    name: "Slav Defense",
    moves: "1.d4 d5 2.c4 c6"
  },
  "1.d4 d5 2.c4 dxc4": {
    eco: "D20",
    name: "Queen's Gambit Accepted",
    moves: "1.d4 d5 2.c4 dxc4"
  },
  "1.d4 Nf6": {
    eco: "A45",
    name: "Indian Defense",
    moves: "1.d4 Nf6"
  },
  "1.d4 Nf6 2.c4": {
    eco: "E00",
    name: "Indian Defense",
    moves: "1.d4 Nf6 2.c4"
  },
  "1.d4 Nf6 2.c4 e6": {
    eco: "E00",
    name: "Indian Defense",
    moves: "1.d4 Nf6 2.c4 e6"
  },
  "1.d4 Nf6 2.c4 g6": {
    eco: "E60",
    name: "King's Indian Defense",
    moves: "1.d4 Nf6 2.c4 g6"
  },
  "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4": {
    eco: "E20",
    name: "Nimzo-Indian Defense",
    moves: "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4"
  },
  "1.d4 Nf6 2.c4 e6 3.Nf3 b6": {
    eco: "E10",
    name: "Queen's Indian Defense",
    moves: "1.d4 Nf6 2.c4 e6 3.Nf3 b6"
  },
  
  // English Opening (A10-A39)
  "1.c4": {
    eco: "A10",
    name: "English Opening",
    moves: "1.c4"
  },
  "1.c4 e5": {
    eco: "A20",
    name: "English Opening",
    variation: "Reversed Sicilian",
    moves: "1.c4 e5"
  },
  "1.c4 Nf6": {
    eco: "A10",
    name: "English Opening",
    variation: "Anglo-Indian Defense",
    moves: "1.c4 Nf6"
  },
  "1.c4 c5": {
    eco: "A20",
    name: "English Opening",
    variation: "Symmetrical Variation",
    moves: "1.c4 c5"
  },
  
  // Nimzo-Larsen Attack (A01)
  "1.b3": {
    eco: "A01",
    name: "Nimzo-Larsen Attack",
    moves: "1.b3"
  },
  
  // Reti Opening (A04-A09)
  "1.Nf3": {
    eco: "A04",
    name: "Reti Opening",
    moves: "1.Nf3"
  },
  "1.Nf3 d5": {
    eco: "A06",
    name: "Reti Opening",
    moves: "1.Nf3 d5"
  },
  "1.Nf3 d5 2.c4": {
    eco: "A09",
    name: "Reti Opening",
    moves: "1.Nf3 d5 2.c4"
  },
  "1.Nf3 Nf6": {
    eco: "A04",
    name: "Reti Opening",
    variation: "King's Indian Attack",
    moves: "1.Nf3 Nf6"
  },
  
  // Other Openings
  "1.f4": {
    eco: "A02",
    name: "Bird's Opening",
    moves: "1.f4"
  },
  "1.g3": {
    eco: "A00",
    name: "Hungarian Opening",
    variation: "King's Fianchetto",
    moves: "1.g3"
  },
  "1.e3": {
    eco: "A00",
    name: "Van't Kruijs Opening",
    moves: "1.e3"
  },
  "1.Nc3": {
    eco: "A00",
    name: "Dunst Opening",
    moves: "1.Nc3"
  }
};

/**
 * Detect the opening from a sequence of moves
 * 
 * @param moves - Array of moves in SAN notation (e.g., ['e4', 'e5', 'Nf3'])
 * @returns Opening information or null if not found
 */
export function detectOpening(moves: string[]): OpeningInfo | null {
  if (moves.length === 0) return null;
  
  // Build progressive move sequences and check from longest to shortest
  // This ensures we get the most specific opening variant
  for (let i = Math.min(moves.length, 10); i > 0; i--) {
    const moveSequence = buildMoveString(moves.slice(0, i));
    const opening = OPENINGS_DATABASE[moveSequence];
    
    if (opening) {
      return opening;
    }
  }
  
  return null;
}

/**
 * Build a standardized move string from moves array
 * Format: "1.e4 e5 2.Nf3 Nc6"
 * 
 * @param moves - Array of moves in SAN notation
 * @returns Formatted move string
 */
function buildMoveString(moves: string[]): string {
  const parts: string[] = [];
  
  for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
      // White's move - add move number
      const moveNum = Math.floor(i / 2) + 1;
      parts.push(`${moveNum}.${moves[i]}`);
    } else {
      // Black's move - just add the move
      parts.push(moves[i]);
    }
  }
  
  return parts.join(' ');
}

/**
 * Get opening name with full description
 * 
 * @param opening - Opening information
 * @returns Formatted opening name
 */
export function getOpeningDisplayName(opening: OpeningInfo): string {
  if (opening.variation) {
    return `${opening.name}: ${opening.variation}`;
  }
  return opening.name;
}

/**
 * Get opening description including ECO code
 * 
 * @param opening - Opening information
 * @returns Formatted description
 */
export function getOpeningDescription(opening: OpeningInfo): string {
  const name = getOpeningDisplayName(opening);
  return `${opening.eco} - ${name}`;
}

/**
 * Extract moves in SAN notation from chess.js Move array
 * 
 * @param moveHistory - Array of Move objects from chess.js
 * @returns Array of SAN notation strings
 */
export function extractSANMoves(moveHistory: Array<{ san: string }>): string[] {
  return moveHistory.map(move => move.san);
}
