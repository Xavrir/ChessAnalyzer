'use client';

import { useEngineStore } from '@/store/useEngineStore';
import { formatEvaluation, evalToBarPercentage } from '@/lib/engine/uci-parser';
import { cn } from '@/lib/utils/cn';

interface EvalBarProps {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function EvalBar({ orientation = 'vertical', className }: EvalBarProps) {
  const { currentInfo, isAnalyzing } = useEngineStore();

  // Calculate bar percentage (0-100, where 50 is equal)
  const percentage = currentInfo ? evalToBarPercentage(currentInfo) : 50;

  // Format evaluation text
  const evalText = currentInfo ? formatEvaluation(currentInfo) : '0.00';

  // Determine if it's a mate score
  const isMate = currentInfo?.score?.mate !== undefined;

  const ariaValue = currentInfo?.score
    ? currentInfo.score.mate !== undefined
      ? currentInfo.score.mate > 0
        ? 1000
        : -1000
      : currentInfo.score.cp ?? 0
    : 0;

  const depth = currentInfo?.depth ?? null;
  const delta = percentage - 50;
  const whiteGain = Math.max(0, delta);
  const blackGain = Math.max(0, -delta);

  if (orientation === 'horizontal') {
    return (
      <section
        className={cn(
          'rounded-lg border border-terminal-green/15 bg-background-secondary/70 px-4 py-3 shadow-sm',
          className
        )}
        role="meter"
        aria-label="Evaluation bar"
        aria-valuemin={-1000}
        aria-valuemax={1000}
        aria-valuenow={ariaValue}
      >
        <div className="flex items-center justify-between text-xs font-mono text-text-secondary mb-2">
          <span>Black</span>
          <span className={cn(
            'text-base font-semibold text-text-primary',
            isMate ? 'text-terminal-green' : percentage > 55 ? 'text-terminal-green' : percentage < 45 ? 'text-orange-400' : 'text-text-secondary'
          )}>
            {evalText}
          </span>
          <span>White</span>
        </div>
        <div className="relative h-4 rounded-full bg-slate-800/80 overflow-hidden">
          <div
            className="absolute inset-y-0 left-1/2 w-px bg-terminal-green/30"
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-1/4 left-1/2 w-px bg-terminal-green/20"
            aria-hidden="true"
            style={{ transform: 'translateX(-50%)' }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-orange-400/50 transition-all duration-200 ease-out"
            style={{ width: `${blackGain}%` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 right-0 bg-terminal-green/60 transition-all duration-200 ease-out"
            style={{ width: `${whiteGain}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-text-secondary">
          <span>−</span>
          <span>
            {depth !== null ? `Depth ${depth}` : 'Depth —'}
            {isAnalyzing && <span className="ml-1 align-middle text-terminal-green">•</span>}
          </span>
          <span>+</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'flex items-center gap-4 rounded-lg border border-terminal-green/15 bg-background-secondary/70 p-4 shadow-sm',
        className
      )}
      role="meter"
      aria-label="Evaluation bar"
      aria-valuemin={-1000}
      aria-valuemax={1000}
      aria-valuenow={ariaValue}
    >
      <div className="relative w-6 min-h-[220px] overflow-hidden rounded-full bg-slate-900/70 border border-terminal-green/20">
        <div
          className="absolute inset-x-0 bottom-0 transition-all duration-200 ease-out bg-terminal-green/60"
          style={{ height: `${percentage}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 transition-all duration-200 ease-out bg-orange-500/50"
          style={{ height: `${100 - percentage}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute left-0 right-0 h-px bg-terminal-green/25"
          style={{ top: '50%' }}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col items-start gap-1">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-text-secondary">Evaluation</p>
        <p
          className={cn(
            'text-2xl font-mono font-semibold',
            isMate ? 'text-terminal-green' : percentage > 55 ? 'text-terminal-green' : percentage < 45 ? 'text-orange-400' : 'text-text-primary'
          )}
          aria-live="polite"
        >
          {evalText}
        </p>
        <p className="text-xs font-mono text-text-secondary">
          {depth !== null ? `Depth ${depth}` : 'Depth —'}
          {isAnalyzing && <span className="ml-1 text-terminal-green">analyzing…</span>}
        </p>
        <div className="mt-2 space-y-1 text-[11px] font-mono text-text-secondary">
          <p><span className="inline-block h-2 w-2 rounded-full bg-terminal-green/70 mr-2" />White advantage</p>
          <p><span className="inline-block h-2 w-2 rounded-full bg-orange-400/70 mr-2" />Black advantage</p>
        </div>
      </div>
    </section>
  );
}
