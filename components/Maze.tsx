
import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { InstancedMesh, Object3D } from 'three';
import { ThreeElements } from '@react-three/fiber';
import WallMaterial from './WallMaterial';
import { WALL } from '../utils/maze';
import { SCALES, MAZE_CONFIG } from '../utils/constants';
import { getWallSideTexture, getWallTopTexture, getFloorTexture } from '../assets/textures';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface MazeProps {
  data: string[][];
  size: number;
}

interface MazeChunkProps { 
  chunkData: {x: number, y: number, z: number}[], 
  sideTex: any,
  topTex: any,
  floorTex: any
}

const MazeChunk = React.memo(({ 
  chunkData, 
  sideTex, 
  topTex, 
  floorTex 
}: MazeChunkProps) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    chunkData.forEach((pos, i) => {
      dummy.position.set(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = chunkData.length;
  }, [chunkData, dummy]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, chunkData.length]}
      frustumCulled={true}
    >
      <boxGeometry args={[1, 1, 1]} />
      <WallMaterial 
        topMap={topTex} 
        sideMap={sideTex} 
        bottomMap={floorTex} 
        glowColor="#990000"          // Deep arterial red
        glowSecondaryColor="#ff9900" // Bright energetic orange
        pulseSpeed={0.4}             // Steady, organic breathing speed
        pulseRange={0.8}             // Keep it slightly more biased towards red
        glowIntensity={1.2}          // Slight boost for visual impact
      />
    </instancedMesh>
  );
});

const Maze: React.FC<MazeProps> = React.memo(({ data }) => {
  const [sideTex, topTex, floorTex] = useMemo(() => [
    getWallSideTexture(),
    getWallTopTexture(),
    getFloorTexture()
  ], []);

  const chunks = useMemo(() => {
    const map = new Map<string, {x: number, y: number, z: number}[]>();
    const chunkSize = MAZE_CONFIG.CHUNK_SIZE;
    const wallHeight = Math.round(SCALES.WALL_HEIGHT);

    for (let x = 0; x < data.length; x++) {
      for (let z = 0; z < data[0].length; z++) {
        if (data[x][z] === WALL) {
          const cx = Math.floor(x / chunkSize);
          const cz = Math.floor(z / chunkSize);
          const key = `${cx},${cz}`;
          if (!map.has(key)) map.set(key, []);
          
          for (let y = 0; y < wallHeight; y++) {
            map.get(key)!.push({ x, y, z });
          }
        }
      }
    }
    return Array.from(map.entries());
  }, [data]);

  return (
    <group>
      {chunks.map(([key, chunkData]) => (
        <MazeChunk 
          key={key}
          chunkData={chunkData}
          sideTex={sideTex}
          topTex={topTex}
          floorTex={floorTex}
        />
      ))}
    </group>
  );
});

export default Maze;
