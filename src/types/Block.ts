/**
 * ブロックの基本インターフェース
 */
export interface Block {
  x: number;
  y: number;
  color: string;
  type: string;
  sprite?: Phaser.GameObjects.Sprite | null;
  counterValue?: number; // カウンターブロック用の値
}

/**
 * 通常ブロックの型
 */
export interface NormalBlock extends Block {
  type: 'normal';
}

/**
 * カウンター+ブロックの型
 */
export interface CounterPlusBlock extends Block {
  type: 'counterPlus';
  counterValue: number; // 指定数以上の同色ブロックグループで消去可能
}

/**
 * カウンター-ブロックの型
 */
export interface CounterMinusBlock extends Block {
  type: 'counterMinus';
  counterValue: number; // 指定数以下の同色ブロックグループで消去可能
}

/**
 * 妨害ブロックの基本型
 */
export interface ObstacleBlock extends Block {
  type: string; // 'iceLv1', 'iceLv2', 'counterPlus', 'counterMinus', etc.
  updateState(adjacentBlocks: Block[]): UpdateResult;
  isRemovable(): boolean;
}

/**
 * 状態更新の結果を表す型
 */
export interface UpdateResult {
  converted: boolean;
  block?: Block;
  stateChanged: boolean;
}

/**
 * ブロックタイプの列挙型
 */
export enum BlockType {
  NORMAL = 'normal',
  ICE_LV1 = 'iceLv1',
  ICE_LV2 = 'iceLv2',
  COUNTER_PLUS = 'counterPlus',
  COUNTER_MINUS = 'counterMinus',
  ICE_COUNTER_PLUS = 'iceCounterPlus',
  ICE_COUNTER_MINUS = 'iceCounterMinus',
  ROCK = 'rock',
  STEEL = 'steel'
}
