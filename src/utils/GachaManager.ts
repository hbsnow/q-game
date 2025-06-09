import { ItemType, ItemRarity, GachaResult } from '../types';
import { ITEM_DATA, getAvailableItemTypes } from '../data/ItemData';

/**
 * ガチャシステム管理クラス
 * アイテムの排出確率計算と抽選を行う
 */
export class GachaManager {
  private static instance: GachaManager;
  private currentStage: number = 1;
  
  // レア度ごとの基準確率
  private readonly baseRarityRates: Record<ItemRarity, number> = {
    S: 0.02,  // 2%
    A: 0.05,  // 5%
    B: 0.08,  // 8%
    C: 0.12,  // 12%
    D: 0.15,  // 15%
    E: 0.20,  // 20%
    F: 0.25   // 25%
  };
  
  // ガチャ価格
  private readonly gachaPrice: number = 100;
  private readonly gacha10Price: number = 1000;

  private constructor() {
    // シングルトンパターン
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): GachaManager {
    if (!GachaManager.instance) {
      GachaManager.instance = new GachaManager();
    }
    return GachaManager.instance;
  }

  /**
   * 現在のステージを設定
   */
  public setCurrentStage(stage: number): void {
    this.currentStage = stage;
  }

  /**
   * 1回ガチャを実行
   */
  public drawGacha(): GachaResult {
    const itemType = this.selectRandomItem();
    const isRare = ['S', 'A'].includes(ITEM_DATA[itemType].rarity);
    
    return {
      items: [{ 
        type: itemType, 
        count: 1 
      }],
      isRare
    };
  }

  /**
   * 10連ガチャを実行（最低1つはDレア以上確定）
   */
  public draw10Gacha(): GachaResult {
    const items: { type: ItemType, count: number }[] = [];
    let hasRareItem = false;
    
    // 10回抽選
    for (let i = 0; i < 10; i++) {
      const itemType = this.selectRandomItem();
      const rarity = ITEM_DATA[itemType].rarity;
      
      // Dレア以上かチェック
      if (['S', 'A', 'B', 'C', 'D'].includes(rarity)) {
        hasRareItem = true;
      }
      
      // 既に同じアイテムが出ているかチェック
      const existingItem = items.find(item => item.type === itemType);
      if (existingItem) {
        existingItem.count++;
      } else {
        items.push({ type: itemType, count: 1 });
      }
    }
    
    // Dレア以上が1つもない場合は、最後の1つをDレア以上に置き換え
    if (!hasRareItem) {
      const dOrAboveItems = this.getAvailableItemsByMinRarity('D');
      if (dOrAboveItems.length > 0) {
        const guaranteedItem = this.selectRandomItemFromList(dOrAboveItems);
        
        // 最後のアイテムを置き換え
        if (items.length > 0) {
          const lastItem = items[items.length - 1];
          if (lastItem.count > 1) {
            lastItem.count--;
            items.push({ type: guaranteedItem, count: 1 });
          } else {
            items[items.length - 1] = { type: guaranteedItem, count: 1 };
          }
        } else {
          items.push({ type: guaranteedItem, count: 1 });
        }
      }
    }
    
    // S・Aレアが含まれているかチェック
    const isRare = items.some(item => 
      ['S', 'A'].includes(ITEM_DATA[item.type].rarity)
    );
    
    return { items, isRare };
  }

  /**
   * ガチャ価格を取得
   */
  public getGachaPrice(): number {
    return this.gachaPrice;
  }

  /**
   * 10連ガチャ価格を取得
   */
  public getGacha10Price(): number {
    return this.gacha10Price;
  }

  /**
   * 現在のステージで出現可能なアイテムからランダムに1つ選択
   */
  private selectRandomItem(): ItemType {
    // 現在のステージで出現可能なアイテムタイプを取得
    const availableItemTypes = getAvailableItemTypes(this.currentStage);
    
    // 各レア度の出現アイテム数をカウント
    const itemCountsByRarity: Record<ItemRarity, number> = {
      S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0
    };
    
    availableItemTypes.forEach(type => {
      const rarity = ITEM_DATA[type].rarity;
      itemCountsByRarity[rarity]++;
    });
    
    // 各レア度の合計確率を計算
    const totalRarityRates: Record<ItemRarity, number> = {
      S: this.baseRarityRates.S * itemCountsByRarity.S,
      A: this.baseRarityRates.A * itemCountsByRarity.A,
      B: this.baseRarityRates.B * itemCountsByRarity.B,
      C: this.baseRarityRates.C * itemCountsByRarity.C,
      D: this.baseRarityRates.D * itemCountsByRarity.D,
      E: this.baseRarityRates.E * itemCountsByRarity.E,
      F: this.baseRarityRates.F * itemCountsByRarity.F
    };
    
    // 全体の確率合計を計算
    const totalRate = Object.values(totalRarityRates).reduce((sum, rate) => sum + rate, 0);
    
    // 各レア度の正規化確率を計算
    const normalizedRates: Record<ItemRarity, number> = {
      S: totalRarityRates.S / totalRate,
      A: totalRarityRates.A / totalRate,
      B: totalRarityRates.B / totalRate,
      C: totalRarityRates.C / totalRate,
      D: totalRarityRates.D / totalRate,
      E: totalRarityRates.E / totalRate,
      F: totalRarityRates.F / totalRate
    };
    
    // レア度を抽選
    const rand = Math.random();
    let cumulativeRate = 0;
    let selectedRarity: ItemRarity = 'F'; // デフォルト値
    
    for (const [rarity, rate] of Object.entries(normalizedRates) as [ItemRarity, number][]) {
      cumulativeRate += rate;
      if (rand < cumulativeRate) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // 選択されたレア度のアイテムをランダムに選択
    const itemsOfSelectedRarity = availableItemTypes.filter(
      type => ITEM_DATA[type].rarity === selectedRarity
    );
    
    if (itemsOfSelectedRarity.length === 0) {
      // 該当するレア度のアイテムがない場合は、利用可能なアイテムからランダムに選択
      return this.selectRandomItemFromList(availableItemTypes);
    }
    
    return this.selectRandomItemFromList(itemsOfSelectedRarity);
  }

  /**
   * 指定されたリストからランダムにアイテムを選択
   */
  private selectRandomItemFromList(itemList: ItemType[]): ItemType {
    if (itemList.length === 0) {
      throw new Error('Item list is empty');
    }
    const randomIndex = Math.floor(Math.random() * itemList.length);
    return itemList[randomIndex];
  }

  /**
   * 指定されたレア度以上のアイテムを取得
   */
  private getAvailableItemsByMinRarity(minRarity: ItemRarity): ItemType[] {
    const rarityOrder: ItemRarity[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const minRarityIndex = rarityOrder.indexOf(minRarity);
    
    if (minRarityIndex === -1) {
      throw new Error(`Invalid rarity: ${minRarity}`);
    }
    
    const validRarities = rarityOrder.slice(0, minRarityIndex + 1);
    const availableItemTypes = getAvailableItemTypes(this.currentStage);
    
    return availableItemTypes.filter(type => 
      validRarities.includes(ITEM_DATA[type].rarity)
    );
  }

  /**
   * 各レア度の排出確率を取得
   */
  public getRarityRates(): Record<ItemRarity, number> {
    // 現在のステージで出現可能なアイテムタイプを取得
    const availableItemTypes = getAvailableItemTypes(this.currentStage);
    
    // 各レア度の出現アイテム数をカウント
    const itemCountsByRarity: Record<ItemRarity, number> = {
      S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0
    };
    
    availableItemTypes.forEach(type => {
      const rarity = ITEM_DATA[type].rarity;
      itemCountsByRarity[rarity]++;
    });
    
    // 各レア度の合計確率を計算
    const totalRarityRates: Record<ItemRarity, number> = {
      S: this.baseRarityRates.S * itemCountsByRarity.S,
      A: this.baseRarityRates.A * itemCountsByRarity.A,
      B: this.baseRarityRates.B * itemCountsByRarity.B,
      C: this.baseRarityRates.C * itemCountsByRarity.C,
      D: this.baseRarityRates.D * itemCountsByRarity.D,
      E: this.baseRarityRates.E * itemCountsByRarity.E,
      F: this.baseRarityRates.F * itemCountsByRarity.F
    };
    
    // 全体の確率合計を計算
    const totalRate = Object.values(totalRarityRates).reduce((sum, rate) => sum + rate, 0);
    
    // 各レア度の正規化確率を計算（パーセント表示）
    const normalizedRates: Record<ItemRarity, number> = {
      S: (totalRarityRates.S / totalRate) * 100,
      A: (totalRarityRates.A / totalRate) * 100,
      B: (totalRarityRates.B / totalRate) * 100,
      C: (totalRarityRates.C / totalRate) * 100,
      D: (totalRarityRates.D / totalRate) * 100,
      E: (totalRarityRates.E / totalRate) * 100,
      F: (totalRarityRates.F / totalRate) * 100
    };
    
    return normalizedRates;
  }

  /**
   * 現在のステージで出現可能なアイテムのリストを取得
   */
  public getAvailableItems(): { type: ItemType, rarity: ItemRarity, name: string }[] {
    const availableItemTypes = getAvailableItemTypes(this.currentStage);
    
    return availableItemTypes.map(type => ({
      type,
      rarity: ITEM_DATA[type].rarity,
      name: ITEM_DATA[type].name
    }));
  }
}
