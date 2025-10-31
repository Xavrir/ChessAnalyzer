# 🎯 Quick Testing Guide - Visual Walkthrough

## Open the Application
```
👉 http://localhost:3000/analyze
```

---

## Step-by-Step Testing Process

### 1️⃣ Import PGN

**Click the "Import PGN" button** (usually at the top or in a menu)

**Paste this PGN:**
```
[Event "World Championship 1972"]
[Site "Reykjavik ISL"]
[Date "1972.07.23"]
[Round "6"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1-0"]

1.c4 e6 2.Nf3 d5 3.d4 Nf6 4.Nc3 Be7 5.Bg5 O-O 6.e3 h6 7.Bh4 b6 8.cxd5 Nxd5 9.Bxe7 Qxe7 10.Nxd5 exd5 11.Rc1 Be6 12.Qa4 c5 13.Qa3 Rc8 14.Bb5 1-0
```

**Expected:** Game loads, you see 14 moves in the move list

---

### 2️⃣ Start Analysis

**Click "ANALYZE GAME" button**

**Expected:**
- Progress indicator appears
- Engine panel shows analysis progress
- Depth increases: 1, 2, 3... up to 20
- Takes ~30 seconds for full game

---

### 3️⃣ Check Opening Detection 🔍

**Look for "Opening Info" panel** (should appear after Advantage Chart)

**What You Should See:**

```
┌─────────────────────────────────────┐
│  📖 Opening Information             │
├─────────────────────────────────────┤
│  Opening: English Opening           │
│  Variation: Agincourt Defense       │
│  ECO Code: A13                      │
└─────────────────────────────────────┘
```

**✅ PASS if:**
- Panel appears and displays opening info
- Opening name is "English Opening" or similar
- ECO code is shown (A13 or A10-A39 range)

**❌ FAIL if:**
- No opening panel appears
- Says "Unknown Opening"
- Panel appears but is empty

---

### 4️⃣ Check Accuracy Percentages 📊

**Look for the Accuracy Summary panel**

**Expected Values for GM Game:**

```
┌─────────────────────────────────────┐
│  📊 Accuracy Summary                │
├─────────────────────────────────────┤
│  White: ████████░░  85.2%          │
│  Black: ████████░░  87.8%          │
└─────────────────────────────────────┘
```

**✅ PASS if:**
- White accuracy: 75-95%
- Black accuracy: 75-95%
- Values are displayed with color coding
- Green = good, Yellow = okay, Red = poor

**⚠️ INVESTIGATE if:**
- White accuracy: < 60% or > 98%
- Black accuracy: < 60% or > 98%
- This might indicate calculation issues

---

### 5️⃣ Check Move Annotations 🎯

**Look at the Move List** (should show moves with symbols)

**Expected Annotations:**

```
1.  c4    Theory  ⭐
    e6    Theory  ⭐
2.  Nf3   Theory  ⭐
    d5    Theory  ⭐
3.  d4    Good    ✓
    Nf6   Good    ✓
...
```

**✅ PASS if:**
- Moves show annotations (⭐, ✓, ⁈, ?, ⁉)
- Opening moves marked as "Theory" or "Excellent"
- No false blunders (⁉) on clearly good moves
- Annotations make sense

**❌ FAIL if:**
- No annotations appear
- Good opening moves marked as blunders
- All moves marked as "Best" or "Excellent" (unrealistic)

---

### 6️⃣ Check Advantage Chart 📈

**Look for the evaluation chart** (line graph)

**Expected:**

```
    +2 ┤     ╭─────
    +1 ┤   ╭─╯
     0 ┼───╯
    -1 ┤
    -2 ┤
```

**✅ PASS if:**
- Chart displays evaluation over time
- Smooth trend (no wild jumps unless there's a blunder)
- Roughly follows expected game flow

---

## 🧪 Additional Test Cases

### Test Case 2: Sicilian Defense

**PGN:**
```
1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6
```

**Expected Opening:** Sicilian Defense: Najdorf Variation (B90)

---

### Test Case 3: Italian Game

**PGN:**
```
1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3
```

**Expected Opening:** Italian Game: Giuoco Piano (C50-C54)

---

### Test Case 4: French Defense

**PGN:**
```
1. e4 e6 2. d4 d5 3. Nc3 Nf6
```

**Expected Opening:** French Defense: Classical Variation (C00-C19)

---

## 📝 What to Report

### If Opening Detection Works ✅
- Which opening was detected
- Was the ECO code correct?
- Did it match the expected opening?

### If Opening Detection Fails ❌
- Check browser console (F12) for errors
- What moves were analyzed?
- Was any opening detected at all?

### For Accuracy Percentages:
- White accuracy: ____%
- Black accuracy: ____%
- Total moves: _____
- Mistakes: _____
- Blunders: _____

### For Move Annotations:
- Do annotations appear? Yes / No
- Are they reasonable? Yes / No
- Any false blunders? Yes / No

---

## 🔧 Troubleshooting

### Issue: Opening Panel Not Appearing

**Check:**
1. Browser console for errors (F12)
2. Is analysis complete?
3. Refresh page and try again

**Fix:**
```bash
# Restart servers
pkill -f 'next dev'
fuser -k 3001/tcp
npm run dev:all
```

---

### Issue: Accuracy Shows 0% or 100%

**This might indicate:**
- Analysis didn't complete properly
- Engine not returning evaluations
- Check Engine Panel for activity

**Fix:**
- Re-analyze the game
- Check if depth reaches 20
- Verify engine initialization

---

### Issue: No Annotations on Moves

**Check:**
1. Did analysis complete?
2. Are evaluations being calculated?
3. Look at the Advantage Chart - does it show data?

**Fix:**
- Make sure analysis finishes completely
- Wait for all positions to be analyzed

---

## 🎉 Success Criteria

### ✅ All Tests Pass If:

1. **Opening Detection:**
   - Panel appears
   - Correct opening identified
   - ECO code displayed

2. **Accuracy Calculation:**
   - Reasonable percentages (75-95% for GM game)
   - Color-coded display
   - No calculation errors

3. **Move Annotations:**
   - Symbols appear
   - Makes sense
   - No false blunders

4. **Visual Elements:**
   - Advantage chart renders
   - Engine panel shows progress
   - Move list is interactive

---

## 📞 Need Help?

### Check These Files:
- `TESTING_COMPLETE_STATUS.md` - Full status report
- `ACCURACY_FIX_COMPLETE.md` - Technical details
- `test-opening-accuracy.sh` - Automated checks

### Server Status:
```bash
netstat -tlnp | grep -E ':(3000|3001)'
```

Should show:
- Port 3000: Next.js dev server
- Port 3001: Stockfish WebSocket server

---

**Ready to test! Open http://localhost:3000/analyze and follow the steps above.** 🚀
