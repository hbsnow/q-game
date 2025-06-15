import { Block } from '../types/Block';
import { BlockLogic } from './BlockLogic';

/**
 * ゲームシーンのクラス
 */
export class GameScene {
  blocks: (Block | null)[][];
  score: number;
  blockLogic: BlockLogic;

  constructor() {
    this.blocks = [];
    this.score = 0;
    this.blockLogic = new BlockLogic();
  }

  /**
   * ブロックを消去する
   * @param blocks 消去対象のブロック配列
   */
  removeBlocks(blocks: Block[]): void {
    // 氷結ブロックはレベルダウンするだけで消去しない
    // 通常ブロックのみを消去する
    blocks.forEach(block => {
      // 元のブロックの座標を使用して現在のブロックを取得
      const currentBlock = this.blocks[block.y][block.x];
      
      // 通常ブロックのみを消去
      if (currentBlock && currentBlock.type === 'normal') {
        // スプライト参照を先にnullに設定（メモリリーク防止）
        if (currentBlock.sprite) {
          currentBlock.sprite = null;
        }
        
        // ブロックを消去
        this.blocks[block.y][block.x] = null;
      }
    });
  }

  /**
   * 氷結ブロックを更新する
   * @param blocks 更新対象のブロック配列
   */
  updateIceBlocks(blocks: Block[]): void {
    blocks.forEach(block => {
      // 元のブロックの座標を使用して現在のブロックを取得
      const currentBlock = this.blocks[block.y][block.x];
      if (!currentBlock) return;
      
      if (currentBlock.type === 'iceLv2') {
        // 氷結Lv2 → 氷結Lv1
        this.blocks[block.y][block.x] = {
          ...currentBlock,
          type: 'iceLv1'
        };
      } else if (currentBlock.type === 'iceLv1') {
        // 氷結Lv1 → 通常ブロック
        this.blocks[block.y][block.x] = {
          ...currentBlock,
          type: 'normal'
        };
      } else if (currentBlock.type === 'iceCounterPlus') {
        // 氷結カウンター+ → 通常ブロック
        this.blocks[block.y][block.x] = {
          ...currentBlock,
          type: 'normal'
        };
      } else if (currentBlock.type === 'iceCounterMinus') {
        // 氷結カウンター- → 通常ブロック
        this.blocks[block.y][block.x] = {
          ...currentBlock,
          type: 'normal'
        };
      }
    });
  }

  /**
   * ブロックをクリックした時の処理
   * @param x X座標
   * @param y Y座標
   * @returns スコア
   */
  clickBlock(x: number, y: number): number {
    // クリックされたブロックが存在しない場合は何もしない
    if (!this.blocks[y] || !this.blocks[y][x]) {
      return 0;
    }
    
    // 消去可能なブロックを検索
    const connectedBlocks = this.blockLogic.findConnectedBlocks(this.blocks, x, y);
    
    // 2つ以上のブロックが隣接していない場合は何もしない
    if (connectedBlocks.length < 2) {
      return 0;
    }
    
    // 氷結ブロックを更新（レベルダウン）
    this.updateIceBlocks(connectedBlocks);
    
    // 通常ブロックのみを消去
    this.removeBlocks(connectedBlocks);
    
    // スコアを計算
    const score = this.blockLogic.calculateScore(connectedBlocks.length);
    this.score += score;
    
    return score;
  }
}
