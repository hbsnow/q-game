import { describe, it, expect } from 'vitest';
import { BlockRemover } from './blockRemover';
import { Block } from '@/types';

describe('BlockRemover', () => {
  const createMockBlock = (x: number, y: number, color: string = 'blue'): Block => ({
    id: `block-${x}-${y}`,
    type: 'normal',
    color: color as any,
    x,
    y,
  });

  describe('removeBlockGroup', () => {
    it('should remove connected blocks of same color', () => {
      const blocks: Block[] = [
        createMockBlock(0, 0, 'blue'),
        createMockBlock(0, 1, 'blue'),
        createMockBlock(1, 0, 'red'),
      ];

      const result = BlockRemover.removeBlockGroup(blocks[0], blocks);
      
      expect(result.removedBlocks).toHaveLength(2);
      expect(result.remainingBlocks).toHaveLength(1);
      expect(result.remainingBlocks[0].color).toBe('red');
    });

    it('should not remove single blocks', () => {
      const blocks: Block[] = [
        createMockBlock(0, 0, 'blue'),
        createMockBlock(0, 2, 'red'),
      ];

      const result = BlockRemover.removeBlockGroup(blocks[0], blocks);
      
      expect(result.removedBlocks).toHaveLength(0);
      expect(result.remainingBlocks).toHaveLength(2);
      expect(result.scoreResult.finalScore).toBe(0);
    });

    it('should calculate correct score', () => {
      const blocks: Block[] = [
        createMockBlock(0, 0, 'blue'),
        createMockBlock(0, 1, 'blue'),
        createMockBlock(0, 2, 'blue'),
      ];

      const result = BlockRemover.removeBlockGroup(blocks[0], blocks);
      
      expect(result.scoreResult.baseScore).toBe(9); // 3^2 = 9
      // 全消しボーナスが適用される（残りブロックなし）
      expect(result.scoreResult.allClearBonus).toBe(true);
      expect(result.scoreResult.finalScore).toBe(14); // 9 * 1.5 = 13.5 → 14（四捨五入）
    });

    it('should apply score booster when active', () => {
      const blocks: Block[] = [
        createMockBlock(0, 0, 'blue'),
        createMockBlock(0, 1, 'blue'),
        createMockBlock(5, 5, 'red'), // 単独の赤ブロック
        createMockBlock(7, 7, 'green'), // 単独の緑ブロック
      ];

      const result = BlockRemover.removeBlockGroup(blocks[0], blocks, true);
      
      expect(result.scoreResult.baseScore).toBe(4); // 2^2 = 4
      expect(result.remainingBlocks).toHaveLength(2); // 赤と緑のブロックが残る
      expect(result.scoreResult.scoreBoosterActive).toBe(true);
      expect(result.scoreResult.finalScore).toBe(6); // 4 * 1.5 = 6（全消しボーナスなし）
    });
  });

  describe('canRemoveCounterBlock', () => {
    it('should allow removal when counter+ condition is met', () => {
      const counterBlock: Block = {
        id: 'counter-1',
        type: 'counterPlus',
        color: 'blue',
        x: 1,
        y: 1,
        counterValue: 3,
        isCounterPlus: true,
      };

      const blocks: Block[] = [
        createMockBlock(0, 1, 'blue'),
        counterBlock,
        createMockBlock(2, 1, 'blue'),
        createMockBlock(1, 2, 'blue'),
      ];

      const canRemove = BlockRemover.canRemoveCounterBlock(counterBlock, blocks);
      expect(canRemove).toBe(true);
    });

    it('should not allow removal when counter+ condition is not met', () => {
      const counterBlock: Block = {
        id: 'counter-1',
        type: 'counterPlus',
        color: 'blue',
        x: 1,
        y: 1,
        counterValue: 5,
        isCounterPlus: true,
      };

      const blocks: Block[] = [
        createMockBlock(0, 1, 'blue'),
        counterBlock,
        createMockBlock(2, 1, 'blue'),
      ];

      const canRemove = BlockRemover.canRemoveCounterBlock(counterBlock, blocks);
      expect(canRemove).toBe(false);
    });

    it('should require exact count for regular counter blocks', () => {
      const counterBlock: Block = {
        id: 'counter-1',
        type: 'counter',
        color: 'blue',
        x: 1,
        y: 1,
        counterValue: 3,
        isCounterPlus: false,
      };

      const blocks: Block[] = [
        createMockBlock(0, 1, 'blue'),
        counterBlock,
        createMockBlock(2, 1, 'blue'),
        // ちょうど3個（カウンターブロック含む）
      ];

      const canRemove = BlockRemover.canRemoveCounterBlock(counterBlock, blocks);
      expect(canRemove).toBe(true);
      
      // 4個の場合は消去不可
      const blocksWithExtra = [
        ...blocks,
        createMockBlock(1, 2, 'blue'),
      ];
      
      const canRemoveExtra = BlockRemover.canRemoveCounterBlock(counterBlock, blocksWithExtra);
      expect(canRemoveExtra).toBe(false);
    });
  });

  describe('removeBlocksByItem', () => {
    it('should remove specified blocks without score calculation', () => {
      const blocks: Block[] = [
        createMockBlock(0, 0, 'blue'),
        createMockBlock(0, 1, 'red'),
        createMockBlock(1, 0, 'green'),
      ];

      const targetBlocks = [blocks[0], blocks[2]];
      const result = BlockRemover.removeBlocksByItem(targetBlocks, blocks);
      
      expect(result).toHaveLength(1);
      expect(result[0].color).toBe('red');
    });
  });
});
