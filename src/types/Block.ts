/**
 * ブロックの種類を表す型
 */
export type BlockType = 'normal' | 'iceLv1' | 'iceLv2' | 'counterPlus' | 'counterMinus' | 'rock' | 'steel';

/**
 * ブロックの基本インターフェース
 */
export interface Block {
  x: number;
  y: number;
  color: string;
  type: string;
  sprite?: Phaser.GameObjects.Sprite | null;
}

/**
 * 通常ブロックの型
 */
export interface NormalBlock extends Block {
  type: 'normal';
}

/**
 * 妨害ブロックの基本型
 */
export interface ObstacleBlock extends Block {
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
