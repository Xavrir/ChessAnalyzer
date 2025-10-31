/**
 * Opening Info Component
 * 
 * Displays the detected opening name and ECO code
 */

import type { OpeningInfo } from '@/lib/chess/openings';
import { getOpeningDisplayName } from '@/lib/chess/openings';

interface OpeningInfoProps {
  opening: OpeningInfo | null;
}

export default function OpeningInfoDisplay({ opening }: OpeningInfoProps) {
  if (!opening) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-terminal-green/20 flex items-center justify-center">
            <span className="text-terminal-green text-xs font-mono font-bold">?</span>
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-terminal-green uppercase tracking-wider">
              Opening
            </h3>
          </div>
        </div>
        <div className="pl-10">
          <p className="text-text-secondary text-xs font-mono">
            Unknown or Custom Opening
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-terminal-green/20 flex items-center justify-center border border-terminal-green/30">
          <span className="text-terminal-green text-xs font-mono font-bold">
            {opening.eco.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="text-sm font-mono font-bold text-terminal-green uppercase tracking-wider">
            Opening
          </h3>
        </div>
      </div>
      <div className="pl-10 space-y-1">
        <p className="text-text-primary text-sm font-mono font-bold">
          {opening.name}
        </p>
        {opening.variation && (
          <p className="text-terminal-green/70 text-xs font-mono">
            {opening.variation}
          </p>
        )}
        <p className="text-text-secondary text-xs font-mono">
          ECO: {opening.eco}
        </p>
      </div>
    </div>
  );
}
