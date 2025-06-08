import { Item, ItemType, ItemRarity, EquipSlot, EquipSlotType } from '../types';

/**
 * アイテム管理システム
 * アイテムの所持、装備、使用状態を管理する
 */
export class ItemManager {
  private items: Map<string, Item> = new Map();
  private equipSlots: [EquipSlot, EquipSlot];

  constructor() {
    // 装備スロットを初期化（特殊枠、通常枠）
    this.equipSlots = [
      { type: 'special', item: null, used: false },
      { type: 'normal', item: null, used: false }
    ];
  }

  /**
   * アイテムを追加または所持数を増加
   */
  addItem(itemType: ItemType, count: number = 1): void {
    const itemData = this.getItemData(itemType);
    const existingItem = this.items.get(itemType);

    if (existingItem) {
      // 既存アイテムの所持数を増加（上限99個）
      existingItem.count = Math.min(existingItem.count + count, 99);
    } else {
      // 新しいアイテムを追加
      const newItem: Item = {
        id: `${itemType}_${Date.now()}`,
        type: itemType,
        name: itemData.name,
        rarity: itemData.rarity,
        count: Math.min(count, 99),
        description: itemData.description,
        unlockStage: itemData.unlockStage
      };
      this.items.set(itemType, newItem);
    }
  }

  /**
   * アイテムを使用（所持数を減少）
   */
  useItem(itemType: ItemType, count: number = 1): boolean {
    const item = this.items.get(itemType);
    if (!item || item.count < count) {
      return false; // 所持数不足
    }

    item.count -= count;
    if (item.count <= 0) {
      this.items.delete(itemType);
    }
    return true;
  }

  /**
   * アイテムの所持数を取得
   */
  getItemCount(itemType: ItemType): number {
    const item = this.items.get(itemType);
    return item ? item.count : 0;
  }

  /**
   * 所持している全アイテムを取得
   */
  getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  /**
   * 装備可能なアイテムを取得（レア度制限考慮）
   */
  getEquippableItems(slotType: EquipSlotType): Item[] {
    const allItems = this.getAllItems();
    
    if (slotType === 'special') {
      // 特殊枠：すべてのアイテムを装備可能
      return allItems;
    } else {
      // 通常枠：B〜Fレアのみ装備可能
      return allItems.filter(item => !['S', 'A'].includes(item.rarity));
    }
  }

  /**
   * アイテムを装備スロットに装備
   */
  equipItem(itemType: ItemType, slotIndex: 0 | 1): boolean {
    const item = this.items.get(itemType);
    if (!item) {
      return false; // アイテムが存在しない
    }

    const slot = this.equipSlots[slotIndex];
    
    // 装備制限チェック
    if (!this.canEquipToSlot(item, slot.type)) {
      return false; // 装備制限に引っかかる
    }

    // 装備実行
    slot.item = { ...item }; // アイテムのコピーを装備
    slot.used = false; // 使用状態をリセット
    return true;
  }

  /**
   * 装備スロットからアイテムを外す
   */
  unequipItem(slotIndex: 0 | 1): void {
    this.equipSlots[slotIndex].item = null;
    this.equipSlots[slotIndex].used = false;
  }

  /**
   * 装備したアイテムを使用
   */
  useEquippedItem(slotIndex: 0 | 1): boolean {
    const slot = this.equipSlots[slotIndex];
    
    if (!slot.item || slot.used) {
      return false; // アイテムがないか既に使用済み
    }

    slot.used = true;
    return true;
  }

  /**
   * 装備スロットの状態を取得
   */
  getEquipSlots(): [EquipSlot, EquipSlot] {
    return [...this.equipSlots] as [EquipSlot, EquipSlot];
  }

  /**
   * ステージ終了時の処理（未使用アイテムを所持アイテムに戻す）
   */
  onStageEnd(): void {
    for (const slot of this.equipSlots) {
      if (slot.item && slot.used) {
        // 使用したアイテムは所持数から減らす
        this.useItem(slot.item.type, 1);
      }
      // 装備をクリア
      slot.item = null;
      slot.used = false;
    }
  }

  /**
   * アイテムが指定スロットに装備可能かチェック
   */
  private canEquipToSlot(item: Item, slotType: EquipSlotType): boolean {
    if (slotType === 'special') {
      return true; // 特殊枠にはすべてのアイテムを装備可能
    } else {
      return !['S', 'A'].includes(item.rarity); // 通常枠にはS・Aレア以外
    }
  }

  /**
   * アイテムタイプから基本データを取得
   */
  private getItemData(itemType: ItemType): {
    name: string;
    rarity: ItemRarity;
    description: string;
    unlockStage: number;
  } {
    const itemDataMap: Record<ItemType, {
      name: string;
      rarity: ItemRarity;
      description: string;
      unlockStage: number;
    }> = {
      swap: { name: 'スワップ', rarity: 'E', description: '2つの指定ブロックを入れ替える', unlockStage: 1 },
      changeOne: { name: 'チェンジワン', rarity: 'D', description: '指定ブロック1個を指定色に変更', unlockStage: 1 },
      miniBomb: { name: 'ミニ爆弾', rarity: 'F', description: '1マスの指定ブロックを消去', unlockStage: 1 },
      shuffle: { name: 'シャッフル', rarity: 'E', description: '盤面の通常ブロックを再配置', unlockStage: 1 },
      meltingAgent: { name: '溶解剤', rarity: 'E', description: '氷結ブロックの解除に必要な回数を-1', unlockStage: 11 },
      changeArea: { name: 'チェンジエリア', rarity: 'D', description: '隣接する同色ブロック全体を指定色に変更', unlockStage: 11 },
      counterReset: { name: 'カウンター+リセット', rarity: 'F', description: '指定したカウンター+ブロックを通常ブロックにする', unlockStage: 21 },
      bomb: { name: '爆弾', rarity: 'S', description: '3×3の範囲のブロックを消去', unlockStage: 31 },
      addPlus: { name: 'アドプラス', rarity: 'B', description: 'カウンターブロックをカウンター+ブロックに変化', unlockStage: 41 },
      scoreBooster: { name: 'スコアブースター', rarity: 'A', description: '使用後からそのステージの獲得スコアを1.5倍', unlockStage: 51 },
      hammer: { name: 'ハンマー', rarity: 'C', description: '指定した岩ブロック1個を破壊', unlockStage: 61 },
      steelHammer: { name: '鋼鉄ハンマー', rarity: 'B', description: '指定した鋼鉄ブロック1個を破壊', unlockStage: 81 },
      specialHammer: { name: 'スペシャルハンマー', rarity: 'S', description: '指定したブロック1個を破壊', unlockStage: 81 }
    };

    return itemDataMap[itemType];
  }

  /**
   * デバッグ用：アイテム管理状態をコンソール出力
   */
  debugLog(): void {
    console.log('=== ItemManager Debug Info ===');
    console.log('所持アイテム:', Array.from(this.items.entries()));
    console.log('装備スロット:', this.equipSlots);
    console.log('==============================');
  }
}
