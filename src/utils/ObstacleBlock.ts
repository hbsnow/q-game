import { Block, BlockType, BlockColor } from '../types';
import { generateId } from './index';

/**
 * 妨害ブロック基底クラス
 * 全ての妨害ブロックの共通機能を提供する
 */
export abstract class ObstacleBlock {
  protected block: Block;
  
  /**
   * コンストラクタ
   * @param type ブロックタイプ
   * @param color ブロック色
   * @param x X座標
   * @param y Y座標
   */
  constructor(type: BlockType, color: BlockColor, x: number, y: number) {
    this.block = {
      id: generateId(),
      type,
      color,
      x,
      y
    };
  }
  
  /**
   * ブロックデータを取得
   */
  public getBlock(): Block {
    return this.block;
  }
  
  /**
   * ブロックIDを取得
   */
  public getId(): string {
    return this.block.id;
  }
  
  /**
   * ブロックタイプを取得
   */
  public getType(): BlockType {
    return this.block.type;
  }
  
  /**
   * ブロック色を取得
   */
  public getColor(): BlockColor {
    return this.block.color;
  }
  
  /**
   * X座標を取得
   */
  public getX(): number {
    return this.block.x;
  }
  
  /**
   * Y座標を取得
   */
  public getY(): number {
    return this.block.y;
  }
  
  /**
   * 座標を設定
   */
  public setPosition(x: number, y: number): void {
    this.block.x = x;
    this.block.y = y;
  }
  
  /**
   * 妨害ブロックが消去可能かどうかを判定
   * @param adjacentBlocks 隣接するブロック
   */
  public abstract isRemovable(adjacentBlocks: Block[]): boolean;
  
  /**
   * 妨害ブロックの状態を更新
   * @param adjacentBlocks 隣接するブロック
   * @returns 状態が変化したかどうか
   */
  public abstract updateState(adjacentBlocks: Block[]): boolean;
  
  /**
   * 妨害ブロックの描画情報を取得
   * @returns 描画に必要な情報
   */
  public abstract getRenderInfo(): {
    mainColor: BlockColor;
    overlayType: string;
    text?: string;
    alpha?: number;
    tint?: number;
  };
}

/**
 * 氷結ブロック Lv1
 * 隣接する同色ブロックが1回消去されると解除される
 */
export class IceBlock1 extends ObstacleBlock {
  constructor(color: BlockColor, x: number, y: number) {
    super('ice1', color, x, y);
    this.block.iceLevel = 1;
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 氷結状態では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 隣接する同色ブロックが消去されたかチェック
    const sameColorAdjacent = adjacentBlocks.some(block => 
      block.color === this.block.color
    );
    
    if (sameColorAdjacent) {
      // 氷結解除：通常ブロックに変化
      this.block.type = 'normal';
      delete this.block.iceLevel;
      return true;
    }
    
    return false;
  }
  
  public getRenderInfo() {
    return {
      mainColor: this.block.color,
      overlayType: 'ice1',
      alpha: 0.7, // 氷の透明度
      tint: 0xADD8E6 // 氷の色合い
    };
  }
}

/**
 * 氷結ブロック Lv2
 * 隣接する同色ブロックが2回消去されると解除される
 */
export class IceBlock2 extends ObstacleBlock {
  constructor(color: BlockColor, x: number, y: number) {
    super('ice2', color, x, y);
    this.block.iceLevel = 2;
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 氷結状態では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 隣接する同色ブロックが消去されたかチェック
    const sameColorAdjacent = adjacentBlocks.some(block => 
      block.color === this.block.color
    );
    
    if (sameColorAdjacent && this.block.iceLevel) {
      // 氷結レベルを下げる
      this.block.iceLevel--;
      
      // 氷結レベルが0になったら通常ブロックに変化
      if (this.block.iceLevel <= 0) {
        this.block.type = 'normal';
        delete this.block.iceLevel;
      } else {
        // 氷結Lv1に変化
        this.block.type = 'ice1';
      }
      
      return true;
    }
    
    return false;
  }
  
  public getRenderInfo() {
    return {
      mainColor: this.block.color,
      overlayType: 'ice2',
      alpha: 0.5, // より濃い氷の透明度
      tint: 0x87CEFA // より濃い氷の色合い
    };
  }
}

/**
 * カウンター+ブロック
 * 指定数以上の同色ブロックグループで消去可能
 */
export class CounterPlusBlock extends ObstacleBlock {
  constructor(color: BlockColor, x: number, y: number, counterValue: number = 3) {
    super('counterPlus', color, x, y);
    this.block.counterValue = counterValue;
    this.block.isCounterPlus = true;
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    if (!this.block.counterValue) return false;
    
    // 同色ブロックの数をカウント（自身を含む）
    const sameColorCount = 1 + adjacentBlocks.filter(block => 
      block.color === this.block.color
    ).length;
    
    // 指定数以上なら消去可能
    return sameColorCount >= this.block.counterValue;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // カウンターブロックは状態変化なし
    return false;
  }
  
  public getRenderInfo() {
    return {
      mainColor: this.block.color,
      overlayType: 'counterPlus',
      text: `${this.block.counterValue}+`,
      tint: 0xFFFFFF // 白色
    };
  }
}

/**
 * カウンターブロック
 * ちょうど指定数の同色ブロックグループで消去可能
 */
export class CounterBlock extends ObstacleBlock {
  constructor(color: BlockColor, x: number, y: number, counterValue: number = 3) {
    super('counter', color, x, y);
    this.block.counterValue = counterValue;
    this.block.isCounterPlus = false;
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    if (!this.block.counterValue) return false;
    
    // 同色ブロックの数をカウント（自身を含む）
    const sameColorCount = 1 + adjacentBlocks.filter(block => 
      block.color === this.block.color
    ).length;
    
    // ちょうど指定数なら消去可能
    return sameColorCount === this.block.counterValue;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // カウンターブロックは状態変化なし
    return false;
  }
  
  public getRenderInfo() {
    return {
      mainColor: this.block.color,
      overlayType: 'counter',
      text: `${this.block.counterValue}`,
      tint: 0xFFFFFF // 白色
    };
  }
}

/**
 * 岩ブロック
 * アイテムでのみ消去可能
 */
export class RockBlock extends ObstacleBlock {
  constructor(x: number, y: number) {
    // 岩ブロックは固定色
    super('rock', 'pearlWhite', x, y);
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 通常操作では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 岩ブロックは状態変化なし
    return false;
  }
  
  public getRenderInfo() {
    return {
      mainColor: 'pearlWhite',
      overlayType: 'rock',
      tint: 0x808080 // 灰色
    };
  }
}

/**
 * 鋼鉄ブロック
 * 特殊アイテムでのみ消去可能、重力の影響を受けない
 */
export class SteelBlock extends ObstacleBlock {
  constructor(x: number, y: number) {
    // 鋼鉄ブロックは固定色
    super('steel', 'pearlWhite', x, y);
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 通常操作では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 鋼鉄ブロックは状態変化なし
    return false;
  }
  
  public getRenderInfo() {
    return {
      mainColor: 'pearlWhite',
      overlayType: 'steel',
      tint: 0xC0C0C0 // 銀色
    };
  }
}

/**
 * 氷結カウンター+ブロック
 * 氷結が解除されるとカウンター+ブロックになる
 */
export class IceCounterPlusBlock extends ObstacleBlock {
  constructor(color: BlockColor, x: number, y: number, counterValue: number = 3) {
    super('iceCounterPlus', color, x, y);
    this.block.iceLevel = 1;
    this.block.counterValue = counterValue;
    this.block.isCounterPlus = true;
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 氷結状態では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 隣接する同色ブロックが消去されたかチェック
    const sameColorAdjacent = adjacentBlocks.some(block => 
      block.color === this.block.color
    );
    
    if (sameColorAdjacent) {
      // 氷結解除：カウンター+ブロックに変化
      this.block.type = 'counterPlus';
      delete this.block.iceLevel;
      return true;
    }
    
    return false;
  }
  
  public getRenderInfo() {
    return {
      mainColor: this.block.color,
      overlayType: 'iceCounterPlus',
      text: `${this.block.counterValue}+`,
      alpha: 0.7,
      tint: 0xADD8E6
    };
  }
}

/**
 * 氷結カウンターブロック
 * 氷結が解除されるとカウンターブロックになる
 */
export class IceCounterBlock extends ObstacleBlock {
  constructor(color: BlockColor, x: number, y: number, counterValue: number = 3) {
    super('iceCounter', color, x, y);
    this.block.iceLevel = 1;
    this.block.counterValue = counterValue;
    this.block.isCounterPlus = false;
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 氷結状態では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 隣接する同色ブロックが消去されたかチェック
    const sameColorAdjacent = adjacentBlocks.some(block => 
      block.color === this.block.color
    );
    
    if (sameColorAdjacent) {
      // 氷結解除：カウンターブロックに変化
      this.block.type = 'counter';
      delete this.block.iceLevel;
      return true;
    }
    
    return false;
  }
  
  public getRenderInfo() {
    return {
      mainColor: this.block.color,
      overlayType: 'iceCounter',
      text: `${this.block.counterValue}`,
      alpha: 0.7,
      tint: 0xADD8E6
    };
  }
}

/**
 * 妨害ブロックファクトリー
 * 妨害ブロックの生成を担当
 */
export class ObstacleBlockFactory {
  /**
   * 妨害ブロックを生成
   */
  public static createObstacleBlock(
    type: BlockType,
    color: BlockColor,
    x: number,
    y: number,
    params: {
      iceLevel?: number;
      counterValue?: number;
      isCounterPlus?: boolean;
    } = {}
  ): ObstacleBlock {
    switch (type) {
      case 'ice1':
        return new IceBlock1(color, x, y);
      case 'ice2':
        return new IceBlock2(color, x, y);
      case 'counterPlus':
        return new CounterPlusBlock(color, x, y, params.counterValue || 3);
      case 'counter':
        return new CounterBlock(color, x, y, params.counterValue || 3);
      case 'rock':
        return new RockBlock(x, y);
      case 'steel':
        return new SteelBlock(x, y);
      case 'iceCounterPlus':
        return new IceCounterPlusBlock(color, x, y, params.counterValue || 3);
      case 'iceCounter':
        return new IceCounterBlock(color, x, y, params.counterValue || 3);
      default:
        throw new Error(`Unknown obstacle block type: ${type}`);
    }
  }
  
  /**
   * 既存のブロックデータから妨害ブロックを生成
   */
  public static createFromBlock(block: Block): ObstacleBlock {
    return this.createObstacleBlock(
      block.type,
      block.color,
      block.x,
      block.y,
      {
        iceLevel: block.iceLevel,
        counterValue: block.counterValue,
        isCounterPlus: block.isCounterPlus
      }
    );
  }
}
