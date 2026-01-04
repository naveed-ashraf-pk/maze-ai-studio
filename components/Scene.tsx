
import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping } from 'three';
import Maze from './Maze.tsx';
import Chest from './Chest.tsx';
import { SPAWN, GOAL, PATH, WALL, CHEST } from '../utils/maze.ts';
import { TEXTURES, SCALES, COLORS, MAZE_CONFIG } from '../utils/constants.ts';

interface SceneProps {
  mazeData: string[][];
  showLights: boolean;
}

interface FloorProps {
  width: number;
  height: number;
  showLights: boolean;
}

const Floor: React.FC<FloorProps> = ({ width, height, showLights }) => {
  const floorTex = useLoader(TextureLoader, TEXTURES.FLOOR);
  const planeWidth = width + 100;
  const planeHeight = height + 100;
  
  useMemo(() => {
    if (floorTex) {
      floorTex.wrapS = floorTex.wrapT = RepeatWrapping;
      floorTex.repeat.set(planeWidth / SCALES.FLOOR_TILING, planeHeight / SCALES.FLOOR_TILING);
      floorTex.anisotropy = MAZE_CONFIG.ANISOTROPY;
    }
  }, [floorTex, planeWidth, planeHeight]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[width / 2, -0.01, height / 2]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      {showLights ? (
        <meshPhongMaterial map={floorTex} shininess={5} reflectivity={0.1} />
      ) : (
        <meshBasicMaterial map={floorTex} color="#888" />
      )}
    </mesh>
  );
};

const Torch: React.FC<{ position: [number, number, number], rotation: [number, number, number], showLights: boolean }> = ({ position, rotation, showLights }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.08, 0.3, 0.1]} />
        <meshBasicMaterial color={COLORS.TORCH_BRACKET} />
      </mesh>
      <mesh position={[0, 0.15, 0.15]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
        <meshBasicMaterial color={COLORS.TORCH_BRACKET} />
      </mesh>
      <group position={[0, 0.25, 0.22]}>
        <mesh>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={COLORS.CORRIDOR_LIGHT} />
        </mesh>
        {showLights && (
          <pointLight color={COLORS.CORRIDOR_LIGHT} intensity={12} distance={COLORS.LIGHT_DISTANCE} decay={COLORS.LIGHT_DECAY} />
        )}
      </group>
    </group>
  );
};

const WallMountedLights: React.FC<{ data: string[][], showLights: boolean }> = ({ data, showLights }) => {
  const torches = useMemo(() => {
    const list: { pos: [number, number, number], rot: [number, number, number] }[] = [];
    const w = data.length;
    const h = data[0].length;
    let validWallSpots = 0;

    for (let x = 1; x < w - 1; x++) {
      for (let z = 1; z < h - 1; z++) {
        if (data[x][z] === WALL) {
          const neighbors = [
            { dx: 0, dz: 1, rot: [0, 0, 0] },          
            { dx: 0, dz: -1, rot: [0, Math.PI, 0] },    
            { dx: 1, dz: 0, rot: [0, Math.PI / 2, 0] }, 
            { dx: -1, dz: 0, rot: [0, -Math.PI / 2, 0] }
          ];
          for (const n of neighbors) {
            const nx = x + n.dx;
            const nz = z + n.dz;
            if (nx >= 0 && nx < w && nz >= 0 && nz < h && data[nx][nz] === PATH) {
              validWallSpots++;
              if (validWallSpots % MAZE_CONFIG.LIGHT_SPACING === 0) {
                list.push({ pos: [x + 0.5 + n.dx * 0.45, 1.4, z + 0.5 + n.dz * 0.45], rot: n.rot as [number, number, number] });
                break; 
              }
            }
          }
        }
      }
    }
    return list;
  }, [data]);

  return (
    <group>
      {torches.map((t, i) => (
        <Torch key={`wall-torch-${i}`} position={t.pos} rotation={t.rot} showLights={showLights} />
      ))}
    </group>
  );
};

const Scene: React.FC<SceneProps> = ({ mazeData, showLights }) => {
  return (
    <group>
      <Floor width={mazeData.length} height={mazeData[0].length} showLights={showLights} />
      <Maze data={mazeData} size={mazeData.length} />
      <WallMountedLights data={mazeData} showLights={showLights} />
      {mazeData.map((row, x) => 
        row.map((cell, z) => {
          if (cell === SPAWN) {
            return (
              <group key={`spawn-${x}-${z}`} position={[x + 0.5, 0, z + 0.5]}>
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
                  <meshBasicMaterial color={COLORS.SPAWN} />
                </mesh>
              </group>
            );
          }
          if (cell === GOAL) {
            return (
              <group key={`goal-${x}-${z}`} position={[x + 0.5, 0.8, z + 0.5]}>
                <mesh><torusKnotGeometry args={[0.3, 0.1, 32, 4]} /><meshBasicMaterial color={COLORS.GOAL} /></mesh>
                {showLights && <pointLight color={COLORS.GOAL} intensity={15} distance={10} />}
              </group>
            );
          }
          if (cell === CHEST) {
            return (
              <group key={`chest-${x}-${z}`} position={[x + 0.5, 0, z + 0.5]}>
                <Chest showLights={showLights} />
              </group>
            );
          }
          return null;
        })
      )}
    </group>
  );
};

export default Scene;
