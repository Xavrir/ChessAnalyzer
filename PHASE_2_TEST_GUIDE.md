# Quick Test Guide - Phase 2: Engine Integration

## 🚀 How to Test the Stockfish Engine

### 1. Start the Development Server
```bash
cd /root/Downloads/tes11/chess-analyzer
PORT=3001 npm run dev
```

The server should start at: http://localhost:3001

---

## 2. Navigate to Analysis Page

1. Open browser to http://localhost:3001
2. Click the **"START ANALYSIS HERE"** button
3. You should see the analysis page with:
   - Evaluation bar on the left
   - Chessboard in the center
   - Controls, move list, and engine panel on the right

---

## 3. Test Engine Features

### ✅ Basic Analysis
1. **Start Analysis**: Click the "START ANALYSIS" button in the Engine Panel
2. Watch the evaluation bar move as the engine analyzes
3. See the depth increase (D1, D2, D3... up to D20)
4. Wait for best move to appear (should be e2e4 or d2d4 for starting position)

### ✅ Depth Control
1. Stop the analysis
2. Move the **DEPTH** slider (1-30)
3. Start analysis again
4. Higher depth = longer analysis time, more accurate

### ✅ Multi-PV (Multiple Lines)
1. Stop the analysis
2. Move the **LINES** slider (1-3)
3. Start analysis again
4. You should see multiple "Principal Variations" showing different best lines

### ✅ Auto-Analysis on Moves
1. Start analysis
2. Make a move on the board (e.g., e2-e4)
3. Engine automatically re-analyzes the new position
4. Evaluation bar updates to show new position evaluation

### ✅ Import and Analyze
1. Click **"IMPORT GAME"** button
2. Switch to **PGN** tab
3. Paste this test game:
```
[Event "Test Game"]
[White "Player"]
[Black "Opponent"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O
```
4. Click **IMPORT**
5. Start analysis
6. Navigate through moves and watch evaluation change

---

## 4. What to Look For

### ✅ Evaluation Bar
- **Green (top)** = White is winning
- **Red (bottom)** = Black is winning
- **Gray (center)** = Equal position
- **Smooth transitions** when evaluation changes

### ✅ Engine Statistics
- **DEPTH**: Current search depth (e.g., 15/18 means depth 15, selective depth 18)
- **NODES**: Number of positions searched (e.g., 1.2M, 500k)
- **SPEED**: Nodes per second (e.g., 250k/s, 1.5M/s)

### ✅ Best Move Display
- Shows in green box with large text
- UCI notation (e.g., E2E4, G1F3)
- Updates as depth increases

### ✅ Principal Variations
- Shows best line(s) found by engine
- Evaluation score for each line (e.g., +0.35, -1.20, M5)
- First 10 moves of variation

---

## 5. Expected Performance

### Starting Position Analysis
- **Depth 15**: ~2-3 seconds
- **Depth 20**: ~5-8 seconds
- **Depth 25**: ~15-20 seconds

### Expected Results (Starting Position)
- **Best Move**: e2e4 or d2d4
- **Evaluation**: Around +0.20 to +0.40 (slight white advantage)
- **Speed**: 100k - 500k nodes/second (depends on hardware)

---

## 6. Common Test Positions

### Test Position 1: Starting Position
```
FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
Expected: ~+0.2, Best move: e2e4 or d2d4
```

### Test Position 2: Scholar's Mate Threat
```
PGN: 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6
Expected: Black is winning (-2.0 to -3.0), Best move: Nxh5
```

### Test Position 3: Forced Mate
```
FEN: 7k/8/5K2/6Q1/8/8/8/8 w - - 0 1
Expected: M2 (Mate in 2), Best move: Qg7#
```

---

## 7. Troubleshooting

### Engine Not Starting
- **Check Console**: Open browser DevTools (F12) and look for errors
- **Check Headers**: Ensure COOP/COEP headers are set (see Network tab)
- **Restart Server**: Stop and restart the dev server

### Slow Analysis
- **Lower Depth**: Use depth 15 instead of 20
- **Check CPU**: Make sure no other heavy processes running
- **Browser**: Chrome/Edge usually fastest for WASM

### No Best Move Appearing
- **Wait Longer**: Deep positions may take time
- **Check Analysis Status**: Ensure "START ANALYSIS" was clicked
- **Try Different Position**: Some positions are harder to analyze

---

## 8. Browser Compatibility

### ✅ Recommended Browsers
- **Chrome/Chromium**: Best performance
- **Edge**: Excellent performance
- **Firefox**: Good performance
- **Safari**: May have issues with SharedArrayBuffer

### HTTPS Requirement
- **Development (localhost)**: Works fine
- **Production**: Must use HTTPS for SharedArrayBuffer

---

## 9. Success Indicators

You'll know Phase 2 is working correctly if:
- ✅ Engine initializes in <2 seconds
- ✅ Evaluation bar moves during analysis
- ✅ Depth increases progressively
- ✅ Best move appears after analysis
- ✅ Statistics update in real-time
- ✅ No console errors
- ✅ UI remains responsive during analysis

---

## 10. Next Steps

Once you've confirmed everything works:
1. ✅ Mark Phase 2 as complete
2. 🚀 Move on to Phase 3: Evaluation Display
3. 📝 Document any issues or observations

---

## 📊 Performance Benchmarks

Test on your machine and record:
- Initialization time: _______ ms
- Depth 15 time: _______ seconds
- Depth 20 time: _______ seconds
- Nodes per second: _______ k/s
- Browser used: _____________

---

**Happy Testing!** 🎉

If you encounter any issues, check:
1. Console errors (F12)
2. Network tab (COOP/COEP headers)
3. Terminal output (server errors)
4. Phase 2 documentation
