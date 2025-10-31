/**
 * Accuracy Calculation Test
 * 
 * This tests the accuracy calculation formula to ensure it's correct.
 */

import { calculateMoveAccuracy, calculateGameAccuracy } from './lib/analysis/accuracy';

console.log('===== ACCURACY CALCULATION TESTS =====\n');

// Test 1: Perfect move (0cp loss)
console.log('Test 1: Perfect move (0cp loss)');
const accuracy1 = calculateMoveAccuracy(100, 110, 110, true);
console.log(`  Input: evalBefore=100, evalAfter=110, bestEval=110 (White)`);
console.log(`  Expected: 100%`);
console.log(`  Result: ${accuracy1.toFixed(1)}%`);
console.log(`  ${accuracy1 === 100 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: Small loss (5cp)
console.log('Test 2: Small loss (5cp)');
const accuracy2 = calculateMoveAccuracy(100, 105, 110, true);
console.log(`  Input: evalBefore=100, evalAfter=105, bestEval=110 (White)`);
console.log(`  evalLoss = 5cp`);
console.log(`  Formula: 100 - (100 * 5 / (5 + 5)) = 100 - 50 = 50%`);
console.log(`  Expected: ~50%`);
console.log(`  Result: ${accuracy2.toFixed(1)}%`);
console.log(`  ${accuracy2 >= 49 && accuracy2 <= 51 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 3: Medium loss (10cp)
console.log('Test 3: Medium loss (10cp)');
const accuracy3 = calculateMoveAccuracy(100, 100, 110, true);
console.log(`  Input: evalBefore=100, evalAfter=100, bestEval=110 (White)`);
console.log(`  evalLoss = 10cp`);
console.log(`  Formula: 100 - (100 * 10 / (10 + 5)) = 100 - 66.67 = 33.33%`);
console.log(`  Expected: ~33%`);
console.log(`  Result: ${accuracy3.toFixed(1)}%`);
console.log(`  ${accuracy3 >= 32 && accuracy3 <= 34 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 4: Large loss (100cp - blunder)
console.log('Test 4: Large loss (100cp - blunder)');
const accuracy4 = calculateMoveAccuracy(100, 0, 100, true);
console.log(`  Input: evalBefore=100, evalAfter=0, bestEval=100 (White)`);
console.log(`  evalLoss = 100cp`);
console.log(`  Formula: 100 - (100 * 100 / (100 + 5)) = 100 - 95.24 = 4.76%`);
console.log(`  Expected: ~5%`);
console.log(`  Result: ${accuracy4.toFixed(1)}%`);
console.log(`  ${accuracy4 >= 4 && accuracy4 <= 6 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 5: Black's move (perspective flip)
console.log('Test 5: Black\'s move (perspective flip)');
const accuracy5 = calculateMoveAccuracy(-100, -110, -110, false);
console.log(`  Input: evalBefore=-100, evalAfter=-110, bestEval=-110 (Black)`);
console.log(`  From Black's perspective: their eval improved from 100 to 110`);
console.log(`  Expected: 100%`);
console.log(`  Result: ${accuracy5.toFixed(1)}%`);
console.log(`  ${accuracy5 === 100 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 6: Game accuracy calculation
console.log('Test 6: Full game accuracy calculation');
const moves = [
  { from: 'e2', to: 'e4' },
  { from: 'e7', to: 'e5' },
  { from: 'g1', to: 'f3' },
  { from: 'b8', to: 'c6' },
];
const evaluations = [0, 20, 15, 25, 20]; // Starting + 4 moves
const bestEvals = [0, 20, 20, 25, 25]; // Best possible evals

const gameAccuracy = calculateGameAccuracy(moves, evaluations, bestEvals);
console.log(`  White moves: e2e4, Nf3`);
console.log(`  White eval changes: 0→20 (best: 20, loss: 0), 15→25 (best: 25, loss: 5)`);
console.log(`  White accuracy: ${gameAccuracy.white.overall.toFixed(1)}%`);
console.log(`  Black moves: e7e5, Nc6`);
console.log(`  Black eval changes: 20→15 (best: 20, loss: 5), 25→20 (best: 25, loss: 5)`);
console.log(`  Black accuracy: ${gameAccuracy.black.overall.toFixed(1)}%`);
console.log(`  ${gameAccuracy.white.overall >= 70 && gameAccuracy.black.overall >= 45 ? '✅ PASS' : '❌ FAIL'}\n`);

console.log('===== ALL TESTS COMPLETE =====');
