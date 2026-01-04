
/**
 * Symbols for the magical maze
 */
export const WALL = '#';
export const PATH = '.';
export const SPAWN = 'S';
export const GOAL = 'G';
export const CHEST = 'C';

/**
 * Generates a 2D grid maze with wide, variable paths.
 */
export const generateMaze = (
  width: number, 
  height: number, 
  minPathWidth: number = 2, 
  maxPathWidth: number = 4
): string[][] => {
  const S = maxPathWidth + 1;
  const cols = Math.floor((width - 1) / S);
  const rows = Math.floor((height - 1) / S);
  const w = cols * S + 1;
  const h = rows * S + 1;

  const maze: string[][] = Array(w)
    .fill(null)
    .map(() => Array(h).fill(WALL));

  const stack: [number, number][] = [];
  const startNode: [number, number] = [0, 0]; 
  const visited = new Set<string>();
  const toKey = (nx: number, ny: number) => `${nx},${ny}`;

  const carveBlock = (x1: number, y1: number, x2: number, y2: number) => {
    const thickness = Math.floor(Math.random() * (maxPathWidth - minPathWidth + 1)) + minPathWidth;
    const tx1 = x1 * S + 1;
    const ty1 = y1 * S + 1;
    const tx2 = x2 * S + 1;
    const ty2 = y2 * S + 1;
    const minX = Math.min(tx1, tx2);
    const maxX = Math.max(tx1, tx2);
    const minY = Math.min(ty1, ty2);
    const maxY = Math.max(ty1, ty2);

    for (let i = minX; i <= maxX + (tx1 === tx2 ? thickness - 1 : 0); i++) {
      for (let j = minY; j <= maxY + (ty1 === ty2 ? thickness - 1 : 0); j++) {
        if (i > 0 && i < w - 1 && j > 0 && j < h - 1) {
          maze[i][j] = PATH;
        }
      }
    }
  };

  stack.push(startNode);
  visited.add(toKey(0, 0));
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const neighbors: [number, number][] = [];
    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited.has(toKey(nx, ny))) {
        neighbors.push([nx, ny]);
      }
    }
    if (neighbors.length > 0) {
      const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
      carveBlock(cx, cy, nx, ny);
      visited.add(toKey(nx, ny));
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }

  // Assign Start (S)
  maze[1][1] = SPAWN;
  
  // Assign Goal (G)
  let goalPlaced = false;
  for (let x = w - 2; x > 0 && !goalPlaced; x--) {
    for (let z = h - 2; z > 0 && !goalPlaced; z--) {
      if (maze[x][z] === PATH) {
        maze[x][z] = GOAL;
        goalPlaced = true;
      }
    }
  }

  // Assign Chest (C) at the center
  const midX = Math.floor(w / 2);
  const midZ = Math.floor(h / 2);
  let chestPlaced = false;
  // Spiral search for nearest path tile
  for (let r = 0; r < Math.min(w, h) && !chestPlaced; r++) {
    for (let dx = -r; dx <= r && !chestPlaced; dx++) {
      for (let dz = -r; dz <= r && !chestPlaced; dz++) {
        const cx = midX + dx;
        const cz = midZ + dz;
        if (cx > 0 && cx < w - 1 && cz > 0 && cz < h - 1 && maze[cx][cz] === PATH) {
          maze[cx][cz] = CHEST;
          chestPlaced = true;
        }
      }
    }
  }

  return maze;
};
