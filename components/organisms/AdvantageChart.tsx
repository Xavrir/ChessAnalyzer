'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { cn } from '@/lib/utils/cn';

interface AdvantageChartProps {
  evaluations: number[]; // Evaluation for each position (in centipawns)
  currentMove: number;   // Currently selected move index
  onMoveClick?: (moveIndex: number) => void;
  className?: string;
}

/**
 * Advantage Chart Component
 *
 * Displays a chart showing evaluation swing across the game.
 * Positive values indicate a White edge, negative values favour Black.
 */
export function AdvantageChart({
  evaluations,
  currentMove,
  onMoveClick,
  className,
}: AdvantageChartProps) {
  const { chartData, maxAbsEval } = useMemo(() => {
    if (evaluations.length === 0) {
      return { chartData: [], maxAbsEval: 0 };
    }

    let maxAbs = 1;
    const data = evaluations.map((evalCp, index) => {
      const pawns = evalCp / 100;
      maxAbs = Math.max(maxAbs, Math.abs(pawns));
      return {
        move: index,
        eval: pawns,
        whiteArea: pawns > 0 ? pawns : 0,
        blackArea: pawns < 0 ? pawns : 0,
        isCurrent: index === currentMove + 1, // +1 because evaluations include the starting position
      };
    });

    const paddedMax = Math.min(20, Math.max(4, Math.ceil(maxAbs + 0.5)));

    return {
      chartData: data,
      maxAbsEval: paddedMax,
    };
  }, [evaluations, currentMove]);

  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { eval: number; move: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const evalValue = data.eval;
      const moveNum = data.move;

      return (
        <div className="rounded border border-terminal-green/20 bg-background-secondary/80 px-3 py-2 shadow-sm">
          <p className="text-xs font-mono text-terminal-green">
            {moveNum === 0 ? 'Start position' : `Move ${moveNum}`}
          </p>
          <p className="text-sm font-mono text-text-primary">
            Eval: {evalValue > 0 ? '+' : ''}{evalValue.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleChartClick = useMemo(() => {
    return (data: unknown) => {
      const chartPayload = data as { activePayload?: Array<{ payload: { move: number } }> };
      if (chartPayload?.activePayload?.length) {
        const moveIndex = chartPayload.activePayload[0].payload.move;
        if (moveIndex > 0 && onMoveClick) {
          onMoveClick(moveIndex - 1);
        }
      }
    };
  }, [onMoveClick]);

  if (chartData.length === 0) {
    return (
      <div className={cn(
        'flex h-48 items-center justify-center rounded border border-terminal-green/15 bg-background-secondary/60',
        className
      )}>
        <p className="text-sm font-mono text-text-secondary">
          No evaluation data available yet.
        </p>
      </div>
    );
  }

  const tickHalf = Math.round(maxAbsEval / 2);
  const ticks = [-maxAbsEval, -tickHalf, 0, tickHalf, maxAbsEval];

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="border-b border-terminal-green/15 px-4 py-3">
        <h3 className="text-sm font-mono uppercase tracking-widest text-terminal-green">
          Advantage Chart
        </h3>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={chartData}
            onClick={handleChartClick}
            margin={{ top: 8, right: 12, left: -10, bottom: 8 }}
          >
            <defs>
              <linearGradient id="adv-white" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="adv-black" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.2} />

            <XAxis
              dataKey="move"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(value) => (value === 0 ? '' : value.toString())}
            />

            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={[-maxAbsEval, maxAbsEval]}
              ticks={ticks}
              tickFormatter={(value) => (value > 0 ? `+${value}` : value.toString())}
            />

            <ReferenceLine
              y={0}
              stroke="#cbd5f5"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />

            <Tooltip content={renderTooltip} />

            <Area
              type="monotone"
              dataKey="whiteArea"
              stroke="#22c55e"
              fill="url(#adv-white)"
              strokeWidth={1.5}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="blackArea"
              stroke="#f97316"
              fill="url(#adv-black)"
              strokeWidth={1.5}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="eval"
              stroke="#e2e8f0"
              strokeWidth={2}
              dot={(props: { cx?: number; cy?: number; payload?: { isCurrent?: boolean; move?: number } }) => {
                const { cx, cy, payload } = props;
                const key = `dot-${payload?.move || 0}`;
                if (payload?.isCurrent) {
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#22c55e"
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  );
                }
                return (
                  <circle
                    key={key}
                    cx={cx}
                    cy={cy}
                    r={2}
                    fill="#22c55e"
                    opacity={0.6}
                  />
                );
              }}
              activeDot={{
                r: 6,
                fill: '#22c55e',
                stroke: '#0f172a',
                strokeWidth: 2,
                cursor: 'pointer',
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-3 flex items-center justify-center gap-6 text-xs font-mono text-text-secondary">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-6 rounded-full bg-terminal-green/80" />
            White advantage
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-6 rounded-full bg-orange-400/80" />
            Black advantage
          </span>
        </div>
      </div>
    </div>
  );
}
