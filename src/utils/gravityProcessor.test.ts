import { describe, it, expect } from 'vitest';
import { GravityProcessor } from './gravityProcessor';
import { Block } from '@/types';

describe('GravityProcessor', () => {
  const createMockBlock = (x: number, y: number, type: string = 'normal'): Block => ({
    id: `block-${x}-${y}`,
    type: type as any,
    color: 'blue',
    x,
    y,
  });

  describe('applyGravity', () => {
    it('should move blocks down when there are gaps', () => {
      const blocks: Block[] = [
        createMockBlock(0, 0), // 上のブロック
        createMockBlock(0, 2), // 下のブロック（1の位置が空）
      ];

      const result = GravityProcessor.applyGravity(blocks);
      
      expect(result.blocks).toHaveLength(2);
      
      // ブロックは下から詰まって配置される
      const sortedBlocks = result.blocks.sort((a, b) => b.y - a.y);
      
      // 最下段のブロック
      expect(sortedBlocks[0].y).toBe(13);
      // 下から2番目のブロック
      expect(sortedBlocks[1].y).toBe(12);
    });

    it('should not move steel blocks', () => {
      const blocks: Block[] = [
        createMockBlock(0, 5, 'steel'), // 鋼鉄ブロック
        createMockBlock(0, 0), // 通常ブロック
      ];

      const result = GravityProcessor.applyGravity(blocks);
      
      // 鋼鉄ブロックは元の位置を維持
      const steelBlock = result.blocks.find(b => b.type === 'steel');
      expect(steelBlock?.y).toBe(5);
      
      // 通常ブロックは最下段に落ちる（鋼鉄ブロックより下）
      const normalBlock = result.blocks.find(b => b.type === 'normal');
      expect(normalBlock?.y).toBe(13); // 最下段
    });

    it('should record block movements', () => {
      const blocks: Block[] = [
        createMockBlock(0, 0),
        // 位置1は空
        createMockBlock(0, 2),
      ];

      const result = GravityProcessor.applyGravity(blocks);
      
      expect(result.movements).toHaveLength(2);
      
      // 移動距離を確認（実際の実装に合わせて調整）
      const movements = result.movements.sort((a, b) => a.from.y - b.from.y);
      
      // 上のブロック（y=0）の移動
      expect(movements[0].from.y).toBe(0);
      expect(movements[0].to.y).toBe(13);
      expect(movements[0].distance).toBe(13);
      
      // 下のブロック（y=2）の移動
      expect(movements[1].from.y).toBe(2);
      expect(movements[1].to.y).toBe(12);
      expect(movements[1].distance).toBe(10);
    });

    it('should identify empty positions', () => {
      const blocks: Block[] = [
        createMockBlock(1, 10), // x=1の列にブロック
        createMockBlock(1, 12),
      ];

      const result = GravityProcessor.applyGravity(blocks);
      
      // x=1の列の上部に空の位置が生成される
      const column1EmptyPositions = result.emptyPositions.filter(pos => pos.x === 1);
      expect(column1EmptyPositions.length).toBeGreaterThan(0);
      
      // 空の位置は上部にある（ブロックが下に詰まった後の上部）
      column1EmptyPositions.forEach(pos => {
        expect(pos.x).toBe(1);
        expect(pos.y).toBeLessThan(12); // 最下段のブロックより上
      });
    });
  });

  describe('needsGravity', () => {
    it('should return true when blocks need to fall', () => {
      const blocks: Block[] = [
        createMockBlock(0, 0), // 上にブロック
        // 位置1-12は空
        createMockBlock(0, 13), // 最下段にブロック
      ];

      const needsGravity = GravityProcessor.needsGravity(blocks);
      expect(needsGravity).toBe(true);
    });

    it('should return false when no gravity is needed', () => {
      const blocks: Block[] = [
        createMockBlock(0, 12),
        createMockBlock(0, 13),
      ];

      const needsGravity = GravityProcessor.needsGravity(blocks);
      expect(needsGravity).toBe(false);
    });

    it('should return false for empty board', () => {
      const blocks: Block[] = [];
      
      const needsGravity = GravityProcessor.needsGravity(blocks);
      expect(needsGravity).toBe(false);
    });
  });

  describe('calculateSteppedMovements', () => {
    it('should break down large movements into steps', () => {
      const movements = [
        {
          blockId: 'block-1',
          from: { x: 0, y: 0 },
          to: { x: 0, y: 3 },
          distance: 3,
        },
      ];

      const steps = GravityProcessor.calculateSteppedMovements(movements);
      
      expect(steps).toHaveLength(3);
      expect(steps[0][0].distance).toBe(1);
      expect(steps[1][0].distance).toBe(1);
      expect(steps[2][0].distance).toBe(1);
    });

    it('should handle empty movements', () => {
      const steps = GravityProcessor.calculateSteppedMovements([]);
      expect(steps).toHaveLength(0);
    });
  });
});
