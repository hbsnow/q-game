/**
 * アイテムデータ定義
 */

import { Item, ItemRarity } from '../types/Item';

/**
 * 全アイテムデータ
 */
export const ITEM_DATA: { [key: string]: Item } = {
  // 基本アイテム（開放ステージ1）
  swap: {
    id: 'swap',
    name: 'スワップ',
    description: '2つの指定ブロックを入れ替える',
    rarity: ItemRarity.E,
    unlockStage: 1,
    effectType: 'swap'
  },
  
  changeOne: {
    id: 'changeOne',
    name: 'チェンジワン',
    description: '指定ブロック1個を指定色に変更',
    rarity: ItemRarity.D,
    unlockStage: 1,
    effectType: 'changeOne'
  },
  
  miniBomb: {
    id: 'miniBomb',
    name: 'ミニ爆弾',
    description: '1マスの指定ブロックを消去（通常ブロックのみ）',
    rarity: ItemRarity.F,
    unlockStage: 1,
    effectType: 'miniBomb'
  },
  
  shuffle: {
    id: 'shuffle',
    name: 'シャッフル',
    description: '通常ブロックのみを再配置',
    rarity: ItemRarity.E,
    unlockStage: 1,
    effectType: 'shuffle'
  },
  
  // 中級アイテム（開放ステージ11）
  meltingAgent: {
    id: 'meltingAgent',
    name: '溶解剤',
    description: '氷結ブロックの解除に必要な隣接消去回数を-1する',
    rarity: ItemRarity.E,
    unlockStage: 11,
    effectType: 'meltingAgent'
  },
  
  changeArea: {
    id: 'changeArea',
    name: 'チェンジエリア',
    description: '指定ブロックと同じ色で隣接している全てのブロックを指定色に変更',
    rarity: ItemRarity.D,
    unlockStage: 11,
    effectType: 'changeArea'
  },
  
  // 高級アイテム（開放ステージ21以降）
  counterReset: {
    id: 'counterReset',
    name: 'カウンター+リセット',
    description: '指定したカウンター+ブロックを通常ブロックにする',
    rarity: ItemRarity.F,
    unlockStage: 21,
    effectType: 'counterReset'
  },
  
  bomb: {
    id: 'bomb',
    name: '爆弾',
    description: '指定した場所を中心に3×3の範囲のブロックを消去',
    rarity: ItemRarity.S,
    unlockStage: 31,
    effectType: 'bomb'
  },
  
  adPlus: {
    id: 'adPlus',
    name: 'アドプラス',
    description: 'カウンターブロックをカウンター+ブロックに変化させる',
    rarity: ItemRarity.B,
    unlockStage: 41,
    effectType: 'adPlus'
  },
  
  scoreBooster: {
    id: 'scoreBooster',
    name: 'スコアブースター',
    description: '使用後からそのステージの獲得スコアを1.5倍にする',
    rarity: ItemRarity.A,
    unlockStage: 51,
    effectType: 'scoreBooster'
  },
  
  hammer: {
    id: 'hammer',
    name: 'ハンマー',
    description: '指定した岩ブロック1個を破壊',
    rarity: ItemRarity.C,
    unlockStage: 61,
    effectType: 'hammer'
  },
  
  steelHammer: {
    id: 'steelHammer',
    name: '鋼鉄ハンマー',
    description: '指定した鋼鉄ブロック1個を破壊',
    rarity: ItemRarity.B,
    unlockStage: 81,
    effectType: 'steelHammer'
  },
  
  specialHammer: {
    id: 'specialHammer',
    name: 'スペシャルハンマー',
    description: '指定したブロック1個を破壊',
    rarity: ItemRarity.S,
    unlockStage: 81,
    effectType: 'specialHammer'
  }
};

/**
 * 指定されたアイテムIDのアイテムデータを取得
 */
export function getItemData(itemId: string): Item | null {
  return ITEM_DATA[itemId] || null;
}

/**
 * 指定されたステージで出現可能なアイテムを取得
 */
export function getAvailableItems(stage: number): Item[] {
  return Object.values(ITEM_DATA).filter(item => item.unlockStage <= stage);
}

/**
 * 指定されたレア度のアイテムを取得
 */
export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return Object.values(ITEM_DATA).filter(item => item.rarity === rarity);
}

/**
 * 基本アイテム（ステージ1から使用可能）を取得
 */
export function getBasicItems(): Item[] {
  return getAvailableItems(1);
}

/**
 * レア度の色を取得
 */
export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case ItemRarity.S: return '#FFD700'; // 金色
    case ItemRarity.A: return '#FF0000'; // 赤色
    case ItemRarity.B: return '#800080'; // 紫色
    case ItemRarity.C: return '#0000FF'; // 青色
    case ItemRarity.D: return '#008000'; // 緑色
    case ItemRarity.E: return '#FFFFFF'; // 白色
    case ItemRarity.F: return '#808080'; // 灰色
    default: return '#FFFFFF';
  }
}

/**
   * レア度の星の数を取得
   */
export function getRarityStars(rarity: ItemRarity): number {
  switch (rarity) {
    case ItemRarity.S: return 5;
    case ItemRarity.A: return 4;
    case ItemRarity.B: return 3;
    case ItemRarity.C: return 2;
    case ItemRarity.D: return 1;
    case ItemRarity.E: return 0;
    case ItemRarity.F: return 0;
    default: return 0;
  }
}

/**
 * アイテムが特殊枠専用かチェック
 */
export function isSpecialSlotItem(item: Item): boolean {
  return item.rarity === ItemRarity.S || item.rarity === ItemRarity.A;
}

/**
 * アイテムが通常枠に装備可能かチェック
 */
export function canEquipToNormalSlot(item: Item): boolean {
  return !isSpecialSlotItem(item);
}
