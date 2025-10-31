#!/bin/bash

# Opening Detection & Accuracy Test Script
# Tests the chess analyzer with Fischer vs Spassky 1972 Game 6

echo "=================================================="
echo "Chess Analyzer - Opening & Accuracy Test"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if servers are running
echo "1️⃣  Checking if servers are running..."
if netstat -tlnp 2>/dev/null | grep -q ':3000' || ss -tlnp 2>/dev/null | grep -q ':3000'; then
    echo -e "${GREEN}✅ Next.js dev server is running on port 3000${NC}"
else
    echo -e "${RED}❌ Next.js dev server is NOT running on port 3000${NC}"
    echo "   Run: npm run dev:all"
    exit 1
fi

if netstat -tlnp 2>/dev/null | grep -q ':3001' || ss -tlnp 2>/dev/null | grep -q ':3001'; then
    echo -e "${GREEN}✅ Stockfish WebSocket server is running on port 3001${NC}"
else
    echo -e "${YELLOW}⚠️  Stockfish WebSocket server is NOT running on port 3001${NC}"
    echo "   This is OK if using mock engine"
fi

echo ""
echo "=================================================="
echo "Test Game: Fischer vs Spassky 1972 Game 6"
echo "=================================================="
echo ""
echo "PGN to test with:"
echo "---------------------------------------------------"
cat << 'EOF'
[Event "World Championship 1972"]
[Site "Reykjavik ISL"]
[Date "1972.07.23"]
[Round "6"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1-0"]

1.c4 e6 2.Nf3 d5 3.d4 Nf6 4.Nc3 Be7 5.Bg5 O-O 6.e3 h6 
7.Bh4 b6 8.cxd5 Nxd5 9.Bxe7 Qxe7 10.Nxd5 exd5 11.Rc1 Be6 
12.Qa4 c5 13.Qa3 Rc8 14.Bb5 1-0
EOF
echo "---------------------------------------------------"
echo ""

echo "=================================================="
echo "Manual Testing Instructions"
echo "=================================================="
echo ""
echo "2️⃣  Open the application:"
echo "   ${YELLOW}http://localhost:3000/analyze${NC}"
echo ""
echo "3️⃣  Import the PGN (copy from above)"
echo ""
echo "4️⃣  Click 'ANALYZE GAME' button"
echo ""
echo "5️⃣  Wait for analysis to complete (~30 seconds)"
echo ""
echo "=================================================="
echo "What to Verify"
echo "=================================================="
echo ""
echo "✅ OPENING DETECTION:"
echo "   - Opening Info panel should appear after Advantage Chart"
echo "   - Expected opening: 'English Opening' or 'Queen's Gambit Declined'"
echo "   - Should show ECO code (A10-A39 for English, D30-D69 for QGD)"
echo "   - Opening name should be displayed prominently"
echo ""
echo "✅ ACCURACY CALCULATION:"
echo "   - For a World Championship GM game, expect:"
echo "     • White accuracy: 80-95%"
echo "     • Black accuracy: 80-95%"
echo "     • Few mistakes/blunders (< 3 total)"
echo "     • Mostly 'excellent' and 'theory' moves"
echo ""
echo "✅ VISUAL ELEMENTS:"
echo "   - Move list shows annotations (!, ?, ⁉, etc.)"
echo "   - Advantage chart displays evaluation trend"
echo "   - Accuracy bars show percentage with color coding"
echo "   - Engine panel shows analysis progress"
echo ""
echo "=================================================="
echo "Expected Opening Detection Results"
echo "=================================================="
echo ""
echo "Opening moves: 1.c4 e6 2.Nf3 d5"
echo ""
echo "This could be classified as:"
echo "• English Opening: Agincourt Defense (A13)"
echo "• English Opening: General (A10-A39)"
echo "• Or transition to Queen's Gambit structures"
echo ""
echo "The detector should identify one of these."
echo ""

echo "=================================================="
echo "Test with Different Games"
echo "=================================================="
echo ""
echo "For more thorough testing, try these games:"
echo ""
echo "🔹 Sicilian Defense:"
echo "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4"
echo "   Expected: Sicilian Defense: Open (B20-B99)"
echo ""
echo "🔹 Italian Game:"
echo "1. e4 e5 2. Nf3 Nc6 3. Bc4"
echo "   Expected: Italian Game (C50-C59)"
echo ""
echo "🔹 Ruy Lopez:"
echo "1. e4 e5 2. Nf3 Nc6 3. Bb5"
echo "   Expected: Ruy Lopez (C60-C99)"
echo ""
echo "🔹 French Defense:"
echo "1. e4 e6 2. d4 d5"
echo "   Expected: French Defense (C00-C19)"
echo ""

echo "=================================================="
echo "Automated Checks"
echo "=================================================="
echo ""

# Check if opening detection file exists
if [ -f "lib/chess/openings.ts" ]; then
    echo -e "${GREEN}✅ Opening detection file exists${NC}"
    
    # Count number of openings in database
    OPENING_COUNT=$(grep -c "moves: \[" lib/chess/openings.ts)
    echo -e "${GREEN}✅ Found ${OPENING_COUNT} openings in database${NC}"
else
    echo -e "${RED}❌ Opening detection file NOT found${NC}"
fi

# Check if OpeningInfo component exists
if [ -f "components/organisms/OpeningInfo.tsx" ]; then
    echo -e "${GREEN}✅ OpeningInfo display component exists${NC}"
else
    echo -e "${RED}❌ OpeningInfo component NOT found${NC}"
fi

# Check if accuracy calculation is updated
if grep -q "bestEvaluations" hooks/useAnalysis.ts; then
    echo -e "${GREEN}✅ Accuracy calculation uses separate bestEvaluations array${NC}"
else
    echo -e "${YELLOW}⚠️  Accuracy calculation may not be using updated logic${NC}"
fi

echo ""
echo "=================================================="
echo "Ready to Test! 🚀"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000/analyze in your browser"
echo "2. Follow the testing instructions above"
echo "3. Report any issues you find"
echo ""
echo "To stop servers: pkill -f 'next dev' && fuser -k 3001/tcp"
echo ""
