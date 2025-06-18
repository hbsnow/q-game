/**
 * ItemEffectManager のユニットテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ItemEffectManager } from './ItemEffectManager';
import { Block } from '../types/Block';
import { BlockFactory } from '../utils/BlockFactory';

describe('ItemEffectManager', () => {
  let blocks: Block[][];
  let blockFactory: BlockFactory;

  beforeEach(() => {
    blockFactory = new BlockFactory();
    // 3x3のテスト用ブロック配列を作成
    blocks = Array(3).fill(0).map(() => Array(3).fill(null));
    
    // テスト用ブロックを配置
    blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF0000'); // 赤
    blocks[0][1] = blockFactory.createNormalBlock(1, 0, '#00FF00'); // 緑
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#0000FF'); // 青
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF0000'); // 赤
    blocks[1][1] = blockFactory.createRockBlock(1, 1);              // 岩
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#0000FF'); // 青
    blocks[2][0] = blockFactory.createNormalBlock(0, 2, '#00FF00'); // 緑
    blocks[2][1] = blockFactory.createNormalBlock(1, 2, '#00FF00'); // 緑
    blocks[2][2] = blockFactory.createNormalBlock(2, 2, '#FF0000'); // 赤
  });

  describe('スワップ効果', () => {
    it('通常ブロック同士を正しく入れ替えできる', () => {
      const result = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 2, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0]?.color).toBe('#0000FF'); // 青に変更
      expect(result.newBlocks![0][2]?.color).toBe('#FF0000'); // 赤に変更
    });

    it('岩ブロックは入れ替えできない', () => {
      const result = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 1, y: 1});
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('岩ブロック');
    });

    it('無効な座標では失敗する', () => {
      const result = ItemEffectManager.applySwap(blocks, {x: -1, y: 0}, {x: 0, y: 0});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('無効な位置です');
    });

    it('存在しないブロックでは失敗する', () => {
      blocks[0][0] = null;
      const result = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 1, y: 0});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('ブロックが存在しません');
    });
  });

  describe('チェンジワン効果', () => {
    it('通常ブロックの色を正しく変更できる', () => {
      const result = ItemEffectManager.applyChangeOne(blocks, {x: 0, y: 0}, '#FFFF00');
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0]?.color).toBe('#FFFF00');
    });

    it('岩ブロックは色変更できない', () => {
      const result = ItemEffectManager.applyChangeOne(blocks, {x: 1, y: 1}, '#FFFF00');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('岩ブロック');
    });

    it('無効な座標では失敗する', () => {
      const result = ItemEffectManager.applyChangeOne(blocks, {x: 10, y: 10}, '#FFFF00');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('無効な位置です');
    });
  });

  describe('ミニ爆弾効果', () => {
    it('通常ブロックを正しく消去できる', () => {
      const result = ItemEffectManager.applyMiniBomb(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0]).toBeNull();
      expect(result.modifiedBlocks).toHaveLength(1);
    });

    it('通常ブロック以外は消去できない', () => {
      const result = ItemEffectManager.applyMiniBomb(blocks, {x: 1, y: 1});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('通常ブロックのみ消去できます');
    });
  });

  describe('シャッフル効果', () => {
    it('通常ブロックのみがシャッフルされる', () => {
      const originalColors = blocks.flat()
        .filter(block => block && block.type === 'normal')
        .map(block => block!.color)
        .sort();
      
      const result = ItemEffectManager.applyShuffle(blocks);
      
      expect(result.success).toBe(true);
      
      const shuffledColors = result.newBlocks!.flat()
        .filter(block => block && block.type === 'normal')
        .map(block => block!.color)
        .sort();
      
      // 色の種類と数は変わらない
      expect(shuffledColors).toEqual(originalColors);
      
      // 岩ブロックの位置は変わらない
      expect(result.newBlocks![1][1]?.type).toBe('rock');
    });
  });

  describe('チェンジエリア効果', () => {
    it('隣接する同色ブロックの色を一括変更できる', () => {
      // 緑ブロックが隣接している (2,0) と (2,1) を対象
      const result = ItemEffectManager.applyChangeArea(blocks, {x: 1, y: 2}, '#FFFF00');
      
      expect(result.success).toBe(true);
      
      // 隣接する緑ブロックが全て黄色に変更される
      expect(result.newBlocks![2][0]?.color).toBe('#FFFF00');
      expect(result.newBlocks![2][1]?.color).toBe('#FFFF00');
    });

    it('岩ブロックは色変更できない', () => {
      const result = ItemEffectManager.applyChangeArea(blocks, {x: 1, y: 1}, '#FFFF00');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('岩ブロック');
    });

    it('隣接ブロックがない場合は適切なメッセージを返す', () => {
      // 単独のブロックを対象
      const result = ItemEffectManager.applyChangeArea(blocks, {x: 2, y: 2}, '#FFFF00');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('1個のブロック');
    });
  });

  describe('エラーハンドリング', () => {
    it('範囲外の座標は無効として処理される', () => {
      const positions = [
        {x: -1, y: 0},
        {x: 0, y: -1},
        {x: 10, y: 0},
        {x: 0, y: 10}
      ];
      
      positions.forEach(pos => {
        const result = ItemEffectManager.applySwap(blocks, pos, {x: 0, y: 0});
        expect(result.success).toBe(false);
        expect(result.message).toBe('無効な位置です');
      });
    });

    it('nullブロックに対する操作は適切に処理される', () => {
      blocks[0][0] = null;
      
      const swapResult = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 1, y: 0});
      expect(swapResult.success).toBe(false);
      
      const changeResult = ItemEffectManager.applyChangeOne(blocks, {x: 0, y: 0}, '#FFFF00');
      expect(changeResult.success).toBe(false);
      
      const bombResult = ItemEffectManager.applyMiniBomb(blocks, {x: 0, y: 0});
      expect(bombResult.success).toBe(false);
    });
  });

  describe('ブロック配列の整合性', () => {
    it('効果適用後もブロック配列の構造が保持される', () => {
      const result = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 2, y: 0});
      
      expect(result.newBlocks).toHaveLength(3);
      expect(result.newBlocks![0]).toHaveLength(3);
      expect(result.newBlocks![1]).toHaveLength(3);
      expect(result.newBlocks![2]).toHaveLength(3);
    });

    it('効果適用後のブロックの座標が正しく更新される', () => {
      const result = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 2, y: 0});
      
      expect(result.newBlocks![0][0]?.x).toBe(0);
      expect(result.newBlocks![0][0]?.y).toBe(0);
      expect(result.newBlocks![0][2]?.x).toBe(2);
      expect(result.newBlocks![0][2]?.y).toBe(0);
    });

    it('効果適用後のスプライト参照がnullに設定される', () => {
      const result = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 2, y: 0});
      
      result.newBlocks!.flat().forEach(block => {
        if (block) {
          expect(block.sprite).toBeNull();
        }
      });
    });
  });
});
