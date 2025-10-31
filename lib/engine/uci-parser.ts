/**
 * UCI (Universal Chess Interface) Protocol Parser
 * Parses Stockfish output lines and extracts analysis data
 */

export interface UCIInfo {
  depth: number;
  seldepth?: number;
  score?: {
    cp?: number;      // Centipawn evaluation
    mate?: number;    // Mate in N moves
  };
  nodes?: number;
  nps?: number;       // Nodes per second
  time?: number;      // Time in milliseconds
  pv?: string[];      // Principal variation (best line)
  multipv?: number;   // Multi-PV line number
  currmove?: string;  // Current move being analyzed
  currmovenumber?: number;
}

export interface UCIBestMove {
  bestmove: string;
  ponder?: string;    // Suggested ponder move
}

/**
 * Parse UCI info line
 * Example: "info depth 20 score cp 35 nodes 1234567 nps 500000 time 2468 pv e2e4 e7e5"
 */
export function parseUCIInfo(line: string): UCIInfo | null {
  if (!line.startsWith('info')) return null;

  const info: UCIInfo = {
    depth: 0,
  };

  const tokens = line.split(' ');
  
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    
    switch (token) {
      case 'depth':
        info.depth = parseInt(tokens[++i]);
        break;
        
      case 'seldepth':
        info.seldepth = parseInt(tokens[++i]);
        break;
        
      case 'score':
        info.score = {};
        const scoreType = tokens[++i];
        if (scoreType === 'cp') {
          info.score.cp = parseInt(tokens[++i]);
        } else if (scoreType === 'mate') {
          info.score.mate = parseInt(tokens[++i]);
        }
        break;
        
      case 'nodes':
        info.nodes = parseInt(tokens[++i]);
        break;
        
      case 'nps':
        info.nps = parseInt(tokens[++i]);
        break;
        
      case 'time':
        info.time = parseInt(tokens[++i]);
        break;
        
      case 'multipv':
        info.multipv = parseInt(tokens[++i]);
        break;
        
      case 'currmove':
        info.currmove = tokens[++i];
        break;
        
      case 'currmovenumber':
        info.currmovenumber = parseInt(tokens[++i]);
        break;
        
      case 'pv':
        // Principal variation - rest of the tokens are moves
        info.pv = tokens.slice(i + 1);
        i = tokens.length; // Break out of loop
        break;
    }
  }

  return info;
}

/**
 * Parse UCI bestmove line
 * Example: "bestmove e2e4 ponder e7e5"
 */
export function parseUCIBestMove(line: string): UCIBestMove | null {
  if (!line.startsWith('bestmove')) return null;

  const tokens = line.split(' ');
  const result: UCIBestMove = {
    bestmove: tokens[1],
  };

  const ponderIndex = tokens.indexOf('ponder');
  if (ponderIndex !== -1 && tokens[ponderIndex + 1]) {
    result.ponder = tokens[ponderIndex + 1];
  }

  return result;
}

/**
 * Format evaluation score for display
 * Converts centipawns to readable format
 */
export function formatEvaluation(info: UCIInfo): string {
  if (!info.score) return '0.00';

  if (info.score.mate !== undefined) {
    const sign = info.score.mate > 0 ? '+' : '';
    return `${sign}M${Math.abs(info.score.mate)}`;
  }

  if (info.score.cp !== undefined) {
    const pawns = info.score.cp / 100;
    const sign = pawns > 0 ? '+' : '';
    return `${sign}${pawns.toFixed(2)}`;
  }

  return '0.00';
}

/**
 * Format nodes per second
 */
export function formatNPS(nps: number): string {
  if (nps >= 1_000_000) {
    return `${(nps / 1_000_000).toFixed(1)}M`;
  }
  if (nps >= 1_000) {
    return `${(nps / 1_000).toFixed(0)}k`;
  }
  return nps.toString();
}

/**
 * Format time in milliseconds to readable format
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Convert evaluation to bar percentage (0-100)
 * 0 = black winning, 50 = equal, 100 = white winning
 */
export function evalToBarPercentage(info: UCIInfo): number {
  if (!info.score) return 50;

  if (info.score.mate !== undefined) {
    // Mate: cap at edges
    return info.score.mate > 0 ? 100 : 0;
  }

  if (info.score.cp !== undefined) {
    // Convert centipawns to percentage
    // -1000cp = 0%, 0cp = 50%, +1000cp = 100%
    // Use sigmoid-like function for better visual distribution
    const cp = info.score.cp;
    const clamped = Math.max(-1000, Math.min(1000, cp));
    return ((clamped / 1000) * 50) + 50;
  }

  return 50;
}
