import { Scene } from 'phaser';
import { Block } from '../types';

/**
 * ブロック選択UI
 * スワップなど複数のブロックを選択する必要があるアイテムで使用
 */
export class BlockSelectionUI {
  private scene: Scene;
  private selectedBlocks: Block[] = [];
  private maxSelections: number;
  private onComplete: (blocks: Block[]) => void;
  private onCancel: () => void;
  private instructionText: Phaser.GameObjects.Text;
  private cancelButton: Phaser.GameObjects.Container;
  private highlightedSprites: Phaser.GameObjects.Sprite[] = [];
  private isActive: boolean = false;

  constructor(
    scene: Scene, 
    maxSelections: number, 
    onComplete: (blocks: Block[]) => void,
    onCancel: () => void
  ) {
    this.scene = scene;
    this.maxSelections = maxSelections;
    this.onComplete = onComplete;
    this.onCancel = onCancel;
    
    // 指示テキスト
    const { width } = scene.cameras.main;
    this.instructionText = scene.add.text(width / 2, 50, '', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    this.instructionText.setVisible(false);
    
    // キャンセルボタン
    this.cancelButton = scene.add.container(width - 60, 50);
    const cancelBg = scene.add.rectangle(0, 0, 100, 30, 0xFF6347, 0.8);
    const cancelText = scene.add.text(0, 0, 'キャンセル', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    this.cancelButton.add([cancelBg, cancelText]);
    this.cancelButton.setSize(100, 30);
    this.cancelButton.setInteractive();
    this.cancelButton.on('pointerup', () => {
      this.cancel();
    });
    this.cancelButton.setVisible(false);
    
    // ESCキーでキャンセル
    this.scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.isActive) {
        this.cancel();
      }
    });
  }

  /**
   * ブロック選択モードを開始
   */
  start(message: string = 'ブロックを選択してください'): void {
    this.selectedBlocks = [];
    this.isActive = true;
    this.instructionText.setText(message);
    this.instructionText.setVisible(true);
    this.cancelButton.setVisible(true);
    this.updateInstructionText();
    
    console.log(`BlockSelectionUI started: ${message}, max selections: ${this.maxSelections}`);
  }

  /**
   * ブロックを選択
   */
  selectBlock(block: Block, sprite: Phaser.GameObjects.Sprite): boolean {
    if (!this.isActive) {
      console.log('BlockSelectionUI is not active, ignoring selection');
      return false;
    }
    
    console.log(`Selecting block: ${block.id} at (${block.x},${block.y})`);
    
    // 既に選択済みかチェック
    const existingIndex = this.selectedBlocks.findIndex(b => b.id === block.id);
    if (existingIndex >= 0) {
      // 選択解除
      console.log(`Block ${block.id} was already selected, deselecting`);
      this.selectedBlocks.splice(existingIndex, 1);
      this.unhighlightSprite(sprite);
      this.updateInstructionText();
      return true;
    }
    
    // 最大選択数を超える場合
    if (this.selectedBlocks.length >= this.maxSelections) {
      // 最初の選択を解除して新しい選択を追加
      console.log(`Max selections (${this.maxSelections}) reached, replacing first selection`);
      const oldSprite = this.highlightedSprites.shift();
      if (oldSprite) {
        this.unhighlightSprite(oldSprite);
      }
      this.selectedBlocks.shift();
    }
    
    // 新しいブロックを選択
    this.selectedBlocks.push(block);
    this.highlightSprite(sprite);
    this.updateInstructionText();
    
    console.log(`Selected blocks: ${this.selectedBlocks.length}/${this.maxSelections}`);
    
    // 最大選択数に達したら完了
    if (this.selectedBlocks.length === this.maxSelections) {
      console.log(`Max selections reached, completing selection`);
      this.complete();
    }
    
    return true;
  }

  /**
   * スプライトをハイライト
   */
  private highlightSprite(sprite: Phaser.GameObjects.Sprite): void {
    sprite.setTint(0xFFFF00);
    sprite.setScale(1.1);
    this.highlightedSprites.push(sprite);
  }

  /**
   * スプライトのハイライトを解除
   */
  private unhighlightSprite(sprite: Phaser.GameObjects.Sprite): void {
    sprite.clearTint();
    sprite.setScale(1.0);
    const index = this.highlightedSprites.indexOf(sprite);
    if (index >= 0) {
      this.highlightedSprites.splice(index, 1);
    }
  }

  /**
   * 指示テキストを更新
   */
  private updateInstructionText(): void {
    const remaining = this.maxSelections - this.selectedBlocks.length;
    if (remaining > 0) {
      this.instructionText.setText(`あと${remaining}個のブロックを選択してください`);
    } else {
      this.instructionText.setText('選択完了！');
    }
  }

  /**
   * 選択完了
   */
  private complete(): void {
    console.log('BlockSelectionUI: Selection complete');
    this.isActive = false;
    this.instructionText.setVisible(false);
    this.cancelButton.setVisible(false);
    
    // 全てのハイライトを解除
    this.highlightedSprites.forEach(sprite => {
      sprite.clearTint();
      sprite.setScale(1.0);
    });
    this.highlightedSprites = [];
    
    // 完了コールバックを呼び出し
    const selectedBlocks = [...this.selectedBlocks];
    console.log(`Calling onComplete with ${selectedBlocks.length} blocks`);
    this.onComplete(selectedBlocks);
  }

  /**
   * 選択キャンセル
   */
  private cancel(): void {
    console.log('BlockSelectionUI: Selection cancelled');
    this.isActive = false;
    this.instructionText.setVisible(false);
    this.cancelButton.setVisible(false);
    
    // 全てのハイライトを解除
    this.highlightedSprites.forEach(sprite => {
      sprite.clearTint();
      sprite.setScale(1.0);
    });
    this.highlightedSprites = [];
    
    // キャンセルコールバックを呼び出し
    this.onCancel();
  }

  /**
   * 選択中かどうかを取得
   */
  isSelecting(): boolean {
    return this.isActive;
  }

  /**
   * 破棄
   */
  destroy(): void {
    this.instructionText.destroy();
    this.cancelButton.destroy();
  }
}
