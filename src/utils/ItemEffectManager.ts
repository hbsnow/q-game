import { Block, BlockColor, ItemType } from '../types';
import { GameScene } from '../scenes/GameScene';
import { ColorSelectionUI } from './ColorSelectionUI';
import { BlockSelectionUI } from './BlockSelectionUI';

/**
 * アイテム効果管理クラス
 * 各アイテムの効果を実装し、ゲームシーンと連携する
 */
export class ItemEffectManager {
  private gameScene: GameScene;
  private isProcessing: boolean = false;
  private colorSelectionUI: ColorSelectionUI | null = null;
  private blockSelectionUI: BlockSelectionUI | null = null;

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
          // スワップは2つのブロックを選択する必要がある
          if (params.length === 0) {
            // パラメータがない場合はブロック選択UIを表示
            this.startBlockSelection(itemType, 2);
            return true; // 選択中は成功とみなす
          } else if (params.length === 2) {
            // 2つのブロックが指定された場合は実行
            result = await this.executeSwap(params[0], params[1]);
            // 実行完了後に選択モードを終了
            this.completeItemEffect();
          }
          break;
          
        case 'changeOne':
          // チェンジワンはブロックと色を選択する必要がある
          if (params.length === 0) {
            // パラメータがない場合はブロック選択UIを表示
            this.startBlockSelection(itemType, 1);
            return true; // 選択中は成功とみなす
          } else if (params.length === 1) {
            // ブロックが選択された場合は色選択UIを表示
            this.showColorSelectionUI(params[0]);
            return true; // 選択中は成功とみなす
          } else if (params.length === 2) {
            // ブロックと色が指定された場合は実行
            result = await this.executeChangeOne(params[0], params[1]);
            // 実行完了後に選択モードを終了
            this.completeItemEffect();
          }
          break;
          
        case 'miniBomb':
          // ミニ爆弾は1つのブロックを選択する必要がある
          if (params.length === 0) {
            // パラメータがない場合はブロック選択UIを表示
            this.startBlockSelection(itemType, 1);
            return true; // 選択中は成功とみなす
          } else if (params.length === 1) {
            // ブロックが指定された場合は実行
            result = await this.executeMiniBomb(params[0]);
            // 実行完了後に選択モードを終了
            this.completeItemEffect();
          }
          break;
          
        case 'shuffle':
          // シャッフルは即時実行
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
      if (result || params.length > 0) {
        // 実行完了または選択キャンセル時は処理中フラグを解除
        this.isProcessing = false;
      }
    }

    return result;
  }

  /**
   * ブロック選択UIを表示
   */
  private startBlockSelection(itemType: ItemType, count: number): void {
    // 既存のUIを破棄
    if (this.blockSelectionUI) {
      this.blockSelectionUI.destroy();
    }
    
    // 選択メッセージを設定
    let message = '';
    switch (itemType) {
      case 'swap':
        message = '入れ替える2つのブロックを選択してください';
        break;
      case 'changeOne':
        message = '色を変更するブロックを選択してください';
        break;
      case 'miniBomb':
        message = '消去するブロックを選択してください';
        break;
      default:
        message = 'ブロックを選択してください';
    }
    
    // ブロック選択UIを作成
    this.blockSelectionUI = new BlockSelectionUI(
      this.gameScene,
      count,
      (blocks) => {
        // 選択完了時の処理
        if (itemType === 'changeOne' && blocks.length === 1) {
          // チェンジワンの場合は色選択UIを表示
          this.showColorSelectionUI(blocks[0]);
        } else {
          // その他のアイテムは選択したブロックで実行
          this.executeItemEffect(itemType, ...blocks);
        }
      },
      () => {
        // キャンセル時の処理
        this.completeItemEffect();
      }
    );
    
    // 選択開始
    this.blockSelectionUI.start(message);
  }

  /**
   * 色選択UIを表示
   */
  private showColorSelectionUI(block: Block): void {
    // 既存のUIを破棄
    if (this.colorSelectionUI) {
      this.colorSelectionUI.destroy();
    }
    
    // 使用可能な色を設定（現在の色を除く）
    const availableColors: BlockColor[] = ['blue', 'lightBlue', 'seaGreen', 'coralRed', 'sandGold', 'pearlWhite']
      .filter(color => color !== block.color);
    
    // 色選択UIを作成
    this.colorSelectionUI = new ColorSelectionUI(
      this.gameScene,
      availableColors,
      (color) => {
        // 色選択完了時の処理
        this.executeItemEffect('changeOne', block, color);
      }
    );
    
    // 色選択UIを表示
    this.colorSelectionUI.show();
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
  
  /**
   * ブロック選択中かどうかを取得
   */
  isBlockSelecting(): boolean {
    return this.blockSelectionUI !== null && this.blockSelectionUI.isSelecting();
  }
  
  /**
   * 色選択中かどうかを取得
   */
  isColorSelecting(): boolean {
    return this.colorSelectionUI !== null && this.colorSelectionUI.getVisible();
  }
  
  /**
   * ブロック選択処理
   * GameSceneからブロック選択時に呼び出される
   */
  handleBlockSelection(block: Block, sprite: Phaser.GameObjects.Sprite): boolean {
    if (this.blockSelectionUI && this.blockSelectionUI.isSelecting()) {
      return this.blockSelectionUI.selectBlock(block, sprite);
    }
    return false;
  }
  
  /**
   * 全てのUIを破棄
   */
  destroyAllUI(): void {
    if (this.blockSelectionUI) {
      this.blockSelectionUI.destroy();
      this.blockSelectionUI = null;
    }
    if (this.colorSelectionUI) {
      this.colorSelectionUI.destroy();
      this.colorSelectionUI = null;
    }
    this.isProcessing = false;
  }
  
  /**
   * アイテム効果の完了処理
   * 選択UIの破棄と処理中フラグの解除を行う
   */
  completeItemEffect(): void {
    this.destroyAllUI();
    this.isProcessing = false;
    
    // GameSceneのアイテム選択モードを解除するためのコールバックがあれば呼び出す
    if (this.gameScene.exitItemSelectionMode) {
      this.gameScene.exitItemSelectionMode();
    }
  }
}
