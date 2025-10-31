'use client';

import { useMemo } from 'react';
import type { AnnotationType } from '@/lib/analysis/annotations';

interface GameStatsTableProps {
  whiteAnnotations: Partial<Record<AnnotationType, number>>;
  blackAnnotations: Partial<Record<AnnotationType, number>>;
  whiteName?: string;
  blackName?: string;
}

const categories: Array<{
  key: AnnotationType;
  label: string;
  icon: string;
  color: string;
}> = [
  { key: 'brilliant', label: 'Brilliant', icon: '!!', color: 'text-cyan-500' },
  { key: 'critical', label: 'Critical', icon: '!?', color: 'text-purple-500' },
  { key: 'best', label: 'Best', icon: '✓', color: 'text-green-600' },
  { key: 'excellent', label: 'Excellent', icon: '!', color: 'text-green-500' },
  { key: 'okay', label: 'Okay', icon: '○', color: 'text-lime-500' },
  { key: 'inaccuracy', label: 'Inaccuracy', icon: '?!', color: 'text-yellow-500' },
  { key: 'mistake', label: 'Mistake', icon: '?', color: 'text-orange-500' },
  { key: 'blunder', label: 'Blunder', icon: '??', color: 'text-red-500' },
  { key: 'theory', label: 'Theory', icon: '📖', color: 'text-blue-500' },
];

export default function GameStatsTable({
  whiteAnnotations,
  blackAnnotations,
  whiteName = 'White',
  blackName = 'Black',
}: GameStatsTableProps) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="pb-2 text-left font-medium text-neutral-400"></th>
            <th className="pb-2 text-right font-medium text-neutral-300">{whiteName}</th>
            <th className="pb-2 text-center font-medium text-neutral-400"></th>
            <th className="pb-2 text-left font-medium text-neutral-300">{blackName}</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const whiteCount = whiteAnnotations[category.key] || 0;
            const blackCount = blackAnnotations[category.key] || 0;

            return (
              <tr
                key={category.key}
                className="border-b border-neutral-800/50 last:border-0"
              >
                <td className="py-2 text-left text-neutral-300">
                  {category.label}
                </td>
                <td className="py-2 text-right text-neutral-200">
                  {whiteCount}
                </td>
                <td className="py-2 text-center">
                  <span className={`text-lg font-bold ${category.color}`}>
                    {category.icon}
                  </span>
                </td>
                <td className="py-2 text-left text-neutral-200">
                  {blackCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
