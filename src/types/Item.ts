/**
 * アイテムのレア度
 */
export enum ItemRarity {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F'
}

/**
 * アイテムの基本インターフェース
 */
export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  unlockStage: number;
  effectType: ItemEffectType;
}

/**
 * アイテムの効果タイプ
 */
export type ItemEffectType = 
  | 'swap'
  | 'changeOne'
  | 'miniBomb'
  | 'shuffle'
  | 'meltingAgent'
  | 'changeArea'
  | 'counterReset'
  | 'bomb'
  | 'adPlus'
  | 'scoreBooster'
  | 'hammer'
  | 'steelHammer'
  | 'specialHammer';
