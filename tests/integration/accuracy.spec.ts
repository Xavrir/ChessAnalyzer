import { describe, it, expect } from 'vitest';
import { calculateMoveAccuracy, calculateGameAccuracy } from '@/lib/analysis/accuracy';

describe('Accuracy calculations', () => {
  it('calculates move accuracy for small, medium, large losses and perfect', () => {
    expect(calculateMoveAccuracy(100, 110, 110, true)).toBe(100);

    const small = calculateMoveAccuracy(100, 105, 110, true);
    expect(small).toBeGreaterThanOrEqual(49);
    expect(small).toBeLessThanOrEqual(51);

    const medium = calculateMoveAccuracy(100, 100, 110, true);
    expect(medium).toBeGreaterThanOrEqual(32);
    expect(medium).toBeLessThanOrEqual(34);

    const blunder = calculateMoveAccuracy(100, 0, 100, true);
    expect(blunder).toBeGreaterThanOrEqual(4);
    expect(blunder).toBeLessThanOrEqual(6);
  });

  it('calculates game accuracy for a short sequence', () => {
    const moves = [
      { from: 'e2', to: 'e4' },
      { from: 'e7', to: 'e5' },
      { from: 'g1', to: 'f3' },
      { from: 'b8', to: 'c6' },
    ];
    const evaluations = [0, 20, 15, 25, 20];
    const bestEvals = [0, 20, 20, 25, 25];

    const { white, black } = calculateGameAccuracy(moves, evaluations, bestEvals);
    expect(white.overall).toBeGreaterThan(60);
    expect(black.overall).toBeGreaterThan(40);
  });
});

