
import { CanvasTexture, RepeatWrapping, NearestFilter, LinearMipmapLinearFilter } from 'three';

/**
 * Procedurally generates textures for the spectral dungeon.
 */
const createTexture = (drawFn: (ctx: CanvasRenderingContext2D, size: number) => void, size: number = 256) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 16;
  return texture;
};

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
