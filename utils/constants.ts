
/**
 * Global Configuration for The Spectral Necropolis
 */
export const TEXTURES = {
  // Floor (Ancient Stone Carvings)
  FLOOR: 'https://images.stockcake.com/public/8/6/c/86ce78a6-a26e-4c6f-b358-c27ff9ec3582/medieval-stone-pattern-stockcake.jpg',
  // Wall Sides (Medieval Stone Wall)
  WALL_SIDE: 'https://images.stockcake.com/public/e/e/2/ee28c3b7-f990-4056-b848-b25583ac9989_large/medieval-stone-wall-stockcake.jpg',
  // Wall Caps (Limestone)
  WALL_TOP: 'https://images.stockcake.com/public/a/f/2/af285766-a092-49b8-8aaf-42988176ace0_large/weathered-limestone-wall-stockcake.jpg',
};

export const SCALES = {
  FLOOR_TILING: 6.0, 
  WALL_SIDE_TILING: 3.0, 
  WALL_HEIGHT: 3.0, // Taller walls for more claustrophobia
};

// Added missing light properties LIGHT_DISTANCE and LIGHT_DECAY to resolve errors in Scene.tsx
export const COLORS = {
  SPAWN: '#00f2ff', 
  GOAL: '#ffffff',  
  CORRIDOR_LIGHT: '#00ccff', 
  TORCH_BRACKET: '#020508',  
  AMBIENT_INTENSITY: 0.01,   
  VOID_FOG: '#000508',
  MANA: '#00f2ff',
  SOUL: '#7000ff',
  LIGHT_DISTANCE: 10,
  LIGHT_DECAY: 2,
};

export const MAZE_CONFIG = {
  CHUNK_SIZE: 12,            
  LIGHT_SPACING: 15,         
  ANISOTROPY: 16,             
};
