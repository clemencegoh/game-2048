import { describe, it, expect } from 'vitest';
import type { Tile } from '../gameEngine';
import { 
  moveBoard, 
  isGameOver,
  DEFAULT_GRID_SIZE as GRID_SIZE
} from '../gameEngine';

const createTilesFromBoard = (board: (number | null)[][]): Tile[] => {
  const tiles: Tile[] = [];
  let id = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] !== null) {
        tiles.push({
          id: id++,
          value: board[r][c] as number,
          x: c,
          y: r
        });
      }
    }
  }
  return tiles;
};

const getBoardFromTiles = (tiles: Tile[]): (number | null)[][] => {
  const board: (number | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  tiles.filter(t => !t.isDeleted).forEach(t => {
    board[t.y][t.x] = t.value;
  });
  return board;
};

describe('gameEngine', () => {
  describe('moveBoard', () => {
    it('should move tiles to the left', () => {
      const initialBoard = [
        [null, 8, 2, 2],
        [4, 2, null, 2],
        [null, null, null, null],
        [null, null, null, 2]
      ];
      const tiles = createTilesFromBoard(initialBoard);
      const { finalTiles: newTiles, changed } = moveBoard(tiles, 100, 'left', 4);
      
      expect(changed).toBe(true);
      const resultBoard = getBoardFromTiles(newTiles);
      expect(resultBoard[0]).toEqual([8, 4, null, null]);
      expect(resultBoard[1]).toEqual([4, 4, null, null]);
      expect(resultBoard[2]).toEqual([null, null, null, null]);
      expect(resultBoard[3]).toEqual([2, null, null, null]);
    });

    it('should move tiles to the right', () => {
      const initialBoard = [
        [null, 8, 2, 2],
        [4, 2, null, 2],
        [null, null, null, null],
        [null, null, null, 2]
      ];
      const tiles = createTilesFromBoard(initialBoard);
      const { finalTiles: newTiles, changed } = moveBoard(tiles, 100, 'right', 4);
      
      expect(changed).toBe(true);
      const resultBoard = getBoardFromTiles(newTiles);
      expect(resultBoard[0]).toEqual([null, null, 8, 4]);
      expect(resultBoard[1]).toEqual([null, null, 4, 4]);
      expect(resultBoard[2]).toEqual([null, null, null, null]);
      expect(resultBoard[3]).toEqual([null, null, null, 2]);
    });

    it('should move tiles up', () => {
      const initialBoard = [
        [null, 8, 2, 2],
        [4, 2, null, 2],
        [null, null, null, null],
        [null, null, null, 2]
      ];
      const tiles = createTilesFromBoard(initialBoard);
      const { finalTiles: newTiles, changed } = moveBoard(tiles, 100, 'up', 4);
      
      expect(changed).toBe(true);
      const resultBoard = getBoardFromTiles(newTiles);
      expect(resultBoard).toEqual([
        [4, 8, 2, 4],
        [null, 2, null, 2],
        [null, null, null, null],
        [null, null, null, null]
      ]);
    });

    it('should move tiles down', () => {
      const initialBoard = [
        [4, 8, 2, 4],
        [null, 2, null, 2],
        [null, null, null, null],
        [null, null, null, null]
      ];
      const tiles = createTilesFromBoard(initialBoard);
      const { finalTiles: newTiles, changed } = moveBoard(tiles, 100, 'down', 4);
      
      expect(changed).toBe(true);
      const resultBoard = getBoardFromTiles(newTiles);
      expect(resultBoard).toEqual([
        [null, null, null, null],
        [null, null, null, null],
        [null, 8, null, 4],
        [4, 2, 2, 2]
      ]);
    });

    it('should not change the board if no move is possible', () => {
      const initialBoard = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2]
      ];
      const tiles = createTilesFromBoard(initialBoard);
      const { changed } = moveBoard(tiles, 100, 'left', 4);
      expect(changed).toBe(false);
    });
  });

  describe('isGameOver', () => {
    it('should detect win when 2048 is reached', () => {
      const initialBoard = [
        [2048, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]
      ];
      const tiles = createTilesFromBoard(initialBoard);
      const status = isGameOver(tiles, 4);
      expect(status.won).toBe(true);
    });

    it('should detect loss when no moves are possible', () => {
      const initialBoard = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2]
      ];
      const tiles = createTilesFromBoard(initialBoard);
      const status = isGameOver(tiles, 4);
      expect(status.lost).toBe(true);
    });
  });
});
