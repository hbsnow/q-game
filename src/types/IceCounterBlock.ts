import { Block, ObstacleBlock, UpdateResult } from './Block';

/**
 * 氷結カウンター+ブロック
 * 隣接する同色ブロックが1回消去されると氷結が解除され、
 * 指定数以上の同色ブロックグループで消去可能なカウンター+ブロックになる
 */
export class IceCounterPlusBlock implements ObstacleBlock {
  x: number;
  y: number;
  color: string;
  type: 'iceCounterPlus';
  counterValue: number;
  sprite?: Phaser.GameObjects.Sprite;
  
  constructor(x: number, y: number, color: string, counterValue: number, sprite?: Phaser.GameObjects.Sprite) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = 'iceCounterPlus';
    this.counterValue = counterValue;
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
      // 同じ色のブロックがあれば氷結を解除してカウンター+ブロックに変換
      const counterPlusBlock: Block = {
        x: this.x,
        y: this.y,
        color: this.color,
        type: 'counterPlus',
        counterValue: this.counterValue,
        sprite: this.sprite
      };
      
      return {
        converted: true,
        block: counterPlusBlock,
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
   * 氷結カウンター+ブロックは直接消去できない
   */
  isRemovable(): boolean {
    return false;
  }
}

/**
 * 氷結カウンター-ブロック
 * 隣接する同色ブロックが1回消去されると氷結が解除され、
 * 指定数以下の同色ブロックグループで消去可能なカウンター-ブロックになる
 */
export class IceCounterMinusBlock implements ObstacleBlock {
  x: number;
  y: number;
  color: string;
  type: 'iceCounterMinus';
  counterValue: number;
  sprite?: Phaser.GameObjects.Sprite;
  
  constructor(x: number, y: number, color: string, counterValue: number, sprite?: Phaser.GameObjects.Sprite) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = 'iceCounterMinus';
    this.counterValue = counterValue;
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
      // 同じ色のブロックがあれば氷結を解除してカウンター-ブロックに変換
      const counterMinusBlock: Block = {
        x: this.x,
        y: this.y,
        color: this.color,
        type: 'counterMinus',
        counterValue: this.counterValue,
        sprite: this.sprite
      };
      
      return {
        converted: true,
        block: counterMinusBlock,
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
   * 氷結カウンター-ブロックは直接消去できない
   */
  isRemovable(): boolean {
    return false;
  }
}
