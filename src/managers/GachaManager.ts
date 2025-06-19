import { ItemManager } from './ItemManager';
import { StageManager } from './StageManager';
import { ITEM_DATA } from '../data/ItemData';

/**
 * ガチャの排出確率設定
 */
interface GachaRates {
  S: number;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

/**
 * ガチャ結果
 */
export interface GachaResult {
  itemId: string;
  itemName: string;
  rarity: string;
  count: number;
}

/**
 * ガチャシステム管理クラス
 */
export class GachaManager {
  private static instance: GachaManager;
  private itemManager: ItemManager;
  private stageManager: StageManager;

  // 1アイテムあたりの基準確率（レア度順序を保つ）
  private readonly baseRarityRates: GachaRates = {
    S: 0.02, // 2%
    A: 0.05, // 5%
    B: 0.08, // 8%
    C: 0.12, // 12%
    D: 0.15, // 15%
    E: 0.2,  // 20%
    F: 0.25, // 25%
  };

  private constructor(itemManager?: ItemManager, stageManager?: StageManager) {
    this.itemManager = itemManager || new ItemManager();
    this.stageManager = stageManager || StageManager.getInstance();
  }

  public static getInstance(itemManager?: ItemManager, stageManager?: StageManager): GachaManager {
    if (!GachaManager.instance) {
      GachaManager.instance = new GachaManager(itemManager, stageManager);
    }
    return GachaManager.instance;
  }

  /**
   * 現在のステージで出現可能なアイテムを取得
   */
  private getAvailableItems(): Array<{id: string, name: string, rarity: string}> {
    const currentStage = this.stageManager.getCurrentStage();
    
    return Object.values(ITEM_DATA)
      .filter(item => item.unlockStage <= currentStage)
      .map(item => ({
        id: item.id,
        name: item.name,
        rarity: item.rarity
      }));
  }

  /**
   * レア度別のアイテム数をカウント
   */
  private countItemsByRarity(availableItems: Array<{id: string, name: string, rarity: string}>): GachaRates {
    const counts: GachaRates = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    
    availableItems.forEach(item => {
      if (item.rarity in counts) {
        counts[item.rarity as keyof GachaRates]++;
      }
    });
    
    return counts;
  }

  /**
   * 正規化された確率を計算
   */
  private calculateNormalizedRates(itemCounts: GachaRates): GachaRates {
    // 各レア度の合計確率を計算
    const totalRarityRates: GachaRates = {
      S: this.baseRarityRates.S * itemCounts.S,
      A: this.baseRarityRates.A * itemCounts.A,
      B: this.baseRarityRates.B * itemCounts.B,
      C: this.baseRarityRates.C * itemCounts.C,
      D: this.baseRarityRates.D * itemCounts.D,
      E: this.baseRarityRates.E * itemCounts.E,
      F: this.baseRarityRates.F * itemCounts.F,
    };

    // 全体を100%に正規化
    const totalRate = Object.values(totalRarityRates).reduce((sum, rate) => sum + rate, 0);
    
    if (totalRate === 0) {
      // アイテムが存在しない場合のフォールバック
      return { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    }

    const normalizedRates: GachaRates = {
      S: (totalRarityRates.S / totalRate) * 100,
      A: (totalRarityRates.A / totalRate) * 100,
      B: (totalRarityRates.B / totalRate) * 100,
      C: (totalRarityRates.C / totalRate) * 100,
      D: (totalRarityRates.D / totalRate) * 100,
      E: (totalRarityRates.E / totalRate) * 100,
      F: (totalRarityRates.F / totalRate) * 100,
    };

    return normalizedRates;
  }

  /**
   * 個別アイテムの確率を計算
   */
  private calculateItemRates(): Map<string, number> {
    const availableItems = this.getAvailableItems();
    const itemCounts = this.countItemsByRarity(availableItems);
    const normalizedRates = this.calculateNormalizedRates(itemCounts);
    
    const itemRates = new Map<string, number>();
    
    availableItems.forEach(item => {
      const rarityRate = normalizedRates[item.rarity as keyof GachaRates];
      const itemsInRarity = itemCounts[item.rarity as keyof GachaRates];
      
      if (itemsInRarity > 0) {
        const individualRate = rarityRate / itemsInRarity;
        itemRates.set(item.id, individualRate);
      }
    });
    
    return itemRates;
  }

  /**
   * 確率に基づいてアイテムを抽選
   */
  private drawItem(excludeRarities: string[] = []): GachaResult | null {
    const availableItems = this.getAvailableItems();
    const filteredItems = excludeRarities.length > 0 
      ? availableItems.filter(item => !excludeRarities.includes(item.rarity))
      : availableItems;
    
    if (filteredItems.length === 0) {
      return null;
    }

    const itemRates = this.calculateItemRates();
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const item of filteredItems) {
      const rate = itemRates.get(item.id) || 0;
      cumulative += rate;
      
      if (random <= cumulative) {
        return {
          itemId: item.id,
          itemName: item.name,
          rarity: item.rarity,
          count: 1
        };
      }
    }

    // フォールバック: 最後のアイテムを返す
    const lastItem = filteredItems[filteredItems.length - 1];
    return {
      itemId: lastItem.id,
      itemName: lastItem.name,
      rarity: lastItem.rarity,
      count: 1
    };
  }

  /**
   * 1回ガチャを実行
   */
  public drawSingle(): GachaResult | null {
    return this.drawItem();
  }

  /**
   * 10連ガチャを実行（最低1つはD以上確定）
   */
  public drawTen(): GachaResult[] {
    const results: GachaResult[] = [];
    
    // 最初の9回は通常抽選
    for (let i = 0; i < 9; i++) {
      const result = this.drawItem();
      if (result) {
        results.push(result);
      }
    }

    // 10回目はD以上確定（既にD以上が出ていない場合）
    const hasRareItem = results.some(result => 
      ['S', 'A', 'B', 'C', 'D'].includes(result.rarity)
    );

    if (hasRareItem) {
      // 既にD以上が出ているので通常抽選
      const result = this.drawItem();
      if (result) {
        results.push(result);
      }
    } else {
      // D以上確定抽選
      const result = this.drawItem(['E', 'F']);
      if (result) {
        results.push(result);
      } else {
        // フォールバック: 通常抽選
        const fallbackResult = this.drawItem();
        if (fallbackResult) {
          results.push(fallbackResult);
        }
      }
    }

    return results;
  }

  /**
   * 現在の確率表示用データを取得
   */
  public getCurrentRates(): { rarity: string; rate: number; items: string[] }[] {
    const availableItems = this.getAvailableItems();
    const itemCounts = this.countItemsByRarity(availableItems);
    const normalizedRates = this.calculateNormalizedRates(itemCounts);
    
    const rateData: { rarity: string; rate: number; items: string[] }[] = [];
    
    Object.entries(normalizedRates).forEach(([rarity, rate]) => {
      if (rate > 0) {
        const itemsInRarity = availableItems
          .filter(item => item.rarity === rarity)
          .map(item => item.name);
        
        rateData.push({
          rarity,
          rate: Math.round(rate * 100) / 100, // 小数点2位まで
          items: itemsInRarity
        });
      }
    });

    return rateData.sort((a, b) => {
      const rarityOrder = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });
  }

  /**
   * ガチャ価格を取得
   */
  public getGachaPrice(): number {
    return 100; // 固定価格
  }

  /**
   * 10連ガチャ価格を取得
   */
  public getTenGachaPrice(): number {
    return this.getGachaPrice() * 10; // 1000G
  }
}
