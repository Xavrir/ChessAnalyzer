'use client';

import type { AccuracyMetrics } from '@/lib/analysis/accuracy';

interface AccuraciesSummaryProps {
  whiteAccuracy: AccuracyMetrics | null;
  blackAccuracy: AccuracyMetrics | null;
  whiteName?: string;
  blackName?: string;
}

export default function AccuraciesSummary({
  whiteAccuracy,
  blackAccuracy,
  whiteName = 'White',
  blackName = 'Black',
}: AccuraciesSummaryProps) {
  const formatAccuracy = (accuracy: AccuracyMetrics | null) => {
    if (accuracy === null) return 'N/A';
    return `${accuracy.overall.toFixed(1)}%`;
  };

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
      <h3 className="mb-3 text-sm font-medium text-neutral-400">Accuracies</h3>
      <div className="flex items-center justify-around">
        <div className="text-center">
          <div className="mb-1 text-xs text-neutral-400">{whiteName}</div>
          <div className="text-2xl font-bold text-neutral-100">
            {formatAccuracy(whiteAccuracy)}
          </div>
        </div>
        <div className="h-8 w-px bg-neutral-700" />
        <div className="text-center">
          <div className="mb-1 text-xs text-neutral-400">{blackName}</div>
          <div className="text-2xl font-bold text-neutral-100">
            {formatAccuracy(blackAccuracy)}
          </div>
        </div>
      </div>
    </div>
  );
}
