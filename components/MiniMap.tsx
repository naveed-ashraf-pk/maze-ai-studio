
import React, { useRef, useEffect, useMemo } from 'react';
import { WALL, SPAWN, GOAL, CHEST, PATH } from '../utils/maze.ts';
import { COLORS } from '../utils/constants.ts';

interface MiniMapProps {
  mazeData: string[][];
  rotation: number; // in radians
  playerPos: { x: number, z: number };
}

const MiniMap: React.FC<MiniMapProps> = ({ mazeData, rotation, playerPos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 180; // Total width/height of the mini-map UI
  const cellSize = 3.5; // Reduced from 6 to show significantly more area
  const iconSize = 10; // Fixed size for non-wall/path items to keep them highly visible

  // 1. Pre-render the entire maze onto an offscreen canvas once
  const offscreenCanvas = useMemo(() => {
    const canvas = document.createElement('canvas');
    const w = mazeData.length;
    const h = mazeData[0].length;
    canvas.width = w * cellSize;
    canvas.height = h * cellSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < w; x++) {
      for (let z = 0; z < h; z++) {
        const cell = mazeData[x][z];
        const cx = x * cellSize;
        const cz = z * cellSize;

        if (cell === WALL) {
          ctx.fillStyle = '#1A1F2B';
          ctx.fillRect(cx, cz, cellSize, cellSize);
          ctx.strokeStyle = 'rgba(0, 255, 204, 0.1)';
          ctx.lineWidth = 0.2;
          ctx.strokeRect(cx, cz, cellSize, cellSize);
        } else if (cell === GOAL) {
          ctx.fillStyle = COLORS.GOAL;
          ctx.beginPath();
          // Centered at tile, but using fixed iconSize for visibility
          ctx.arc(cx + cellSize / 2, cz + cellSize / 2, iconSize / 2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowBlur = 8;
          ctx.shadowColor = COLORS.GOAL;
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (cell === CHEST) {
          ctx.fillStyle = '#D4AF37';
          // Draw at fixed iconSize regardless of cellSize, centered on the tile
          ctx.fillRect(
            cx + cellSize / 2 - iconSize / 2, 
            cz + cellSize / 2 - iconSize / 2, 
            iconSize, 
            iconSize
          );
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            cx + cellSize / 2 - iconSize / 2, 
            cz + cellSize / 2 - iconSize / 2, 
            iconSize, 
            iconSize
          );
        }
      }
    }
    return canvas;
  }, [mazeData]);

  // 2. Main Render Loop: Handles rotation and translation based on dynamic player position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear main canvas
    ctx.clearRect(0, 0, size, size);

    // Setup transformation for the rotating map
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(rotation);

    // Offset based on player position so player is at center
    const offsetX = -playerPos.x * cellSize;
    const offsetZ = -playerPos.z * cellSize;

    // Perform a single draw call for the entire visible maze
    ctx.drawImage(offscreenCanvas, offsetX, offsetZ);

    ctx.restore();

    // 3. Draw Static UI Overlays (Fixed to screen space)
    ctx.save();
    ctx.translate(size / 2, size / 2);

    // Pulse effect for player
    const pulse = (Math.sin(Date.now() / 200) + 1) * 0.5;
    
    // Outer Glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 + pulse * 5);
    gradient.addColorStop(0, `${COLORS.SPAWN}66`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Core - Constant marker size for the player
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.SPAWN;
    ctx.fillStyle = COLORS.SPAWN;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Center point
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  }, [rotation, offscreenCanvas, playerPos]);

  return (
    <div className="relative group select-none">
      {/* Label Decoration */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="h-[1px] w-4 bg-orange-500/30" />
        <span className="text-[9px] font-bold text-orange-500/80 uppercase tracking-[0.3em] px-2 py-0.5 whitespace-nowrap">
          Tactical Link v2.0
        </span>
        <div className="h-[1px] w-4 bg-orange-500/30" />
      </div>

      <div 
        className="rounded-full bg-[#050505]/95 backdrop-blur-xl overflow-hidden border border-orange-500/30 relative shadow-[0_0_40px_rgba(0,0,0,0.9)]"
        style={{ width: size, height: size }}
      >
        {/* Radar Sweep Animation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,204,0.4)_15deg,transparent_30deg)] animate-[spin_3s_linear_infinite] z-20" />
        
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-30" />

        <canvas 
          ref={canvasRef} 
          width={size} 
          height={size} 
          className="relative z-10"
        />
        
        {/* Directional Labels */}
        <div className="absolute inset-0 z-50 pointer-events-none font-black text-[10px] tracking-tighter opacity-60">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-orange-500">N</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40">S</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40">W</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40">E</span>
        </div>
        
        {/* Glass Reflection & Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none z-50" />
        <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,1)] pointer-events-none z-50" />
      </div>
    </div>
  );
};

export default MiniMap;
