import { ItemType, ItemRarity } from '../types';

/**
 * アイテムの基本データ定義
 * モックデータから実データへの移行のため、アイテムの基本情報を一元管理
 */
export interface ItemData {
  type: ItemType;
  name: string;
  rarity: ItemRarity;
  description: string;
  unlockStage: number;
}

/**
 * 全アイテムの基本データ
 */
export const ITEM_DATA: Record<ItemType, ItemData> = {
  swap: {
    type: 'swap',
    name: 'スワップ',
    rarity: 'E',
    description: '2つの指定ブロックを入れ替える',
    unlockStage: 1
  },
  changeOne: {
    type: 'changeOne',
    name: 'チェンジワン',
    rarity: 'D',
    description: '指定ブロック1個を指定色に変更',
    unlockStage: 1
  },
  miniBomb: {
    type: 'miniBomb',
    name: 'ミニ爆弾',
    rarity: 'F',
    description: '1マスの指定ブロックを消去',
    unlockStage: 1
  },
  shuffle: {
    type: 'shuffle',
    name: 'シャッフル',
    rarity: 'E',
    description: '盤面の通常ブロックを再配置',
    unlockStage: 1
  },
  meltingAgent: {
    type: 'meltingAgent',
    name: '溶解剤',
    rarity: 'E',
    description: '氷結ブロックの解除に必要な回数を-1',
    unlockStage: 11
  },
  changeArea: {
    type: 'changeArea',
    name: 'チェンジエリア',
    rarity: 'D',
    description: '隣接する同色ブロック全体を指定色に変更',
    unlockStage: 11
  },
  counterReset: {
    type: 'counterReset',
    name: 'カウンター+リセット',
    rarity: 'F',
    description: '指定したカウンター+ブロックを通常ブロックにする',
    unlockStage: 21
  },
  bomb: {
    type: 'bomb',
    name: '爆弾',
    rarity: 'S',
    description: '3×3の範囲のブロックを消去',
    unlockStage: 31
  },
  addPlus: {
    type: 'addPlus',
    name: 'アドプラス',
    rarity: 'B',
    description: 'カウンターブロックをカウンター+ブロックに変化',
    unlockStage: 41
  },
  scoreBooster: {
    type: 'scoreBooster',
    name: 'スコアブースター',
    rarity: 'A',
    description: '使用後からそのステージの獲得スコアを1.5倍',
    unlockStage: 51
  },
  hammer: {
    type: 'hammer',
    name: 'ハンマー',
    rarity: 'C',
    description: '指定した岩ブロック1個を破壊',
    unlockStage: 61
  },
  steelHammer: {
    type: 'steelHammer',
    name: '鋼鉄ハンマー',
    rarity: 'B',
    description: '指定した鋼鉄ブロック1個を破壊',
    unlockStage: 81
  },
  specialHammer: {
    type: 'specialHammer',
    name: 'スペシャルハンマー',
    rarity: 'S',
    description: '指定したブロック1個を破壊',
    unlockStage: 81
  }
};

/**
 * レア度に応じた色を取得
 */
export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'S': return '#FFD700'; // 金色
    case 'A': return '#FF4444'; // 赤色
    case 'B': return '#8A2BE2'; // 紫色
    case 'C': return '#4169E1'; // 青色
    case 'D': return '#32CD32'; // 緑色
    case 'E': return '#FFFFFF'; // 白色
    case 'F': return '#808080'; // 灰色
    default: return '#FFFFFF';
  }
}

/**
 * レア度に応じた星の数を取得
 */
export function getRarityStars(rarity: ItemRarity): number {
  switch (rarity) {
    case 'S': return 5;
    case 'A': return 4;
    case 'B': return 3;
    case 'C': return 2;
    case 'D': return 1;
    case 'E': return 0;
    case 'F': return 0;
    default: return 0;
  }
}

/**
 * アイテムが特殊枠に装備可能かチェック
 */
export function canEquipToSpecialSlot(): boolean {
  return true; // 特殊枠にはすべてのアイテムを装備可能
}

/**
 * アイテムが通常枠に装備可能かチェック
 */
export function canEquipToNormalSlot(rarity: ItemRarity): boolean {
  return !['S', 'A'].includes(rarity); // S・Aレア以外は通常枠に装備可能
}

/**
 * 現在のステージで出現可能なアイテムタイプを取得
 */
export function getAvailableItemTypes(currentStage: number): ItemType[] {
  return Object.values(ITEM_DATA)
    .filter(item => item.unlockStage <= currentStage)
    .map(item => item.type);
}

/**
 * アイテムタイプからアイテムデータを取得
 */
export function getItemData(itemType: ItemType): ItemData {
  return ITEM_DATA[itemType];
}
