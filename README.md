# Chess Analyzer

A modern chess analysis web application powered by Stockfish NNUE. Analyze your games with professional-grade engine evaluation, import from Chess.com, and improve your chess understanding.

## Features

- 🎯 **Interactive Analysis Board** - Drag-and-drop moves with visual feedback
- 🤖 **Stockfish NNUE Engine** - Industry-leading chess analysis
- 📊 **Detailed Insights** - ACPL, accuracy, mistake detection
- ♟️ **Chess.com Integration** - Import and analyze your games
- 📝 **PGN/FEN Support** - Import games from any source
- 🎨 **Modern UI** - Built with Next.js 15 and Tailwind CSS

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI
- **Chess Engine:** Stockfish NNUE (WebAssembly)
- **State:** Zustand + React Query
- **Testing:** Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Modern browser with WebAssembly support

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run E2E tests
npm run analyze      # Analyze bundle size
```

### E2E Testing

- Playwright no longer manages the Next.js dev server (webServer removed).
- Start the app separately, then run tests:

```bash
# Terminal 1: start the app (optionally with WS engine)
npm run dev           # or: npm run dev:all

# Terminal 2: run e2e tests
npm run test:e2e
```

- You can target a different server using:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

Note: If you drive the app via an external Playwright/MCP controller, ensure the app is reachable at the configured `PLAYWRIGHT_BASE_URL` before issuing actions.

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── atoms/             # Basic UI elements
│   ├── molecules/         # Composite components
│   ├── organisms/         # Complex components
│   └── templates/         # Layout templates
├── lib/                   # Core libraries
│   ├── chess/            # Chess logic
│   ├── engine/           # Stockfish integration
│   ├── analysis/         # Analysis algorithms
│   ├── chesscom/         # Chess.com API
│   └── utils/            # Utilities
├── store/                 # Zustand stores
├── hooks/                 # Custom React hooks
├── tests/                 # Test files
└── public/               # Static assets
    └── stockfish/        # Stockfish WASM files
```

## Contributing

Contributions are welcome! Please read the development plan before contributing.

## License

This project is licensed under the MIT License.

### Third-Party Licenses

- **Stockfish:** GNU GPL v3 - [License](https://github.com/official-stockfish/Stockfish/blob/master/Copying.txt)
- **Chess.com API:** Public Data API - [Terms](https://www.chess.com/news/view/published-data-api)

## Credits

- Chess engine: [Stockfish](https://stockfishchess.org/)
- Chess.com data: [Chess.com Public API](https://www.chess.com/news/view/published-data-api)
- Built with [Next.js](https://nextjs.org/)
