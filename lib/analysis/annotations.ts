/**
 * Move Annotations Module
 * 
 * Provides functionality to annotate chess moves based on evaluation changes.
 * Implements wintrchess.com-style categories:
 * - Brilliant: Exceptional move with unexpected improvement
 * - Critical: Only reasonable move in a critical position
 * - Best: Engine's top choice
 * - Excellent: Within 20cp of best
 * - Okay: Within 50cp of best
 * - Inaccuracy: 50-100cp loss
 * - Mistake: 100-200cp loss
 * - Blunder: >200cp loss with objectively bad position
 * - Theory: Opening book move
 */

export type AnnotationType = 
  | 'brilliant' 
  | 'critical' 
  | 'best' 
  | 'excellent' 
  | 'okay' 
  | 'inaccuracy' 
  | 'mistake' 
  | 'blunder'
  | 'theory';

export interface MoveAnnotation {
  moveNumber: number;
  annotation: AnnotationType;
  evalBefore: number;
  evalAfter: number;
  evalChange: number;
  bestMove?: string;
  actualMove: string;
  isWhiteMove: boolean;
}

/**
 * Annotate a move based on evaluation change
 * 
 * Annotation Rules (in centipawns):
 * - brilliant: Unexpected move significantly better than expected (>80cp improvement in advantage)
 * - critical: Only move that maintains/saves position in critical situation
 * - best: Engine's top choice
 * - excellent: Within 20cp of best
 * - okay: Within 50cp of best (still good)
 * - inaccuracy: 50-100cp loss (suboptimal but not bad)
 * - mistake: 100-200cp loss (clear error)
 * - blunder: >200cp loss AND position becomes objectively worse
 * - theory: Opening book move (first 10 moves if close to best)
 * 
 * Key improvements to avoid false blunders:
 * 1. Don't mark as blunder if already losing badly (eval < -300)
 * 2. Don't mark as blunder if maintaining winning advantage (both evals > +300)
 * 3. Consider if it's a forced sequence
 * 
 * @param evalBefore - Evaluation before the move (in centipawns)
 * @param evalAfter - Evaluation after the move (in centipawns)
 * @param isWhiteMove - Whether it's White's move (affects eval direction)
 * @param moveNumber - Move number (for theory detection)
 * @param isBest - Whether this move matches engine's top choice
 * @returns Annotation type or null if move is neutral
 */
export function annotateMoveFromEval(
  evalBefore: number,
  evalAfter: number,
  isWhiteMove: boolean,
  moveNumber: number = 0,
  isBest: boolean = false
): AnnotationType | null {
  // Calculate change from the player's perspective
  // For white: positive change is good, negative is bad
  // For black: negative change is good, positive is bad
  const change = isWhiteMove 
    ? evalAfter - evalBefore 
    : evalBefore - evalAfter;
  
  const absChange = Math.abs(change);
  
  // Get player's perspective evaluations
  const evalFromPlayerView = isWhiteMove ? evalBefore : -evalBefore;
  const evalAfterFromPlayerView = isWhiteMove ? evalAfter : -evalAfter;
  
  // Theory moves (opening book) - first 10 FULL moves (20 ply) within 50cp of best
  // IMPORTANT: Check this FIRST before marking as "best" or other annotations
  // This ensures opening book moves get the theory annotation
  if (moveNumber < 20 && absChange <= 50) {
    return 'theory';
  }
  
  // Best move - engine's top choice
  if (isBest) {
    return 'best';
  }
  
  // Brilliant move: Unexpected improvement in already good/winning position
  // Must improve by >80cp AND find a better path than expected
  if (change > 80 && evalAfterFromPlayerView > 100) {
    return 'brilliant';
  }
  
  // Critical: Position was bad (< -100cp), move brings it back close to equal
  // This is a "saving move" rather than brilliant
  if (evalFromPlayerView < -100 && change > 150 && Math.abs(evalAfterFromPlayerView) < 100) {
    return 'critical';
  }
  
  // Excellent: Very close to best move (within 20cp)
  if (absChange <= 20) {
    return 'excellent';
  }
  
  // Okay: Reasonably close to best (within 50cp)
  if (absChange <= 50) {
    return 'okay';
  }
  
  // Now check for bad moves
  // Important: Don't mark as blunder if position is already lost
  const positionAlreadyLost = evalFromPlayerView < -300;
  const positionAlreadyWon = evalFromPlayerView > 300;
  
  // Inaccuracy: 50-100cp loss
  if (change < -50 && change >= -100) {
    return 'inaccuracy';
  }
  
  // Mistake: 100-200cp loss (but not if already lost)
  if (change < -100 && change >= -200) {
    // If position was already lost, don't mark every move as mistake
    if (positionAlreadyLost && evalAfterFromPlayerView > -500) {
      return null; // Trying to hold on in lost position
    }
    return 'mistake';
  }
  
  // Blunder: >200cp loss
  // BUT: Only if this objectively makes position worse
  // Don't mark as blunder if:
  // 1. Already losing badly (< -300) and just losing more
  // 2. Still winning after the move (> +200) - maybe it's just less winning
  if (change < -200) {
    // Already lost, and move doesn't dramatically worsen it
    if (positionAlreadyLost && evalAfterFromPlayerView > -600) {
      return 'mistake'; // Downgrade to mistake
    }
    
    // Still winning after the move (just less winning)
    if (evalAfterFromPlayerView > 200) {
      return 'mistake'; // Downgrade to mistake (e.g., +500 to +250)
    }
    
    // This is a true blunder: significantly worsens position
    return 'blunder';
  }
  
  // Neutral moves (no significant change)
  return null;
}

/**
 * Get the color class for an annotation badge
 */
export function getAnnotationColor(annotation: AnnotationType): string {
  switch (annotation) {
    case 'brilliant':
      return 'bg-cyan-500 text-white';
    case 'critical':
      return 'bg-purple-500 text-white';
    case 'best':
      return 'bg-green-600 text-white';
    case 'excellent':
      return 'bg-green-500 text-white';
    case 'okay':
      return 'bg-lime-500 text-white';
    case 'inaccuracy':
      return 'bg-yellow-500 text-white';
    case 'mistake':
      return 'bg-orange-500 text-white';
    case 'blunder':
      return 'bg-red-500 text-white';
    case 'theory':
      return 'bg-blue-500 text-white';
  }
}

/**
 * Get a human-readable description for an annotation
 */
export function getAnnotationDescription(annotation: AnnotationType, evalChange: number): string {
  const absChange = Math.abs(evalChange);
  const cpText = `${absChange.toFixed(0)}cp`;
  
  switch (annotation) {
    case 'brilliant':
      return `Brilliant move! Improved position by ${cpText}`;
    case 'critical':
      return `Critical move. Saved position by ${cpText}`;
    case 'best':
      return `Best move according to engine`;
    case 'excellent':
      return `Excellent move. Within ${cpText} of best`;
    case 'okay':
      return `Good move. Within ${cpText} of best`;
    case 'theory':
      return `Opening theory move`;
    case 'inaccuracy':
      return `Inaccuracy. Lost ${cpText}`;
    case 'mistake':
      return `Mistake. Lost ${cpText}`;
    case 'blunder':
      return `Blunder! Lost ${cpText}`;
  }
}

/**
 * Annotate an entire game based on move-by-move evaluations
 * 
 * @param moves - Array of moves in the game
 * @param evaluations - Array of evaluations (one per position, including starting position)
 * @param bestMoves - Optional array of best moves from engine
 * @returns Array of annotations for moves that warrant annotation
 */
export function annotateGame(
  moves: Array<{ from: string; to: string; promotion?: string }>,
  evaluations: number[],
  bestMoves?: string[]
): MoveAnnotation[] {
  const annotations: MoveAnnotation[] = [];
  
  // Need at least 2 evaluations to compare (before and after first move)
  if (evaluations.length < 2 || moves.length === 0) {
    return annotations;
  }
  
  for (let i = 0; i < moves.length; i++) {
    const evalBefore = evaluations[i];
    const evalAfter = evaluations[i + 1];
    
    // Determine if this is a white or black move
    // Move 0 = White's first move, Move 1 = Black's first move, etc.
    const isWhiteMove = i % 2 === 0;
    
    // Check if this is the best move
    const actualMove = `${moves[i].from}${moves[i].to}${moves[i].promotion || ''}`;
    const bestMove = bestMoves?.[i];
    const isBest = actualMove === bestMove;
    
    const annotation = annotateMoveFromEval(
      evalBefore, 
      evalAfter, 
      isWhiteMove,
      Math.floor(i / 2), // Full move number
      isBest
    );
    
    if (annotation) {
      const evalChange = isWhiteMove 
        ? evalAfter - evalBefore 
        : evalBefore - evalAfter;
      
      annotations.push({
        moveNumber: i,
        annotation,
        evalBefore,
        evalAfter,
        evalChange,
        bestMove,
        actualMove,
        isWhiteMove,
      });
    }
  }
  
  return annotations;
}

/**
 * Count annotations by type for statistics
 */
export function countAnnotations(annotations: MoveAnnotation[]): Record<AnnotationType, number> {
  const counts: Record<AnnotationType, number> = {
    'brilliant': 0,
    'critical': 0,
    'best': 0,
    'excellent': 0,
    'okay': 0,
    'inaccuracy': 0,
    'mistake': 0,
    'blunder': 0,
    'theory': 0,
  };
  
  for (const annotation of annotations) {
    counts[annotation.annotation]++;
  }
  
  return counts;
}

/**
 * Get annotations for a specific player
 */
export function getPlayerAnnotations(
  annotations: MoveAnnotation[],
  isWhite: boolean
): MoveAnnotation[] {
  return annotations.filter(a => a.isWhiteMove === isWhite);
}

/**
 * Check if a move is the best move according to the engine
 */
export function isBestMove(
  actualMove: string,
  bestMove: string | undefined
): boolean {
  if (!bestMove) return false;
  
  // Direct match
  if (actualMove === bestMove) return true;
  
  // Could add more sophisticated matching here
  // (e.g., checking if moves are within tolerance of evaluation)
  
  return false;
}
