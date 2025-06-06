import { describe, it, expect } from 'vitest';
import { BlockGenerator } from './blockGenerator';
import { StageConfig } from '@/types';

describe('BlockGenerator', () => {
  const mockStageConfig: StageConfig = {
    stage: 1,
    colors: 3,
    targetScore: 500,
    obstacles: [],
  };

  describe('generateStageBlocks', () => {
    it('should generate blocks for the entire board', () => {
      const blocks = BlockGenerator.generateStageBlocks(mockStageConfig);
      
      // 10x14 = 140ブロック生成されるはず
      expect(blocks).toHaveLength(140);
    });

    it('should use only specified number of colors', () => {
      const blocks = BlockGenerator.generateStageBlocks(mockStageConfig);
      const colors = new Set(blocks.map(b => b.color));
      
      expect(colors.size).toBeLessThanOrEqual(3);
    });

    it('should generate valid block positions', () => {
      const blocks = BlockGenerator.generateStageBlocks(mockStageConfig);
      
      blocks.forEach(block => {
        expect(block.x).toBeGreaterThanOrEqual(0);
        expect(block.x).toBeLessThan(10);
        expect(block.y).toBeGreaterThanOrEqual(0);
        expect(block.y).toBeLessThan(14);
      });
    });

    it('should generate blocks with unique IDs', () => {
      const blocks = BlockGenerator.generateStageBlocks(mockStageConfig);
      const ids = blocks.map(b => b.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(blocks.length);
    });
  });

  describe('generateNewBlocks', () => {
    it('should generate blocks for specified positions', () => {
      const positions = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];
      const colors = ['blue', 'red'] as any;
      
      const blocks = BlockGenerator.generateNewBlocks(positions, colors);
      
      expect(blocks).toHaveLength(3);
      blocks.forEach((block, index) => {
        expect(block.x).toBe(positions[index].x);
        expect(block.y).toBe(positions[index].y);
        expect(block.type).toBe('normal');
        expect(colors).toContain(block.color);
      });
    });
  });

  describe('with obstacles', () => {
    it('should place obstacle blocks at specified positions', () => {
      const stageConfigWithObstacles: StageConfig = {
        stage: 1,
        colors: 3,
        targetScore: 500,
        obstacles: [
          {
            type: 'rock',
            positions: [{ x: 5, y: 7 }],
          },
        ],
      };

      const blocks = BlockGenerator.generateStageBlocks(stageConfigWithObstacles);
      const rockBlock = blocks.find(b => b.x === 5 && b.y === 7);
      
      expect(rockBlock).toBeDefined();
      expect(rockBlock?.type).toBe('rock');
    });

    it('should not place normal blocks where obstacles exist', () => {
      const stageConfigWithObstacles: StageConfig = {
        stage: 1,
        colors: 3,
        targetScore: 500,
        obstacles: [
          {
            type: 'rock',
            positions: [{ x: 5, y: 7 }],
          },
        ],
      };

      const blocks = BlockGenerator.generateStageBlocks(stageConfigWithObstacles);
      const blocksAtPosition = blocks.filter(b => b.x === 5 && b.y === 7);
      
      expect(blocksAtPosition).toHaveLength(1);
      expect(blocksAtPosition[0].type).toBe('rock');
    });
  });
});
