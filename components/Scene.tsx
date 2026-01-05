
import React, { useMemo } from 'react';
import { ThreeElements } from '@react-three/fiber';
import Maze from './Maze';
import Chest from './Chest';
import Player from './Player';
import { SPAWN, GOAL, PATH, WALL, CHEST } from '../utils/maze';
import { SCALES, COLORS, MAZE_CONFIG } from '../utils/constants';
import { getFloorTexture } from '../assets/textures';

// Fix for "Property does not exist on type 'JSX.IntrinsicElements'" errors.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  mazeData: string[][];
  showLights: boolean;
  onPlayerMove: (pos: { x: number, z: number }) => void;
}

const Floor = React.memo(({ width, height, showLights }: { width: number, height: number, showLights: boolean }) => {
  const floorTex = useMemo(() => {
    const tex = getFloorTexture();
    const planeWidth = width + 100;
    const planeHeight = height + 100;
    tex.repeat.set(planeWidth / SCALES.FLOOR_TILING, planeHeight / SCALES.FLOOR_TILING);
    return tex;
  }, [width, height]);

  const planeWidth = width + 100;
  const planeHeight = height + 100;

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
});

const Torch = React.memo(({ position, rotation, showLights }: { position: [number, number, number], rotation: [number, number, number], showLights: boolean }) => {
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
          <pointLight 
            color={COLORS.CORRIDOR_LIGHT} 
            intensity={12} 
            distance={COLORS.LIGHT_DISTANCE} 
            decay={COLORS.LIGHT_DECAY} 
          />
        )}
      </group>
    </group>
  );
});

const WallMountedLights = React.memo(({ data, showLights }: { data: string[][], showLights: boolean }) => {
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
});

const Scene: React.FC<SceneProps> = React.memo(({ mazeData, showLights, onPlayerMove }) => {
  const staticEntities = useMemo(() => {
    const list: React.ReactNode[] = [];
    mazeData.forEach((row, x) => {
      row.forEach((cell, z) => {
        if (cell === SPAWN) {
          list.push(
            <group key={`spawn-${x}-${z}`} position={[x + 0.5, 0, z + 0.5]}>
              <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
                <meshBasicMaterial color={COLORS.SPAWN} transparent opacity={0.2} />
              </mesh>
            </group>
          );
        } else if (cell === GOAL) {
          list.push(
            <group key={`goal-${x}-${z}`} position={[x + 0.5, 0.8, z + 0.5]}>
              <mesh><torusKnotGeometry args={[0.3, 0.1, 32, 4]} /><meshBasicMaterial color={COLORS.GOAL} /></mesh>
            </group>
          );
        } else if (cell === CHEST) {
          list.push(
            <group key={`chest-${x}-${z}`} position={[x + 0.5, 0, z + 0.5]}>
              <Chest showLights={showLights} />
            </group>
          );
        }
      });
    });
    return list;
  }, [mazeData, showLights]);

  const goalLights = useMemo(() => {
    if (!showLights) return null;
    const list: React.ReactNode[] = [];
    mazeData.forEach((row, x) => {
      row.forEach((cell, z) => {
        if (cell === GOAL) {
          list.push(<pointLight key={`goal-light-${x}-${z}`} position={[x + 0.5, 0.8, z + 0.5]} color={COLORS.GOAL} intensity={15} distance={10} />);
        }
      });
    });
    return list;
  }, [mazeData, showLights]);

  return (
    <group>
      <Floor width={mazeData.length} height={mazeData[0].length} showLights={showLights} />
      <Maze data={mazeData} size={mazeData.length} />
      <WallMountedLights data={mazeData} showLights={showLights} />
      
      <Player mazeData={mazeData} onPositionUpdate={onPlayerMove} />

      {staticEntities}
      {goalLights}
    </group>
  );
});

export default Scene;
