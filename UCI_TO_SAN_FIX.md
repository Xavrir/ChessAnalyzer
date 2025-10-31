# UCI to SAN Conversion Fix

## Problem Identified

The console was flooded with hundreds of warnings like:
```
Failed to convert UCI "d2d4" to SAN: Error: Invalid move: {"from":"d2","to":"d4"}
```

These errors occurred when displaying the Principal Variation (PV) moves returned by Stockfish.

## Root Cause

The issue was a **FEN mismatch** between:
- **Analyzed Position**: The FEN that was actually sent to Stockfish for analysis
- **Displayed Position**: The FEN currently shown on the board (`useGameStore().fen`)

### Why This Happened

1. When analyzing a full game, `useAnalysis.ts` calls `analyzePosition(fen)` for each move
2. The engine stores the analysis results in `useEngineStore`
3. BUT the engine store didn't track WHICH FEN was analyzed
4. When `EnginePanel.tsx` tried to convert UCI moves to SAN, it used the **current board FEN** from `useGameStore`
5. This FEN was often different from the position that was analyzed
6. Result: `uciMovesToSan()` tried to apply moves to the wrong position, causing "Invalid move" errors

### Example of the Bug

```typescript
// Analysis happens on this position:
analyzePosition("rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3")

// Engine returns PV: ["d2d4", "exd4", "c3d4", ...]

// But EnginePanel tries to convert using THIS FEN (from current board):
const fen = useGameStore().fen; // "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"

// Result: "d2d4" is illegal from the starting position!
```

## Solution Implemented

### 1. Added `analyzedFen` to EngineStore

Modified `/store/useEngineStore.ts`:

```typescript
export interface EngineState {
  // ... other fields
  analyzedFen: string | null; // NEW: FEN that was analyzed
}
```

### 2. Store FEN When Analysis Starts

```typescript
analyzePosition: (fen: string, moves?: string[]) => {
  set({
    isAnalyzing: true,
    analyzedFen: fen, // Store the FEN being analyzed
    // ... reset other fields
  });
  // ... send to worker
}
```

### 3. Use analyzedFen for UCI->SAN Conversion

Modified `/components/organisms/EnginePanel.tsx`:

```typescript
// Before (WRONG):
const bestMoveSan = bestMove && fen ? uciToSan(fen, bestMove) : '';
const sanMoves = fen ? uciMovesToSan(fen, info.pv.slice(0, 10)) : info.pv.slice(0, 10);

// After (CORRECT):
const bestMoveSan = bestMove && analyzedFen ? uciToSan(analyzedFen, bestMove) : '';
const sanMoves = analyzedFen ? uciMovesToSan(analyzedFen, info.pv.slice(0, 10)) : info.pv.slice(0, 10);
```

## Testing

After this fix:
- ✅ PV moves should display correctly in SAN notation (e.g., "1. Qxb5 Rb8 2. Qa4 Bb7...")
- ✅ No more "Failed to convert UCI" warnings in console
- ✅ Best move display shows correct SAN notation
- ✅ UCI->SAN conversion works with correct position

## Remaining Issues to Address

Based on user's screenshot and requirements:

### 1. React "unique key" Error
- **Status**: Not yet reproduced in console logs
- **Expected**: Error about "Each child in a list should have a unique key prop" in ForwardRef/circle component
- **Location**: Likely in `AdvantageChart.tsx` or `MoveList.tsx` where lists are mapped without keys
- **Next Step**: Need to inspect those components

### 2. Auto-Analysis Per Move
- **Status**: Not implemented
- **Expected**: After full game analysis, clicking on individual moves should automatically trigger analysis of that position
- **Current**: Analysis only happens when "ANALYZE GAME" button is clicked
- **Reference**: wintrchess.com behavior
- **Next Step**: Add useEffect in analyze page to auto-analyze on position change after full game analysis completes

### 3. Eval Bar Appearance
- **Status**: Not fixed
- **Expected**: White section (positive eval) / Black section (negative eval) with gray center line
- **Current**: Majority black, unclear split
- **Location**: `components/organisms/AdvantageChart.tsx`
- **Next Step**: Review SVG rendering and color calculations

### 4. Brilliant Move / Blunder Detection
- **Status**: Need to verify
- **Expected**: Moves with large positive eval swings get "!!" annotation, large negative get "?"
- **Location**: `lib/analysis/annotations.ts`
- **Next Step**: Test with real game to verify thresholds are correct

## Files Changed

1. `/store/useEngineStore.ts` - Added `analyzedFen` field, store it during analysis
2. `/components/organisms/EnginePanel.tsx` - Use `analyzedFen` for UCI->SAN conversion

## Impact

- **Performance**: No impact - just using correct FEN reference
- **Compatibility**: Backward compatible - `analyzedFen` is nullable
- **User Experience**: Massive improvement - PV display now works correctly
