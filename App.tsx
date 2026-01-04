
import React, { useState, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import Scene from './components/Scene.tsx';
import MiniMap from './components/MiniMap.tsx';
import { generateMaze } from './utils/maze.ts';
import { COLORS } from './utils/constants.ts';
import * as THREE from 'three';

// Tracks the horizontal angle of the camera relative to its target
const CameraRotationSync = ({ onChange, target }: { onChange: (rotation: number) => void, target: THREE.Vector3 }) => {
  const { camera } = useThree();
  const vec = new THREE.Vector3();

  useFrame(() => {
    // Calculate angle based on camera position relative to the look-at target
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

  const mazeData = useMemo(() => 
    generateMaze(mazeSize, mazeSize, minPathWidth, maxPathWidth), 
    [mazeSize, seed, minPathWidth, maxPathWidth]
  );

  // The center of the maze world-space
  const mazeCenter = useMemo(() => new THREE.Vector3(mazeSize / 2, 0, mazeSize / 2), [mazeSize]);

  const regenerate = () => setSeed(s => s + 1);

  const handleMinChange = (val: number) => {
    setMinPathWidth(val);
    if (val > maxPathWidth) setMaxPathWidth(val);
  };

  const handleMaxChange = (val: number) => {
    setMaxPathWidth(val);
    if (val < minPathWidth) setMinPathWidth(val);
  };

  return (
    <div className="w-full h-full relative bg-neutral-950 overflow-hidden">
      <Canvas 
        shadows={false} 
        dpr={[1, 1.2]} 
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        <Suspense fallback={null}>
          <CameraRotationSync onChange={setCameraRot} target={mazeCenter} />
          <PerspectiveCamera makeDefault position={[mazeSize * 0.8, mazeSize * 0.6, mazeSize * 0.8]} />
          <OrbitControls 
            makeDefault 
            target={mazeCenter}
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.2} 
            enableDamping={true}
          />
          
          <ambientLight intensity={showLights ? COLORS.AMBIENT_INTENSITY : 0.8} />
          
          <color attach="background" args={['#020202']} />
          <fog attach="fog" args={['#020202', 10, mazeSize * 1.5]} />

          <Scene 
            mazeData={mazeData}
            showLights={showLights}
          />
        </Suspense>
        <Stats className="!absolute !top-4 !left-4" />
      </Canvas>

      {/* MiniMap Compass UI */}
      <div className="absolute bottom-8 left-8 pointer-events-none">
        <MiniMap mazeData={mazeData} rotation={cameraRot} />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 right-0 p-6 flex flex-col gap-4 pointer-events-none w-80 h-full overflow-y-auto custom-scrollbar">
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl pointer-events-auto shadow-2xl space-y-6">
          <header>
            <h1 className="text-xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">
              DungeonArchitect
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Layout Generator
            </p>
          </header>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-xs font-bold text-white uppercase">Dynamic Lights</p>
                <p className="text-[9px] text-gray-500">Affects FPS significantly</p>
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
                <span className="text-xs font-mono text-orange-400">{mazeSize}x{mazeSize}</span>
              </div>
              <input 
                type="range" min="21" max="81" step="2" value={mazeSize} 
                onChange={(e) => setMazeSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div className="space-y-4 pt-2 border-t border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Path Configuration</p>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Min Width</label>
                  <span className="text-xs font-mono text-orange-400">{minPathWidth}</span>
                </div>
                <input 
                  type="range" min="1" max="6" step="1" value={minPathWidth} 
                  onChange={(e) => handleMinChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Max Width</label>
                  <span className="text-xs font-mono text-orange-400">{maxPathWidth}</span>
                </div>
                <input 
                  type="range" min="1" max="8" step="1" value={maxPathWidth} 
                  onChange={(e) => handleMaxChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>

            <button 
              onClick={regenerate}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-orange-900/20"
            >
              Rebuild Dungeon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
