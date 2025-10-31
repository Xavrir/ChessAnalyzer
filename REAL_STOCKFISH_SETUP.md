# 🎮 Real Stockfish Integration - Setup Complete!

## ✅ What's Been Installed

1. **Stockfish 16.1 Binary** - Downloaded to `bin/stockfish-bin`
2. **WebSocket Server** - Created at `server/stockfish-server.ts`
3. **WebSocket Engine Worker** - Created at `lib/engine/engine-worker-websocket.ts`
4. **Auto-switching** - App now uses real Stockfish via WebSocket

---

## 🚀 Quick Start

### Option 1: Run Everything Together (Recommended)
```bash
npm run dev:all
```
This starts both the Next.js app (port 3000) AND the Stockfish server (port 3001) simultaneously.

### Option 2: Run Separately
```bash
# Terminal 1 - Start Stockfish WebSocket Server
npm run stockfish-server

# Terminal 2 - Start Next.js App
npm run dev
```

---

## 🎯 How It Works

### Architecture:
```
Browser (localhost:3000)
    ↕ WebSocket
Stockfish Server (localhost:3001)
    ↕ spawn process
Real Stockfish Binary (bin/stockfish-bin)
```

### Engine Selection:
The app now checks `.env.local`:
- `NEXT_PUBLIC_ENGINE_TYPE=websocket` → Uses real Stockfish (current)
- `NEXT_PUBLIC_ENGINE_TYPE=mock` → Uses enhanced mock engine

---

## 📝 Testing Real Stockfish

1. **Start both servers:**
   ```bash
   npm run dev:all
   ```

2. **Open browser:**
   ```
   http://localhost:3000/analyze
   ```

3. **Watch console logs:**
   - Browser console: "Connecting to Stockfish server..."
   - Server terminal: "✅ Client connected" + "🎮 Stockfish process started"

4. **Import a game and analyze:**
   - Click "Import" → Paste a PGN
   - Click "ANALYZE GAME"
   - You'll see REAL Stockfish analysis! 🎉

---

## 🔍 How to Tell It's Real Stockfish

### Mock Engine Signs:
- Always depth progresses smoothly (1→2→3...)
- Evaluations based on simple heuristics
- Best moves picked from material/tactics only

### Real Stockfish Signs:
- ✅ Depth jumps (seldepth > depth)
- ✅ **Much stronger evaluations** and tactical vision
- ✅ Finds deep combinations (10+ moves ahead)
- ✅ Better move quality (no obvious mistakes)
- ✅ Server terminal shows UCI commands

---

## 🐛 Troubleshooting

### "Failed to connect to Stockfish server"
**Solution:** Make sure the Stockfish server is running on port 3001
```bash
npm run stockfish-server
```

### Port 3001 already in use
```bash
# Kill any process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Stockfish binary not found
```bash
# Check if binary exists
ls -la bin/stockfish-bin

# Re-download if needed
cd bin && curl -L -o stockfish.tar https://github.com/official-stockfish/Stockfish/releases/download/sf_16.1/stockfish-ubuntu-x86-64-avx2.tar
```

---

## ⚙️ Configuration

### Switch Back to Mock Engine
Edit `.env.local`:
```bash
NEXT_PUBLIC_ENGINE_TYPE=mock
```
Then restart `npm run dev`

### Adjust Engine Strength
Edit `server/stockfish-server.ts` and add:
```typescript
// Limit engine strength (ELO rating)
ws.send('setoption name UCI_LimitStrength value true');
ws.send('setoption name UCI_Elo value 2000'); // 2000 ELO
```

### Multi-threading (Advanced)
Stockfish supports multiple threads for faster analysis:
```typescript
ws.send('setoption name Threads value 4'); // Use 4 CPU threads
```

---

## 📊 Performance Comparison

| Feature | Enhanced Mock | Real Stockfish 16 |
|---------|--------------|-------------------|
| Strength | ~1500 ELO | ~3500 ELO |
| Depth | Max 20 | Unlimited |
| Nodes/sec | Simulated 5M | Actual 5-20M |
| Tactics | Basic | Advanced |
| Setup | ✅ None | WebSocket server |

---

## 🎯 What's Next?

Your app now has **REAL Stockfish 16.1** running! The analysis will be:
- ✅ **Much stronger** tactically
- ✅ **More accurate** evaluations
- ✅ **Better move suggestions**
- ✅ **Professional-grade** analysis

Try analyzing some tactical puzzles or complex positions - you'll see the difference immediately!

---

## 🔄 Switching Between Engines

You can easily switch:

1. **For Development/Demos:** Use mock engine (no server needed)
2. **For Real Analysis:** Use WebSocket Stockfish (requires server)

Just change `.env.local` and restart!
