export type TileValue = number;
export interface Tile {
  id: number;
  value: TileValue;
  x: number;
  y: number;
  mergedFrom?: Tile[];
  isNew?: boolean;
  isDeleted?: boolean;
}
export type Direction = 'up' | 'down' | 'left' | 'right';

export const GRID_SIZE = 4;

// Legacy Grid for internal logic
export type Grid = (Tile | null)[][];

export const createEmptyGrid = (): Grid => 
  Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

export const getEmptyCells = (grid: Grid): { r: number; c: number }[] => {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) cells.push({ r, c });
    }
  }
  return cells;
};

export const spawnTile = (tiles: Tile[], nextId: number, count: number = 1): { tiles: Tile[], nextId: number } => {
  const newTiles = tiles.filter(t => !t.isDeleted).map(t => ({ ...t }));
  let currentId = nextId;
  const grid = createEmptyGrid();
  newTiles.forEach(tile => {
    grid[tile.y][tile.x] = tile;
  });

  for (let i = 0; i < count; i++) {
    const emptyCells = getEmptyCells(grid);
    if (emptyCells.length === 0) break;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    const newTile: Tile = {
      id: currentId++,
      value,
      x: c,
      y: r,
      isNew: true,
    };
    newTiles.push(newTile);
    grid[r][c] = newTile;
  }
  return { tiles: newTiles, nextId: currentId };
};

export const initializeBoard = (): { tiles: Tile[], nextId: number } => {
  const initialCount = 2;
  return spawnTile([], 0, initialCount);
};

export const moveBoard = (tiles: Tile[], nextId: number, direction: Direction): { animationTiles: Tile[], finalTiles: Tile[], score: number, changed: boolean, nextId: number } => {
  let score = 0;
  let changed = false;
  let currentId = nextId;

  const traverseX = direction === 'right' ? [3, 2, 1, 0] : [0, 1, 2, 3];
  const traverseY = direction === 'down' ? [3, 2, 1, 0] : [0, 1, 2, 3];

  const getVector = (dir: Direction) => {
    const vectors = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    return vectors[dir];
  };

  const vector = getVector(direction);
  
  const animationTiles: Tile[] = tiles.filter(t => !t.isDeleted).map(t => ({ ...t, isNew: false, mergedFrom: undefined }));
  const animationGrid = createEmptyGrid();
  animationTiles.forEach(t => { animationGrid[t.y][t.x] = t; });

  const finalTiles: Tile[] = [];

  const findFarthestPosition = (x: number, y: number, v: { x: number, y: number }, g: Grid) => {
    let previous;
    do {
      previous = { x, y };
      x += v.x;
      y += v.y;
    } while (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && !g[y][x]);

    return {
      farthest: previous,
      next: { x, y }
    };
  };

  traverseY.forEach(y => {
    traverseX.forEach(x => {
      const tile = animationGrid[y][x];
      if (tile) {
        const { farthest, next } = findFarthestPosition(tile.x, tile.y, vector, animationGrid);
        const nextTile = (next.x >= 0 && next.x < GRID_SIZE && next.y >= 0 && next.y < GRID_SIZE) ? animationGrid[next.y][next.x] : null;

        if (nextTile && nextTile.value === tile.value && !nextTile.mergedFrom) {
          const merged: Tile = {
            id: currentId++,
            value: tile.value * 2,
            x: next.x,
            y: next.y,
            mergedFrom: [nextTile, tile],
          };
          
          animationGrid[tile.y][tile.x] = null;
          animationGrid[next.y][next.x] = { ...merged, id: -1 }; 
          
          tile.x = next.x;
          tile.y = next.y;
          tile.isDeleted = true;
          nextTile.isDeleted = true;
          
          animationTiles.push(merged);
          finalTiles.push(merged);
          score += merged.value;
          changed = true;
        } else {
          if (farthest.x !== tile.x || farthest.y !== tile.y) {
            changed = true;
          }
          animationGrid[tile.y][tile.x] = null;
          animationGrid[farthest.y][farthest.x] = tile;
          tile.x = farthest.x;
          tile.y = farthest.y;
          finalTiles.push(tile);
        }
      }
    });
  });

  return { 
    animationTiles, 
    finalTiles: finalTiles.filter(t => !t.isDeleted), 
    score, 
    changed, 
    nextId: currentId 
  };
};

export const isGameOver = (tiles: Tile[]): { won: boolean; lost: boolean } => {
  const activeTiles = tiles.filter(t => !t.isDeleted);
  let won = false;
  const grid: (number | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  
  activeTiles.forEach(t => {
    grid[t.y][t.x] = t.value;
    if (t.value === 2048) won = true;
  });

  if (won) return { won: true, lost: false };

  // Check for empty cells
  let hasEmpty = false;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) hasEmpty = true;
    }
  }
  if (hasEmpty) return { won: false, lost: false };

  // Check for possible merges
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const current = grid[r][c];
      // Check right
      if (c < GRID_SIZE - 1 && current === grid[r][c + 1]) return { won: false, lost: false };
      // Check down
      if (r < GRID_SIZE - 1 && current === grid[r + 1][c]) return { won: false, lost: false };
    }
  }

  return { won: false, lost: true };
};

// Simple heuristic for AI: Empty cells + Monotonicity + Edge values
export const getBestMove = (tiles: Tile[]): Direction => {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  let bestScore = -Infinity;
  let bestDir: Direction = 'up';

  for (const dir of directions) {
    const { finalTiles: movedTiles, changed, score: moveScore } = moveBoard(tiles, 0, dir);
    if (!changed) continue;

    const activeMoved = movedTiles.filter(t => !t.isDeleted);
    const emptyCells = (GRID_SIZE * GRID_SIZE) - activeMoved.length;
    
    // Check if largest value is in a corner (prefer corners)
    let maxValue = 0;
    let maxPos = { r: 0, c: 0 };
    activeMoved.forEach(t => {
      if (t.value > maxValue) {
        maxValue = t.value;
        maxPos = { r: t.y, c: t.x };
      }
    });

    const isInCorner = (maxPos.r === 0 || maxPos.r === 3) && (maxPos.c === 0 || maxPos.c === 3);
    const evaluation = moveScore + (emptyCells * 100) + (isInCorner ? 1000 : 0);
    
    if (evaluation > bestScore) {
      bestScore = evaluation;
      bestDir = dir;
    }
  }

  return bestDir;
};
