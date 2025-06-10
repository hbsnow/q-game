import { Item, ItemType, ItemRarity, EquipSlot, EquipSlotType } from '../types';
import { ITEM_DATA, getItemData } from '../data/ItemData';

/**
 * アイテム管理システム
 * アイテムの所持、装備、使用状態を管理する
 */
export class ItemManager {
  private items: Map<string, Item> = new Map();
  private equipSlots: [EquipSlot, EquipSlot];
  private usedItemIds: Set<string> = new Set(); // 使用済みアイテムのIDを管理

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
    const itemData = getItemData(itemType);
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
    
    // 使用済みアイテムとして記録
    if (slot.item) {
      this.usedItemIds.add(slot.item.id);
    }
    
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
    
    // 使用済みアイテムリストをクリア
    this.usedItemIds.clear();
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
   * アイテムが使用済みかチェック
   */
  isItemUsed(itemId: string): boolean {
    return this.usedItemIds.has(itemId);
  }

  /**
   * アイテムを使用済みとしてマーク
   */
  markItemAsUsed(itemId: string): void {
    this.usedItemIds.add(itemId);
  }

  /**
   * 使用済みアイテムリストをリセット
   */
  resetUsedItems(): void {
    this.usedItemIds.clear();
  }

  /**
   * アイテムをリセット（全て削除）
   */
  public resetItems(): void {
    this.items = new Map();
    this.equipSlots = [
      { type: 'special', item: null, used: false },
      { type: 'normal', item: null, used: false }
    ];
  }

  /**
   * デバッグ用：アイテム管理状態をコンソール出力
   */
  debugLog(): void {
    console.log('=== ItemManager Debug Info ===');
    console.log('所持アイテム:', Array.from(this.items.entries()));
    console.log('装備スロット:', this.equipSlots);
    console.log('使用済みアイテム:', Array.from(this.usedItemIds));
    console.log('==============================');
  }
}
