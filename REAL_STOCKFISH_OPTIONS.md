# Real Stockfish Integration Options

## Current Status
The app uses an **enhanced mock engine** that provides realistic heuristic evaluation. While this demonstrates all features, it's not as strong as real Stockfish.

## Why Real WASM is Blocked in Next.js
- Next.js Web Workers use `importScripts()` which can't load ES Modules
- Modern Stockfish WASM builds use `import.meta` and ES Module syntax
- Webpack fallback config doesn't work with Turbopack
- This is a known limitation documented in `STOCKFISH_WASM_INTEGRATION.md`

---

## ✅ **Option 1: Server-Side Stockfish (RECOMMENDED)**

Run Stockfish as a separate process on your server.

### Advantages:
- ✅ Full Stockfish strength (ELO 3500+)
- ✅ No browser compatibility issues
- ✅ Can use multi-threading
- ✅ Works with any Next.js version
- ✅ No CORS issues

### Implementation:

#### Backend (Node.js + Express):
```bash
# Install dependencies
npm install express ws stockfish
```

```typescript
// server/engine-server.ts
import express from 'express';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const app = express();
const server = app.listen(3001);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  // Spawn Stockfish process
  const stockfish = spawn('stockfish');
  
  // Forward messages from browser to engine
  ws.on('message', (message) => {
    stockfish.stdin.write(message + '\n');
  });
  
  // Forward engine output to browser
  stockfish.stdout.on('data', (data) => {
    ws.send(data.toString());
  });
  
  ws.on('close', () => {
    stockfish.kill();
  });
});
```

#### Frontend (Update engine worker):
```typescript
// lib/engine/engine-worker-websocket.ts
let ws: WebSocket;

async function initEngine() {
  ws = new WebSocket('ws://localhost:3001');
  
  ws.onmessage = (event) => {
    handleStockfishMessage(event.data);
  };
  
  ws.onopen = () => {
    ws.send('uci');
  };
}

function sendCommand(cmd: string) {
  ws.send(cmd);
}
```

### Installation:
```bash
# Ubuntu/Debian
sudo apt-get install stockfish

# macOS
brew install stockfish

# Or download binary from:
# https://stockfishchess.org/download/
```

---

## ✅ **Option 2: Use Lichess API**

Leverage Lichess's free cloud analysis.

### Advantages:
- ✅ No backend needed
- ✅ Free and fast
- ✅ Uses latest Stockfish
- ✅ Cloud-based (no local resources)

### Implementation:
```typescript
// lib/analysis/lichess-cloud.ts
export async function analyzeFEN(fen: string, depth: number = 20) {
  const response = await fetch(
    `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`,
    { method: 'GET' }
  );
  
  const data = await response.json();
  
  return {
    cp: data.pvs[0].cp,
    mate: data.pvs[0].mate,
    bestMove: data.pvs[0].moves.split(' ')[0],
    pv: data.pvs[0].moves
  };
}
```

### Rate Limits:
- Free tier: ~1 request/second
- For bulk analysis, implement request queuing

---

## ✅ **Option 3: Stockfish.js (Old But Works)**

Use the older stockfish.js (not .wasm) package.

### Implementation:
```bash
npm install stockfish
```

```typescript
// lib/engine/engine-worker-legacy.ts
importScripts('https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js');

let sf: any;

async function initEngine() {
  // @ts-expect-error - loaded from CDN
  sf = STOCKFISH();
  
  sf.onmessage = (line: string) => {
    handleStockfishMessage(line);
  };
  
  sf.postMessage('uci');
}
```

### Note:
- Older version (Stockfish 16 instead of 17)
- Slower than WASM
- But works in Web Workers!

---

## ✅ **Option 4: Python Backend + FastAPI**

If you prefer Python:

```python
# backend/stockfish_api.py
from fastapi import FastAPI, WebSocket
from stockfish import Stockfish
import asyncio

app = FastAPI()
sf = Stockfish(path="/usr/games/stockfish")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    while True:
        command = await websocket.receive_text()
        
        if command.startswith("position"):
            fen = command.split("fen ")[1]
            sf.set_fen_position(fen)
            
        elif command.startswith("go"):
            depth = int(command.split("depth ")[1])
            best_move = sf.get_best_move_time(1000)
            evaluation = sf.get_evaluation()
            
            await websocket.send_text(f"bestmove {best_move}")
```

```bash
pip install fastapi stockfish python-stockfish uvicorn
uvicorn stockfish_api:app --reload
```

---

## ✅ **Option 5: Docker Container**

Containerize Stockfish for easy deployment:

```dockerfile
# Dockerfile
FROM node:20-alpine

# Install Stockfish
RUN apk add --no-cache stockfish

# Copy your backend code
COPY server /app/server
WORKDIR /app

RUN npm install
CMD ["node", "server/engine-server.js"]
```

```bash
docker build -t chess-stockfish .
docker run -p 3001:3001 chess-stockfish
```

---

## 📊 **Comparison:**

| Option | Strength | Setup Complexity | Cost | Best For |
|--------|----------|------------------|------|----------|
| **Server-Side** | ⭐⭐⭐⭐⭐ | Medium | Free/Server | Production |
| **Lichess API** | ⭐⭐⭐⭐⭐ | Easy | Free | Quick MVP |
| **Stockfish.js** | ⭐⭐⭐⭐ | Easy | Free | Browser-only |
| **Python Backend** | ⭐⭐⭐⭐⭐ | Medium | Free/Server | Python devs |
| **Docker** | ⭐⭐⭐⭐⭐ | Hard | Free/Server | Scalability |
| **Enhanced Mock** | ⭐⭐ | ✅ Done | Free | Demo/UI Dev |

---

## 🚀 **Quick Start: Server-Side Implementation**

Want me to implement Option 1 (Server-Side Stockfish) for you? I can:

1. Create a simple Express WebSocket server
2. Update the engine worker to connect to it
3. Install and configure real Stockfish
4. Test the full integration

**Just say "implement server-side stockfish" and I'll do it!**

---

## 🔧 **Current Setup:**

Your app currently uses the **Enhanced Mock Engine** which:
- ✅ Demonstrates all Phase 3 features perfectly
- ✅ Provides realistic-looking analysis
- ✅ Works in all environments
- ❌ Not as strong as real Stockfish (~1500 ELO vs 3500)
- ❌ Doesn't find deep tactical combinations

The enhanced mock is perfect for development and UI demonstrations, but for serious analysis, you'll want one of the real options above.
