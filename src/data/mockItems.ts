import { Item, ItemRarity, ItemType } from '../types';

// モックアイテムデータ（Phase 3用）
export const mockItems: Item[] = [
  {
    id: 'swap_1',
    type: 'swap',
    name: 'スワップ',
    rarity: 'E',
    count: 3,
    description: '2つの指定ブロックを入れ替える',
    unlockStage: 1
  },
  {
    id: 'changeOne_1',
    type: 'changeOne',
    name: 'チェンジワン',
    rarity: 'D',
    count: 2,
    description: '指定ブロック1個を指定色に変更',
    unlockStage: 1
  },
  {
    id: 'miniBomb_1',
    type: 'miniBomb',
    name: 'ミニ爆弾',
    rarity: 'F',
    count: 8,
    description: '1マスの指定ブロックを消去',
    unlockStage: 1
  },
  {
    id: 'shuffle_1',
    type: 'shuffle',
    name: 'シャッフル',
    rarity: 'E',
    count: 5,
    description: '盤面の通常ブロックを再配置',
    unlockStage: 1
  },
  {
    id: 'meltingAgent_1',
    type: 'meltingAgent',
    name: '溶解剤',
    rarity: 'E',
    count: 1,
    description: '氷結ブロックの解除に必要な回数を-1',
    unlockStage: 11
  },
  {
    id: 'changeArea_1',
    type: 'changeArea',
    name: 'チェンジエリア',
    rarity: 'D',
    count: 1,
    description: '隣接する同色ブロック全体を指定色に変更',
    unlockStage: 11
  },
  {
    id: 'bomb_1',
    type: 'bomb',
    name: '爆弾',
    rarity: 'S',
    count: 3,
    description: '3×3の範囲のブロックを消去',
    unlockStage: 31
  },
  {
    id: 'scoreBooster_1',
    type: 'scoreBooster',
    name: 'スコアブースター',
    rarity: 'A',
    count: 1,
    description: '使用後からそのステージの獲得スコアを1.5倍',
    unlockStage: 51
  },
  {
    id: 'hammer_1',
    type: 'hammer',
    name: 'ハンマー',
    rarity: 'C',
    count: 1,
    description: '指定した岩ブロック1個を破壊',
    unlockStage: 61
  },
  {
    id: 'specialHammer_1',
    type: 'specialHammer',
    name: 'スペシャルハンマー',
    rarity: 'S',
    count: 1,
    description: '指定したブロック1個を破壊',
    unlockStage: 81
  }
];

// レア度に応じた色を取得
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

// レア度に応じた星の数を取得
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

// アイテムが特殊枠に装備可能かチェック
export function canEquipToSpecialSlot(item: Item): boolean {
  return true; // 特殊枠にはすべてのアイテムを装備可能
}

// アイテムが通常枠に装備可能かチェック
export function canEquipToNormalSlot(item: Item): boolean {
  return !['S', 'A'].includes(item.rarity); // S・Aレア以外は通常枠に装備可能
}
