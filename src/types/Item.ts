/**
 * アイテムの基本インターフェース
 */
export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  count: number;
  unlockStage: number;
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
