
import { CanvasTexture, RepeatWrapping, NearestFilter, LinearMipmapLinearFilter } from 'three';

/**
 * Procedurally generates textures for the dungeon with a high-quality hand-painted look.
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

export const getTopTexture = () => createTexture((ctx, size) => {
  ctx.fillStyle = '#D2B48C';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = size * 0.05;
  ctx.strokeRect(0, 0, size, size);
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = Math.random() * 0.15;
    ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }
});

export const getSideTexture = () => createTexture((ctx, size) => {
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(0, 0, size, size);
  const rows = 4;
  const cols = 2;
  const h = size / rows;
  const w = size / cols;
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = size * 0.02;
  for (let i = 0; i < rows; i++) {
    const offset = (i % 2) * (w / 2);
    for (let j = -1; j <= cols; j++) {
      const x = j * w + offset;
      const y = i * h;
      const brickColors = ['#DEB887', '#CD853F', '#BC8F8F', '#C4A484'];
      ctx.fillStyle = brickColors[Math.floor(Math.random() * brickColors.length)];
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      ctx.strokeRect(x, y, w, h);
    }
  }
});

export const getBottomTexture = () => createTexture((ctx, size) => {
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const brownVal = 20 + Math.random() * 30;
    ctx.fillStyle = `rgb(${brownVal + 20}, ${brownVal}, ${brownVal - 10})`;
    ctx.fillRect(x, y, 1, 1);
  }
});

export const getChestTexture = () => createTexture((ctx, size) => {
  // Premium Polished Mahogany Wood
  ctx.fillStyle = '#2D1810';
  ctx.fillRect(0, 0, size, size);
  
  // Planking Effect
  const plankCount = 6;
  const plankH = size / plankCount;
  
  for (let i = 0; i < plankCount; i++) {
    const y = i * plankH;
    
    // Gradient for each plank to give it depth
    const grad = ctx.createLinearGradient(0, y, 0, y + plankH);
    grad.addColorStop(0, '#4A2B1F');
    grad.addColorStop(0.5, '#3A1F16');
    grad.addColorStop(1, '#2D1810');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, size, plankH);
    
    // Highlight top edge
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, y, size, 1);
    
    // Darker grain detail
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    for(let j=0; j<8; j++) {
        const yGrain = y + Math.random() * plankH;
        ctx.beginPath();
        ctx.moveTo(0, yGrain);
        ctx.bezierCurveTo(size/3, yGrain + 5, size*0.6, yGrain - 5, size, yGrain);
        ctx.stroke();
    }
  }

  // Polished Sheen
  const sheen = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
  sheen.addColorStop(0, 'rgba(255,255,255,0.05)');
  sheen.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);
}, 512);

export const getGoldTexture = () => createTexture((ctx, size) => {
    // Rich Gold Base
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(0.5, '#FFEA00');
    grad.addColorStop(1, '#B8860B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    
    // Filigree / Ornate Patterns
    ctx.strokeStyle = 'rgba(139, 101, 8, 0.4)';
    ctx.lineWidth = 2;
    for(let i=0; i<8; i++) {
        ctx.beginPath();
        const x = Math.random()*size;
        const y = Math.random()*size;
        ctx.arc(x, y, 20 + Math.random()*30, 0, Math.PI * 1.5);
        ctx.stroke();
    }
    
    // Bevel highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, size-10, size-10);
    
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);
    
    // Little rivets/jewels detail
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for(let i=0; i<4; i++) {
        const corners = [[10,10], [size-10, 10], [10, size-10], [size-10, size-10]];
        const [cx, cy] = corners[i];
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI*2);
        ctx.fill();
    }
}, 512);
