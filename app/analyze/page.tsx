'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, StopCircle } from 'lucide-react';
import { Chessboard } from '@/components/organisms/Chessboard';
import { MoveList } from '@/components/organisms/MoveList';
import { Controls } from '@/components/organisms/Controls';
import { ImportDialog } from '@/components/organisms/ImportDialog';
import { EnginePanel } from '@/components/organisms/EnginePanel';
import { EvalBar } from '@/components/molecules/EvalBar';
import { AdvantageChart } from '@/components/organisms/AdvantageChart';
import AccuraciesSummary from '@/components/organisms/AccuraciesSummary';
import GameStatsTable from '@/components/organisms/GameStatsTable';
import OpeningInfoDisplay from '@/components/organisms/OpeningInfo';
import { useGameStore } from '@/store/useGameStore';
import { useAnalysis } from '@/hooks/useAnalysis';
import { cn } from '@/lib/utils/cn';
import { countAnnotations, getPlayerAnnotations } from '@/lib/analysis/annotations';

export default function AnalyzePage() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { analysis, currentMoveIndex, goToMove } = useGameStore();
  const { analyzeGame, cancelAnalysis, isAnalyzing, progress, error } = useAnalysis();

  // Calculate annotation counts for both players
  const annotationStats = useMemo(() => {
    if (!analysis?.annotations) {
      return { white: {}, black: {} };
    }

    const whiteAnnotations = getPlayerAnnotations(analysis.annotations, true);
    const blackAnnotations = getPlayerAnnotations(analysis.annotations, false);

    return {
      white: countAnnotations(whiteAnnotations),
      black: countAnnotations(blackAnnotations),
    };
  }, [analysis?.annotations]);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Header */}
      <header className="border-b border-terminal-green/20 bg-background-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="group flex items-center gap-2 rounded border border-terminal-green/30 bg-terminal-green/10 px-4 py-2 text-sm font-mono text-terminal-green transition-all duration-200 hover:bg-terminal-green hover:text-black hover:shadow-[0_0_15px_rgba(1,232,124,0.4)]"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                BACK
              </Link>
              <h1 className="text-2xl font-mono font-bold text-terminal-green uppercase tracking-wider">
                Chess Analysis
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section className="flex flex-col gap-6">
            <div className="rounded-xl border border-terminal-green/15 bg-background-secondary/70 p-5 shadow-lg">
              <div className="flex flex-col gap-5">
                <div className="lg:hidden">
                  <EvalBar orientation="horizontal" />
                </div>
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="flex-1 min-w-0">
                    <Chessboard />
                  </div>
                  <div className="hidden lg:flex lg:w-36 lg:flex-col lg:justify-center">
                    <EvalBar
                      orientation="vertical"
                      className="border-0 bg-transparent p-0 shadow-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-terminal-green/15 bg-background-secondary/70 shadow-lg">
              <MoveList />
            </div>

            {analysis && analysis.evaluations.length > 0 && (
              <div className="rounded-xl border border-terminal-green/15 bg-background-secondary/70 shadow-lg">
                <AdvantageChart
                  evaluations={analysis.evaluations}
                  currentMove={currentMoveIndex}
                  onMoveClick={goToMove}
                  className="rounded-xl border-none bg-transparent"
                />
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-xl border border-terminal-green/15 bg-background-secondary/70 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-terminal-green">
                  Analysis Controls
                </h2>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="text-xs font-mono text-terminal-green underline-offset-4 hover:underline"
                >
                  Import game
                </button>
              </div>
              <div className="mt-4 space-y-5">
                <Controls />
                <button
                  type="button"
                  onClick={isAnalyzing ? cancelAnalysis : analyzeGame}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-mono text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    isAnalyzing
                      ? 'border border-red-400/60 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                      : 'border border-terminal-green/50 bg-terminal-green/15 text-terminal-green hover:bg-terminal-green hover:text-black'
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <StopCircle className="h-4 w-4" />
                      Stop analysis
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Analyze game
                    </>
                  )}
                </button>
                <div className="min-h-[1rem] text-xs font-mono text-text-secondary" aria-live="polite">
                  {isAnalyzing && progress.total > 0 ? (
                    <span>
                      {progress.status || `Analyzing move ${progress.current}/${progress.total}`}
                    </span>
                  ) : (
                    <span className="text-text-secondary/70">
                      Ready to analyze your current game.
                    </span>
                  )}
                </div>
                {error && (
                  <p className="text-xs font-mono text-red-400" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {analysis && (
              <div className="rounded-xl border border-terminal-green/15 bg-background-secondary/70 p-5 shadow-lg">
                <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-terminal-green">
                  Insights
                </h2>
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-terminal-green/10 bg-background-primary/70 p-4">
                    <OpeningInfoDisplay opening={analysis.opening || null} />
                  </div>
                  {analysis.accuracy && (
                    <div className="rounded-lg border border-terminal-green/10 bg-background-primary/70 p-4">
                      <AccuraciesSummary
                        whiteAccuracy={analysis.accuracy.white}
                        blackAccuracy={analysis.accuracy.black}
                        whiteName="White"
                        blackName="Black"
                      />
                    </div>
                  )}
                  {analysis.annotations && (
                    <div className="rounded-lg border border-terminal-green/10 bg-background-primary/70 p-4">
                      <GameStatsTable
                        whiteAnnotations={annotationStats.white}
                        blackAnnotations={annotationStats.black}
                        whiteName="White"
                        blackName="Black"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-terminal-green/15 bg-background-secondary/70 p-5 shadow-lg">
              <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-terminal-green">
                Engine Output
              </h2>
              <div className="mt-4">
                <EnginePanel />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Import Dialog */}
      <ImportDialog 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
      />
    </div>
  );
}
