
import React, { useState, useEffect, useRef, useCallback } from 'react';
import StoneModal from './StoneModal';
import InventoryHUD from './InventoryHUD';
import ToastContainer from './ToastContainer';
import InGameHUD from './InGameHUD';
import LevelUpOverlay from './LevelUpOverlay';

interface HUDManagerProps {
  isPaused: boolean;
  setIsPaused: (v: boolean) => void;
  showInventory: boolean;
  setShowInventory: (v: boolean) => void;
  showLights: boolean;
  setShowLights: (v: boolean) => void;
  mazeSize: number;
  setMazeSize: (v: number) => void;
  regenerate: () => void;
}

const HUDManager: React.FC<HUDManagerProps> = React.memo(({
  isPaused, setIsPaused,
  showInventory, setShowInventory,
  showLights, setShowLights,
  mazeSize, setMazeSize,
  regenerate
}) => {
  const [toasts, setToasts] = useState<{id: number, text: string}[]>([]);
  const [resources, setResources] = useState({
    souls: 1250,
    mana: 85,
    shards: 3,
    maxShards: 5
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const isFirstRender = useRef(true);

  const addToast = useCallback((text: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Simulate progress for demo
  useEffect(() => {
    if (isFirstRender.current) {
      setTimeout(() => addToast("Link Established"), 1000);
      isFirstRender.current = false;
    }
  }, [addToast]);

  const handleLevelUp = useCallback(() => {
    setShowLevelUp(true);
    addToast("Ascension Imminent...");
  }, [addToast]);

  // Handle Level Up shortcut for demo
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'l') handleLevelUp();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleLevelUp]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden font-['Cinzel']">
      
      {/* Permanent Visor Elements */}
      <InGameHUD 
        resources={resources}
        setIsPaused={() => setIsPaused(true)}
        setShowInventory={() => setShowInventory(true)}
      />

      {/* Overlays */}
      {isPaused && (
        <StoneModal title="SYSTEM_HALT" onClose={() => setIsPaused(false)}>
          <div className="space-y-10 visor-entry">
            <div className="grid grid-cols-1 gap-6">
               <div className="artifact-container p-6 bg-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-cyan-500/60 font-black uppercase tracking-widest">Spectral Modality</span>
                    <span className="text-sm font-black text-white">MANA_RADIANCE</span>
                  </div>
                  <button 
                    onClick={() => setShowLights(!showLights)}
                    className={`px-6 py-2 artifact-container transition-all text-[10px] font-black tracking-widest pointer-events-auto shadow-inner ${showLights ? 'border-cyan-400 text-cyan-400 bg-cyan-400/20' : 'border-white/20 text-slate-400 bg-white/5'}`}
                  >
                    {showLights ? 'ACTIVE' : 'DORMANT'}
                  </button>
               </div>

               <div className="space-y-4 artifact-container p-6 bg-white/5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Labyrinth Scale</span>
                    <span className="text-xl font-black text-cyan-400">{mazeSize}x{mazeSize}</span>
                  </div>
                  <input 
                    type="range" min="11" max="51" step="2" value={mazeSize} 
                    onChange={(e) => setMazeSize(parseInt(e.target.value))}
                    className="pointer-events-auto"
                  />
               </div>
            </div>

            <button 
              onClick={regenerate}
              className="w-full py-6 artifact-container border-y-2 border-y-cyan-400/50 bg-cyan-400/10 text-cyan-400 font-black text-sm tracking-[0.5em] hover:bg-cyan-400 hover:text-black transition-all relative group overflow-hidden pointer-events-auto"
            >
              CONSTRUCT_NEW_TIMELINE
            </button>
          </div>
        </StoneModal>
      )}

      {showInventory && (
        <InventoryHUD onClose={() => setShowInventory(false)} />
      )}

      {showLevelUp && (
        <LevelUpOverlay 
          onClose={() => setShowLevelUp(false)} 
          currentLevel={4}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
});

export default HUDManager;
