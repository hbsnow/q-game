import { describe, it, expect } from 'vitest';
import { 
  isAdjacent, 
  getAdjacentPositions, 
  getConnectedBlocks,
  calculateScore,
  shuffleArray,
  randomInt,
  hasRemovableBlocks
} from './index';
import { Block } from '@/types';

describe('Utils', () => {
  describe('isAdjacent', () => {
    it('should return true for adjacent positions', () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(true);
      expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true);
    });

    it('should return false for non-adjacent positions', () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(false);
      expect(isAdjacent({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(false);
    });
  });

  describe('getAdjacentPositions', () => {
    it('should return valid adjacent positions', () => {
      const positions = getAdjacentPositions({ x: 1, y: 1 });
      expect(positions).toHaveLength(4);
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 1, y: 2 });
      expect(positions).toContainEqual({ x: 0, y: 1 });
      expect(positions).toContainEqual({ x: 2, y: 1 });
    });

    it('should filter out invalid positions at board edges', () => {
      const positions = getAdjacentPositions({ x: 0, y: 0 });
      expect(positions).toHaveLength(2);
      expect(positions).toContainEqual({ x: 0, y: 1 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
    });
  });

  describe('getConnectedBlocks', () => {
    it('should find connected blocks of same color', () => {
      const blocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 },
        { id: '3', type: 'normal', color: 'red', x: 1, y: 0 },
      ];

      const group = getConnectedBlocks(blocks[0], blocks);
      expect(group.count).toBe(2);
      expect(group.color).toBe('blue');
      expect(group.blocks).toHaveLength(2);
    });

    it('should not include different colored blocks', () => {
      const blocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        { id: '2', type: 'normal', color: 'red', x: 0, y: 1 },
      ];

      const group = getConnectedBlocks(blocks[0], blocks);
      expect(group.count).toBe(1);
      expect(group.blocks).toHaveLength(1);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score as square of block count', () => {
      expect(calculateScore(2)).toBe(4);
      expect(calculateScore(3)).toBe(9);
      expect(calculateScore(5)).toBe(25);
      expect(calculateScore(10)).toBe(100);
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      
      expect(original).toEqual(originalCopy);
    });
  });

  describe('randomInt', () => {
    it('should return number within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('hasRemovableBlocks', () => {
    it('should return true when removable blocks exist', () => {
      const blocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 },
      ];

      expect(hasRemovableBlocks(blocks)).toBe(true);
    });

    it('should return false when no removable blocks exist', () => {
      const blocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        { id: '2', type: 'normal', color: 'red', x: 0, y: 1 },
      ];

      expect(hasRemovableBlocks(blocks)).toBe(false);
    });
  });
});
