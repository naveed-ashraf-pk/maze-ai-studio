
import React from 'react';

interface LevelUpOverlayProps {
  onClose: () => void;
  currentLevel: number;
}

const UPGRADES = [
  { id: 'sight', title: 'Spectral Sight', desc: 'Increases light distance by 40%', icon: 'ᛉ', cost: '1500 S' },
  { id: 'ghost', title: 'Ghost Step', desc: 'Pass through one wall segment every 30s', icon: 'ᛟ', cost: '3000 S' },
  { id: 'pockets', title: 'Void Pockets', desc: 'Increase inventory size +4 slots', icon: 'ᛝ', cost: '1000 S' }
];

const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ onClose, currentLevel }) => {
  return (
    <div className="fixed inset-0 pointer-events-auto flex items-center justify-center bg-black/95 backdrop-blur-3xl z-[500] p-4 sm:p-10 overflow-y-auto">
      <div className="relative w-full max-w-4xl visor-entry">
        
        <div className="absolute -inset-10 bg-cyan-400/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="obsidian-shard p-8 sm:p-16 border-2 border-cyan-400/40 flex flex-col items-center relative overflow-hidden">
          <div className="spectral-scan opacity-30" />
          
          <div className="mb-8 sm:mb-12 text-center">
             <div className="text-[10px] text-cyan-400 font-bold tracking-[0.5em] uppercase mb-2 animate-pulse">Ascension Available</div>
             <h2 className="text-4xl sm:text-6xl font-black text-white tracking-[0.1em] mb-4 uppercase drop-shadow-2xl">Level {currentLevel}</h2>
             <div className="w-32 h-1 bg-cyan-400 mx-auto shadow-[0_0_10px_#00f2ff]" />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {UPGRADES.map(u => (
              <div 
                key={u.id}
                className="flex-1 obsidian-shard p-6 sm:p-8 border-white/10 hover:border-cyan-400 hover:bg-cyan-400/10 group cursor-pointer transition-all flex flex-col items-center text-center transform active:scale-95"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-cyan-400/20 flex items-center justify-center mb-6 bg-cyan-950/30 group-hover:border-cyan-400 group-hover:bg-cyan-400 transition-all">
                   <span className="text-3xl sm:text-4xl rune-animate group-hover:text-black group-hover:animate-none">{u.icon}</span>
                </div>
                <h3 className="text-lg font-black text-white tracking-widest mb-2 uppercase group-hover:text-cyan-400">{u.title}</h3>
                <p className="text-[10px] text-slate-300 leading-relaxed font-bold tracking-tight opacity-90 mb-6">
                  {u.desc}
                </p>
                <div className="mt-auto px-4 py-1.5 bg-cyan-400/10 border border-cyan-400/40 text-cyan-400 font-black text-xs tracking-widest rounded-full group-hover:bg-cyan-400 group-hover:text-black transition-all">
                   {u.cost}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="mt-10 sm:mt-16 py-4 px-10 obsidian-panel border-y border-white/20 text-[10px] font-black tracking-[0.4em] text-white/50 hover:text-white hover:border-cyan-400 transition-all uppercase"
          >
            Confirm_and_Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpOverlay;
