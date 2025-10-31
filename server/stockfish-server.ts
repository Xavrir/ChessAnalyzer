/**
 * Stockfish WebSocket Server
 * 
 * Runs Stockfish engine as a separate process and communicates with
 * the browser via WebSocket. This allows using real Stockfish without
 * browser/Web Worker compatibility issues.
 */

import { WebSocketServer } from 'ws';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const STOCKFISH_PATH = path.join(__dirname, '../bin/stockfish-bin');

console.log(`🚀 Starting Stockfish WebSocket Server on port ${PORT}...`);
console.log(`📍 Stockfish binary: ${STOCKFISH_PATH}`);

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  console.log('✅ Client connected');
  
  let stockfish: ChildProcess | null = null;
  
  try {
    // Spawn Stockfish process
    stockfish = spawn(STOCKFISH_PATH);
    console.log('🎮 Stockfish process started');
    
    // Handle Stockfish stdout (engine output)
    stockfish.stdout?.on('data', (data) => {
      const output = data.toString();
      // Send each line to the browser
      output.split('\n').forEach((line: string) => {
        if (line.trim()) {
          ws.send(line);
        }
      });
    });
    
    // Handle Stockfish stderr (errors)
    stockfish.stderr?.on('data', (data) => {
      console.error('⚠️ Stockfish stderr:', data.toString());
    });
    
    // Handle Stockfish process exit
    stockfish.on('exit', (code) => {
      console.log(`🛑 Stockfish process exited with code ${code}`);
    });
    
    // Handle messages from browser (UCI commands)
    ws.on('message', (message) => {
      const command = message.toString();
      
      if (stockfish && stockfish.stdin) {
        stockfish.stdin.write(command + '\n');
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('👋 Client disconnected');
      if (stockfish) {
        stockfish.kill();
        stockfish = null;
      }
    });
    
  } catch (error) {
    console.error('❌ Error starting Stockfish:', error);
    ws.send(JSON.stringify({ error: 'Failed to start Stockfish' }));
    ws.close();
  }
});

wss.on('error', (error) => {
  console.error('❌ WebSocket server error:', error);
});

console.log(`✨ Stockfish WebSocket Server ready at ws://localhost:${PORT}`);
console.log('💡 Connect your frontend to this server to use real Stockfish!');
