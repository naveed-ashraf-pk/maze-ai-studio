
/**
 * Global Configuration for DungeonArchitect
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
  FLOOR_TILING: 4.0, 
  WALL_SIDE_TILING: 2.0, 
  WALL_HEIGHT: 2.0,
};

export const COLORS = {
  SPAWN: '#00ffcc',
  GOAL: '#ff0088',
  CORRIDOR_LIGHT: '#EFC070', 
  TORCH_BRACKET: '#1a1a1a',  
  AMBIENT_INTENSITY: 0.1,    
  SUN_INTENSITY: 0.0,        
  LIGHT_DISTANCE: 10.0,      
  LIGHT_DECAY: 2.5,          
};

export const MAZE_CONFIG = {
  CHUNK_SIZE: 15,            
  LIGHT_SPACING: 35,         // Increased from 20 to 35 to reduce light count further
  ANISOTROPY: 2,             
};
