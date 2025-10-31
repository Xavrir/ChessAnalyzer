'use client';

import { useState } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { useGameStore } from '@/store/useGameStore';

type SquareStyle = Record<string, { background?: string; boxShadow?: string; outline?: string; outlineOffset?: string }>;

const SELECTED_STYLE = {
  outline: '3px solid rgba(14, 165, 233, 0.9)',
  outlineOffset: '-3px',
  background: 'rgba(14, 165, 233, 0.15)',
};

const MOVE_OPTION_STYLE = {
  boxShadow: 'inset 0 0 0 3px rgba(34, 197, 94, 0.7)',
  background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.35) 0%, rgba(34, 197, 94, 0) 65%)',
};

const HIGHLIGHT_STYLE = {
  boxShadow: 'inset 0 0 0 3px rgba(99, 102, 241, 0.7)',
  background: 'rgba(99, 102, 241, 0.25)',
};

export function Chessboard() {
  const {
    fen,
    makeMove,
    orientation,
    getLegalMovesForSquare,
  } = useGameStore();

  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<SquareStyle>({});
  const [optionSquares, setOptionSquares] = useState<SquareStyle>({});

  function resetSelections() {
    setMoveFrom(null);
    setOptionSquares({});
  }

  function toggleHighlight(square: Square) {
    setHighlightedSquares((prev) => {
      const next = { ...prev };
      if (next[square]) {
        delete next[square];
      } else {
        next[square] = HIGHLIGHT_STYLE;
      }
      return next;
    });
  }

  function onSquareClick(square: Square) {
    if (moveFrom === square) {
      resetSelections();
      return;
    }

    if (moveFrom) {
      const moved = makeMove(moveFrom, square, 'q');
      if (moved) {
        resetSelections();
        return;
      }
    }

    const movesForSquare = getLegalMovesForSquare(square);

    if (movesForSquare.length > 0) {
      setMoveFrom(square);

      const nextOptionSquares: SquareStyle = {};
      movesForSquare.forEach((toSquare) => {
        nextOptionSquares[toSquare] = MOVE_OPTION_STYLE;
      });

      setOptionSquares(nextOptionSquares);
    } else {
      resetSelections();
      toggleHighlight(square);
    }
  }

  function onSquareRightClick(square: Square) {
    toggleHighlight(square);
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square) {
    const moved = makeMove(sourceSquare, targetSquare, 'q');
    resetSelections();
    return moved;
  }

  const selectedSquareStyles = moveFrom ? { [moveFrom]: SELECTED_STYLE } : {};

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-terminal-green/20 bg-background-secondary/70 shadow-lg">
        <ReactChessboard
          id="analysis-board"
          position={fen}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          boardOrientation={orientation}
          showBoardNotation
          customBoardStyle={{
            borderRadius: '0',
          }}
          customLightSquareStyle={{
            backgroundColor: '#f1f5f9',
          }}
          customDarkSquareStyle={{
            backgroundColor: '#475569',
          }}
          customNotationStyle={{
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontSize: '0.65rem',
            color: '#94a3b8',
          }}
          customSquareStyles={{
            ...highlightedSquares,
            ...optionSquares,
            ...selectedSquareStyles,
          }}
          areArrowsAllowed={false}
          animationDuration={200}
          boardAriaLabel="Current analysis board"
        />
      </div>
      <p className="mt-3 text-xs font-mono text-text-secondary">
        Tap any empty square to add or remove a highlight. Legal moves are shown in teal; highlighted squares stay visible across turns for quick annotations.
      </p>
    </div>
  );
}
