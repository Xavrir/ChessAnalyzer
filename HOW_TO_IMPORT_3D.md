# How to Import and Use the 3D Queen Component

## ✅ Already Done for You!

The 3D Queen is **already imported and integrated** in `/app/page.tsx`. Here's what was added:

## Step 1: Add 'use client' Directive

```tsx
'use client';  // 👈 This is REQUIRED for Three.js components
```

**Why?** Three.js uses browser APIs that only work on the client side.

## Step 2: Dynamic Import with next/dynamic

```tsx
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const ChessQueen3D = dynamic(
  () => import('@/components/three/ChessQueen3D'),
  { 
    ssr: false,  // Don't render on server
    loading: () => (
      // Show this while loading
      <div className="w-full h-full flex items-center justify-center bg-background-tertiary/20 rounded-lg animate-pulse">
        <span className="text-terminal-green font-mono text-sm">[ LOADING 3D ASSET... ]</span>
      </div>
    )
  }
);
```

**Why dynamic import?**
- Three.js needs `window` object (not available during SSR)
- Prevents "window is not defined" errors
- Shows loading state while component loads

## Step 3: Use the Component

```tsx
export default function Home() {
  return (
    <div>
      {/* Your other content */}
      
      <div className="h-[500px] relative">
        <ChessQueen3D className="w-full h-full" />
      </div>
    </div>
  );
}
```

## Current Integration (Already in Landing Page)

Located in `/app/page.tsx` around line 110:

```tsx
{/* Right: 3D Queen */}
<div className="hidden lg:block h-[500px] relative">
  <ChessQueen3D className="w-full h-full" />
  
  {/* Tactical Frame Corners */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-terminal-green/50" />
    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-terminal-green/50" />
    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-terminal-green/50" />
    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-terminal-green/50" />
  </div>
  
  {/* Asset Label */}
  <div className="absolute top-2 left-2 text-xs font-mono text-terminal-green/70 bg-background-primary/80 px-2 py-1 rounded">
    <div>ASSET: QUEEN-V1</div>
    <div className="text-terminal-green/50">STATUS: ACTIVE</div>
  </div>
</div>
```

## Component Props (Optional)

You can customize the queen:

```tsx
<ChessQueen3D 
  className="w-full h-full"
  autoRotate={true}  // Auto-rotate the queen (default: true)
  scale={1.5}        // Make it bigger/smaller (default: 1)
/>
```

## File Structure

```
chess-analyzer/
├── app/
│   └── page.tsx              # Landing page (uses ChessQueen3D)
└── components/
    └── three/
        ├── ChessQueen3D.tsx  # Main 3D scene setup
        └── CyberpunkQueen.tsx # Queen model/geometry
```

## How It Works

1. **ChessQueen3D.tsx** - Sets up the 3D scene:
   - Canvas (Three.js renderer)
   - Camera
   - Lights (terminal green + cyan)
   - Controls (orbit, auto-rotate)
   - Fog for depth

2. **CyberpunkQueen.tsx** - The actual queen:
   - Geometric placeholder (or GLB model when you have one)
   - Floating animation
   - Glowing materials
   - Point lights

## Testing It

1. **Start dev server:**
   ```bash
   cd /root/Downloads/tes11/chess-analyzer
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Look for:**
   - Rotating green glowing geometric queen on the right side
   - Tactical frame corners around it
   - "ASSET: QUEEN-V1" label
   - It should auto-rotate and glow!

## Using in Other Pages

Want to add the queen to another page? Just follow the same pattern:

```tsx
'use client';  // 👈 Don't forget this!

import dynamic from 'next/dynamic';

const ChessQueen3D = dynamic(
  () => import('@/components/three/ChessQueen3D'),
  { ssr: false }
);

export default function MyPage() {
  return (
    <div className="h-96">
      <ChessQueen3D />
    </div>
  );
}
```

## Common Errors & Fixes

### ❌ Error: "window is not defined"
**Fix:** Add `'use client'` at the top of the file

### ❌ Error: "ssr: false not allowed in Server Components"
**Fix:** Add `'use client'` directive

### ❌ Error: "Cannot find module './CyberpunkQueen'"
**Fix:** File exists, just TypeScript being slow. Restart dev server:
```bash
pkill -f "next dev"
npm run dev
```

### ❌ Black screen / nothing renders
**Fix:** Check browser console for errors. Might need to:
- Clear .next cache: `rm -rf .next`
- Restart dev server

## Replacing Placeholder with Real Model

When you get a GLB model (from Meshy AI or elsewhere):

1. **Place file:**
   ```bash
   cp ~/Downloads/queen.glb public/models/queen.glb
   ```

2. **Update CyberpunkQueen.tsx:**
   ```tsx
   import { useGLTF } from '@react-three/drei';
   
   export default function CyberpunkQueen({ scale = 1 }) {
     const { scene } = useGLTF('/models/queen.glb');
     
     return (
       <primitive object={scene.clone()} scale={scale} />
     );
   }
   
   useGLTF.preload('/models/queen.glb');
   ```

## That's It! 🎉

The 3D queen is already working with:
- ✅ Proper imports
- ✅ Client-side rendering
- ✅ Loading state
- ✅ Auto-rotation
- ✅ Glowing effects
- ✅ Floating animation
- ✅ Tactical frame decoration

Just run `npm run dev` and check it out at http://localhost:3000! 👑✨
