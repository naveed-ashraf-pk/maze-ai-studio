
import React from 'react';

interface StoneModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const StoneModal: React.FC<StoneModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 pointer-events-auto flex items-center justify-center bg-black/80 backdrop-blur-xl z-[600] p-6 animate-in fade-in zoom-in duration-300">
      <div className="artifact-container w-full max-w-[550px] flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)] border-t-2 border-t-cyan-400/30">
        
        {/* Artifact Header */}
        <div className="p-8 flex justify-between items-center border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 artifact-container border border-cyan-400 flex items-center justify-center bg-cyan-950/20">
               <span className="text-cyan-400 text-2xl font-black drop-shadow-glow animate-pulse">ᛟ</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-[0.4em] uppercase font-ancient">{title}</h2>
              <p className="text-[8px] text-cyan-400/40 font-black tracking-widest uppercase mt-1">Data_Link: Established</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 artifact-container border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-cyan-400 text-white/40 hover:text-white transition-all active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="p-10 relative overflow-y-auto max-h-[65vh] custom-scrollbar bg-black/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          {children}
        </div>

        {/* Footer */}
        <div className="px-10 py-5 border-t border-white/5 flex justify-between items-center bg-white/5">
           <div className="flex gap-4 text-cyan-400/30 text-[12px] font-black uppercase font-ancient">
              <span>ᚠ</span><span>ᚢ</span><span>ᚦ</span><span>ᚨ</span>
           </div>
           <span className="text-[9px] text-white/20 font-black tracking-[0.3em] uppercase font-tech">Warden_Protocol_v9.2</span>
        </div>
      </div>
    </div>
  );
};

export default StoneModal;
