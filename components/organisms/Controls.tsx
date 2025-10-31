'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/atoms/Button';
import { 
  ChevronFirst, 
  ChevronLast, 
  ChevronLeft, 
  ChevronRight,
  FlipHorizontal2,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface ControlsProps {
  onImportClick?: () => void;
}

export function Controls({ onImportClick }: ControlsProps) {
  const {
    currentMoveIndex,
    moveHistory,
    goToMove,
    flipBoard,
    newGame,
  } = useGameStore();

  const isAtStart = currentMoveIndex === -1;
  const isAtEnd = currentMoveIndex === moveHistory.length - 1;

  const handleFirst = useCallback(() => goToMove(-1), [goToMove]);
  const handlePrevious = useCallback(() => goToMove(currentMoveIndex - 1), [goToMove, currentMoveIndex]);
  const handleNext = useCallback(() => goToMove(currentMoveIndex + 1), [goToMove, currentMoveIndex]);
  const handleLast = useCallback(() => goToMove(moveHistory.length - 1), [goToMove, moveHistory.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Home':
          e.preventDefault();
          handleFirst();
          break;
        case 'End':
          e.preventDefault();
          handleLast();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFirst, handlePrevious, handleNext, handleLast]);

  return (
    <div className="flex flex-col gap-3">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleFirst}
          disabled={isAtStart}
          title="First move (Home)"
          className="flex-1"
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePrevious}
          disabled={isAtStart}
          title="Previous move (←)"
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleNext}
          disabled={isAtEnd}
          title="Next move (→)"
          className="flex-1"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLast}
          disabled={isAtEnd}
          title="Last move (End)"
          className="flex-1"
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={flipBoard}
          title="Flip board"
          className="flex-1"
        >
          <FlipHorizontal2 className="h-4 w-4" />
          Flip
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={newGame}
          title="New game"
          className="flex-1"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        
        {onImportClick && (
          <Button
            size="sm"
            variant="primary"
            onClick={onImportClick}
            title="Import game"
            className="flex-1"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        )}
      </div>

      {/* Move counter */}
      <div className="text-center text-xs font-mono text-text-secondary">
        Move {currentMoveIndex + 1} / {moveHistory.length || 0}
      </div>
    </div>
  );
}
