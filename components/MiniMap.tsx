
import React, { useRef, useEffect } from 'react';
import { WALL, SPAWN, GOAL, CHEST } from '../utils/maze.ts';
import { COLORS } from '../utils/constants.ts';

interface MiniMapProps {
  mazeData: string[][];
  rotation: number; // in radians
}

const MiniMap: React.FC<MiniMapProps> = ({ mazeData, rotation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 180; // Total width/height of the mini-map

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. CLEAR & SETUP
    ctx.clearRect(0, 0, size, size);
    
    // Draw Background Grid (Fixed to the screen)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for(let i=0; i<size; i+=15) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }

    ctx.save();
    ctx.translate(size / 2, size / 2);

    // 2. ROTATION & CENTERING
    // We rotate the world around the player so 'Forward' (where the camera looks) is Up
    ctx.rotate(rotation);

    const mazeW = mazeData.length;
    const mazeH = mazeData[0].length;
    
    // SCALE ADJUSTMENT: Increased divisor to decrease individual cell size
    const cellSize = (size / 45); 
    
    // Find player (Spawn) to center the map on them
    let px = 1, pz = 1;
    for(let x=0; x<mazeW; x++) {
        for(let z=0; z<mazeH; z++) {
            if(mazeData[x][z] === SPAWN) { px = x; pz = z; break; }
        }
    }

    // Offset the canvas so the player is at the center of the rotating frame
    ctx.translate(-px * cellSize, -pz * cellSize);

    // 3. RENDER MAZE CELLS
    const renderRadius = 25; 
    const startX = Math.max(0, px - renderRadius);
    const endX = Math.min(mazeW, px + renderRadius);
    const startZ = Math.max(0, pz - renderRadius);
    const endZ = Math.min(mazeH, pz + renderRadius);

    for (let x = startX; x < endX; x++) {
      for (let z = startZ; z < endZ; z++) {
        const cell = mazeData[x][z];
        const cx = x * cellSize;
        const cz = z * cellSize;

        if (cell === WALL) {
          ctx.fillStyle = '#1A1F2B';
          ctx.fillRect(cx, cz, cellSize, cellSize);
          ctx.strokeStyle = 'rgba(0, 255, 204, 0.12)';
          ctx.lineWidth = 0.3; 
          ctx.strokeRect(cx, cz, cellSize, cellSize);
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(cx, cz, cellSize, cellSize);
        }

        // 4. OBJECTIVES
        if (cell === GOAL) {
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = COLORS.GOAL;
          ctx.fillStyle = COLORS.GOAL;
          ctx.beginPath();
          ctx.arc(cx + cellSize/2, cz + cellSize/2, cellSize*0.8, 0, Math.PI*2);
          ctx.fill();
          ctx.strokeStyle = COLORS.GOAL;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx + cellSize/2, cz + cellSize/2, cellSize * (1.2 + Math.sin(Date.now() / 200) * 0.2), 0, Math.PI*2);
          ctx.stroke();
          ctx.restore();
        } else if (cell === CHEST) {
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#FFD700';
          ctx.fillStyle = '#D4AF37'; 
          ctx.fillRect(cx - cellSize*0.2, cz - cellSize*0.2, cellSize*1.4, cellSize*1.4);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(cx - cellSize*0.2, cz - cellSize*0.2, cellSize*1.4, cellSize*1.4);
          ctx.restore();
        }
      }
    }

    // 5. STATIC OVERLAYS (Relative to the compass UI, not the map)
    ctx.restore();
    ctx.save();
    ctx.translate(size/2, size/2);

    // Compass Indicator (Needle)
    ctx.save();
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -size/2 + 12);
    ctx.lineTo(4, -size/2 + 24);
    ctx.lineTo(-4, -size/2 + 24);
    ctx.closePath();
    ctx.fillStyle = '#FF4400';
    ctx.fill();
    ctx.restore();

    // Player Marker (Static in the center)
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.SPAWN;
    ctx.fillStyle = COLORS.SPAWN;
    
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

  }, [mazeData, rotation]);

  return (
    <div className="relative group select-none">
      {/* Outer Compass Housing */}
      <div 
        className="absolute inset-0 rounded-full border-[2px] border-white/5 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"
        style={{ width: size, height: size }}
      />
      
      {/* Glass Display */}
      <div 
        className="rounded-full bg-[#050505]/95 backdrop-blur-xl overflow-hidden border border-orange-500/30 relative shadow-[0_0_30px_rgba(0,0,0,0.8)]"
        style={{ width: size, height: size }}
      >
        {/* Radar Sweep Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,204,0.3)_10deg,transparent_20deg)] animate-[spin_4s_linear_infinite]" />
        
        <canvas 
          ref={canvasRef} 
          width={size} 
          height={size} 
          className="relative z-10"
        />
        
        {/* Directional Labels (Fixed on the glass: Up, Down, Left, Right) */}
        <div className="absolute inset-0 z-20 pointer-events-none font-black text-[10px] tracking-tighter">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-orange-500 shadow-sm">U</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/20">D</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20">L</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20">R</span>
        </div>
        
        {/* Vignette/Glass Shine */}
        <div className="absolute inset-0 bg-radial-gradient(circle, transparent 60%, black 100%) pointer-events-none z-30" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-30" />
      </div>

      {/* Label Decoration */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="h-[1px] w-4 bg-orange-500/30" />
        <span className="text-[9px] font-bold text-orange-500/80 uppercase tracking-[0.3em] px-2 py-0.5 whitespace-nowrap">
          Tactical Link
        </span>
        <div className="h-[1px] w-4 bg-orange-500/30" />
      </div>
    </div>
  );
};

export default MiniMap;
