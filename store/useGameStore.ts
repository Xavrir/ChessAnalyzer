import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';
import type { MoveAnnotation } from '@/lib/analysis/annotations';
import type { AccuracyMetrics } from '@/lib/analysis/accuracy';
import type { OpeningInfo } from '@/lib/chess/openings';

/**
 * Analysis data for a game
 */
export interface GameAnalysis {
  evaluations: number[];         // Evaluation for each position (including starting position)
  bestMoves: string[];           // Best move for each position (engine recommendation)
  annotations: MoveAnnotation[]; // Annotations for notable moves
  accuracy?: {
    white: AccuracyMetrics;
    black: AccuracyMetrics;
  };
  opening?: OpeningInfo | null;  // Detected opening
}

/**
 * Game State Interface
 */
export interface GameState {
  // Core game state
  chess: Chess;
  fen: string;
  pgn: string;
  
  // Position tracking
  currentMoveIndex: number;
  moveHistory: Move[];
  positionHistory: string[]; // FEN strings for each position
  
  // Game metadata
  gameInfo: {
    white?: string;
    black?: string;
    event?: string;
    site?: string;
    date?: string;
    round?: string;
    result?: string;
  };
  
  // Analysis data
  analysis: GameAnalysis | null;
  
  // UI state
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  orientation: 'white' | 'black';
  
  // Status
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  turn: Color;
}

/**
 * Game Actions Interface
 */
export interface GameActions {
  // Move actions
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  undoMove: () => void;
  
  // Navigation
  goToMove: (index: number) => void;
  goToStart: () => void;
  goToEnd: () => void;
  goForward: () => void;
  goBack: () => void;
  
  // Board actions
  flipBoard: () => void;
  selectSquare: (square: Square | null) => void;
  
  // Game loading
  loadPGN: (pgn: string) => boolean;
  loadFEN: (fen: string) => boolean;
  newGame: () => void;
  
  // Analysis actions
  setAnalysis: (analysis: GameAnalysis | null) => void;
  clearAnalysis: () => void;
  
  // Helpers
  updateStatus: () => void;
  getLegalMovesForSquare: (square: Square) => Square[];
}

export type GameStore = GameState & GameActions;

/**
 * Initial game state
 */
const initialState: GameState = {
  chess: new Chess(),
  fen: new Chess().fen(),
  pgn: '',
  currentMoveIndex: -1,
  moveHistory: [],
  positionHistory: [new Chess().fen()],
  gameInfo: {},
  analysis: null,
  selectedSquare: null,
  legalMoves: [],
  lastMove: null,
  orientation: 'white',
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  isDraw: false,
  isGameOver: false,
  turn: 'w',
};

/**
 * Create Game Store
 */
export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        /**
         * Make a move on the board
         */
        makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => {
          const { chess, currentMoveIndex } = get();
          
          try {
            const move = chess.move({
              from,
              to,
              promotion: promotion || 'q',
            });
            
            if (move) {
              const newHistory = chess.history({ verbose: true });
              const newPosition = chess.fen();
              
              // If we're not at the end, truncate future moves
              const moveHistory = currentMoveIndex === newHistory.length - 2
                ? newHistory
                : newHistory.slice(0, currentMoveIndex + 2);
              
              const positionHistory = [
                initialState.positionHistory[0],
                ...moveHistory.map((_, i) => {
                  const tempChess = new Chess();
                  moveHistory.slice(0, i + 1).forEach(m => {
                    tempChess.move({ from: m.from, to: m.to, promotion: m.promotion });
                  });
                  return tempChess.fen();
                }),
              ];
              
              set({
                chess,
                fen: newPosition,
                pgn: chess.pgn(),
                moveHistory,
                positionHistory,
                currentMoveIndex: moveHistory.length - 1,
                lastMove: { from: move.from, to: move.to },
                selectedSquare: null,
                legalMoves: [],
              });
              
              get().updateStatus();
              return true;
            }
            
            return false;
          } catch (error) {
            console.error('Invalid move:', error);
            return false;
          }
        },
        
        /**
         * Undo the last move
         */
        undoMove: () => {
          const { chess } = get();
          const move = chess.undo();
          
          if (move) {
            const moveHistory = chess.history({ verbose: true });
            
            set({
              chess,
              fen: chess.fen(),
              pgn: chess.pgn(),
              moveHistory,
              currentMoveIndex: moveHistory.length - 1,
              lastMove: moveHistory.length > 0 
                ? { from: moveHistory[moveHistory.length - 1].from, to: moveHistory[moveHistory.length - 1].to }
                : null,
              selectedSquare: null,
              legalMoves: [],
            });
            
            get().updateStatus();
          }
        },
        
        /**
         * Navigate to a specific move index
         */
        goToMove: (index: number) => {
          const { moveHistory, positionHistory } = get();
          
          if (index < -1 || index >= moveHistory.length) {
            return;
          }
          
          // Create a new chess instance at the target position
          const targetFen = positionHistory[index + 1];
          const chess = new Chess(targetFen);
          
          const lastMove = index >= 0 ? moveHistory[index] : null;
          
          set({
            chess,
            fen: targetFen,
            currentMoveIndex: index,
            lastMove: lastMove ? { from: lastMove.from, to: lastMove.to } : null,
            selectedSquare: null,
            legalMoves: [],
          });
          
          get().updateStatus();
        },
        
        /**
         * Go to the start of the game
         */
        goToStart: () => {
          get().goToMove(-1);
        },
        
        /**
         * Go to the end of the game
         */
        goToEnd: () => {
          const { moveHistory } = get();
          get().goToMove(moveHistory.length - 1);
        },
        
        /**
         * Go forward one move
         */
        goForward: () => {
          const { currentMoveIndex, moveHistory } = get();
          if (currentMoveIndex < moveHistory.length - 1) {
            get().goToMove(currentMoveIndex + 1);
          }
        },
        
        /**
         * Go back one move
         */
        goBack: () => {
          const { currentMoveIndex } = get();
          if (currentMoveIndex >= 0) {
            get().goToMove(currentMoveIndex - 1);
          }
        },
        
        /**
         * Flip the board orientation
         */
        flipBoard: () => {
          set((state) => ({
            orientation: state.orientation === 'white' ? 'black' : 'white',
          }));
        },
        
        /**
         * Select a square on the board
         */
        selectSquare: (square: Square | null) => {
          if (!square) {
            set({ selectedSquare: null, legalMoves: [] });
            return;
          }
          
          const legalMoves = get().getLegalMovesForSquare(square);
          
          set({
            selectedSquare: square,
            legalMoves,
          });
        },
        
        /**
         * Load a game from PGN
         */
        loadPGN: (pgn: string) => {
          try {
            const chess = new Chess();
            chess.loadPgn(pgn);
            
            const moveHistory = chess.history({ verbose: true });
            
            // Build position history
            const tempChess = new Chess();
            const positionHistory = [tempChess.fen()];
            
            moveHistory.forEach(move => {
              tempChess.move({ from: move.from, to: move.to, promotion: move.promotion });
              positionHistory.push(tempChess.fen());
            });
            
            // Extract game info from PGN headers
            const headers = chess.header();
            
            set({
              chess,
              fen: chess.fen(),
              pgn,
              moveHistory,
              positionHistory,
              currentMoveIndex: moveHistory.length - 1,
              lastMove: moveHistory.length > 0
                ? { from: moveHistory[moveHistory.length - 1].from, to: moveHistory[moveHistory.length - 1].to }
                : null,
              gameInfo: {
                white: headers.White,
                black: headers.Black,
                event: headers.Event,
                site: headers.Site,
                date: headers.Date,
                round: headers.Round,
                result: headers.Result,
              },
              analysis: null, // Clear analysis when loading new game
              selectedSquare: null,
              legalMoves: [],
            });
            
            get().updateStatus();
            return true;
          } catch (error) {
            console.error('Failed to load PGN:', error);
            return false;
          }
        },
        
        /**
         * Load a position from FEN
         */
        loadFEN: (fen: string) => {
          try {
            const chess = new Chess(fen);
            
            set({
              chess,
              fen,
              pgn: '',
              moveHistory: [],
              positionHistory: [fen],
              currentMoveIndex: -1,
              lastMove: null,
              gameInfo: {},
              analysis: null, // Clear analysis when loading new position
              selectedSquare: null,
              legalMoves: [],
            });
            
            get().updateStatus();
            return true;
          } catch (error) {
            console.error('Failed to load FEN:', error);
            return false;
          }
        },
        
        /**
         * Start a new game
         */
        newGame: () => {
          const chess = new Chess();
          
          set({
            ...initialState,
            chess,
            orientation: get().orientation, // Preserve board orientation
          });
          
          get().updateStatus();
        },
        
        /**
         * Set analysis data for the current game
         */
        setAnalysis: (analysis: GameAnalysis | null) => {
          set({ analysis });
        },
        
        /**
         * Clear analysis data
         */
        clearAnalysis: () => {
          set({ analysis: null });
        },
        
        /**
         * Update game status (check, checkmate, etc.)
         */
        updateStatus: () => {
          const { chess } = get();
          
          set({
            isCheck: chess.isCheck(),
            isCheckmate: chess.isCheckmate(),
            isStalemate: chess.isStalemate(),
            isDraw: chess.isDraw(),
            isGameOver: chess.isGameOver(),
            turn: chess.turn(),
          });
        },
        
        /**
         * Get legal moves for a square
         */
        getLegalMovesForSquare: (square: Square): Square[] => {
          const { chess } = get();
          const moves = chess.moves({ square, verbose: true });
          return moves.map(move => move.to);
        },
      }),
      {
        name: 'chess-game-storage',
        partialize: (state) => ({
          fen: state.fen,
          pgn: state.pgn,
          orientation: state.orientation,
          gameInfo: state.gameInfo,
        }),
      }
    ),
    { name: 'ChessGameStore' }
  )
);
