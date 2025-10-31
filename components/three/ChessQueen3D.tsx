'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import CyberpunkQueen from './CyberpunkQueen';

interface ChessQueen3DProps {
  className?: string;
  autoRotate?: boolean;
  scale?: number;
}

/**
 * 3D Chess King Scene Component
 * Renders a cyberpunk-styled chess king with animations
 */
export default function ChessQueen3D({
  className = '',
  autoRotate = true,
  scale = 1,
}: ChessQueen3DProps) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        className="touch-none"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]} // Adaptive pixel ratio
      >
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />

        {/* Lights */}
        <ambientLight intensity={0.3} />
        
        {/* Main key light - terminal green */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          color="#01e87c"
          castShadow
        />
        
        {/* Fill light - cyan accent */}
        <directionalLight
          position={[-5, 3, -5]}
          intensity={0.5}
          color="#00ffff"
        />
        
        {/* Rim light - creates edge glow */}
        <spotLight
          position={[0, 8, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#01e87c"
        />

        {/* 3D King Model */}
        <Suspense fallback={<LoadingFallback />}>
          <CyberpunkQueen scale={scale} />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Fog for depth */}
        <fog attach="fog" args={['#010d19', 5, 15]} />
      </Canvas>

      {/* Loading overlay */}
      <div className="absolute bottom-2 right-2 text-xs font-mono text-terminal-green/50">
        [ 3D ASSET LOADED ]
      </div>
    </div>
  );
}

/**
 * Loading fallback while 3D model loads
 */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial
        color="#01e87c"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}
