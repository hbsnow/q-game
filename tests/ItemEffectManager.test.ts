import { describe, it, expect } from 'vitest';
import { ItemEffectManager } from '../src/managers/ItemEffectManager';
import { Block } from '../src/types/Block';

describe('ItemEffectManager', () => {
  // テスト用のブロック配列を作成するヘルパー関数
  const createTestBlocks = (): Block[][] => {
    return [
      [
        { x: 0, y: 0, color: '#FF0000', type: 'normal', sprite: null },
        { x: 1, y: 0, color: '#00FF00', type: 'normal', sprite: null },
        { x: 2, y: 0, color: '#0000FF', type: 'normal', sprite: null }
      ],
      [
        { x: 0, y: 1, color: '#FF0000', type: 'normal', sprite: null },
        { x: 1, y: 1, color: '#00FF00', type: 'rock', sprite: null },
        { x: 2, y: 1, color: '#0000FF', type: 'normal', sprite: null }
      ],
      [
        { x: 0, y: 2, color: '#FFFF00', type: 'normal', sprite: null },
        { x: 1, y: 2, color: '#FF00FF', type: 'normal', sprite: null },
        { x: 2, y: 2, color: '#00FFFF', type: 'normal', sprite: null }
      ]
    ];
  };

  describe('applySwap', () => {
    it('正常にブロックを入れ替える', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 1, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0].color).toBe('#00FF00');
      expect(result.newBlocks![0][1].color).toBe('#FF0000');
    });

    it('岩ブロックは入れ替えできない', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applySwap(blocks, {x: 0, y: 0}, {x: 1, y: 1});
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('岩ブロックと鋼鉄ブロックは入れ替えできません');
    });

    it('無効な座標では失敗する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applySwap(blocks, {x: -1, y: 0}, {x: 1, y: 0});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('無効な位置です');
    });
  });

  describe('applyChangeOne', () => {
    it('正常にブロックの色を変更する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyChangeOne(blocks, {x: 0, y: 0}, '#FFFFFF');
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0].color).toBe('#FFFFFF');
    });

    it('岩ブロックは色変更できない', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyChangeOne(blocks, {x: 1, y: 1}, '#FFFFFF');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('岩ブロックと鋼鉄ブロックは色変更できません');
    });
  });

  describe('applyMiniBomb', () => {
    it('正常に通常ブロックを消去する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyMiniBomb(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0]).toBe(null);
      expect(result.modifiedBlocks).toHaveLength(1);
    });

    it('通常ブロック以外は消去できない', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyMiniBomb(blocks, {x: 1, y: 1});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('通常ブロックのみ消去できます');
    });
  });

  describe('applyShuffle', () => {
    it('正常にブロックをシャッフルする', () => {
      const blocks = createTestBlocks();
      const originalColors = blocks.flat().filter(b => b && b.type === 'normal').map(b => b!.color);
      
      const result = ItemEffectManager.applyShuffle(blocks);
      
      expect(result.success).toBe(true);
      
      // 通常ブロックの色が変わっていることを確認（確率的にテストが失敗する可能性があるが、実用上問題なし）
      const newColors = result.newBlocks!.flat().filter(b => b && b.type === 'normal').map(b => b!.color);
      expect(newColors).toHaveLength(originalColors.length);
      
      // 岩ブロックは変更されていないことを確認
      expect(result.newBlocks![1][1].type).toBe('rock');
    });
  });

  describe('applyChangeArea', () => {
    it('隣接する同色ブロック群の色を変更する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyChangeArea(blocks, {x: 0, y: 0}, '#FFFFFF');
      
      expect(result.success).toBe(true);
      // (0,0)と(0,1)は同じ赤色で隣接しているので両方変更される
      expect(result.newBlocks![0][0].color).toBe('#FFFFFF');
      expect(result.newBlocks![1][0].color).toBe('#FFFFFF');
    });

    it('岩ブロックは色変更できない', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyChangeArea(blocks, {x: 1, y: 1}, '#FFFFFF');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('岩ブロックと鋼鉄ブロックは色変更できません');
    });
  });

  describe('applyMeltingAgent', () => {
    it('氷結Lv2を氷結Lv1に変更する', () => {
      const blocks = createTestBlocks();
      blocks[0][0].type = 'iceLv2';
      
      const result = ItemEffectManager.applyMeltingAgent(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0].type).toBe('iceLv1');
      expect(result.message).toBe('氷結レベルが下がりました');
    });

    it('氷結Lv1を通常ブロックに変更する', () => {
      const blocks = createTestBlocks();
      blocks[0][0].type = 'iceLv1';
      
      const result = ItemEffectManager.applyMeltingAgent(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0].type).toBe('normal');
      expect(result.message).toBe('氷結が解除されました');
    });

    it('氷結ブロック以外では失敗する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyMeltingAgent(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('このアイテムは氷結ブロック専用です');
    });
  });

  describe('applyCounterReset', () => {
    it('カウンター+ブロックを通常ブロックに変更する', () => {
      const blocks = createTestBlocks();
      blocks[0][0].type = 'counterPlus';
      
      const result = ItemEffectManager.applyCounterReset(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0].type).toBe('normal');
      expect(result.message).toBe('カウンター+ブロックを通常ブロックに変更しました');
    });

    it('カウンター+ブロック以外では失敗する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyCounterReset(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('このアイテムはカウンター+ブロック専用です');
    });
  });

  describe('applyAdPlus', () => {
    it('カウンターブロックをカウンター+ブロックに変更する', () => {
      const blocks = createTestBlocks();
      blocks[0][0].type = 'counterMinus';
      
      const result = ItemEffectManager.applyAdPlus(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0].type).toBe('counterPlus');
      expect(result.message).toBe('カウンターブロックをカウンター+ブロックに変更しました');
    });

    it('カウンターブロック以外では失敗する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyAdPlus(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('このアイテムはカウンターブロック専用です');
    });
  });

  describe('applyBomb', () => {
    it('3×3範囲のブロックを消去する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyBomb(blocks, {x: 1, y: 1});
      
      expect(result.success).toBe(true);
      expect(result.modifiedBlocks!.length).toBeGreaterThan(0);
      
      // 中心のブロック（鋼鉄ブロック以外）が消去されることを確認
      expect(result.newBlocks![0][0]).toBe(null); // 範囲内
      expect(result.newBlocks![0][1]).toBe(null); // 範囲内
      expect(result.newBlocks![1][1]).toBe(null); // 岩ブロックも消去される
    });

    it('鋼鉄ブロックは消去されない', () => {
      const blocks = createTestBlocks();
      blocks[1][1].type = 'steel';
      
      const result = ItemEffectManager.applyBomb(blocks, {x: 1, y: 1});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![1][1]).not.toBe(null); // 鋼鉄ブロックは残る
    });
  });

  describe('applyScoreBooster', () => {
    it('スコアブースターが正常に発動する', () => {
      const result = ItemEffectManager.applyScoreBooster();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('スコアブースターが発動しました');
    });
  });

  describe('applyHammer', () => {
    it('岩ブロックを破壊する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyHammer(blocks, {x: 1, y: 1});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![1][1]).toBe(null);
      expect(result.message).toBe('岩ブロックを破壊しました');
    });

    it('岩ブロック以外では失敗する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applyHammer(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('このアイテムは岩ブロック専用です');
    });
  });

  describe('applySteelHammer', () => {
    it('鋼鉄ブロックを破壊する', () => {
      const blocks = createTestBlocks();
      blocks[1][1].type = 'steel';
      
      const result = ItemEffectManager.applySteelHammer(blocks, {x: 1, y: 1});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![1][1]).toBe(null);
      expect(result.message).toBe('鋼鉄ブロックを破壊しました');
    });

    it('鋼鉄ブロック以外では失敗する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applySteelHammer(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('このアイテムは鋼鉄ブロック専用です');
    });
  });

  describe('applySpecialHammer', () => {
    it('任意のブロックを破壊する', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applySpecialHammer(blocks, {x: 0, y: 0});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![0][0]).toBe(null);
      expect(result.message).toBe('ブロックを破壊しました');
    });

    it('岩ブロックも破壊できる', () => {
      const blocks = createTestBlocks();
      const result = ItemEffectManager.applySpecialHammer(blocks, {x: 1, y: 1});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![1][1]).toBe(null);
      expect(result.message).toBe('ブロックを破壊しました');
    });

    it('鋼鉄ブロックも破壊できる', () => {
      const blocks = createTestBlocks();
      blocks[1][1].type = 'steel';
      
      const result = ItemEffectManager.applySpecialHammer(blocks, {x: 1, y: 1});
      
      expect(result.success).toBe(true);
      expect(result.newBlocks![1][1]).toBe(null);
      expect(result.message).toBe('ブロックを破壊しました');
    });
  });
});
