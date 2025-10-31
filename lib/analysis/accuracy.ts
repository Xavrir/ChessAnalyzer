/**
 * Accuracy Calculation Module
 * 
 * Calculates move accuracy based on engine evaluation.
 * Uses a formula inspired by Chess.com's accuracy system.
 */

export interface AccuracyMetrics {
  overall: number;        // 0-100%
  opening: number;        // First 10 moves (moves 0-9)
  middlegame: number;     // Moves 10-29
  endgame: number;        // Moves 30+
  bestMoves: number;      // Count of exact best moves
  goodMoves: number;      // Moves within 25cp of best
  inaccuracies: number;   // 50-100cp loss
  mistakes: number;       // 100-200cp loss
  blunders: number;       // 200cp+ loss
}

export interface PlayerAccuracy {
  white: AccuracyMetrics;
  black: AccuracyMetrics;
}

/**
 * Convert centipawn evaluation to expected points (win probability)
 * Uses a logistic function with gradient 0.0035 (standard chess formula)
 * 
 * @param evaluation - Centipawn evaluation
 * @returns Expected points (0-1, where 0.5 is equal, 1.0 is winning)
 */
function getExpectedPoints(evaluation: number): number {
  const centipawnGradient = 0.0035;
  return 1 / (1 + Math.exp(-centipawnGradient * evaluation));
}

/**
 * Calculate expected points loss from a move
 * 
 * @param evalBefore - Evaluation before the move (cp)
 * @param evalAfter - Evaluation after the move (cp)
 * @param bestEval - Best possible evaluation (cp)
 * @param isWhiteMove - Whether it's White's move
 * @returns Point loss (0-1)
 */
function getPointLoss(
  evalBefore: number,
  evalAfter: number,
  bestEval: number,
  isWhiteMove: boolean
): number {
  // From the opponent's perspective before our move
  const expectedBeforeOpp = getExpectedPoints(-evalBefore);
  
  // Best case: if we made the best move
  const expectedBestUs = getExpectedPoints(isWhiteMove ? bestEval : -bestEval);
  
  // Actual case: what we actually achieved
  const expectedActualUs = getExpectedPoints(isWhiteMove ? evalAfter : -evalAfter);
  
  // Point loss is how much worse we did compared to best
  // Opponent's win probability before - our win probability after (best vs actual)
  const pointLoss = Math.max(0, expectedBestUs - expectedActualUs);
  
  return pointLoss;
}

/**
 * Calculate accuracy for a single move
 * 
 * Uses WintrChess/Chess.com formula: accuracy = 103.16 * exp(-4 * pointLoss) - 3.17
 * This provides:
 * - ~100% for the best move (0 point loss)
 * - ~99% for theory moves with minimal loss (~0.01 point loss)
 * - ~95% for excellent moves (~0.02 point loss)
 * - ~50% for significant mistakes (~0.15 point loss)
 * - ~10% for blunders (~0.3+ point loss)
 * 
 * @param evalBefore - Evaluation before the move (cp)
 * @param evalAfter - Evaluation after the move (cp)
 * @param bestEval - Best possible evaluation (cp)
 * @param isWhiteMove - Whether it's White's move
 * @returns Accuracy percentage (0-100)
 */
export function calculateMoveAccuracy(
  evalBefore: number,
  evalAfter: number,
  bestEval: number,
  isWhiteMove: boolean
): number {
  // Calculate point loss (win probability loss)
  const pointLoss = getPointLoss(evalBefore, evalAfter, bestEval, isWhiteMove);
  
  // Apply WintrChess formula (matches Chess.com methodology)
  // Formula: 103.16 * e^(-4 * pointLoss) - 3.17
  const accuracy = 103.16 * Math.exp(-4 * pointLoss) - 3.17;
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, accuracy));
}

/**
 * Categorize a move based on eval loss
 */
function categorizMove(evalLoss: number): 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' {
  if (evalLoss <= 10) return 'best';
  if (evalLoss <= 25) return 'good';
  if (evalLoss <= 100) return 'inaccuracy';
  if (evalLoss <= 200) return 'mistake';
  return 'blunder';
}

/**
 * Calculate game phase for a move
 */
function getGamePhase(moveNumber: number): 'opening' | 'middlegame' | 'endgame' {
  if (moveNumber < 10) return 'opening';
  if (moveNumber < 30) return 'middlegame';
  return 'endgame';
}

/**
 * Calculate accuracy metrics for a player
 */
export function calculatePlayerAccuracy(
  moves: Array<{ from: string; to: string }>,
  evaluations: number[],
  bestEvals: number[],
  isWhite: boolean
): AccuracyMetrics {
  const metrics: AccuracyMetrics = {
    overall: 0,
    opening: 0,
    middlegame: 0,
    endgame: 0,
    bestMoves: 0,
    goodMoves: 0,
    inaccuracies: 0,
    mistakes: 0,
    blunders: 0,
  };

  // Filter moves for this player (white = even indices, black = odd indices)
  const playerMoveIndices = moves
    .map((_, i) => i)
    .filter(i => (i % 2 === 0) === isWhite);

  if (playerMoveIndices.length === 0) {
    return metrics;
  }

  // Track accuracies by phase
  const phaseAccuracies: Record<string, number[]> = {
    opening: [],
    middlegame: [],
    endgame: [],
  };

  let totalAccuracy = 0;

  for (const moveIndex of playerMoveIndices) {
    const evalBefore = evaluations[moveIndex];
    const evalAfter = evaluations[moveIndex + 1];
    const bestEval = bestEvals[moveIndex];

    // Calculate accuracy for this move
    const accuracy = calculateMoveAccuracy(evalBefore, evalAfter, bestEval, isWhite);
    totalAccuracy += accuracy;

    // Add to phase tracking
    const phase = getGamePhase(moveIndex);
    phaseAccuracies[phase].push(accuracy);

    // Calculate eval loss for categorization
    const actualChange = isWhite ? evalAfter - evalBefore : evalBefore - evalAfter;
    const bestChange = isWhite ? bestEval - evalBefore : evalBefore - bestEval;
    const evalLoss = Math.max(0, bestChange - actualChange);

    // Categorize move
    const category = categorizMove(evalLoss);
    switch (category) {
      case 'best':
        metrics.bestMoves++;
        metrics.goodMoves++;
        break;
      case 'good':
        metrics.goodMoves++;
        break;
      case 'inaccuracy':
        metrics.inaccuracies++;
        break;
      case 'mistake':
        metrics.mistakes++;
        break;
      case 'blunder':
        metrics.blunders++;
        break;
    }
  }

  // Calculate averages
  metrics.overall = totalAccuracy / playerMoveIndices.length;
  metrics.opening = phaseAccuracies.opening.length > 0
    ? phaseAccuracies.opening.reduce((a, b) => a + b, 0) / phaseAccuracies.opening.length
    : 0;
  metrics.middlegame = phaseAccuracies.middlegame.length > 0
    ? phaseAccuracies.middlegame.reduce((a, b) => a + b, 0) / phaseAccuracies.middlegame.length
    : 0;
  metrics.endgame = phaseAccuracies.endgame.length > 0
    ? phaseAccuracies.endgame.reduce((a, b) => a + b, 0) / phaseAccuracies.endgame.length
    : 0;

  return metrics;
}

/**
 * Calculate accuracy for both players
 */
export function calculateGameAccuracy(
  moves: Array<{ from: string; to: string }>,
  evaluations: number[],
  bestEvals: number[]
): PlayerAccuracy {
  return {
    white: calculatePlayerAccuracy(moves, evaluations, bestEvals, true),
    black: calculatePlayerAccuracy(moves, evaluations, bestEvals, false),
  };
}

/**
 * Get color class for accuracy percentage
 */
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-green-500';
  if (accuracy >= 80) return 'text-green-400';
  if (accuracy >= 70) return 'text-yellow-500';
  if (accuracy >= 60) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get description for accuracy percentage
 */
export function getAccuracyDescription(accuracy: number): string {
  if (accuracy >= 95) return 'Brilliant';
  if (accuracy >= 90) return 'Excellent';
  if (accuracy >= 80) return 'Very Good';
  if (accuracy >= 70) return 'Good';
  if (accuracy >= 60) return 'Decent';
  if (accuracy >= 50) return 'Fair';
  return 'Poor';
}
