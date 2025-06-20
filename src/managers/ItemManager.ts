/**
 * アイテム管理システム
 */

import { Item, ItemRarity } from '../types/Item';
import { ITEM_DATA } from '../data/ItemData';

/**
 * アイテムの所持状況
 */
export interface ItemInventory {
  [itemId: string]: number; // アイテムID -> 所持数
}

/**
 * 装備中のアイテム
 */
export interface EquippedItems {
  specialSlot: Item | null; // 特殊枠（S・Aレア専用、通常アイテムも装備可能）
  normalSlot: Item | null;  // 通常枠（B〜Fレア専用）
}

/**
 * アイテム使用状態（ステージ内でのみ有効）
 */
export interface ItemUsageState {
  specialSlotUsed: boolean;
  normalSlotUsed: boolean;
}

/**
 * アイテム管理クラス（シングルトン）
 */
export class ItemManager {
  private static instance: ItemManager;
  private inventory: ItemInventory = {};
  private equippedItems: EquippedItems = {
    specialSlot: null,
    normalSlot: null
  };
  private usageState: ItemUsageState = {
    specialSlotUsed: false,
    normalSlotUsed: false
  };

  private constructor() {
    // プライベートコンストラクタでシングルトンを保証
    console.log('[ItemManager] ItemManager初期化');
    console.log('[ItemManager] 初期インベントリ:', this.inventory);
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ItemManager {
    if (!ItemManager.instance) {
      ItemManager.instance = new ItemManager();
    }
    return ItemManager.instance;
  }

  /**
   * アイテムを追加
   */
  addItem(itemId: string, count: number = 1): void {
    // デバッグ用ログ出力
    console.log(`[ItemManager] アイテム追加: ${itemId} x${count}`);
    console.log(`[ItemManager] 追加前の所持数: ${this.inventory[itemId] || 0}`);
    
    if (this.inventory[itemId]) {
      this.inventory[itemId] += count;
    } else {
      this.inventory[itemId] = count;
    }
    
    // 所持上限チェック（99個まで）
    if (this.inventory[itemId] > 99) {
      this.inventory[itemId] = 99;
    }
    
    console.log(`[ItemManager] 追加後の所持数: ${this.inventory[itemId]}`);
    console.log(`[ItemManager] 現在のインベントリ:`, this.inventory);
  }

  /**
   * アイテムを消費
   */
  consumeItem(itemId: string, count: number = 1): boolean {
    if (!this.inventory[itemId] || this.inventory[itemId] < count) {
      return false;
    }
    
    this.inventory[itemId] -= count;
    if (this.inventory[itemId] <= 0) {
      delete this.inventory[itemId];
    }
    
    return true;
  }

  /**
   * アイテムの所持数を取得
   */
  getItemCount(itemId: string): number {
    return this.inventory[itemId] || 0;
  }

  /**
   * 全アイテムの所持状況を取得
   */
  getInventory(): ItemInventory {
    return { ...this.inventory };
  }

  /**
   * アイテムを装備
   */
  equipItem(item: Item, slot: 'special' | 'normal'): boolean {
    // 装備制限チェック
    if (slot === 'normal' && (item.rarity === ItemRarity.S || item.rarity === ItemRarity.A)) {
      return false; // 通常枠にS・Aレアは装備不可
    }
    
    // 所持チェック
    if (this.getItemCount(item.id) <= 0) {
      return false;
    }
    
    if (slot === 'special') {
      this.equippedItems.specialSlot = item;
    } else {
      this.equippedItems.normalSlot = item;
    }
    
    return true;
  }

  /**
   * アイテムの装備を解除
   */
  unequipItem(slot: 'special' | 'normal'): void {
    if (slot === 'special') {
      this.equippedItems.specialSlot = null;
    } else {
      this.equippedItems.normalSlot = null;
    }
  }

  /**
   * 装備中のアイテムを取得
   */
  getEquippedItems(): EquippedItems {
    return {
      specialSlot: this.equippedItems.specialSlot,
      normalSlot: this.equippedItems.normalSlot
    };
  }

  /**
   * アイテムを使用
   */
  useItem(slot: 'special' | 'normal'): boolean {
    // 既に使用済みかチェック
    if (slot === 'special' && this.usageState.specialSlotUsed) {
      return false;
    }
    if (slot === 'normal' && this.usageState.normalSlotUsed) {
      return false;
    }
    
    // 装備されているかチェック
    const item = slot === 'special' ? this.equippedItems.specialSlot : this.equippedItems.normalSlot;
    if (!item) {
      return false;
    }
    
    // 使用済み状態に設定
    if (slot === 'special') {
      this.usageState.specialSlotUsed = true;
    } else {
      this.usageState.normalSlotUsed = true;
    }
    
    return true;
  }

  /**
   * アイテムが使用済みかチェック
   */
  isItemUsed(slot: 'special' | 'normal'): boolean {
    return slot === 'special' ? this.usageState.specialSlotUsed : this.usageState.normalSlotUsed;
  }

  /**
   * ステージクリア時の処理（使用したアイテムを消費）
   */
  onStageComplete(): void {
    // 使用したアイテムを所持数から減らす
    if (this.usageState.specialSlotUsed && this.equippedItems.specialSlot) {
      this.consumeItem(this.equippedItems.specialSlot.id, 1);
    }
    
    if (this.usageState.normalSlotUsed && this.equippedItems.normalSlot) {
      this.consumeItem(this.equippedItems.normalSlot.id, 1);
    }
    
    // 使用状態をリセット
    this.resetUsageState();
  }

  /**
   * ステージリトライ時の処理（使用状態のみリセット）
   */
  onStageRetry(): void {
    // 使用状態をリセット（所持数は減らさない）
    this.resetUsageState();
  }

  /**
   * 使用状態をリセット
   */
  resetUsageState(): void {
    this.usageState = {
      specialSlotUsed: false,
      normalSlotUsed: false
    };
  }

  /**
   * 装備をクリア
   */
  clearEquipment(): void {
    this.equippedItems = {
      specialSlot: null,
      normalSlot: null
    };
    this.resetUsageState();
  }

  /**
   * アイテムが装備可能かチェック
   */
  canEquipItem(item: Item, slot: 'special' | 'normal'): boolean {
    // 所持チェック
    if (this.getItemCount(item.id) <= 0) {
      return false;
    }
    
    // 装備制限チェック
    if (slot === 'normal' && (item.rarity === ItemRarity.S || item.rarity === ItemRarity.A)) {
      return false; // 通常枠にS・Aレアは装備不可
    }
    
    return true;
  }

  /**
   * 総アイテム数を取得
   */
  getTotalItemCount(): number {
    return Object.values(this.inventory).reduce((total, count) => total + count, 0);
  }

  /**
   * デバッグ用：インベントリ情報を文字列で取得
   */
  getInventoryInfo(): string {
    const items = Object.entries(this.inventory)
      .map(([id, count]) => `${id}: ${count}`)
      .join(', ');
    return `アイテム: ${items || 'なし'} (総数: ${this.getTotalItemCount()})`;
  }

  /**
   * デバッグ用：装備情報を文字列で取得
   */
  getEquipmentInfo(): string {
    const special = this.equippedItems.specialSlot?.name || '未装備';
    const normal = this.equippedItems.normalSlot?.name || '未装備';
    const specialUsed = this.usageState.specialSlotUsed ? '(使用済み)' : '';
    const normalUsed = this.usageState.normalSlotUsed ? '(使用済み)' : '';
    
    return `特殊枠: ${special}${specialUsed}, 通常枠: ${normal}${normalUsed}`;
  }

  /**
   * アイテムデータを取得
   */
  getItemData(itemId: string): any {
    return ITEM_DATA[itemId] || null;
  }
}
