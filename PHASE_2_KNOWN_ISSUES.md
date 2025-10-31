# Phase 2 Known Issues & Workarounds

## Issue: Stockfish WASM Integration

### Problem
The Stockfish Web Worker implementation encounters issues with `importScripts()` and the nested worker architecture when using nmrugg/stockfish.js.

### Error Message
```
Failed to execute 'importScripts' on 'WorkerGlobalScope': The URL '/stockfish/stockfish.js' is invalid.
```

### Root Cause
- Next.js's Web Worker implementation doesn't fully support `importScripts()`
- The nmrugg/stockfish.js library expects a specific worker setup
- COOP/COEP headers may need additional configuration

### Workarounds

#### Option 1: Use stockfish.wasm directly (Recommended)
Download official Stockfish WASM from: https://github.com/official-stockfish/Stockfish

```bash
cd public/stockfish
wget https://github.com/official-stockfish/Stockfish/releases/download/sf_16/stockfish-16-wasm-single.tar
tar -xf stockfish-16-wasm-single.tar
```

#### Option 2: Use lila-stockfish-web (Lichess version)
```bash
npm install lila-stockfish-web
```

Then update engine-worker.ts:
```typescript
import { Stockfish } from 'lila-stockfish-web';

async function initEngine() {
  stockfish = await Stockfish();
  // ... rest of implementation
}
```

#### Option 3: Use npm package stockfish (Simpler)
```bash
npm install stockfish
```

```typescript
import Stockfish from 'stockfish';

async function initEngine() {
  stockfish = Stockfish();
  // ... rest of implementation
}
```

#### Option 4: Demo Mode (Temporary)
For demonstration purposes, create a mock engine that returns random evaluations:

```typescript
// lib/engine/mock-engine.ts
export const createMockEngine = () => ({
  analyze: (fen: string) => ({
    bestmove: 'e2e4',
    evaluation: Math.random() * 2 - 1,
    depth: 20
  })
});
```

### Next Steps
1. Choose one of the workarounds above
2. Test engine initialization
3. Verify UCI protocol communication
4. Run full analysis tests

### Files to Update
- `lib/engine/engine-worker.ts` - Worker implementation
- `public/stockfish/` - WASM binaries
- `package.json` - Dependencies (if using npm package)

### Testing Checklist
- [ ] Engine initializes without errors
- [ ] UCI commands work (position, go, stop)
- [ ] Evaluation updates in real-time
- [ ] Best moves display correctly
- [ ] Multi-PV works
- [ ] No console errors

## Status
**Current**: ❌ Not working (importScripts issue)  
**Priority**: High  
**Estimated Fix Time**: 1-2 hours

## Alternative: Demo Without Engine
The UI is fully functional. To demonstrate without the engine:
1. The evaluation bar can show static values
2. The engine panel can display mock data
3. All other features (board, moves, import) work perfectly

## References
- [Stockfish.js GitHub](https://github.com/nmrugg/stockfish.js)
- [Official Stockfish WASM](https://github.com/official-stockfish/Stockfish)
- [Lichess Stockfish Web](https://github.com/lichess-org/lila-stockfish-web)
- [Next.js Web Workers](https://nextjs.org/docs/app/building-your-application/optimizing/web-workers)
