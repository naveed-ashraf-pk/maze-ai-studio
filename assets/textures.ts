
import { CanvasTexture, RepeatWrapping, NearestFilter, LinearFilter, LinearMipmapLinearFilter } from 'three';

/**
 * Procedurally generates textures for the spectral dungeon.
 */
const createTexture = (drawFn: (ctx: CanvasRenderingContext2D, size: number) => void, size: number = 512) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  // Fix: magFilter only supports NearestFilter or LinearFilter.
  // LinearMipmapLinearFilter is a MinificationTextureFilter and cannot be used for magnification.
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 16;
  return texture;
};

export const getWallSideTexture = () => createTexture((ctx, size) => {
  // Dark weathered stone bricks
  ctx.fillStyle = '#1a1d21';
  ctx.fillRect(0, 0, size, size);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  
  const rows = 4;
  const cols = 2;
  const h = size / rows;
  const w = size / cols;

  for (let y = 0; y < rows; y++) {
    const offset = (y % 2) * (w / 2);
    for (let x = -1; x <= cols; x++) {
      ctx.fillStyle = `rgb(${25 + Math.random() * 15}, ${28 + Math.random() * 15}, ${32 + Math.random() * 15})`;
      const posX = x * w + offset;
      ctx.fillRect(posX + 2, y * h + 2, w - 4, h - 4);
      
      // Grain/Noise
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for(let i=0; i<100; i++) {
        ctx.fillRect(posX + Math.random() * w, y * h + Math.random() * h, 2, 2);
      }
    }
  }
});

export const getWallTopTexture = () => createTexture((ctx, size) => {
  // Limestone weathered cap
  ctx.fillStyle = '#3a3d41';
  ctx.fillRect(0, 0, size, size);
  
  // Splotches
  for(let i=0; i<20; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 100, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Cracks
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  for(let i=0; i<5; i++) {
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    for(let j=0; j<10; j++) {
      x += (Math.random() - 0.5) * 50;
      y += (Math.random() - 0.5) * 50;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
});

export const getFloorTexture = () => createTexture((ctx, size) => {
  // Ancient Paving Stones
  ctx.fillStyle = '#0a0c0e';
  ctx.fillRect(0, 0, size, size);
  
  const tileSize = size / 4;
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      ctx.fillStyle = `rgb(${10 + Math.random() * 10}, ${12 + Math.random() * 10}, ${15 + Math.random() * 10})`;
      ctx.fillRect(x * tileSize + 2, y * tileSize + 2, tileSize - 4, tileSize - 4);
      
      // Fine cracks
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.beginPath();
      ctx.moveTo(x * tileSize + Math.random() * tileSize, y * tileSize);
      ctx.lineTo(x * tileSize + Math.random() * tileSize, y * tileSize + tileSize);
      ctx.stroke();
    }
  }
});

export const getChestTexture = () => createTexture((ctx, size) => {
  // Void-Grain Wood (Dark Teal/Black)
  ctx.fillStyle = '#01080b';
  ctx.fillRect(0, 0, size, size);
  
  const plankCount = 6;
  const plankH = size / plankCount;
  
  for (let i = 0; i < plankCount; i++) {
    const y = i * plankH;
    const grad = ctx.createLinearGradient(0, y, 0, y + plankH);
    grad.addColorStop(0, '#0a1a20');
    grad.addColorStop(0.5, '#051014');
    grad.addColorStop(1, '#01080b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, size, plankH);
    
    // Spectral highlights
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let j=0; j<12; j++) {
        const yGrain = y + Math.random() * plankH;
        ctx.beginPath();
        ctx.moveTo(0, yGrain);
        ctx.bezierCurveTo(size/3, yGrain + 5, size*0.6, yGrain - 5, size, yGrain);
        ctx.stroke();
    }
  }
}, 512);

export const getGoldTexture = () => createTexture((ctx, size) => {
    // Ghost Iron / Mana-Crystal Metal
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#00b3ff');
    grad.addColorStop(0.5, '#002233');
    grad.addColorStop(1, '#001111');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    
    // Runic Etchings
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.3)';
    ctx.lineWidth = 2;
    for(let i=0; i<15; i++) {
        ctx.beginPath();
        const x = Math.random()*size;
        const y = Math.random()*size;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random()-0.5)*40, y + (Math.random()-0.5)*40);
        ctx.stroke();
    }
    
    // Bevel highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, size-10, size-10);
}, 512);
