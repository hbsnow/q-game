// ブロックの種類
export type BlockType = 'normal' | 'ice1' | 'ice2' | 'counter' | 'counterPlus' | 'rock' | 'steel' | 'iceCounter' | 'iceCounterPlus';

// ブロックの色
export type BlockColor = 'blue' | 'lightBlue' | 'seaGreen' | 'coralRed' | 'sandGold' | 'pearlWhite';

// ブロックの基本インターフェース
export interface Block {
  id: string;
  type: BlockType;
  color: BlockColor;
  x: number;
  y: number;
  // 妨害ブロック用の追加プロパティ
  iceLevel?: number; // 氷結レベル（1 or 2）
  counterValue?: number; // カウンター値
  isCounterPlus?: boolean; // カウンター+かどうか
}

// アイテムのレア度
export type ItemRarity = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

// アイテムの種類
export type ItemType = 
  | 'swap' | 'changeOne' | 'miniBomb' | 'shuffle'
  | 'meltingAgent' | 'changeArea' | 'counterReset'
  | 'bomb' | 'addPlus' | 'scoreBooster'
  | 'hammer' | 'steelHammer' | 'specialHammer';

// アイテムインターフェース
export interface Item {
  id: string;
  type: ItemType;
  name: string;
  rarity: ItemRarity;
  count: number;
  description: string;
  unlockStage: number; // 開放ステージ
}

// 装備枠の種類
export type EquipSlotType = 'special' | 'normal';

// 装備スロット
export interface EquipSlot {
  type: EquipSlotType;
  item: Item | null;
  used: boolean; // そのステージで使用済みかどうか
}

// ゲーム状態
export interface GameState {
  currentStage: number;
  gold: number;
  score: number;
  targetScore: number;
  items: Item[];
  equipSlots: [EquipSlot, EquipSlot]; // 特殊枠、通常枠
  isScoreBoosterActive: boolean;
}

// ステージ設定
export interface StageConfig {
  stage: number;
  colors: number; // 使用する色数（3-6）
  targetScore: number;
  obstacles: ObstacleConfig[];
}

// 妨害ブロック配置設定
export interface ObstacleConfig {
  type: BlockType;
  positions: { x: number; y: number }[];
  // 妨害ブロック固有のパラメータ
  iceLevel?: number;
  counterValue?: number;
  isCounterPlus?: boolean;
}

// ガチャ結果
export interface GachaResult {
  items: Item[];
  isRare: boolean; // S・Aレア含有フラグ
}

// スコア計算結果
export interface ScoreResult {
  baseScore: number;
  allClearBonus: boolean;
  scoreBoosterActive: boolean;
  finalScore: number;
}

// ゲーム設定
export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  gameWidth: number;
  gameHeight: number;
  blockSize: number;
  colors: BlockColor[];
  gachaPrice: number;
  gacha10Price: number;
}

// 座標
export interface Position {
  x: number;
  y: number;
}

// ブロックグループ（消去対象）
export interface BlockGroup {
  blocks: Block[];
  count: number;
  color: BlockColor;
}
