import { Block, BlockType, BlockColor } from '../types';
import { generateId } from './index';

/**
 * 妨害ブロック基底クラス
 * 
 * 重要な原則:
 * - 単一エンティティの原則: 妨害ブロックは「オーバーレイ」ではなく「単一のエンティティ」
 * - マス占有の原則: 1つのマスには1種類のブロックのみ存在する
 * - 視覚的一貫性: 妨害ブロックは見た目でも単一のブロックとして表現
 */
export abstract class ObstacleBlock {
  protected id: string;
  protected type: BlockType;
  protected color: BlockColor;
  protected x: number;
  protected y: number;
  
  /**
   * コンストラクタ
   * @param type ブロックタイプ
   * @param color ブロック色
   * @param x X座標
   * @param y Y座標
   */
  constructor(type: BlockType, color: BlockColor, x: number, y: number) {
    this.id = generateId();
    this.type = type;
    this.color = color;
    this.x = x;
    this.y = y;
  }
  
  /**
   * ブロックデータを取得
   */
  public getBlock(): Block {
    return {
      id: this.id,
      type: this.type,
      color: this.color,
      x: this.x,
      y: this.y,
      ...this.getAdditionalProperties()
    };
  }
  
  /**
   * 追加プロパティを取得（サブクラスでオーバーライド）
   */
  protected getAdditionalProperties(): Record<string, any> {
    return {};
  }
  
  /**
   * ブロックIDを取得
   */
  public getId(): string {
    return this.id;
  }
  
  /**
   * ブロックタイプを取得
   */
  public getType(): BlockType {
    return this.type;
  }
  
  /**
   * ブロック色を取得
   */
  public getColor(): BlockColor {
    return this.color;
  }
  
  /**
   * X座標を取得
   */
  public getX(): number {
    return this.x;
  }
  
  /**
   * Y座標を取得
   */
  public getY(): number {
    return this.y;
  }
  
  /**
   * 座標を設定
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
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
    textureKey: string;
    text?: string;
    tint?: number;
  };
  
  /**
   * 重力の影響を受けるかどうか
   */
  public isAffectedByGravity(): boolean {
    // デフォルトでは重力の影響を受ける
    return true;
  }
}

/**
 * 氷結ブロック Lv1
 * 隣接する同色ブロックが1回消去されると解除される
 */
export class IceBlock1 extends ObstacleBlock {
  constructor(color: BlockColor, x: number, y: number) {
    super('ice1', color, x, y);
  }
  
  protected getAdditionalProperties(): Record<string, any> {
    return { iceLevel: 1 };
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 氷結状態では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 隣接する同色ブロックが消去されたかチェック
    const sameColorAdjacent = adjacentBlocks.some(block => 
      block.color === this.color
    );
    
    if (sameColorAdjacent) {
      // 氷結解除：通常ブロックに変化
      this.type = 'normal';
      return true;
    }
    
    return false;
  }
  
  public getRenderInfo() {
    return {
      textureKey: 'ice1Texture',
      tint: this.getColorTint(this.color)
    };
  }
  
  private getColorTint(color: BlockColor): number {
    const colorMap: Record<BlockColor, number> = {
      'blue': 0x1E5799,
      'lightBlue': 0x7DB9E8,
      'seaGreen': 0x2E8B57,
      'coralRed': 0xFF6347,
      'sandGold': 0xF4D03F,
      'pearlWhite': 0xF5F5F5
    };
    
    return colorMap[color] || 0xFFFFFF;
  }
}

/**
 * 氷結ブロック Lv2
 * 隣接する同色ブロックが2回消去されると解除される
 */
export class IceBlock2 extends ObstacleBlock {
  private iceLevel: number = 2;
  
  constructor(color: BlockColor, x: number, y: number) {
    super('ice2', color, x, y);
  }
  
  protected getAdditionalProperties(): Record<string, any> {
    return { iceLevel: this.iceLevel };
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 氷結状態では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 隣接する同色ブロックが消去されたかチェック
    const sameColorAdjacent = adjacentBlocks.some(block => 
      block.color === this.color
    );
    
    if (sameColorAdjacent) {
      // 氷結レベルを下げる
      this.iceLevel--;
      
      // 氷結レベルが0になったら通常ブロックに変化
      if (this.iceLevel <= 0) {
        this.type = 'normal';
      } else {
        // 氷結Lv1に変化
        this.type = 'ice1';
      }
      
      return true;
    }
    
    return false;
  }
  
  public getRenderInfo() {
    return {
      textureKey: 'ice2Texture',
      tint: this.getColorTint(this.color)
    };
  }
  
  private getColorTint(color: BlockColor): number {
    const colorMap: Record<BlockColor, number> = {
      'blue': 0x1E5799,
      'lightBlue': 0x7DB9E8,
      'seaGreen': 0x2E8B57,
      'coralRed': 0xFF6347,
      'sandGold': 0xF4D03F,
      'pearlWhite': 0xF5F5F5
    };
    
    return colorMap[color] || 0xFFFFFF;
  }
}

/**
 * カウンター+ブロック
 * 指定数以上の同色ブロックグループで消去可能
 */
export class CounterPlusBlock extends ObstacleBlock {
  private counterValue: number;
  
  constructor(color: BlockColor, x: number, y: number, counterValue: number = 3) {
    super('counterPlus', color, x, y);
    this.counterValue = counterValue;
  }
  
  protected getAdditionalProperties(): Record<string, any> {
    return { 
      counterValue: this.counterValue,
      isCounterPlus: true
    };
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 同色ブロックの数をカウント（自身を含む）
    const sameColorCount = 1 + adjacentBlocks.filter(block => 
      block.color === this.color
    ).length;
    
    // 指定数以上なら消去可能
    return sameColorCount >= this.counterValue;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // カウンターブロックは状態変化なし
    return false;
  }
  
  public getRenderInfo() {
    return {
      textureKey: 'counterPlusTexture',
      text: `${this.counterValue}+`,
      tint: this.getColorTint(this.color)
    };
  }
  
  private getColorTint(color: BlockColor): number {
    const colorMap: Record<BlockColor, number> = {
      'blue': 0x1E5799,
      'lightBlue': 0x7DB9E8,
      'seaGreen': 0x2E8B57,
      'coralRed': 0xFF6347,
      'sandGold': 0xF4D03F,
      'pearlWhite': 0xF5F5F5
    };
    
    return colorMap[color] || 0xFFFFFF;
  }
}

/**
 * カウンターブロック
 * ちょうど指定数の同色ブロックグループで消去可能
 */
export class CounterBlock extends ObstacleBlock {
  private counterValue: number;
  
  constructor(color: BlockColor, x: number, y: number, counterValue: number = 3) {
    super('counter', color, x, y);
    this.counterValue = counterValue;
  }
  
  protected getAdditionalProperties(): Record<string, any> {
    return { 
      counterValue: this.counterValue,
      isCounterPlus: false
    };
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 同色ブロックの数をカウント（自身を含む）
    const sameColorCount = 1 + adjacentBlocks.filter(block => 
      block.color === this.color
    ).length;
    
    // ちょうど指定数なら消去可能
    return sameColorCount === this.counterValue;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // カウンターブロックは状態変化なし
    return false;
  }
  
  public getRenderInfo() {
    return {
      textureKey: 'counterTexture',
      text: `${this.counterValue}`,
      tint: this.getColorTint(this.color)
    };
  }
  
  private getColorTint(color: BlockColor): number {
    const colorMap: Record<BlockColor, number> = {
      'blue': 0x1E5799,
      'lightBlue': 0x7DB9E8,
      'seaGreen': 0x2E8B57,
      'coralRed': 0xFF6347,
      'sandGold': 0xF4D03F,
      'pearlWhite': 0xF5F5F5
    };
    
    return colorMap[color] || 0xFFFFFF;
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
      textureKey: 'rockTexture'
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
      textureKey: 'steelTexture'
    };
  }
  
  public isAffectedByGravity(): boolean {
    // 鋼鉄ブロックは重力の影響を受けない
    return false;
  }
}

/**
 * 氷結カウンター+ブロック
 * 氷結が解除されるとカウンター+ブロックになる
 */
export class IceCounterPlusBlock extends ObstacleBlock {
  private counterValue: number;
  
  constructor(color: BlockColor, x: number, y: number, counterValue: number = 3) {
    super('iceCounterPlus', color, x, y);
    this.counterValue = counterValue;
  }
  
  protected getAdditionalProperties(): Record<string, any> {
    return { 
      iceLevel: 1,
      counterValue: this.counterValue,
      isCounterPlus: true
    };
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 氷結状態では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 隣接する同色ブロックが消去されたかチェック
    const sameColorAdjacent = adjacentBlocks.some(block => 
      block.color === this.color
    );
    
    if (sameColorAdjacent) {
      // 氷結解除：カウンター+ブロックに変化
      this.type = 'counterPlus';
      return true;
    }
    
    return false;
  }
  
  public getRenderInfo() {
    return {
      textureKey: 'iceCounterPlusTexture',
      text: `${this.counterValue}+`,
      tint: this.getColorTint(this.color)
    };
  }
  
  private getColorTint(color: BlockColor): number {
    const colorMap: Record<BlockColor, number> = {
      'blue': 0x1E5799,
      'lightBlue': 0x7DB9E8,
      'seaGreen': 0x2E8B57,
      'coralRed': 0xFF6347,
      'sandGold': 0xF4D03F,
      'pearlWhite': 0xF5F5F5
    };
    
    return colorMap[color] || 0xFFFFFF;
  }
}

/**
 * 氷結カウンターブロック
 * 氷結が解除されるとカウンターブロックになる
 */
export class IceCounterBlock extends ObstacleBlock {
  private counterValue: number;
  
  constructor(color: BlockColor, x: number, y: number, counterValue: number = 3) {
    super('iceCounter', color, x, y);
    this.counterValue = counterValue;
  }
  
  protected getAdditionalProperties(): Record<string, any> {
    return { 
      iceLevel: 1,
      counterValue: this.counterValue,
      isCounterPlus: false
    };
  }
  
  public isRemovable(adjacentBlocks: Block[]): boolean {
    // 氷結状態では消去不可
    return false;
  }
  
  public updateState(adjacentBlocks: Block[]): boolean {
    // 隣接する同色ブロックが消去されたかチェック
    const sameColorAdjacent = adjacentBlocks.some(block => 
      block.color === this.color
    );
    
    if (sameColorAdjacent) {
      // 氷結解除：カウンターブロックに変化
      this.type = 'counter';
      return true;
    }
    
    return false;
  }
  
  public getRenderInfo() {
    return {
      textureKey: 'iceCounterTexture',
      text: `${this.counterValue}`,
      tint: this.getColorTint(this.color)
    };
  }
  
  private getColorTint(color: BlockColor): number {
    const colorMap: Record<BlockColor, number> = {
      'blue': 0x1E5799,
      'lightBlue': 0x7DB9E8,
      'seaGreen': 0x2E8B57,
      'coralRed': 0xFF6347,
      'sandGold': 0xF4D03F,
      'pearlWhite': 0xF5F5F5
    };
    
    return colorMap[color] || 0xFFFFFF;
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
      counterValue?: number;
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
        counterValue: block.counterValue
      }
    );
  }
}
