import { Scene } from 'phaser';
import { BlockColor } from '../types';

/**
 * 色選択UI
 * チェンジワンやチェンジエリアなどの色選択が必要なアイテムで使用
 */
export class ColorSelectionUI {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;
  private colors: BlockColor[];
  private colorButtons: Phaser.GameObjects.Container[] = [];
  private onColorSelected: (color: BlockColor) => void;
  private isVisible: boolean = false;

  constructor(scene: Scene, colors: BlockColor[], onColorSelected: (color: BlockColor) => void) {
    this.scene = scene;
    this.colors = colors;
    this.onColorSelected = onColorSelected;
    
    // コンテナ作成（初期状態では非表示）
    const { width, height } = scene.cameras.main;
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setVisible(false);
    
    // 背景（半透明オーバーレイ）
    const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0.5);
    this.container.add(overlay);
    
    // タイトル
    const title = scene.add.text(0, -120, '色を選択してください', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(title);
    
    // 色ボタンを作成
    this.createColorButtons();
    
    // キャンセルボタン
    const cancelButton = scene.add.container(0, 100);
    const cancelBg = scene.add.rectangle(0, 0, 120, 40, 0xB22222, 0.9);
    cancelBg.setStrokeStyle(2, 0xFF4444, 0.8);
    const cancelText = scene.add.text(0, 0, 'キャンセル', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    cancelButton.add([cancelBg, cancelText]);
    cancelButton.setSize(120, 40);
    cancelButton.setInteractive();
    cancelButton.on('pointerup', () => {
      this.hide();
    });
    this.container.add(cancelButton);
    
    // オーバーレイをクリックしても何も起きないようにする
    overlay.setInteractive();
    overlay.on('pointerdown', (event: Phaser.Input.Pointer) => {
      event.stopPropagation();
    });
  }

  /**
   * 色ボタンを作成
   */
  private createColorButtons() {
    const buttonSize = 50;
    const spacing = 20;
    const totalWidth = this.colors.length * buttonSize + (this.colors.length - 1) * spacing;
    const startX = -totalWidth / 2 + buttonSize / 2;
    
    this.colors.forEach((color, index) => {
      const x = startX + index * (buttonSize + spacing);
      const colorButton = this.createColorButton(color, x, 0, buttonSize);
      this.colorButtons.push(colorButton);
      this.container.add(colorButton);
    });
  }

  /**
   * 色ボタンを作成
   */
  private createColorButton(color: BlockColor, x: number, y: number, size: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    
    // 色に応じた背景色を設定
    const bgColor = this.getColorHex(color);
    
    // ボタン背景
    const bg = this.scene.add.rectangle(0, 0, size, size, bgColor, 1);
    bg.setStrokeStyle(3, 0xFFFFFF, 0.8);
    
    // 色名ラベル
    const colorName = this.getColorName(color);
    const label = this.scene.add.text(0, size / 2 + 15, colorName, {
      fontSize: '12px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setSize(size, size);
    container.setInteractive();
    
    // ホバー効果
    container.on('pointerover', () => {
      bg.setStrokeStyle(4, 0xFFFF00, 1);
      container.setScale(1.1);
    });
    
    container.on('pointerout', () => {
      bg.setStrokeStyle(3, 0xFFFFFF, 0.8);
      container.setScale(1.0);
    });
    
    // クリック時の処理
    container.on('pointerup', () => {
      this.onColorSelected(color);
      this.hide();
    });
    
    return container;
  }

  /**
   * 色に応じたHEX値を取得
   */
  private getColorHex(color: BlockColor): number {
    switch (color) {
      case 'blue': return 0x1E5799;
      case 'lightBlue': return 0x7DB9E8;
      case 'seaGreen': return 0x2E8B57;
      case 'coralRed': return 0xFF6347;
      case 'sandGold': return 0xF4D03F;
      case 'pearlWhite': return 0xF5F5F5;
      default: return 0xFFFFFF;
    }
  }

  /**
   * 色名を取得
   */
  private getColorName(color: BlockColor): string {
    switch (color) {
      case 'blue': return '深い青';
      case 'lightBlue': return '水色';
      case 'seaGreen': return '海緑';
      case 'coralRed': return '珊瑚赤';
      case 'sandGold': return '砂金色';
      case 'pearlWhite': return '真珠白';
      default: return '不明';
    }
  }

  /**
   * 色選択UIを表示
   */
  show(): void {
    this.container.setVisible(true);
    this.isVisible = true;
    
    // 表示アニメーション
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 0.8, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 200,
      ease: 'Power2'
    });
  }

  /**
   * 色選択UIを非表示
   */
  hide(): void {
    this.isVisible = false;
    
    // 非表示アニメーション
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 1, to: 0.8 },
      alpha: { from: 1, to: 0 },
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false);
      }
    });
  }

  /**
   * 表示状態を取得
   */
  getVisible(): boolean {
    return this.isVisible;
  }

  /**
   * 破棄
   */
  destroy(): void {
    this.container.destroy();
  }
}
