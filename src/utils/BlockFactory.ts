import { Block, BlockType } from '../types/Block';

/**
 * ブロックファクトリークラス
 * 様々な種類のブロックを生成する
 */
export class BlockFactory {
  /**
   * 通常ブロックを作成
   */
  createNormalBlock(x: number, y: number, color: string): Block {
    return {
      x,
      y,
      color,
      type: BlockType.NORMAL
    };
  }
  
  /**
   * 氷結ブロック Lv1 を作成
   */
  createIceBlockLv1(x: number, y: number, color: string): Block {
    return {
      x,
      y,
      color,
      type: BlockType.ICE_LV1
    };
  }
  
  /**
   * 氷結ブロック Lv2 を作成
   */
  createIceBlockLv2(x: number, y: number, color: string): Block {
    return {
      x,
      y,
      color,
      type: BlockType.ICE_LV2
    };
  }
  
  /**
   * カウンター+ブロックを作成
   * @param x X座標
   * @param y Y座標
   * @param color 色
   * @param counterValue カウンター値（指定数以上の同色ブロックグループで消去可能）
   */
  createCounterPlusBlock(x: number, y: number, color: string, counterValue: number): Block {
    return {
      x,
      y,
      color,
      type: BlockType.COUNTER_PLUS,
      counterValue
    };
  }
  
  /**
   * カウンター-ブロックを作成
   * @param x X座標
   * @param y Y座標
   * @param color 色
   * @param counterValue カウンター値（指定数以下の同色ブロックグループで消去可能）
   */
  createCounterMinusBlock(x: number, y: number, color: string, counterValue: number): Block {
    return {
      x,
      y,
      color,
      type: BlockType.COUNTER_MINUS,
      counterValue
    };
  }
  
  /**
   * 氷結カウンター+ブロックを作成
   * @param x X座標
   * @param y Y座標
   * @param color 色
   * @param counterValue カウンター値（指定数以上の同色ブロックグループで消去可能）
   */
  createIceCounterPlusBlock(x: number, y: number, color: string, counterValue: number): Block {
    return {
      x,
      y,
      color,
      type: BlockType.ICE_COUNTER_PLUS,
      counterValue
    };
  }
  
  /**
   * 氷結カウンター-ブロックを作成
   * @param x X座標
   * @param y Y座標
   * @param color 色
   * @param counterValue カウンター値（指定数以下の同色ブロックグループで消去可能）
   */
  createIceCounterMinusBlock(x: number, y: number, color: string, counterValue: number): Block {
    return {
      x,
      y,
      color,
      type: BlockType.ICE_COUNTER_MINUS,
      counterValue
    };
  }
  
  /**
   * 岩ブロックを作成
   */
  createRockBlock(x: number, y: number): Block {
    return {
      x,
      y,
      color: '#808080', // 灰色
      type: BlockType.ROCK
    };
  }
  
  /**
   * 鋼鉄ブロックを作成
   */
  createSteelBlock(x: number, y: number): Block {
    return {
      x,
      y,
      color: '#C0C0C0', // シルバー
      type: BlockType.STEEL
    };
  }
}
