'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  getAccuracyColor,
  getAccuracyDescription,
  type AccuracyMetrics,
} from '@/lib/analysis/accuracy';
import { Trophy, Target, AlertTriangle, XCircle, type LucideIcon } from 'lucide-react';

interface AccuracyPanelProps {
  whiteAccuracy?: AccuracyMetrics;
  blackAccuracy?: AccuracyMetrics;
  className?: string;
}

/**
 * Circular progress indicator for accuracy
 */
function AccuracyCircle({ 
  accuracy, 
  label, 
  size = 80 
}: { 
  accuracy: number; 
  label: string; 
  size?: number 
}) {
  const circumference = 2 * Math.PI * (size / 2 - 5);
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 5}
            fill="none"
            stroke="#333"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 5}
            fill="none"
            stroke="#00ff00"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-mono font-bold', getAccuracyColor(accuracy))}>
            {accuracy.toFixed(0)}%
          </span>
        </div>
      </div>
      <span className="text-xs font-mono text-text-secondary">{label}</span>
    </div>
  );
}

/**
 * Progress bar for phase accuracy
 */
function PhaseBar({ 
  label, 
  accuracy 
}: { 
  label: string; 
  accuracy: number 
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-text-secondary">{label}</span>
        <span className={cn('font-bold', getAccuracyColor(accuracy))}>
          {accuracy > 0 ? accuracy.toFixed(0) : '--'}%
        </span>
      </div>
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-terminal-green transition-all duration-500"
          style={{ width: `${accuracy}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Stat badge showing move categories
 */
function StatBadge({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-bg-secondary/50 rounded">
      <Icon className={cn('w-4 h-4', color)} />
      <div className="flex-1">
        <div className="text-xs font-mono text-text-secondary">{label}</div>
        <div className="text-sm font-mono font-bold text-text-primary">{count}</div>
      </div>
    </div>
  );
}

/**
 * Accuracy Panel Component
 * 
 * Displays accuracy metrics for both players including:
 * - Overall accuracy percentage
 * - Accuracy by game phase (opening, middlegame, endgame)
 * - Move quality statistics
 */
export function AccuracyPanel({
  whiteAccuracy,
  blackAccuracy,
  className,
}: AccuracyPanelProps) {
  const hasData = whiteAccuracy || blackAccuracy;

  if (!hasData) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="border-b border-terminal-green/20 p-3">
          <h3 className="text-sm font-mono text-terminal-green uppercase tracking-wider">
            Accuracy Analysis
          </h3>
        </div>
        <div className="p-4 text-center text-text-secondary font-mono text-sm">
          Analyze the game to see accuracy metrics
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="border-b border-terminal-green/20 p-3">
        <h3 className="text-sm font-mono text-terminal-green uppercase tracking-wider">
          Accuracy Analysis
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Overall Accuracy Circles */}
        <div className="flex justify-around items-center">
          {whiteAccuracy && (
            <AccuracyCircle
              accuracy={whiteAccuracy.overall}
              label="White"
              size={90}
            />
          )}
          {blackAccuracy && (
            <AccuracyCircle
              accuracy={blackAccuracy.overall}
              label="Black"
              size={90}
            />
          )}
        </div>

        {/* White Player Details */}
        {whiteAccuracy && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-terminal-green uppercase tracking-wider">
              White • {getAccuracyDescription(whiteAccuracy.overall)}
            </h4>
            
            {/* Phase Accuracy */}
            <div className="space-y-2">
              <PhaseBar label="Opening" accuracy={whiteAccuracy.opening} />
              <PhaseBar label="Middlegame" accuracy={whiteAccuracy.middlegame} />
              <PhaseBar label="Endgame" accuracy={whiteAccuracy.endgame} />
            </div>

            {/* Move Quality Stats */}
            <div className="grid grid-cols-2 gap-2">
              <StatBadge
                icon={Trophy}
                label="Best Moves"
                count={whiteAccuracy.bestMoves}
                color="text-cyan-500"
              />
              <StatBadge
                icon={Target}
                label="Good Moves"
                count={whiteAccuracy.goodMoves}
                color="text-green-500"
              />
              <StatBadge
                icon={AlertTriangle}
                label="Inaccuracies"
                count={whiteAccuracy.inaccuracies}
                color="text-yellow-500"
              />
              <StatBadge
                icon={XCircle}
                label="Mistakes"
                count={whiteAccuracy.mistakes + whiteAccuracy.blunders}
                color="text-red-500"
              />
            </div>
          </div>
        )}

        {/* Black Player Details */}
        {blackAccuracy && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-terminal-green uppercase tracking-wider">
              Black • {getAccuracyDescription(blackAccuracy.overall)}
            </h4>
            
            {/* Phase Accuracy */}
            <div className="space-y-2">
              <PhaseBar label="Opening" accuracy={blackAccuracy.opening} />
              <PhaseBar label="Middlegame" accuracy={blackAccuracy.middlegame} />
              <PhaseBar label="Endgame" accuracy={blackAccuracy.endgame} />
            </div>

            {/* Move Quality Stats */}
            <div className="grid grid-cols-2 gap-2">
              <StatBadge
                icon={Trophy}
                label="Best Moves"
                count={blackAccuracy.bestMoves}
                color="text-cyan-500"
              />
              <StatBadge
                icon={Target}
                label="Good Moves"
                count={blackAccuracy.goodMoves}
                color="text-green-500"
              />
              <StatBadge
                icon={AlertTriangle}
                label="Inaccuracies"
                count={blackAccuracy.inaccuracies}
                color="text-yellow-500"
              />
              <StatBadge
                icon={XCircle}
                label="Mistakes"
                count={blackAccuracy.mistakes + blackAccuracy.blunders}
                color="text-red-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
