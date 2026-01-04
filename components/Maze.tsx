
import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { InstancedMesh, Object3D, TextureLoader, RepeatWrapping } from 'three';
import { useLoader } from '@react-three/fiber';
import WallMaterial from './WallMaterial.tsx';
import { WALL } from '../utils/maze.ts';
import { TEXTURES, SCALES, MAZE_CONFIG } from '../utils/constants.ts';

interface MazeProps {
  data: string[][];
  size: number;
}

interface MazeChunkProps { 
  chunkData: {x: number, z: number}[], 
  sideTex: any,
  topTex: any,
  floorTex: any
}

const MazeChunk: React.FC<MazeChunkProps> = ({ 
  chunkData, 
  sideTex, 
  topTex, 
  floorTex 
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    chunkData.forEach((pos, i) => {
      dummy.position.set(pos.x + 0.5, SCALES.WALL_HEIGHT / 2, pos.z + 0.5);
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
    >
      <boxGeometry args={[1, SCALES.WALL_HEIGHT, 1]} />
      <WallMaterial 
        topMap={topTex} 
        sideMap={sideTex} 
        bottomMap={floorTex} 
      />
    </instancedMesh>
  );
};

const Maze: React.FC<MazeProps> = ({ data }) => {
  const [sideTex, topTex, floorTex] = useLoader(TextureLoader, [
    TEXTURES.WALL_SIDE,
    TEXTURES.WALL_TOP,
    TEXTURES.FLOOR
  ]);

  useMemo(() => {
    [sideTex, topTex, floorTex].forEach(t => {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.anisotropy = MAZE_CONFIG.ANISOTROPY;
    });
  }, [sideTex, topTex, floorTex]);

  const chunks = useMemo(() => {
    const map = new Map<string, {x: number, z: number}[]>();
    const chunkSize = MAZE_CONFIG.CHUNK_SIZE;

    for (let x = 0; x < data.length; x++) {
      for (let z = 0; z < data[0].length; z++) {
        if (data[x][z] === WALL) {
          const cx = Math.floor(x / chunkSize);
          const cz = Math.floor(z / chunkSize);
          const key = `${cx},${cz}`;
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push({ x, z });
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
};

export default Maze;
