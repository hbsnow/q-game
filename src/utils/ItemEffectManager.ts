import { Block, BlockColor, ItemType } from '../types';
import { GameScene } from '../scenes/GameScene';

/**
 * アイテム効果管理クラス
 * 各アイテムの効果を実装し、ゲームシーンと連携する
 */
export class ItemEffectManager {
  private gameScene: GameScene;
  private isProcessing: boolean = false;

  constructor(gameScene: GameScene) {
    this.gameScene = gameScene;
  }

  /**
   * アイテム効果を実行
   * @param itemType アイテムタイプ
   * @param params アイテム固有のパラメータ
   * @returns 実行成功したかどうか
   */
  async executeItemEffect(itemType: ItemType, ...params: any[]): Promise<boolean> {
    if (this.isProcessing) {
      return false; // 処理中は実行不可
    }

    this.isProcessing = true;
    let result = false;

    try {
      switch (itemType) {
        case 'swap':
          result = await this.executeSwap(params[0], params[1]);
          break;
        case 'changeOne':
          result = await this.executeChangeOne(params[0], params[1]);
          break;
        case 'miniBomb':
          result = await this.executeMiniBomb(params[0]);
          break;
        case 'shuffle':
          result = await this.executeShuffle();
          break;
        // 他のアイテム効果は後で実装
        default:
          console.error(`Unknown item type: ${itemType}`);
          result = false;
      }
    } catch (error) {
      console.error(`Error executing item effect ${itemType}:`, error);
      result = false;
    } finally {
      this.isProcessing = false;
    }

    return result;
  }

  /**
   * スワップ: 2つの指定ブロックを入れ替える
   */
  private async executeSwap(block1: Block, block2: Block): Promise<boolean> {
    if (!block1 || !block2) {
      return false;
    }

    // 岩ブロックと鋼鉄ブロックは入れ替え不可
    if (block1.type === 'rock' || block1.type === 'steel' || 
        block2.type === 'rock' || block2.type === 'steel') {
      return false;
    }

    // ブロックの位置を入れ替え
    const tempX = block1.x;
    const tempY = block1.y;
    
    block1.x = block2.x;
    block1.y = block2.y;
    block2.x = tempX;
    block2.y = tempY;

    // ゲームシーンのブロック配列も更新
    this.gameScene.updateBlockPositions(block1, block2);

    // アニメーション再生
    await this.gameScene.animateSwap(block1, block2);

    return true;
  }

  /**
   * チェンジワン: 指定ブロック1個を指定色に変更
   */
  private async executeChangeOne(block: Block, newColor: BlockColor): Promise<boolean> {
    if (!block || !newColor) {
      return false;
    }

    // 岩ブロックと鋼鉄ブロックは変更不可
    if (block.type === 'rock' || block.type === 'steel') {
      return false;
    }

    // 色を変更
    const oldColor = block.color;
    block.color = newColor;

    // ゲームシーンのブロック色を更新
    await this.gameScene.updateBlockColor(block, oldColor, newColor);

    return true;
  }

  /**
   * ミニ爆弾: 1マスの指定ブロックを消去
   */
  private async executeMiniBomb(block: Block): Promise<boolean> {
    if (!block) {
      return false;
    }

    // 通常ブロックのみ消去可能
    if (block.type !== 'normal') {
      return false;
    }

    // ブロックを消去（スコアは加算しない）
    await this.gameScene.removeBlock(block, false);

    return true;
  }

  /**
   * シャッフル: 盤面の通常ブロックを再配置
   */
  private async executeShuffle(): Promise<boolean> {
    // 通常ブロックのみを取得
    const normalBlocks = this.gameScene.getNormalBlocks();
    
    if (normalBlocks.length <= 1) {
      return false; // シャッフルする意味がない
    }

    // 色の配列を作成
    const colors = normalBlocks.map(block => block.color);
    
    // 色をシャッフル
    this.shuffleArray(colors);
    
    // シャッフルした色を各ブロックに適用
    for (let i = 0; i < normalBlocks.length; i++) {
      normalBlocks[i].color = colors[i];
    }

    // ゲームシーンの盤面を更新
    await this.gameScene.updateAfterShuffle(normalBlocks);

    return true;
  }

  /**
   * 配列をシャッフルするヘルパーメソッド（Fisher-Yates）
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * 処理中かどうかを取得
   */
  isEffectProcessing(): boolean {
    return this.isProcessing;
  }
}
