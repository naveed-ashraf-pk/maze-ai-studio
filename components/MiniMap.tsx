
import React, { useRef, useEffect, useMemo } from 'react';
import { WALL, SPAWN, GOAL, CHEST } from '../utils/maze';

interface MiniMapProps {
  mazeData: string[][];
  rotation: number;
  playerPos: { x: number, z: number };
}

const MiniMap: React.FC<MiniMapProps> = React.memo(({ mazeData, rotation, playerPos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 200;
  const cellSize = 6;

  const offscreenCanvas = useMemo(() => {
    const canvas = document.createElement('canvas');
    const w = mazeData.length;
    const h = mazeData[0].length;
    canvas.width = w * cellSize;
    canvas.height = h * cellSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < w; x++) {
      for (let z = 0; z < h; z++) {
        const cell = mazeData[x][z];
        const cx = x * cellSize;
        const cz = z * cellSize;

        if (cell === WALL) {
          ctx.fillStyle = 'rgba(0, 242, 255, 0.1)';
          ctx.fillRect(cx, cz, cellSize - 1, cellSize - 1);
        } else if (cell === GOAL) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx + cellSize / 2, cz + cellSize / 2, cellSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === CHEST) {
          ctx.fillStyle = '#7000ff';
          ctx.fillRect(cx + 1, cz + 1, cellSize - 2, cellSize - 2);
        }
      }
    }
    return canvas;
  }, [mazeData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Vignette / Inner glow
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(0, 242, 255, 0.05)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(rotation);

    const offsetX = -playerPos.x * cellSize;
    const offsetZ = -playerPos.z * cellSize;

    ctx.drawImage(offscreenCanvas, offsetX, offsetZ);
    ctx.restore();

    // Player indicator
    ctx.fillStyle = '#00f2ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f2ff';
    ctx.beginPath();
    ctx.moveTo(size/2, size/2 - 8);
    ctx.lineTo(size/2 + 5, size/2 + 5);
    ctx.lineTo(size/2 - 5, size/2 + 5);
    ctx.closePath();
    ctx.fill();
    
    // Scan line
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, (Date.now() / 10) % size);
    ctx.lineTo(size, (Date.now() / 10) % size);
    ctx.stroke();

  }, [rotation, offscreenCanvas, playerPos.x, playerPos.z]);

  return (
    <div className="hologram-map group">
      <div className="absolute inset-0 rounded-full border border-cyan-400/10 pointer-events-none" />
      <div className="absolute inset-2 border border-cyan-400/5 rounded-full animate-pulse pointer-events-none" />
      
      {/* Sonar Pulse */}
      <div className="absolute w-full h-full rounded-full border-2 border-cyan-400/20 pointer-events-none animate-[sonar-pulse_4s_linear_infinite]" />
      
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="rounded-full overflow-hidden scale-[1.1] mask-radial" 
      />
      
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 border border-cyan-400/30 text-[8px] font-black text-cyan-400 tracking-widest uppercase rounded">
        Holo_Map
      </div>
    </div>
  );
});

export default MiniMap;
