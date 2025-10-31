/**
 * Stockfish Engine Web Worker
 * Runs Stockfish in a separate thread to avoid blocking the UI
 * 
 * ENHANCED MOCK - Provides realistic analysis using heuristic evaluation
 * See STOCKFISH_WASM_INTEGRATION.md for real engine integration notes
 */

// Web Worker context
/// <reference lib="webworker" />
declare const self: Worker & typeof globalThis;

// Import enhanced mock engine
import { evaluatePosition, findBestMove, generatePV } from './enhanced-mock-engine';

let isReady = false;
let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
let analysisInterval: ReturnType<typeof setInterval> | null = null;

// Message types from main thread
export interface WorkerMessage {
  type: 'init' | 'position' | 'go' | 'stop' | 'quit';
  fen?: string;
  moves?: string[];
  depth?: number;
  multiPV?: number;
}

// Message types to main thread
export interface WorkerResponse {
  type: 'ready' | 'info' | 'bestmove' | 'error';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

/**
 * Initialize Stockfish engine (ENHANCED MOCK)
 * 
 * Simulates engine initialization instantly
 */
async function initEngine() {
  try {
    // Simulate brief initialization delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    isReady = true;
    postMessage({ type: 'ready' } as WorkerResponse);
    
  } catch (err) {
    postMessage({
      type: 'error',
      data: `Failed to initialize engine: ${err}`
    } as WorkerResponse);
  }
}

/**
 * Stop analysis
 */
function sendBestMove() {
  const bestMove = findBestMove(currentFen);
  const pv = generatePV(currentFen, 2).split(' ');
  const ponder = pv[1] || '';

  postMessage({
    type: 'bestmove',
    data: `bestmove ${bestMove}${ponder ? ` ponder ${ponder}` : ''}`,
  } as WorkerResponse);
}

function stopAnalysis(emitBestMove = false) {
  if (analysisInterval) {
    clearInterval(analysisInterval);
    analysisInterval = null;
  }

  if (emitBestMove) {
    sendBestMove();
  }
}

/**
 * Simulate realistic analysis using heuristic evaluation
 */
function simulateAnalysis(depth: number = 20) {
  stopAnalysis();
  
  let currentDepth = 1;
  const maxDepth = depth;
  const startTime = Date.now();

  analysisInterval = setInterval(() => {
    if (currentDepth > maxDepth) {
      stopAnalysis();
      sendBestMove();
      return;
    }

    // Evaluate current position
    const cp = evaluatePosition(currentFen);
    const pv = generatePV(currentFen, Math.min(currentDepth, 10));
    
    // Calculate realistic statistics
    const nodesBase = currentDepth * currentDepth * 50000;
    const nodes = nodesBase + Math.floor(Math.random() * 10000);
    const elapsed = Date.now() - startTime;
    const nps = Math.floor((nodes / Math.max(elapsed, 1)) * 1000);
    const time = elapsed;
    const seldepth = currentDepth + Math.floor(Math.random() * 3);
    
    // UCI info line with realistic values
    const info = `info depth ${currentDepth} seldepth ${seldepth} score cp ${cp} nodes ${nodes} nps ${nps} time ${time} pv ${pv}`;
    
    postMessage({
      type: 'info',
      data: info
    } as WorkerResponse);
    
    currentDepth++;
  }, 200); // 200ms per depth
}

/**
 * Set position on the board
 */
function setPosition(fen?: string, moves?: string[]) {
  if (!isReady) return;

  if (fen) {
    currentFen = fen;
  } else {
    currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
  
  // Apply moves if provided
  if (moves && moves.length > 0) {
    // For now, we'll assume the FEN already includes the position after moves
    // In a real implementation, we'd need to apply moves to the FEN
  }
}

/**
 * Start analysis
 */
function startAnalysis(depth: number = 20, _multiPV: number = 1) {
  if (!isReady) return;
  
  // Start simulated analysis
  simulateAnalysis(depth);
}

/**
 * Quit engine
 */
function quitEngine() {
  stopAnalysis();
  isReady = false;
}

// Handle messages from main thread
self.addEventListener('message', (e: MessageEvent) => {
  const message = e.data as WorkerMessage;

  switch (message.type) {
    case 'init':
      initEngine();
      break;

    case 'position':
      setPosition(message.fen, message.moves);
      break;

    case 'go':
      startAnalysis(message.depth, message.multiPV);
      break;

    case 'stop':
      stopAnalysis(true);
      break;

    case 'quit':
      quitEngine();
      break;
  }
});

// Export for TypeScript (won't be used in runtime)
export {};
