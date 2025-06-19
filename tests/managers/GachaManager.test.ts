import { describe, it, expect, beforeEach } from 'vitest';
import { GachaManager } from '../../src/managers/GachaManager';
import { ItemManager } from '../../src/managers/ItemManager';
import { StageManager } from '../../src/managers/StageManager';

describe('GachaManager', () => {
  let gachaManager: GachaManager;
  let itemManager: ItemManager;
  let stageManager: StageManager;

  beforeEach(() => {
    // 新しいインスタンスを作成（テスト間の独立性を保つ）
    itemManager = new ItemManager();
    stageManager = StageManager.getInstance();
    
    // GachaManagerのシングルトンをリセット
    (GachaManager as any).instance = null;
    gachaManager = GachaManager.getInstance(itemManager, stageManager);

    // テスト用のアイテムを追加
    itemManager.addItem('swap', 5);
    itemManager.addItem('changeOne', 3);
    itemManager.addItem('miniBomb', 2);
    itemManager.addItem('bomb', 1);
  });

  describe('基本機能', () => {
    it('シングルトンパターンで同じインスタンスを返す', () => {
      const instance1 = GachaManager.getInstance(itemManager, stageManager);
      const instance2 = GachaManager.getInstance(itemManager, stageManager);
      expect(instance1).toBe(instance2);
    });

    it('ガチャ価格を正しく返す', () => {
      expect(gachaManager.getGachaPrice()).toBe(100);
      expect(gachaManager.getTenGachaPrice()).toBe(1000);
    });
  });

  describe('アイテム抽選', () => {
    it('1回ガチャでアイテムを抽選できる', () => {
      const result = gachaManager.drawSingle();
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.itemId).toBeDefined();
        expect(result.itemName).toBeDefined();
        expect(result.rarity).toBeDefined();
        expect(result.count).toBe(1);
      }
    });

    it('10連ガチャで10個のアイテムを抽選できる', () => {
      const results = gachaManager.drawTen();
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.itemId).toBeDefined();
        expect(result.itemName).toBeDefined();
        expect(result.rarity).toBeDefined();
        expect(result.count).toBe(1);
      });
    });

    it('10連ガチャで最低1つはD以上のアイテムが確定する', () => {
      // 複数回テストして確率的な動作を確認
      for (let i = 0; i < 5; i++) {
        const results = gachaManager.drawTen();
        const hasRareItem = results.some(result => 
          ['S', 'A', 'B', 'C', 'D'].includes(result.rarity)
        );
        expect(hasRareItem).toBe(true);
      }
    });
  });

  describe('確率計算', () => {
    it('現在の確率表示データを正しく計算する', () => {
      const rates = gachaManager.getCurrentRates();
      
      expect(rates.length).toBeGreaterThan(0);
      
      // 各レア度のデータが正しい形式
      rates.forEach(rate => {
        expect(rate.rarity).toBeDefined();
        expect(rate.rate).toBeGreaterThan(0);
        expect(Array.isArray(rate.items)).toBe(true);
        expect(rate.items.length).toBeGreaterThan(0);
      });
      
      // 確率の合計が100%に近い（小数点誤差を考慮）
      const totalRate = rates.reduce((sum, rate) => sum + rate.rate, 0);
      expect(totalRate).toBeCloseTo(100, 1);
    });

    it('レア度順にソートされている', () => {
      const rates = gachaManager.getCurrentRates();
      const rarityOrder = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
      
      for (let i = 1; i < rates.length; i++) {
        const prevIndex = rarityOrder.indexOf(rates[i-1].rarity);
        const currIndex = rarityOrder.indexOf(rates[i].rarity);
        expect(prevIndex).toBeLessThan(currIndex);
      }
    });
  });

  describe('ステージ進行による変化', () => {
    it('ステージ1では初期アイテムのみ出現する', () => {
      // ステージ1に設定（StageManagerの初期値は1）
      const rates = gachaManager.getCurrentRates();
      
      // 初期ステージで出現するアイテムのみが含まれている
      rates.forEach(rate => {
        rate.items.forEach(itemName => {
          // 初期アイテム（スワップ、チェンジワン、ミニ爆弾、シャッフル）のみ
          const initialItems = ['スワップ', 'チェンジワン', 'ミニ爆弾', 'シャッフル'];
          expect(initialItems.some(initial => itemName.includes(initial))).toBe(true);
        });
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('正常な状態では結果を返す', () => {
      const result = gachaManager.drawSingle();
      expect(result).not.toBeNull();
      
      const rates = gachaManager.getCurrentRates();
      expect(rates.length).toBeGreaterThan(0);
    });
  });
});
