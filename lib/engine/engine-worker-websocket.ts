/**
 * Stockfish Engine Web Worker - WebSocket Version
 * 
 * Connects to a real Stockfish engine running on a WebSocket server.
 * This bypasses all browser/WASM compatibility issues.
 */

// Web Worker context
/// <reference lib="webworker" />
declare const self: Worker & typeof globalThis;

let ws: WebSocket | null = null;
let isReady = false;

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
 * Initialize connection to Stockfish WebSocket server
 */
async function initEngine() {
  try {
    // Connect to WebSocket server
    const wsUrl = 'ws://localhost:3001';
    console.log('Connecting to Stockfish server at', wsUrl);
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to Stockfish server');
      // Send UCI command to initialize
      ws?.send('uci');
    };
    
    ws.onmessage = (event) => {
      handleStockfishMessage(event.data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      postMessage({
        type: 'error',
        data: 'Failed to connect to Stockfish server. Make sure the server is running on port 3001.'
      } as WorkerResponse);
    };
    
    ws.onclose = () => {
      console.log('Disconnected from Stockfish server');
      isReady = false;
    };
    
  } catch (err) {
    postMessage({
      type: 'error',
      data: `Failed to initialize engine: ${err}`
    } as WorkerResponse);
  }
}

/**
 * Handle Stockfish output
 */
function handleStockfishMessage(line: string) {
  if (typeof line !== 'string') return;

  // Engine ready
  if (line === 'uciok') {
    isReady = true;
    postMessage({ type: 'ready' } as WorkerResponse);
  }
  
  // Info lines (evaluation, pv, etc.)
  else if (line.startsWith('info')) {
    postMessage({
      type: 'info',
      data: line
    } as WorkerResponse);
  }
  
  // Best move found
  else if (line.startsWith('bestmove')) {
    postMessage({
      type: 'bestmove',
      data: line
    } as WorkerResponse);
  }
}

/**
 * Set position on the board
 */
function setPosition(fen?: string, moves?: string[]) {
  if (!ws || !isReady) return;

  let command = 'position';

  if (fen) {
    command += ` fen ${fen}`;
  } else {
    command += ' startpos';
  }

  if (moves && moves.length > 0) {
    command += ` moves ${moves.join(' ')}`;
  }

  ws.send(command);
}

/**
 * Start analysis
 */
function startAnalysis(depth: number = 20, multiPV: number = 1) {
  if (!ws || !isReady) return;

  // Set multi-PV if requested
  if (multiPV > 1) {
    ws.send(`setoption name MultiPV value ${multiPV}`);
  }

  // Start analysis
  ws.send(`go depth ${depth}`);
}

/**
 * Stop analysis
 */
function stopAnalysis() {
  if (!ws || !isReady) return;
  ws.send('stop');
}

/**
 * Quit engine
 */
function quitEngine() {
  if (!ws) return;
  ws.send('quit');
  ws.close();
  ws = null;
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
      stopAnalysis();
      break;

    case 'quit':
      quitEngine();
      break;
  }
});

// Export for TypeScript (won't be used in runtime)
export {};
