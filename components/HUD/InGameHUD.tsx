
import React from 'react';

interface InGameHUDProps {
  resources: { souls: number, mana: number, shards: number, maxShards: number };
  setIsPaused: () => void;
  setShowInventory: () => void;
}

const InGameHUD: React.FC<InGameHUDProps> = ({ resources, setIsPaused, setShowInventory }) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      
      {/* TOP HEADER: Vital Stats & Tactical Relay */}
      <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* Left Side: Resources */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
           <div className="artifact-container px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-4 sm:gap-6 border-l-4 border-l-[#00f2ff]">
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[10px] text-cyan-400 font-black tracking-widest font-tech uppercase">Soul_Count</span>
                <span className="text-lg sm:text-2xl font-black text-white font-tech">
                  {resources.souls.toLocaleString()}
                </span>
              </div>
              <div className="h-8 sm:h-10 w-[1px] bg-cyan-400/20" />
              <div className="flex flex-col flex-1 sm:flex-none">
                <span className="text-[8px] sm:text-[10px] text-purple-400 font-black tracking-widest font-tech uppercase">Mana_Resonance</span>
                <div className="w-full sm:w-32 h-1.5 sm:h-2 bg-black/40 rounded-full mt-1 overflow-hidden border border-purple-500/20">
                   <div 
                     className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.5)] transition-all duration-700"
                     style={{ width: `${resources.mana}%` }}
                   />
                </div>
              </div>
           </div>
        </div>

        {/* Right Side: Shards & Tactical Relay */}
        <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
          <div className="flex gap-1.5 sm:gap-2">
             {Array.from({ length: resources.maxShards }).map((_, i) => (
               <div 
                 key={i} 
                 className={`w-2 h-6 sm:w-3 sm:h-8 artifact-container border transition-all duration-700
                   ${i < resources.shards 
                     ? 'bg-cyan-400/20 border-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.4)]' 
                     : 'opacity-10 border-white/5'
                   }`} 
               />
             ))}
          </div>

          {/* Tactical Relay: Moved here from bottom to avoid map overlap */}
          <div className="artifact-container p-3 sm:p-4 max-w-[240px] hidden sm:block border-r-2 border-r-cyan-400/30">
             <div className="flex items-center gap-2 mb-1 text-cyan-400">
                <span className="text-[8px] font-black tracking-[0.4em] uppercase">Tactical_Relay</span>
                <div className="flex-1 h-[1px] bg-cyan-400/10" />
             </div>
             <p className="text-[8px] text-white/50 leading-tight uppercase font-tech font-bold">
               <span className="text-cyan-400 mr-1">></span> Analyzing Strata...<br/>
               <span className="text-cyan-400 mr-1">></span> Link Strength: 98.4%
             </p>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
        
        {/* Empty left space for MiniMap (which is in App.tsx) - we'll keep buttons on the right */}
        <div className="flex-1" />

        <div className="flex gap-3 sm:gap-6 pointer-events-auto">
           <button 
             onClick={setShowInventory}
             className="runic-btn w-12 h-12 sm:w-16 sm:h-16 !p-0 artifact-container border hover:scale-105 active:scale-95"
             title="Inventory [I]"
           >
             <span className="text-xl sm:text-3xl">ᛟ</span>
           </button>
           
           <button 
             onClick={setIsPaused}
             className="runic-btn px-4 sm:px-8 artifact-container group flex flex-col sm:flex-row h-12 sm:h-16"
             title="System [ESC]"
           >
             <span className="text-[10px] font-black tracking-widest font-tech">HALT</span>
             <span className="hidden sm:inline text-white/20 group-hover:text-cyan-400 transition-colors ml-2">ᛉ</span>
           </button>
        </div>
      </div>

      <div className="scanlines" />
      <div className="chromatic-aberration" />
    </div>
  );
};

export default InGameHUD;
