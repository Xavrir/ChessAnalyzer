'use client';

import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useEngineStore } from '@/store/useEngineStore';
import { annotateGame } from '@/lib/analysis/annotations';
import { calculateGameAccuracy } from '@/lib/analysis/accuracy';
import { detectOpening, extractSANMoves } from '@/lib/chess/openings';
import type { UCIInfo } from '@/lib/engine/uci-parser';
import { formatEvaluation } from '@/lib/engine/uci-parser';

/**
 * Hook for analyzing chess games
 * 
 * Orchestrates the full game analysis workflow:
 * 1. Analyzes each position with the engine
 * 2. Collects evaluations and best moves
 * 3. Generates move annotations
 * 4. Calculates accuracy metrics
 * 5. Detects opening
 * 6. Updates game store with results
 */
export function useAnalysis() {
  const { moveHistory, positionHistory, setAnalysis } = useGameStore();
  const { analyzePosition, stopAnalysis, isInitialized } = useEngineStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [error, setError] = useState<string | null>(null);
  const shouldCancelRef = useRef(false);

  const resetProgress = useCallback(() => {
    setProgress({ current: 0, total: 0, status: '' });
  }, []);

  /**
   * Analyze the entire game
   */
  const analyzeGame = useCallback(async () => {
    if (!isInitialized) {
      setError('Engine not initialized. Please wait for initialization to complete.');
      return;
    }

    if (moveHistory.length === 0) {
      setError('No moves to analyze. Please load a game first.');
      return;
    }

    shouldCancelRef.current = false;
    setIsAnalyzing(true);
    setError(null);
    setProgress({
      current: 0,
      total: positionHistory.length,
      status: positionHistory.length ? 'Preparing engine…' : '',
    });

    // Enable batch mode to prevent live UI updates during analysis
    useEngineStore.getState().setBatchMode(true);

    try {
      const evaluations: number[] = [];
      const bestEvaluations: number[] = []; // Separate array for "best eval after best move"
      const bestMoves: string[] = [];

      // Analyze each position
      const targetDepth = useEngineStore.getState().depth ?? 18;
      const maxPerPositionMs = 10000;
      const stallTimeoutMs = 1800;

      const waitForAnalysis = async (moveIndex: number) => {
        const start = performance.now();
        let lastDepth = 0;
        let lastScoreSignature = '';
        let lastProgressUpdate = start;
        let settled = false;

        return new Promise<{ info: UCIInfo | null; bestMove: string } | null>((resolve) => {
          const cleanup = () => {
            if (settled) return;
            settled = true;
            clearInterval(pollInterval);
            clearTimeout(timeLimit);
          };

          const timeLimit = setTimeout(() => {
            cleanup();
            resolve({
              info: useEngineStore.getState().currentInfo,
              bestMove: useEngineStore.getState().bestMove || '',
            });
          }, maxPerPositionMs);

          const pollInterval = setInterval(() => {
            if (shouldCancelRef.current) {
              cleanup();
              resolve(null);
              return;
            }

            const { currentInfo: info, bestMove: best, isAnalyzing: engineBusy } = useEngineStore.getState();
            const depth = info?.depth ?? 0;
            const scoreSignature = info?.score
              ? `${info.score.cp ?? ''}|${info.score.mate ?? ''}`
              : '';

            if (info) {
              setProgress({
                current: moveIndex + 1,
                total: positionHistory.length,
                status: `Move ${moveIndex + 1}/${positionHistory.length} · depth ${depth}${info.score ? ` · eval ${formatEvaluation(info)}` : ''}`,
              });
            }

            if (info && (depth > lastDepth || scoreSignature !== lastScoreSignature)) {
              lastDepth = depth;
              lastScoreSignature = scoreSignature;
              lastProgressUpdate = performance.now();
            }

            const reachedTargetDepth = depth >= targetDepth;
            const reachedUsableDepth = depth >= Math.min(12, targetDepth);
            const depthStalled = reachedUsableDepth && performance.now() - lastProgressUpdate > stallTimeoutMs;
            const timeElapsed = performance.now() - start;

            if (!engineBusy && best) {
              cleanup();
              resolve({ info, bestMove: best });
              return;
            }

            if (reachedTargetDepth || depthStalled || timeElapsed > maxPerPositionMs) {
              stopAnalysis();

              setTimeout(() => {
                const state = useEngineStore.getState();
                cleanup();
                resolve({
                  info: state.currentInfo,
                  bestMove: state.bestMove || '',
                });
              }, 150);
              return;
            }
          }, 150);
        });
      };

      for (let i = 0; i < positionHistory.length; i++) {
        const fen = positionHistory[i];
        
        if (shouldCancelRef.current) {
          break;
        }

        setProgress({
          current: i + 1,
          total: positionHistory.length,
          status: `Move ${i + 1}/${positionHistory.length} · starting`,
        });

        // Start analysis for this position
        analyzePosition(fen);

        const analysisResult = await waitForAnalysis(i);

        if (!analysisResult) {
          break;
        }

        // Extract current position evaluation (before any move)
        const finalInfo = analysisResult.info;
        const currentEval = (finalInfo?.score?.mate !== undefined && finalInfo?.score?.mate !== null)
          ? (finalInfo.score.mate > 0 ? 10000 : -10000)
          : (finalInfo?.score?.cp ?? 0);
        
        evaluations.push(currentEval);
        bestMoves.push(analysisResult.bestMove);

        // Extract "best eval" from the engine's evaluation
        // The engine's score assumes best continuation, so it represents
        // the evaluation AFTER playing the best move from this position.
        // This is what we need for the "bestEval" in accuracy calculation.
        const bestEval = currentEval; // Engine eval already assumes best play
        bestEvaluations.push(bestEval);

        // Small delay between positions
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!shouldCancelRef.current) {
        // Generate annotations
        const annotations = annotateGame(
          moveHistory.map(m => ({ from: m.from, to: m.to, promotion: m.promotion })),
          evaluations,
          bestMoves
        );

        // Calculate accuracy
        const accuracy = calculateGameAccuracy(
          moveHistory.map(m => ({ from: m.from, to: m.to })),
          evaluations,
          bestEvaluations
        );

        // Detect opening
        const sanMoves = extractSANMoves(moveHistory);
        const opening = detectOpening(sanMoves);

        // Update store with analysis results
        setAnalysis({
          evaluations,
          bestMoves,
          annotations,
          accuracy,
          opening,
        });
      }

      setIsAnalyzing(false);
      resetProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
      resetProgress();
    } finally {
      // Always disable batch mode when analysis completes or fails
      useEngineStore.getState().setBatchMode(false);
      shouldCancelRef.current = false;
    }
  }, [
    moveHistory,
    positionHistory,
    isInitialized,
    analyzePosition,
    setAnalysis,
    resetProgress,
    stopAnalysis,
  ]);

  /**
   * Cancel ongoing analysis
   */
  const cancelAnalysis = useCallback(() => {
    shouldCancelRef.current = true;
    stopAnalysis();
    setIsAnalyzing(false);
    resetProgress();
  }, [stopAnalysis, resetProgress]);

  /**
   * Quick analysis (analyze current position only)
   */
  const analyzeCurrentPosition = useCallback(async (fen: string) => {
    if (!isInitialized) {
      setError('Engine not initialized');
      return null;
    }

    analyzePosition(fen);

    // Wait for analysis to complete
    return new Promise<{ evaluation: number; bestMove: string } | null>((resolve) => {
      const checkInterval = setInterval(() => {
        const { currentInfo: info, bestMove: best } = useEngineStore.getState();
        
        if (best || (info && info.depth >= 15)) {
          clearInterval(checkInterval);
          
          const evaluation = info?.score?.mate
            ? (info.score.mate > 0 ? 10000 : -10000)
            : info?.score?.cp || 0;
          
          resolve({
            evaluation,
            bestMove: best || '',
          });
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null);
      }, 10000);
    });
  }, [isInitialized, analyzePosition]);

  return {
    analyzeGame,
    cancelAnalysis,
    analyzeCurrentPosition,
    isAnalyzing,
    progress,
    error,
  };
}
