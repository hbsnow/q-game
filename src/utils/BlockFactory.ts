import { Block } from '../types/Block';

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
      type: 'normal'
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
      type: 'iceLv1'
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
      type: 'iceLv2'
    };
  }
  
  /**
   * カウンター+ブロックを作成
   */
  createCounterPlusBlock(x: number, y: number, color: string, count: number): Block {
    return {
      x,
      y,
      color,
      type: 'counterPlus',
      count
    } as Block;
  }
  
  /**
   * カウンターブロックを作成
   */
  createCounterBlock(x: number, y: number, color: string, count: number): Block {
    return {
      x,
      y,
      color,
      type: 'counter',
      count
    } as Block;
  }
  
  /**
   * 岩ブロックを作成
   */
  createRockBlock(x: number, y: number): Block {
    return {
      x,
      y,
      color: '#808080', // 灰色
      type: 'rock'
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
      type: 'steel'
    };
  }
}
