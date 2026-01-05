
import React, { useState } from 'react';

const ITEMS = [
  { name: 'Soul Shard', icon: 'ᛝ', color: 'text-cyan-400', rarity: 'RELIQUARY' },
  { name: 'Void Key', icon: 'ᚠ', color: 'text-slate-400', rarity: 'UTILITY' },
  { name: 'Wraith Essence', icon: 'ᛟ', color: 'text-blue-500', rarity: 'CATALYST' },
  { name: 'Ancient Sigil', icon: 'ᚦ', color: 'text-white', rarity: 'LEGACY' },
];

const InventoryHUD: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selected, setSelected] = useState<number | null>(0);

  return (
    <div className="fixed inset-0 pointer-events-auto flex flex-col lg:flex-row items-center justify-center bg-black/90 backdrop-blur-2xl p-5 sm:p-12 z-[400] overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 w-full max-w-6xl">
        
        {/* Inventory Grid Section */}
        <div className="w-full lg:w-3/5 obsidian-shard border-2 border-cyan-400/50 p-6 sm:p-12 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="spectral-scan opacity-30" />
          
          <div className="mb-8 flex justify-between items-end border-b-2 border-cyan-400/20 pb-5">
             <div>
                <h3 className="text-sm font-black tracking-[0.6em] text-cyan-400 uppercase drop-shadow-md">SOUL_SATCHEL</h3>
                <p className="text-[10px] text-white/30 font-bold uppercase mt-1 font-data">Artifact_Storage_Unit_v.2</p>
             </div>
             <span className="text-xs text-white/60 font-black font-data tracking-widest bg-cyan-400/10 px-3 py-1 border border-cyan-400/20 rounded-full">04 / 16</span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-5 max-h-[45vh] lg:max-h-none overflow-y-auto custom-scrollbar pr-2">
            {Array.from({ length: 16 }).map((_, i) => {
              const item = ITEMS[i];
              const isSelected = selected === i;
              return (
                <div 
                  key={i}
                  onClick={() => item && setSelected(i)}
                  className={`
                    aspect-square obsidian-shard border-2 flex items-center justify-center relative transition-all cursor-pointer
                    ${isSelected ? 'border-cyan-400 bg-cyan-400/20 scale-105 z-10 shadow-[0_0_20px_rgba(0,242,255,0.3)]' : 'border-white/10 hover:border-cyan-400/40'}
                    ${!item && 'opacity-20 grayscale'}
                  `}
                >
                  {item ? (
                    <div className="relative pointer-events-none flex flex-col items-center gap-1">
                      <div className={`absolute inset-0 blur-xl ${item.color.replace('text-', 'bg-')} opacity-30`} />
                      <span className={`text-2xl sm:text-4xl ${item.color} relative z-10 drop-shadow-lg`}>{item.icon}</span>
                    </div>
                  ) : (
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">N/A</span>
                  )}
                  {isSelected && <div className="absolute inset-0 border-2 border-cyan-400 animate-pulse" />}
                </div>
              );
            })}
          </div>

          <button 
            onClick={onClose}
            className="mt-10 py-5 border-2 border-cyan-400/20 text-[11px] font-black tracking-[0.8em] text-white/40 hover:text-white hover:bg-cyan-400/10 hover:border-cyan-400 transition-all uppercase obsidian-panel"
          >
            RETURN_TO_PLANE
          </button>
        </div>

        {/* Info Panel Section */}
        <div className="w-full lg:w-2/5 obsidian-shard border-2 border-white/10 p-8 sm:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden bg-black/40">
          {selected !== null && ITEMS[selected] ? (
            <div className="animate-slide-up space-y-8">
              <div className="relative">
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-2 border-cyan-400/40 flex items-center justify-center mx-auto bg-cyan-950/40 shadow-[0_0_50px_rgba(0,242,255,0.1)]">
                   <span className={`text-5xl sm:text-7xl ${ITEMS[selected].color} rune-animate`}>{ITEMS[selected].icon}</span>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-cyan-400 text-black text-[10px] font-black tracking-[0.4em] uppercase shadow-xl transform skew-x-[-15deg]">
                   {ITEMS[selected].rarity}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-2xl sm:text-3xl font-black text-white tracking-[0.2em] uppercase text-sharp">{ITEMS[selected].name}</h4>
                <div className="h-1 w-20 bg-cyan-400 mx-auto shadow-[0_0_10px_#00f2ff]" />
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium font-data uppercase tracking-tight opacity-90 px-2 sm:px-10">
                A pulsating relic of the old world. It hums with a frequency that disrupts local spatial coherence.
              </p>
            </div>
          ) : (
            <div className="opacity-10 flex flex-col items-center gap-6 py-10">
               <span className="text-7xl">ᛖ</span>
               <span className="text-[12px] font-black tracking-[0.6em] uppercase font-data">NO_ARTIFACT_LINK</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryHUD;
