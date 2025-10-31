'use client';

import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface CyberpunkQueenProps {
  scale?: number;
}

/**
 * Cyberpunk Chess King Component
 * 
 * Now using actual 3D model from Meshy AI!
 * Model: /models/king.glb (Generated with Meshy AI API)
 */
function QueenModel({ scale = 1 }: CyberpunkQueenProps) {
  const groupRef = useRef<Group>(null);
  
  // Load the GLB model
  const { scene } = useGLTF('/models/king.glb');

  // Floating and rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Gentle floating motion
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.2;
      
      // Subtle rotation
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* The actual 3D model from Meshy AI */}
      <primitive object={scene.clone()} castShadow receiveShadow />
      
      {/* Cyberpunk lighting effects */}
      <pointLight 
        position={[0, 2, 0]} 
        intensity={2} 
        distance={3} 
        color="#01e87c" 
      />
      <pointLight 
        position={[0, 0, 0]} 
        intensity={1} 
        distance={2} 
        color="#00ffff" 
      />
      
      {/* Glowing ring effect */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#01e87c"
          emissive="#01e87c"
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// Fallback component while model loads
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#01e87c" 
        emissive="#01e87c" 
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

// Main export with Suspense boundary
export default function CyberpunkQueen(props: CyberpunkQueenProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QueenModel {...props} />
    </Suspense>
  );
}

// Preload the model for better performance
useGLTF.preload('/models/king.glb');
