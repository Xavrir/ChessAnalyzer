'use client';

import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils/cn';
import { 
  getAnnotationColor, 
  getAnnotationDescription,
  type AnnotationType 
} from '@/lib/analysis/annotations';

// Map annotation types to display symbols
const annotationSymbols: Record<AnnotationType, string> = {
  brilliant: '!!',
  critical: '!?',
  best: '✓',
  excellent: '!',
  okay: '○',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
  theory: '📖',
};

export function MoveList() {
  const { moveHistory, currentMoveIndex, goToMove, analysis } = useGameStore();

  if (moveHistory.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary font-mono text-sm">
        No moves yet. Import a game or start playing.
      </div>
    );
  }

  // Helper to get annotation for a specific move index
  const getAnnotationForMove = (moveIndex: number): { annotation: AnnotationType; evalChange: number } | null => {
    if (!analysis?.annotations) return null;
    const annotation = analysis.annotations.find(a => a.moveNumber === moveIndex);
    return annotation ? { annotation: annotation.annotation, evalChange: annotation.evalChange } : null;
  };

  // Group moves into pairs (white, black)
  const movePairs: Array<{ moveNumber: number; white?: typeof moveHistory[0]; black?: typeof moveHistory[0] }> = [];
  
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1],
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-terminal-green/20 p-3">
        <h3 className="text-sm font-mono text-terminal-green uppercase tracking-wider">
          Move History
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {movePairs.map(({ moveNumber, white, black }, pairIndex) => (
            <div
              key={pairIndex}
              className="flex items-center gap-2 font-mono text-sm"
            >
              {/* Move number */}
              <span className="text-text-secondary w-8 text-right shrink-0">
                {moveNumber}.
              </span>

              {/* White move */}
              {white && (
                <button
                  onClick={() => goToMove(pairIndex * 2)}
                  className={cn(
                    'flex-1 px-2 py-1 rounded text-left transition-colors group relative',
                    currentMoveIndex === pairIndex * 2
                      ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/50'
                      : 'text-text-primary hover:bg-terminal-green/10'
                  )}
                  title={(() => {
                    const annot = getAnnotationForMove(pairIndex * 2);
                    return annot ? getAnnotationDescription(annot.annotation, annot.evalChange) : undefined;
                  })()}
                >
                  <span className="flex items-center gap-1.5">
                    {white.san}
                    {(() => {
                      const annot = getAnnotationForMove(pairIndex * 2);
                      return annot ? (
                        <span className={cn(
                          'text-[10px] px-1 py-0.5 rounded font-bold',
                          getAnnotationColor(annot.annotation)
                        )}>
                          {annotationSymbols[annot.annotation]}
                        </span>
                      ) : null;
                    })()}
                  </span>
                </button>
              )}

              {/* Black move */}
              {black && (
                <button
                  onClick={() => goToMove(pairIndex * 2 + 1)}
                  className={cn(
                    'flex-1 px-2 py-1 rounded text-left transition-colors group relative',
                    currentMoveIndex === pairIndex * 2 + 1
                      ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/50'
                      : 'text-text-primary hover:bg-terminal-green/10'
                  )}
                  title={(() => {
                    const annot = getAnnotationForMove(pairIndex * 2 + 1);
                    return annot ? getAnnotationDescription(annot.annotation, annot.evalChange) : undefined;
                  })()}
                >
                  <span className="flex items-center gap-1.5">
                    {black.san}
                    {(() => {
                      const annot = getAnnotationForMove(pairIndex * 2 + 1);
                      return annot ? (
                        <span className={cn(
                          'text-[10px] px-1 py-0.5 rounded font-bold',
                          getAnnotationColor(annot.annotation)
                        )}>
                          {annotationSymbols[annot.annotation]}
                        </span>
                      ) : null;
                    })()}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
