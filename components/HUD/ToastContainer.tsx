
import React from 'react';

interface ToastContainerProps {
  toasts: { id: number, text: string }[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed top-[15vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-5 pointer-events-none z-[200]">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className="obsidian-shard border-2 border-cyan-400 bg-black/95 px-8 py-3.5 animate-slide-up flex items-center gap-6 shadow-[0_30px_60px_rgba(0,0,0,1)]"
        >
          <div className="w-2 h-7 mana-line rounded-full" />
          <span className="text-[12px] font-bold text-white uppercase tracking-[0.5em] font-data text-sharp whitespace-nowrap">
            {toast.text}
          </span>
          <div className="text-cyan-400 font-black text-2xl flex items-center">
             <span className="rune-animate opacity-60">ᛉ</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
