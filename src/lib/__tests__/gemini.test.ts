import { describe, it, expect } from 'vitest';
import { getBoardStateString } from '../gemini';
import type { Tile } from '../gameEngine';

describe('gemini', () => {
  describe('getBoardStateString', () => {
    it('should generate a correct string for an empty board', () => {
      const tiles: Tile[] = [];
      const result = getBoardStateString(tiles);
      const expected = 
        '0, 0, 0, 0\n' +
        '0, 0, 0, 0\n' +
        '0, 0, 0, 0\n' +
        '0, 0, 0, 0';
      expect(result).toBe(expected);
    });

    it('should generate a correct string for a board with tiles', () => {
      const tiles: Tile[] = [
        { id: 1, value: 2, x: 0, y: 0 },
        { id: 2, value: 4, x: 1, y: 0 },
        { id: 3, value: 8, x: 0, y: 1 },
      ];
      const result = getBoardStateString(tiles);
      const expected = 
        '2, 4, 0, 0\n' +
        '8, 0, 0, 0\n' +
        '0, 0, 0, 0\n' +
        '0, 0, 0, 0';
      expect(result).toBe(expected);
    });

    it('should ignore deleted tiles', () => {
      const tiles: Tile[] = [
        { id: 1, value: 2, x: 0, y: 0 },
        { id: 2, value: 4, x: 1, y: 0, isDeleted: true },
        { id: 3, value: 8, x: 0, y: 1 },
      ];
      const result = getBoardStateString(tiles);
      const expected = 
        '2, 0, 0, 0\n' +
        '8, 0, 0, 0\n' +
        '0, 0, 0, 0\n' +
        '0, 0, 0, 0';
      expect(result).toBe(expected);
    });

    it('should produce identical strings for identical board states with different tile IDs', () => {
      const tiles1: Tile[] = [
        { id: 1, value: 2, x: 0, y: 0 },
        { id: 2, value: 4, x: 1, y: 0 },
      ];
      const tiles2: Tile[] = [
        { id: 10, value: 2, x: 0, y: 0 },
        { id: 20, value: 4, x: 1, y: 0 },
      ];
      
      expect(getBoardStateString(tiles1)).toBe(getBoardStateString(tiles2));
    });

    it('should produce different strings for different board states', () => {
      const tiles1: Tile[] = [
        { id: 1, value: 2, x: 0, y: 0 },
        { id: 2, value: 4, x: 1, y: 0 },
      ];
      const tiles2: Tile[] = [
        { id: 1, value: 4, x: 0, y: 0 },
        { id: 2, value: 2, x: 1, y: 0 },
      ];
      
      expect(getBoardStateString(tiles1)).not.toBe(getBoardStateString(tiles2));
    });
  });
});
