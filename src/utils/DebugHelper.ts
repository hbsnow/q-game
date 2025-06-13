import { Block } from '../types/Block';
import { BlockAsciiRenderer } from './BlockAsciiRenderer';

/**
 * デバッグ用のヘルパークラス
 */
export class DebugHelper {
  private scene: Phaser.Scene;
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private isVisible: boolean = true;
  private blocks: Block[][] | null = null;
  private lastClickPosition: {x: number, y: number} | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Dキーでデバッグ表示の切り替え
    this.scene.input.keyboard?.addKey('D').on('down', () => {
      this.toggleVisibility();
    });
    
    // Shift+Dキーでデバッグ情報をコンソール出力
    this.scene.input.keyboard?.addKey('SHIFT+D').on('down', () => {
      this.logDebugInfo();
    });
    
    // Bキーでブロック状態をアスキーアートで出力
    this.scene.input.keyboard?.addKey('B').on('down', () => {
      this.logBlockState();
    });
  }

  /**
   * エリア境界線を追加
   */
  addAreaBorder(x: number, y: number, width: number, height: number, color: number, name: string): Phaser.GameObjects.Rectangle {
    const rect = this.scene.add.rectangle(x, y, width, height, 0x000000, 0)
      .setStrokeStyle(2, color);
    
    const text = this.scene.add.text(x - width / 2 + 5, y - height / 2 + 5, name, {
      fontSize: '10px',
      color: '#FFFFFF',
      backgroundColor: '#000000'
    });
    
    this.debugElements.push(rect);
    this.debugElements.push(text);
    
    return rect;
  }

  /**
   * デバッグ表示の可視性を切り替え
   */
  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.debugElements.forEach(element => {
      if (element) {
        element.setVisible(this.isVisible);
      }
    });
    console.log(`Debug display: ${this.isVisible ? 'visible' : 'hidden'}`);
  }

  /**
   * デバッグ情報をコンソールに出力
   */
  logDebugInfo(): void {
    console.log('=== DEBUG INFO ===');
    console.log('Scene:', this.scene.scene.key);
    console.log('FPS:', this.scene.game.loop.actualFps);
    console.log('Objects count:', this.scene.children.length);
    console.log('==================');
  }
  
  /**
   * ブロック配列を設定
   * @param blocks ブロック配列
   */
  setBlocks(blocks: Block[][]): void {
    this.blocks = blocks;
  }
  
  /**
   * 最後にクリックされた位置を設定
   * @param x X座標
   * @param y Y座標
   */
  setLastClickPosition(x: number, y: number): void {
    this.lastClickPosition = { x, y };
    console.log(`Click position set: (${x}, ${y}) - ${String.fromCharCode(97 + x)}${y}`);
  }
  
  /**
   * ブロック状態をアスキーアートでコンソールに出力
   */
  logBlockState(): void {
    if (!this.blocks) {
      console.log('No blocks data available. Call setBlocks() first.');
      return;
    }
    
    BlockAsciiRenderer.logBlocks(this.blocks, 'CURRENT BLOCK STATE', this.lastClickPosition || undefined);
  }
  
  /**
   * ブロック状態の変化をアスキーアートで比較出力
   * @param beforeBlocks 変化前のブロック配列
   * @param afterBlocks 変化後のブロック配列
   * @param label 出力時のラベル（オプション）
   */
  logBlocksComparison(beforeBlocks: Block[][], afterBlocks: Block[][], label?: string): void {
    BlockAsciiRenderer.logBlocksComparison(beforeBlocks, afterBlocks, label, this.lastClickPosition || undefined);
  }
}
