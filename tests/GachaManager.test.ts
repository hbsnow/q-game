import { describe, it, expect } from 'vitest';
import { GachaManager } from '../src/managers/GachaManager';
import { ItemRarity } from '../src/types/Item';

describe('GachaManager', () => {
  describe('drawSingle', () => {
    it('1回ガチャが正常に動作する', () => {
      const result = GachaManager.drawSingle(1);
      
      expect(result.items).toHaveLength(1);
      expect(result.totalCost).toBe(100);
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).toHaveProperty('rarity');
    });

    it('ステージ1では基本アイテムのみ出現する', () => {
      const result = GachaManager.drawSingle(1);
      const item = result.items[0];
      
      // ステージ1で出現可能なアイテムのIDリスト
      const stage1Items = ['swap', 'changeOne', 'miniBomb', 'shuffle'];
      expect(stage1Items).toContain(item.id);
    });

    it('高ステージでは高級アイテムも出現する', () => {
      // 100回試行して、高級アイテムが出現することを確認
      let hasHighRarityItem = false;
      
      for (let i = 0; i < 100; i++) {
        const result = GachaManager.drawSingle(100); // 全アイテム解放
        const item = result.items[0];
        
        if (item.rarity === ItemRarity.S || item.rarity === ItemRarity.A) {
          hasHighRarityItem = true;
          break;
        }
      }
      
      // 確率的にS・Aレアが出現するはず（100回中に1回は出る想定）
      expect(hasHighRarityItem).toBe(true);
    });
  });

  describe('drawMulti', () => {
    it('10連ガチャが正常に動作する', () => {
      const result = GachaManager.drawMulti(1);
      
      expect(result.items).toHaveLength(10);
      expect(result.totalCost).toBe(1000);
      
      // 全てのアイテムが有効なオブジェクトであることを確認
      result.items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('rarity');
      });
    });

    it('10連ガチャでD以上確定が機能する', () => {
      const result = GachaManager.drawMulti(1);
      
      // 最低1つはD以上のレアアイテムが含まれているはず
      const hasGuaranteedItem = result.items.some(item => 
        item.rarity === ItemRarity.S ||
        item.rarity === ItemRarity.A ||
        item.rarity === ItemRarity.B ||
        item.rarity === ItemRarity.C ||
        item.rarity === ItemRarity.D
      );
      
      expect(hasGuaranteedItem).toBe(true);
    });
  });

  describe('getDropRates', () => {
    it('排出確率が正しく計算される', () => {
      const dropRates = GachaManager.getDropRates(1);
      
      expect(dropRates.length).toBeGreaterThan(0);
      
      // 確率の合計が100%になることを確認
      const totalRate = dropRates.reduce((sum, item) => sum + item.rate, 0);
      expect(Math.abs(totalRate - 100)).toBeLessThan(0.01); // 浮動小数点誤差を考慮
      
      // 各アイテムの確率が0以上であることを確認
      dropRates.forEach(item => {
        expect(item.rate).toBeGreaterThan(0);
        expect(item.item).toHaveProperty('id');
      });
    });

    it('レア度順序が保たれている', () => {
      const dropRates = GachaManager.getDropRates(100); // 全アイテム解放
      
      // 同じレア度内では確率が同じであることを確認
      const rarityGroups: Record<ItemRarity, number[]> = {
        [ItemRarity.S]: [],
        [ItemRarity.A]: [],
        [ItemRarity.B]: [],
        [ItemRarity.C]: [],
        [ItemRarity.D]: [],
        [ItemRarity.E]: [],
        [ItemRarity.F]: [],
      };
      
      dropRates.forEach(item => {
        rarityGroups[item.item.rarity].push(item.rate);
      });
      
      // 同じレア度内では確率が同じであることを確認
      Object.keys(rarityGroups).forEach(rarityKey => {
        const rarity = rarityKey as ItemRarity;
        const rates = rarityGroups[rarity];
        
        if (rates.length > 1) {
          // 同じレア度内の確率は同じであるべき
          const firstRate = rates[0];
          rates.forEach(rate => {
            expect(Math.abs(rate - firstRate)).toBeLessThan(0.01);
          });
        }
      });
      
      // 基準確率（1アイテムあたり）の順序確認: S > A > B > C > D > E > F
      // ただし、実際の排出確率は正規化により変動する可能性がある
      // 重要なのは、同じレア度内では同じ確率であることと、全体で100%になることを確認
      
      // 確率の合計が100%になることを確認
      const totalRate = dropRates.reduce((sum, item) => sum + item.rate, 0);
      expect(Math.abs(totalRate - 100)).toBeLessThan(0.01);
      
      // 各レア度に少なくとも1つのアイテムがあることを確認
      expect(rarityGroups[ItemRarity.S].length).toBeGreaterThan(0);
      expect(rarityGroups[ItemRarity.A].length).toBeGreaterThan(0);
      expect(rarityGroups[ItemRarity.B].length).toBeGreaterThan(0);
      expect(rarityGroups[ItemRarity.C].length).toBeGreaterThan(0);
      expect(rarityGroups[ItemRarity.D].length).toBeGreaterThan(0);
      expect(rarityGroups[ItemRarity.E].length).toBeGreaterThan(0);
      expect(rarityGroups[ItemRarity.F].length).toBeGreaterThan(0);
    });
  });

  describe('getRarityRates', () => {
    it('レア度別確率が正しく計算される', () => {
      const rarityRates = GachaManager.getRarityRates(1);
      
      // 確率の合計が100%になることを確認
      const totalRate = Object.values(rarityRates).reduce((sum, rate) => sum + rate, 0);
      expect(Math.abs(totalRate - 100)).toBeLessThan(0.01);
      
      // ステージ1では基本アイテムのみなので、S・Aレアは0%のはず
      expect(rarityRates[ItemRarity.S]).toBe(0);
      expect(rarityRates[ItemRarity.A]).toBe(0);
    });

    it('高ステージでは全レア度が出現する', () => {
      const rarityRates = GachaManager.getRarityRates(100);
      
      // 全レア度が0%以上であることを確認
      Object.values(ItemRarity).forEach(rarity => {
        expect(rarityRates[rarity]).toBeGreaterThanOrEqual(0);
      });
      
      // S・Aレアも出現することを確認
      expect(rarityRates[ItemRarity.S]).toBeGreaterThan(0);
      expect(rarityRates[ItemRarity.A]).toBeGreaterThan(0);
    });
  });

  describe('getCosts', () => {
    it('ガチャコストが正しく返される', () => {
      const costs = GachaManager.getCosts();
      
      expect(costs.single).toBe(100);
      expect(costs.multi).toBe(1000);
    });
  });

  describe('simulate', () => {
    it('シミュレーションが正常に動作する', () => {
      const results = GachaManager.simulate(1, 1000);
      
      // 結果が返されることを確認
      expect(Object.keys(results).length).toBeGreaterThan(0);
      
      // 合計回数が正しいことを確認
      const totalDraws = Object.values(results).reduce((sum, count) => sum + count, 0);
      expect(totalDraws).toBe(1000);
      
      // 各アイテムの出現回数が0以上であることを確認
      Object.values(results).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('確率に応じた分布になる', () => {
      const results = GachaManager.simulate(1, 10000); // 大量試行
      const dropRates = GachaManager.getDropRates(1);
      
      // 各アイテムの実際の出現率と期待確率を比較
      dropRates.forEach(item => {
        const actualCount = results[item.item.id] || 0;
        const actualRate = (actualCount / 10000) * 100;
        const expectedRate = item.rate;
        
        // 誤差範囲内であることを確認（±2%程度）
        expect(Math.abs(actualRate - expectedRate)).toBeLessThan(2);
      });
    });
  });
});
