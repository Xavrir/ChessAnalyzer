/**
 * Engine Store - Manages Stockfish engine state
 * Uses Web Worker to run engine in separate thread
 */

import { create } from 'zustand';
import { parseUCIInfo, parseUCIBestMove, type UCIInfo, type UCIBestMove } from '@/lib/engine/uci-parser';
import type { WorkerMessage, WorkerResponse } from '@/lib/engine/engine-worker';

export interface EngineState {
  // Engine status
  isInitialized: boolean;
  isAnalyzing: boolean;
  isBatchAnalysis: boolean; // Flag to indicate batch game analysis (prevents live UI updates)
  error: string | null;
  
  // Analysis results
  currentInfo: UCIInfo | null;
  bestMove: string | null;
  ponderMove: string | null;
  analyzedFen: string | null; // FEN that was analyzed (for UCI->SAN conversion)
  
  // Multi-PV lines
  multiPVLines: UCIInfo[];
  
  // Settings
  depth: number;
  multiPV: number;
  
  // Worker instance
  worker: Worker | null;
  
  // Actions
  initEngine: () => void;
  analyzePosition: (fen: string, moves?: string[]) => void;
  stopAnalysis: () => void;
  setDepth: (depth: number) => void;
  setMultiPV: (multiPV: number) => void;
  setBatchMode: (isBatch: boolean) => void; // Control batch analysis mode
  quitEngine: () => void;
  reset: () => void;
}

export const useEngineStore = create<EngineState>((set, get) => ({
  // Initial state
  isInitialized: false,
  isAnalyzing: false,
  isBatchAnalysis: false,
  error: null,
  currentInfo: null,
  bestMove: null,
  ponderMove: null,
  analyzedFen: null,
  multiPVLines: [],
  depth: 20,
  multiPV: 1,
  worker: null,

  /**
   * Initialize Stockfish engine
   */
  initEngine: () => {
    const { worker: existingWorker } = get();
    
    // Don't re-initialize if already initialized
    if (existingWorker) {
      console.log('Engine already initialized');
      return;
    }

    try {
      // Determine which engine to use
      const engineType = process.env.NEXT_PUBLIC_ENGINE_TYPE || 'mock';
      const workerPath = engineType === 'websocket' 
        ? '@/lib/engine/engine-worker-websocket.ts'
        : '@/lib/engine/engine-worker.ts';
      
      console.log(`Initializing ${engineType} engine...`);
      
      // Create Web Worker
      const worker = new Worker(
        new URL(workerPath, import.meta.url),
        { type: 'module' }
      );

      // Handle messages from worker
      worker.addEventListener('message', (e: MessageEvent<WorkerResponse>) => {
        const response = e.data;

        switch (response.type) {
          case 'ready':
            set({ 
              isInitialized: true, 
              error: null 
            });
            console.log('Stockfish engine initialized');
            break;

          case 'info':
            const info = parseUCIInfo(response.data);
            if (info) {
              // IMPORTANT: Keep analyzedFen unchanged! It was set when analyzePosition() was called
              // and should remain associated with all UCI info updates for that analysis session.
              // This ensures currentInfo and analyzedFen stay synchronized even during rapid
              // sequential analysis of multiple positions.
              set({ currentInfo: info });

              // Store multi-PV lines if available
              if (info.multipv) {
                const { multiPVLines } = get();
                const newLines = [...multiPVLines];
                newLines[info.multipv - 1] = info;
                set({ multiPVLines: newLines });
              }
            }
            break;

          case 'bestmove':
            const bestMove = parseUCIBestMove(response.data);
            if (bestMove) {
              set({
                bestMove: bestMove.bestmove,
                ponderMove: bestMove.ponder || null,
                isAnalyzing: false,
              });
              console.log('Best move:', bestMove.bestmove);
            }
            break;

          case 'error':
            set({ 
              error: response.data, 
              isAnalyzing: false 
            });
            console.error('Engine error:', response.data);
            break;
        }
      });

      // Handle worker errors
      worker.addEventListener('error', (error) => {
        set({ 
          error: `Worker error: ${error.message}`, 
          isAnalyzing: false 
        });
        console.error('Worker error:', error);
      });

      // Store worker and initialize
      set({ worker, error: null });
      
      const message: WorkerMessage = { type: 'init' };
      worker.postMessage(message);

    } catch (error) {
      set({ 
        error: `Failed to create worker: ${error}`, 
        isAnalyzing: false 
      });
      console.error('Failed to create worker:', error);
    }
  },

  /**
   * Analyze a position
   */
  analyzePosition: (fen: string, moves?: string[]) => {
    const { worker, isInitialized, depth, multiPV } = get();

    if (!worker || !isInitialized) {
      console.warn('Engine not initialized');
      return;
    }

    // Reset analysis state and store the FEN being analyzed
    set({
      isAnalyzing: true,
      currentInfo: null,
      bestMove: null,
      ponderMove: null,
      analyzedFen: fen, // Store FEN for UCI->SAN conversion
      multiPVLines: [],
      error: null,
    });

    // Send position to worker
    const positionMessage: WorkerMessage = {
      type: 'position',
      fen,
      moves,
    };
    worker.postMessage(positionMessage);

    // Start analysis
    const goMessage: WorkerMessage = {
      type: 'go',
      depth,
      multiPV,
    };
    worker.postMessage(goMessage);

    console.log(`Analyzing position at depth ${depth}, multi-PV ${multiPV}`);
  },

  /**
   * Stop current analysis
   */
  stopAnalysis: () => {
    const { worker, isAnalyzing } = get();

    if (!worker || !isAnalyzing) return;

    const message: WorkerMessage = { type: 'stop' };
    worker.postMessage(message);
    
    set({ isAnalyzing: false });
    console.log('Analysis stopped');
  },

  /**
   * Set analysis depth
   */
  setDepth: (depth: number) => {
    set({ depth: Math.max(1, Math.min(30, depth)) });
  },

  /**
   * Set multi-PV lines
   */
  setMultiPV: (multiPV: number) => {
    set({ 
      multiPV: Math.max(1, Math.min(5, multiPV)),
      multiPVLines: [], // Clear old lines
    });
  },

  /**
   * Set batch analysis mode
   * When true, prevents live UI updates during batch game analysis to avoid race conditions
   */
  setBatchMode: (isBatch: boolean) => {
    set({ isBatchAnalysis: isBatch });
  },

  /**
   * Quit engine and cleanup
   */
  quitEngine: () => {
    const { worker } = get();

    if (worker) {
      const message: WorkerMessage = { type: 'quit' };
      worker.postMessage(message);
      worker.terminate();
    }

    set({
      worker: null,
      isInitialized: false,
      isAnalyzing: false,
      isBatchAnalysis: false,
      currentInfo: null,
      bestMove: null,
      ponderMove: null,
      analyzedFen: null,
      multiPVLines: [],
      error: null,
    });

    console.log('Engine quit');
  },

  /**
   * Reset analysis state (keep engine running)
   */
  reset: () => {
    set({
      isAnalyzing: false,
      isBatchAnalysis: false,
      currentInfo: null,
      bestMove: null,
      ponderMove: null,
      analyzedFen: null,
      multiPVLines: [],
      error: null,
    });
  },
}));
