
import React, { useState, Suspense, useMemo, useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import Scene from './components/Scene';
import MiniMap from './components/MiniMap';
import HUDManager from './components/HUD/HUDManager';
import { generateMaze, SPAWN } from './utils/maze';
import { COLORS } from './utils/constants';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const CameraRotationSync = ({ onChange, target }: { onChange: (rotation: number) => void, target: THREE.Vector3 }) => {
  const { camera } = useThree();
  const vec = new THREE.Vector3();

  useFrame(() => {
    vec.copy(camera.position).sub(target);
    const angle = Math.atan2(vec.x, vec.z);
    onChange(angle);
  });
  return null;
};

const App: React.FC = () => {
  const [mazeSize, setMazeSize] = useState(25); 
  const [seed, setSeed] = useState(0);
  const [showLights, setShowLights] = useState(true); 
  const [cameraRot, setCameraRot] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const orbitRef = useRef<any>(null);

  const mazeData = useMemo(() => 
    generateMaze(mazeSize, mazeSize, 2, 4), 
    [mazeSize, seed]
  );

  const initialPlayerPos = useMemo(() => {
    for (let x = 0; x < mazeData.length; x++) {
      for (let z = 0; z < mazeData[0].length; z++) {
        if (mazeData[x][z] === SPAWN) return { x: x + 0.5, z: z + 0.5 };
      }
    }
    return { x: 1.5, z: 1.5 };
  }, [mazeData]);

  const [playerPos, setPlayerPos] = useState(initialPlayerPos);
  const playerVec = useMemo(() => new THREE.Vector3(playerPos.x, 0.5, playerPos.z), [playerPos.x, playerPos.z]);

  const regenerate = useCallback(() => {
    setSeed(s => s + 1);
    setPlayerPos(initialPlayerPos);
    setIsPaused(false);
  }, [initialPlayerPos]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'escape') setIsPaused(p => !p);
      if (e.key.toLowerCase() === 'i') setShowInventory(i => !i);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  return (
    <div className="w-full h-full relative bg-[#010203] overflow-hidden select-none">
      <div className={`w-full h-full transition-all duration-1000 ${isPaused || showInventory ? 'blur-xl opacity-40' : 'blur-0 opacity-100'}`}>
        <Canvas 
          shadows={false} 
          dpr={[1, 2]} 
          gl={{ 
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
        >
          <Suspense fallback={null}>
            <CameraRotationSync onChange={setCameraRot} target={playerVec} />
            <PerspectiveCamera makeDefault position={[playerPos.x, 12, playerPos.z + 8]} fov={60} />
            
            <OrbitControls 
              ref={orbitRef}
              target={[playerPos.x, 0.5, playerPos.z]}
              enablePan={false}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={3}
              maxDistance={18}
              makeDefault
            />

            <ambientLight intensity={showLights ? 0.05 : 0.4} color="#001122" />
            
            <color attach="background" args={[COLORS.VOID_FOG]} />
            <fog attach="fog" args={[COLORS.VOID_FOG, 2, 22]} />

            <Scene 
              mazeData={mazeData}
              showLights={showLights}
              onPlayerMove={setPlayerPos}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,1)] z-10" />

      <HUDManager 
        isPaused={isPaused} 
        setIsPaused={setIsPaused}
        showInventory={showInventory}
        setShowInventory={setShowInventory}
        showLights={showLights}
        setShowLights={setShowLights}
        mazeSize={mazeSize}
        setMazeSize={setMazeSize}
        regenerate={regenerate}
      />

      <div className="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 z-20 transition-transform duration-500 hover:scale-105 origin-bottom-left">
        <MiniMap mazeData={mazeData} rotation={cameraRot} playerPos={playerPos} />
      </div>
      
      <div className="absolute top-2 right-2 opacity-5 hover:opacity-100 transition-opacity z-50 scale-[0.6] origin-top-right invert">
        <Stats />
      </div>
    </div>
  );
};

export default App;
