import { Block } from '../types/Block';
import { IceBlockLv1 } from '../types/IceBlock';

/**
 * ブロックを生成するファクトリークラス
 */
export class BlockFactory {
  /**
   * 通常ブロックを生成
   * @param x X座標
   * @param y Y座標
   * @param color 色
   * @returns 通常ブロック
   */
  static createNormalBlock(x: number, y: number, color: string): Block {
    return {
      x,
      y,
      color,
      type: 'normal'
    };
  }
  
  /**
   * 氷結ブロック Lv1 を生成
   * @param x X座標
   * @param y Y座標
   * @param color 色
   * @returns 氷結ブロック Lv1
   */
  static createIceBlockLv1(x: number, y: number, color: string): IceBlockLv1 {
    return new IceBlockLv1(x, y, color);
  }
}
