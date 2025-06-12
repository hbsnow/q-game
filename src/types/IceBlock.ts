import { Block, ObstacleBlock, UpdateResult } from './Block';

/**
 * 氷結ブロック Lv1
 * 隣接する同色ブロックが1回消去されると解除される
 */
export class IceBlockLv1 implements ObstacleBlock {
  x: number;
  y: number;
  color: string;
  type: 'iceLv1';
  sprite?: Phaser.GameObjects.Sprite;
  
  constructor(x: number, y: number, color: string, sprite?: Phaser.GameObjects.Sprite) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = 'iceLv1';
    this.sprite = sprite;
  }
  
  /**
   * 隣接ブロックが消去された時の状態更新
   * @param adjacentBlocks 隣接するブロック
   * @returns 更新結果
   */
  updateState(adjacentBlocks: Block[]): UpdateResult {
    // 隣接ブロックに同じ色のブロックがあるか確認
    const hasSameColorBlock = adjacentBlocks.some(block => block && block.color === this.color);
    
    if (hasSameColorBlock) {
      // 同じ色のブロックがあれば通常ブロックに変換
      const normalBlock: Block = {
        x: this.x,
        y: this.y,
        color: this.color,
        type: 'normal',
        sprite: this.sprite
      };
      
      return {
        converted: true,
        block: normalBlock,
        stateChanged: true
      };
    }
    
    // 変化なし
    return {
      converted: false,
      stateChanged: false
    };
  }
  
  /**
   * このブロックが消去可能かどうか
   * 氷結ブロックは直接消去できない
   */
  isRemovable(): boolean {
    return false;
  }
}
