
import React, { useState, Suspense, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import Scene from './components/Scene.tsx';
import MiniMap from './components/MiniMap.tsx';
import { generateMaze, SPAWN } from './utils/maze.ts';
import { COLORS } from './utils/constants.ts';
import * as THREE from 'three';

// Tracks the horizontal angle of the camera relative to its target for the MiniMap
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
  const [mazeSize, setMazeSize] = useState(41); 
  const [seed, setSeed] = useState(0);
  const [showLights, setShowLights] = useState(false); 
  const [minPathWidth, setMinPathWidth] = useState(2);
  const [maxPathWidth, setMaxPathWidth] = useState(4);
  const [cameraRot, setCameraRot] = useState(0);
  const orbitRef = useRef<any>(null);

  const mazeData = useMemo(() => 
    generateMaze(mazeSize, mazeSize, minPathWidth, maxPathWidth), 
    [mazeSize, seed, minPathWidth, maxPathWidth]
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
  const playerVec = useMemo(() => new THREE.Vector3(playerPos.x, 0.5, playerPos.z), [playerPos]);

  const regenerate = () => {
    setSeed(s => s + 1);
    setPlayerPos(initialPlayerPos);
  };

  return (
    <div className="w-full h-full relative bg-neutral-950 overflow-hidden">
      <Canvas 
        shadows={false} 
        dpr={[1, 1.2]} 
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <CameraRotationSync onChange={setCameraRot} target={playerVec} />
          <PerspectiveCamera makeDefault position={[playerPos.x, 15, playerPos.z + 10]} fov={50} />
          
          <OrbitControls 
            ref={orbitRef}
            target={[playerPos.x, 0.5, playerPos.z]}
            enablePan={false}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={30}
            makeDefault
          />

          <ambientLight intensity={showLights ? COLORS.AMBIENT_INTENSITY : 0.6} />
          <directionalLight position={[10, 20, 10]} intensity={0.4} />
          
          <color attach="background" args={['#020202']} />
          <fog attach="fog" args={['#020202', 10, 50]} />

          <Scene 
            mazeData={mazeData}
            showLights={showLights}
            onPlayerMove={setPlayerPos}
          />
        </Suspense>
        <Stats className="!absolute !top-4 !left-4" />
      </Canvas>

      <div className="absolute bottom-8 left-8 pointer-events-none">
        <MiniMap mazeData={mazeData} rotation={cameraRot} playerPos={playerPos} />
      </div>

      <div className="absolute top-0 right-0 p-6 flex flex-col gap-4 pointer-events-none w-80 h-full overflow-y-auto custom-scrollbar">
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl pointer-events-auto shadow-2xl space-y-6">
          <header>
            <h1 className="text-xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">
              MazeArchitect
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              3D Voxel Dungeon
            </p>
          </header>
          
          <div className="space-y-6">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Controls</p>
              <p className="text-xs text-orange-400 font-mono">WASD to Move</p>
              <p className="text-xs text-gray-400 font-mono">MOUSE to Rotate View</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-xs font-bold text-white uppercase">Dynamic Lights</p>
                <p className="text-[9px] text-gray-500">Torches & Glows</p>
              </div>
              <button 
                onClick={() => setShowLights(!showLights)}
                className={`w-12 h-6 rounded-full transition-colors relative ${showLights ? 'bg-orange-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showLights ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Maze Scale</label>
                <span className="text-xs font-mono text-orange-400">{mazeSize}</span>
              </div>
              <input 
                type="range" min="21" max="61" step="2" value={mazeSize} 
                onChange={(e) => setMazeSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <button 
              onClick={regenerate}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg"
            >
              Rebuild Maze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
