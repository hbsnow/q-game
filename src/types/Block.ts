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

/**
 * ブロックの基本インターフェース
 */
export interface Block {
  x: number;
  y: number;
  color: string;
  type: string | BlockType; // 段階的移行のためのユニオン型
  sprite?: Phaser.GameObjects.Sprite | null;
  counterValue?: number; // カウンターブロック用の値
  count?: number; // カウンターブロック用の値（counterValueのエイリアス）
}

/**
 * 通常ブロックの型
 */
export interface NormalBlock extends Block {
  type: BlockType.NORMAL;
}

/**
 * カウンター+ブロックの型
 */
export interface CounterPlusBlock extends Block {
  type: BlockType.COUNTER_PLUS;
  counterValue: number; // 指定数以上の同色ブロックグループで消去可能
}

/**
 * カウンター-ブロックの型
 */
export interface CounterMinusBlock extends Block {
  type: BlockType.COUNTER_MINUS;
  counterValue: number; // 指定数以下の同色ブロックグループで消去可能
}

/**
 * 妨害ブロックの基本型
 */
export interface ObstacleBlock extends Block {
  type: string | BlockType; // ユニオン型を使用
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
