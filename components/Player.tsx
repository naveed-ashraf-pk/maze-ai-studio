
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Vector3, Group, Mesh } from 'three';
// Fixed: Removed .ts extension from utility imports
import { SPAWN } from '../utils/maze';
import { COLORS } from '../utils/constants';

// Fix for "Property does not exist on type 'JSX.IntrinsicElements'" errors.
// Augmenting JSX namespace locally to support React Three Fiber tags.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface PlayerProps {
  mazeData: string[][];
  onPositionUpdate: (pos: { x: number, z: number }) => void;
}

const Player: React.FC<PlayerProps> = ({ mazeData, onPositionUpdate }) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  
  const initialPos = (() => {
    for (let x = 0; x < mazeData.length; x++) {
      for (let z = 0; z < mazeData[0].length; z++) {
        if (mazeData[x][z] === SPAWN) return new Vector3(x + 0.5, 0.5, z + 0.5);
      }
    }
    return new Vector3(1.5, 0.5, 1.5);
  })();

  const pos = useRef(initialPos.clone());
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const speed = 6;
    const input = new Vector3();
    if (keys.current['arrowup'] || keys.current['w']) input.z -= 1;
    if (keys.current['arrowdown'] || keys.current['s']) input.z += 1;
    if (keys.current['arrowleft'] || keys.current['a']) input.x -= 1;
    if (keys.current['arrowright'] || keys.current['d']) input.x += 1;

    if (input.length() > 0) {
      input.normalize().multiplyScalar(speed * delta);
      
      const nextX = pos.current.x + input.x;
      const nextZ = pos.current.z + input.z;
      
      const padding = 0.35;
      const checkCollision = (tx: number, tz: number) => {
        const gridX = Math.floor(tx);
        const gridZ = Math.floor(tz);
        if (gridX < 0 || gridX >= mazeData.length || gridZ < 0 || gridZ >= mazeData[0].length) return true;
        return mazeData[gridX][gridZ] === '#'; 
      };

      if (!checkCollision(nextX + (input.x > 0 ? padding : -padding), pos.current.z)) {
        pos.current.x = nextX;
      }
      if (!checkCollision(pos.current.x, nextZ + (input.z > 0 ? padding : -padding))) {
        pos.current.z = nextZ;
      }

      onPositionUpdate({ x: pos.current.x, z: pos.current.z });
    }

    groupRef.current.position.lerp(pos.current, 0.3);
    
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.position.y = 0.2 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color={COLORS.SPAWN} 
          emissive={COLORS.SPAWN} 
          emissiveIntensity={2} 
          wireframe
        />
      </mesh>
      <mesh position={[0, -0.45, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.2, 0.4, 32]} />
        <meshBasicMaterial color={COLORS.SPAWN} transparent opacity={0.4} />
      </mesh>
      <pointLight 
        color={COLORS.SPAWN} 
        intensity={8} 
        distance={4} 
        decay={2} 
      />
    </group>
  );
};

export default Player;
