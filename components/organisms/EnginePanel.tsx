/**
 * EnginePanel Component - Stockfish engine controls and analysis display
 * Shows best moves, principal variations, and engine statistics
 */

'use client';

import { useEffect } from 'react';
import { useEngineStore } from '@/store/useEngineStore';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/atoms/Button';
import { formatNPS, formatTime } from '@/lib/engine/uci-parser';
import { uciToSan, uciMovesToSan } from '@/lib/chess/uci-to-san';
import { Play, Square, Brain, Settings, TrendingUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function EnginePanel() {
  const {
    isInitialized,
    isAnalyzing,
    isBatchAnalysis,
    currentInfo,
    bestMove,
    analyzedFen,
    multiPVLines,
    depth,
    multiPV,
    error,
    initEngine,
    analyzePosition,
    stopAnalysis,
    setDepth,
    setMultiPV,
  } = useEngineStore();

  const { fen } = useGameStore();

  // Initialize engine on mount
  useEffect(() => {
    if (!isInitialized) {
      initEngine();
    }
  }, [isInitialized, initEngine]);

  // Auto-analyze on position change (if already analyzing)
  // IMPORTANT: Skip auto-analysis during batch mode to prevent race conditions
  useEffect(() => {
    if (isAnalyzing && fen && !isBatchAnalysis) {
      analyzePosition(fen);
    }
  }, [fen, isAnalyzing, isBatchAnalysis, analyzePosition]);

  // Handle start/stop analysis
  const handleToggleAnalysis = () => {
    if (isAnalyzing) {
      stopAnalysis();
    } else {
      if (fen) {
        analyzePosition(fen);
      }
    }
  };

  // Show simplified UI during batch analysis to prevent race conditions
  // IMPORTANT: Do this check BEFORE any UCI-to-SAN conversions to avoid race conditions
  if (isBatchAnalysis) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-terminal-green animate-pulse" />
            <h3 className="text-lg font-bold text-terminal-green uppercase tracking-wider">
              STOCKFISH ENGINE
            </h3>
          </div>
          
          <div className="px-2 py-1 bg-terminal-green/20 text-terminal-green border border-terminal-green/50 rounded text-xs font-mono animate-pulse">
            BATCH ANALYSIS
          </div>
        </div>

        {/* Batch analysis message */}
        <div className="p-4 bg-terminal-green/10 border border-terminal-green/30 rounded">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
            <span className="text-terminal-green font-mono text-sm">
              Analyzing entire game...
            </span>
          </div>
          <p className="text-terminal-white/60 text-xs font-mono">
            Engine panel will resume after analysis completes.
          </p>
        </div>
      </div>
    );
  }

  // Convert best move from UCI to SAN (use analyzedFen, not current board FEN)
  // IMPORTANT: This runs AFTER the batch mode check to prevent race conditions
  // If analyzedFen is null, fall back to displaying UCI notation
  const bestMoveSan = bestMove && analyzedFen ? uciToSan(analyzedFen, bestMove) : (bestMove || '');

  // Format best move for display with source and destination squares
  const formatBestMoveDetailed = (uciMove: string): { from: string; to: string; san: string } | null => {
    if (!uciMove || uciMove.length < 4) return null;
    
    return {
      from: uciMove.substring(0, 2).toUpperCase(),
      to: uciMove.substring(2, 4).toUpperCase(),
      san: bestMoveSan || uciMove.toUpperCase(),
    };
  };

  const bestMoveDetails = bestMove ? formatBestMoveDetailed(bestMove) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-terminal-green" />
          <h3 className="text-lg font-bold text-terminal-green uppercase tracking-wider">
            STOCKFISH ENGINE
          </h3>
        </div>
        
        {isInitialized && (
          <div className="px-2 py-1 bg-terminal-green/20 text-terminal-green border border-terminal-green/50 rounded text-xs font-mono">
            READY
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm font-mono">
          ERROR: {error}
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {/* Start/Stop button */}
        <Button
          variant={isAnalyzing ? 'danger' : 'primary'}
          onClick={handleToggleAnalysis}
          disabled={!isInitialized}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Square className="w-4 h-4" />
              STOP ANALYSIS
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              START ANALYSIS
            </>
          )}
        </Button>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-3">
          {/* Depth control */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-mono text-terminal-cyan/80">
              <Settings className="w-3 h-3" />
              DEPTH: {depth}
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value))}
              disabled={isAnalyzing}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-terminal-green"
            />
          </div>

          {/* Multi-PV control */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-mono text-terminal-cyan/80">
              <TrendingUp className="w-3 h-3" />
              LINES: {multiPV}
            </label>
            <input
              type="range"
              min="1"
              max="3"
              value={multiPV}
              onChange={(e) => setMultiPV(parseInt(e.target.value))}
              disabled={isAnalyzing}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-terminal-green"
            />
          </div>
        </div>
      </div>

      {/* Engine statistics */}
      {currentInfo && (
        <div className="p-3 bg-background-secondary border border-terminal-green/30 rounded space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div>
              <div className="text-terminal-cyan/60">DEPTH</div>
              <div className="text-terminal-green font-bold">
                {currentInfo.depth}/{currentInfo.seldepth || '-'}
              </div>
            </div>
            
            <div>
              <div className="text-terminal-cyan/60">NODES</div>
              <div className="text-terminal-green font-bold">
                {currentInfo.nodes ? formatNPS(currentInfo.nodes) : '-'}
              </div>
            </div>
            
            <div>
              <div className="text-terminal-cyan/60">SPEED</div>
              <div className="text-terminal-green font-bold">
                {currentInfo.nps ? `${formatNPS(currentInfo.nps)}/s` : '-'}
              </div>
            </div>
          </div>

          {currentInfo.time !== undefined && (
            <div className="text-xs font-mono text-terminal-cyan/60">
              Time: {formatTime(currentInfo.time)}
            </div>
          )}
        </div>
      )}

      {/* Best move */}
      {bestMoveDetails && (
        <div className="p-4 bg-gradient-to-br from-terminal-green/10 to-terminal-green/5 border-2 border-terminal-green rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-terminal-cyan/80 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="uppercase tracking-wider">Best Move Suggestion</span>
          </div>
          
          <div className="flex items-center justify-between">
            {/* SAN notation - primary display */}
            <div>
              <div className="text-3xl font-bold font-mono text-terminal-green">
                {bestMoveDetails.san}
              </div>
              <div className="text-xs font-mono text-terminal-cyan/60 mt-1">
                {bestMoveDetails.from} → {bestMoveDetails.to}
              </div>
            </div>
            
            {/* Evaluation if available */}
            {currentInfo?.score && (
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-terminal-green">
                  {currentInfo.score.mate !== undefined
                    ? `M${Math.abs(currentInfo.score.mate)}`
                    : `${(currentInfo.score.cp! / 100).toFixed(2)}`}
                </div>
                <div className="text-xs font-mono text-terminal-cyan/60">
                  Evaluation
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Principal variations */}
      {(multiPV > 1 ? multiPVLines : currentInfo?.pv ? [currentInfo] : []).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-terminal-cyan/80 uppercase tracking-wider">
            PRINCIPAL VARIATION{multiPV > 1 ? 'S' : ''}
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {(multiPV > 1 ? multiPVLines : currentInfo?.pv ? [currentInfo] : []).map((info, index) => {
              if (!info || !info.pv || info.pv.length === 0) return null;
              
              const evalText = info.score?.mate !== undefined
                ? `M${Math.abs(info.score.mate)}`
                : info.score?.cp !== undefined
                ? `${(info.score.cp / 100).toFixed(2)}`
                : '0.00';
              
              const isPositive = 
                (info.score?.mate !== undefined && info.score.mate > 0) ||
                (info.score?.cp !== undefined && info.score.cp > 0);

              // Convert UCI moves to SAN (use analyzedFen, not current board FEN)
              const sanMoves = analyzedFen ? uciMovesToSan(analyzedFen, info.pv.slice(0, 10)) : info.pv.slice(0, 10);

              return (
                <div
                  key={index}
                  className={cn(
                    'p-3 border rounded text-xs font-mono',
                    index === 0
                      ? 'bg-terminal-green/5 border-terminal-green'
                      : 'bg-background-tertiary border-terminal-green/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-terminal-cyan/60">
                      {multiPV > 1 ? `Line ${index + 1}` : 'Best line'}
                    </span>
                    <span
                      className={cn(
                        'font-bold text-lg',
                        isPositive ? 'text-terminal-green' : 'text-red-500'
                      )}
                    >
                      {isPositive ? '+' : ''}{evalText}
                    </span>
                  </div>
                  
                  <div className="text-terminal-green/90 leading-relaxed">
                    {sanMoves.map((move, i) => (
                      <span key={i} className="mr-2">
                        {i % 2 === 0 && `${Math.floor(i / 2) + 1}. `}
                        <span className="font-bold">{move}</span>
                      </span>
                    ))}
                    {info.pv.length > 10 && <span className="text-terminal-cyan/50">...</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {!isInitialized && !error && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-terminal-green border-t-transparent rounded-full animate-spin mb-2" />
          <div className="text-sm font-mono text-terminal-cyan/60">
            Initializing Stockfish...
          </div>
        </div>
      )}
    </div>
  );
}
