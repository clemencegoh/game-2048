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

export const DEFAULT_GRID_SIZE = 4;

// Legacy Grid for internal logic
export type Grid = (Tile | null)[][];

export const createEmptyGrid = (size: number): Grid => 
  Array(size).fill(null).map(() => Array(size).fill(null));

export const getEmptyCells = (grid: Grid, size: number): { r: number; c: number }[] => {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) cells.push({ r, c });
    }
  }
  return cells;
};

export const spawnTile = (tiles: Tile[], nextId: number, size: number, count: number = 1): { tiles: Tile[], nextId: number } => {
  const newTiles = tiles.filter(t => !t.isDeleted).map(t => ({ ...t }));
  let currentId = nextId;
  const grid = createEmptyGrid(size);
  newTiles.forEach(tile => {
    grid[tile.y][tile.x] = tile;
  });

  for (let i = 0; i < count; i++) {
    const emptyCells = getEmptyCells(grid, size);
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

export const initializeBoard = (size: number): { tiles: Tile[], nextId: number } => {
  const initialCount = 2;
  return spawnTile([], 0, size, initialCount);
};

export const moveBoard = (tiles: Tile[], nextId: number, direction: Direction, size: number): { animationTiles: Tile[], finalTiles: Tile[], score: number, changed: boolean, nextId: number } => {
  let score = 0;
  let changed = false;
  let currentId = nextId;

  const range = Array.from({ length: size }, (_, i) => i);
  const reverseRange = [...range].reverse();

  const traverseX = direction === 'right' ? reverseRange : range;
  const traverseY = direction === 'down' ? reverseRange : range;

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
  const animationGrid = createEmptyGrid(size);
  animationTiles.forEach(t => { animationGrid[t.y][t.x] = t; });

  const finalTiles: Tile[] = [];

  const findFarthestPosition = (x: number, y: number, v: { x: number, y: number }, g: Grid) => {
    let previous;
    do {
      previous = { x, y };
      x += v.x;
      y += v.y;
    } while (x >= 0 && x < size && y >= 0 && y < size && !g[y][x]);

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
        const nextTile = (next.x >= 0 && next.x < size && next.y >= 0 && next.y < size) ? animationGrid[next.y][next.x] : null;

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

export const isGameOver = (tiles: Tile[], size: number): { won: boolean; lost: boolean } => {
  const activeTiles = tiles.filter(t => !t.isDeleted);
  let won = false;
  const grid: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  
  activeTiles.forEach(t => {
    grid[t.y][t.x] = t.value;
    if (t.value === 2048) won = true;
  });

  if (won) return { won: true, lost: false };

  // Check for empty cells
  let hasEmpty = false;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) hasEmpty = true;
    }
  }
  if (hasEmpty) return { won: false, lost: false };

  // Check for possible merges
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const current = grid[r][c];
      // Check right
      if (c < size - 1 && current === grid[r][c + 1]) return { won: false, lost: false };
      // Check down
      if (r < size - 1 && current === grid[r + 1][c]) return { won: false, lost: false };
    }
  }

  return { won: false, lost: true };
};

// Simple heuristic for AI: Empty cells + Monotonicity + Edge values
export const getBestMove = (tiles: Tile[], size: number): Direction => {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  let bestScore = -Infinity;
  let bestDir: Direction = 'up';

  for (const dir of directions) {
    const { finalTiles: movedTiles, changed, score: moveScore } = moveBoard(tiles, 0, dir, size);
    if (!changed) continue;

    const activeMoved = movedTiles.filter(t => !t.isDeleted);
    const emptyCells = (size * size) - activeMoved.length;
    
    // Check if largest value is in a corner (prefer corners)
    let maxValue = 0;
    let maxPos = { r: 0, c: 0 };
    activeMoved.forEach(t => {
      if (t.value > maxValue) {
        maxValue = t.value;
        maxPos = { r: t.y, c: t.x };
      }
    });

    const isInCorner = (maxPos.r === 0 || maxPos.r === size - 1) && (maxPos.c === 0 || maxPos.c === size - 1);
    const evaluation = moveScore + (emptyCells * 100) + (isInCorner ? 1000 : 0);
    
    if (evaluation > bestScore) {
      bestScore = evaluation;
      bestDir = dir;
    }
  }

  return bestDir;
};
