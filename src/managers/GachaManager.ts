/**
 * ガチャ管理システム
 */

import { Item, ItemRarity } from '../types/Item';
import { ITEM_DATA, getAvailableItems } from '../data/ItemData';

/**
 * ガチャ結果
 */
export interface GachaResult {
  items: Item[];
  totalCost: number;
}

/**
 * 個別アイテムの排出確率情報
 */
export interface ItemDropRate {
  item: Item;
  rate: number; // パーセンテージ
}

/**
 * レア度別の基準確率（1アイテムあたり）
 */
const BASE_RARITY_RATES = {
  [ItemRarity.S]: 0.02, // 2%
  [ItemRarity.A]: 0.05, // 5%
  [ItemRarity.B]: 0.08, // 8%
  [ItemRarity.C]: 0.12, // 12%
  [ItemRarity.D]: 0.15, // 15%
  [ItemRarity.E]: 0.2,  // 20%
  [ItemRarity.F]: 0.25, // 25%
};

/**
 * ガチャ管理クラス
 */
export class GachaManager {
  private static readonly SINGLE_COST = 100; // 1回のガチャコスト
  private static readonly MULTI_COUNT = 10;  // 10連ガチャの回数

  /**
   * 1回ガチャを実行
   */
  static drawSingle(currentStage: number): GachaResult {
    const availableItems = getAvailableItems(currentStage);
    const drawnItem = this.drawRandomItem(availableItems);
    
    return {
      items: [drawnItem],
      totalCost: this.SINGLE_COST
    };
  }

  /**
   * 10連ガチャを実行
   */
  static drawMulti(currentStage: number): GachaResult {
    const availableItems = getAvailableItems(currentStage);
    const drawnItems: Item[] = [];
    
    // 9回は通常抽選
    for (let i = 0; i < this.MULTI_COUNT - 1; i++) {
      drawnItems.push(this.drawRandomItem(availableItems));
    }
    
    // 最後の1回はD以上確定
    const guaranteedItem = this.drawGuaranteedItem(availableItems);
    drawnItems.push(guaranteedItem);
    
    return {
      items: drawnItems,
      totalCost: this.SINGLE_COST * this.MULTI_COUNT
    };
  }

  /**
   * 現在のステージでの各アイテムの排出確率を取得
   */
  static getDropRates(currentStage: number): ItemDropRate[] {
    const availableItems = getAvailableItems(currentStage);
    const rates = this.calculateItemRates(availableItems);
    
    return availableItems.map(item => ({
      item,
      rate: rates[item.id] || 0
    })).sort((a, b) => b.rate - a.rate); // 確率の高い順にソート
  }

  /**
   * レア度別の排出確率を取得
   */
  static getRarityRates(currentStage: number): Record<ItemRarity, number> {
    const availableItems = getAvailableItems(currentStage);
    const itemRates = this.calculateItemRates(availableItems);
    
    const rarityRates: Record<ItemRarity, number> = {
      [ItemRarity.S]: 0,
      [ItemRarity.A]: 0,
      [ItemRarity.B]: 0,
      [ItemRarity.C]: 0,
      [ItemRarity.D]: 0,
      [ItemRarity.E]: 0,
      [ItemRarity.F]: 0,
    };
    
    // 各アイテムの確率をレア度別に合計
    availableItems.forEach(item => {
      rarityRates[item.rarity] += itemRates[item.id] || 0;
    });
    
    return rarityRates;
  }

  /**
   * ガチャの必要コストを取得
   */
  static getCosts(): { single: number; multi: number } {
    return {
      single: this.SINGLE_COST,
      multi: this.SINGLE_COST * this.MULTI_COUNT
    };
  }

  /**
   * ランダムにアイテムを抽選
   */
  private static drawRandomItem(availableItems: Item[]): Item {
    const rates = this.calculateItemRates(availableItems);
    const random = Math.random() * 100; // 0-100の範囲
    
    let cumulative = 0;
    for (const item of availableItems) {
      cumulative += rates[item.id] || 0;
      if (random <= cumulative) {
        return item;
      }
    }
    
    // フォールバック（通常は到達しない）
    return availableItems[availableItems.length - 1];
  }

  /**
   * D以上確定でアイテムを抽選
   */
  private static drawGuaranteedItem(availableItems: Item[]): Item {
    // D以上のアイテムのみをフィルタ
    const guaranteedItems = availableItems.filter(item => 
      item.rarity === ItemRarity.S ||
      item.rarity === ItemRarity.A ||
      item.rarity === ItemRarity.B ||
      item.rarity === ItemRarity.C ||
      item.rarity === ItemRarity.D
    );
    
    if (guaranteedItems.length === 0) {
      // D以上がない場合は通常抽選
      return this.drawRandomItem(availableItems);
    }
    
    return this.drawRandomItem(guaranteedItems);
  }

  /**
   * 各アイテムの排出確率を計算
   */
  private static calculateItemRates(availableItems: Item[]): Record<string, number> {
    // レア度別のアイテム数をカウント
    const itemCounts: Record<ItemRarity, number> = {
      [ItemRarity.S]: 0,
      [ItemRarity.A]: 0,
      [ItemRarity.B]: 0,
      [ItemRarity.C]: 0,
      [ItemRarity.D]: 0,
      [ItemRarity.E]: 0,
      [ItemRarity.F]: 0,
    };
    
    availableItems.forEach(item => {
      itemCounts[item.rarity]++;
    });
    
    // 各レア度の合計確率を計算
    const totalRarityRates: Record<ItemRarity, number> = {
      [ItemRarity.S]: 0,
      [ItemRarity.A]: 0,
      [ItemRarity.B]: 0,
      [ItemRarity.C]: 0,
      [ItemRarity.D]: 0,
      [ItemRarity.E]: 0,
      [ItemRarity.F]: 0,
    };
    
    Object.keys(itemCounts).forEach(rarityKey => {
      const rarity = rarityKey as ItemRarity;
      totalRarityRates[rarity] = BASE_RARITY_RATES[rarity] * itemCounts[rarity];
    });
    
    // 全体を100%に正規化
    const totalRate = Object.values(totalRarityRates).reduce((sum, rate) => sum + rate, 0);
    
    const normalizedRarityRates: Record<ItemRarity, number> = {
      [ItemRarity.S]: 0,
      [ItemRarity.A]: 0,
      [ItemRarity.B]: 0,
      [ItemRarity.C]: 0,
      [ItemRarity.D]: 0,
      [ItemRarity.E]: 0,
      [ItemRarity.F]: 0,
    };
    
    Object.keys(totalRarityRates).forEach(rarityKey => {
      const rarity = rarityKey as ItemRarity;
      normalizedRarityRates[rarity] = (totalRarityRates[rarity] / totalRate) * 100;
    });
    
    // 個別アイテムの確率を計算
    const itemRates: Record<string, number> = {};
    
    availableItems.forEach(item => {
      const rarityRate = normalizedRarityRates[item.rarity];
      const itemsInRarity = itemCounts[item.rarity];
      itemRates[item.id] = rarityRate / itemsInRarity;
    });
    
    return itemRates;
  }

  /**
   * ガチャシミュレーション（テスト用）
   */
  static simulate(currentStage: number, drawCount: number): Record<string, number> {
    const results: Record<string, number> = {};
    const availableItems = getAvailableItems(currentStage);
    
    // 結果カウンターを初期化
    availableItems.forEach(item => {
      results[item.id] = 0;
    });
    
    // 指定回数抽選
    for (let i = 0; i < drawCount; i++) {
      const item = this.drawRandomItem(availableItems);
      results[item.id]++;
    }
    
    return results;
  }
}
