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
  private debugMenu?: Phaser.GameObjects.Container;
  private isDebugMenuVisible: boolean = false;

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
      if ('setVisible' in element) {
        (element as any).setVisible(this.isVisible);
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
   * @param position クリック位置
   */
  setLastClickPosition(position: {x: number, y: number}): void {
    this.lastClickPosition = position;
    console.log(`Click position set: (${position.x}, ${position.y}) - ${String.fromCharCode(97 + position.x)}${position.y}`);
  }
  
  /**
   * ブロック状態をアスキーアートでコンソールに出力
   */
  logBlockState(): void {
    if (!this.blocks) {
      console.log('No blocks data available. Call setBlocks() first.');
      return;
    }
    
    // JSON形式で出力
    BlockAsciiRenderer.logBlocksAsJson(this.blocks, 'CURRENT BLOCK STATE');
  }
  
  /**
   * ブロック状態の変化をアスキーアートで比較出力
   * @param beforeBlocks 変化前のブロック配列
   * @param afterBlocks 変化後のブロック配列
   * @param label 出力時のラベル（オプション）
   */
  logBlocksComparison(beforeBlocks: Block[][], afterBlocks: Block[][], label?: string): void {
    BlockAsciiRenderer.logBlocksComparison(beforeBlocks, afterBlocks, label, this.lastClickPosition);
  }

  /**
   * デバッグメニューを作成・表示
   */
  createDebugMenu(callbacks: {
    onStageChange?: (stage: number) => void;
    onGoldAdd?: (amount: number) => void;
    onClose?: () => void;
  }): void {
    if (this.debugMenu) {
      this.debugMenu.destroy();
    }

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // 背景オーバーレイ
    const background = this.scene.add.graphics();
    background.fillStyle(0x000000, 0.8);
    background.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
    background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height), Phaser.Geom.Rectangle.Contains);

    // メニューパネル
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x333333, 1);
    panel.lineStyle(2, 0xFFFFFF, 1);
    panel.fillRoundedRect(-150, -220, 300, 440, 10);
    panel.strokeRoundedRect(-150, -220, 300, 440, 10);

    // タイトル
    const title = this.scene.add.text(0, -190, 'デバッグメニュー', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ステージ移動セクション
    const stageTitle = this.scene.add.text(0, -150, 'ステージ移動', {
      fontSize: '16px',
      color: '#FFFF00'
    }).setOrigin(0.5);

    // ステージボタン（1-20）
    const stageButtons: Phaser.GameObjects.Text[] = [];
    for (let i = 1; i <= 20; i++) {
      const row = Math.floor((i - 1) / 5);
      const col = (i - 1) % 5;
      const x = -80 + col * 40;
      const y = -120 + row * 30;

      const button = this.scene.add.text(x, y, i.toString(), {
        fontSize: '14px',
        color: '#FFFFFF',
        backgroundColor: '#666666',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setInteractive();

      button.on('pointerdown', () => {
        if (callbacks.onStageChange) {
          callbacks.onStageChange(i);
        }
        this.hideDebugMenu();
      });

      button.on('pointerover', () => {
        button.setStyle({ backgroundColor: '#888888' });
      });

      button.on('pointerout', () => {
        button.setStyle({ backgroundColor: '#666666' });
      });

      stageButtons.push(button);
    }

    // ゴールド追加セクション
    const goldTitle = this.scene.add.text(0, 30, 'ゴールド追加', {
      fontSize: '16px',
      color: '#FFFF00'
    }).setOrigin(0.5);

    const goldAmounts = [100, 500, 1000, 5000];
    const goldButtons: Phaser.GameObjects.Text[] = [];

    goldAmounts.forEach((amount, index) => {
      const x = -60 + (index % 2) * 120;
      const y = 60 + Math.floor(index / 2) * 40;

      const button = this.scene.add.text(x, y, `+${amount}G`, {
        fontSize: '14px',
        color: '#FFFFFF',
        backgroundColor: '#006600',
        padding: { x: 12, y: 6 }
      }).setOrigin(0.5).setInteractive();

      button.on('pointerdown', () => {
        if (callbacks.onGoldAdd) {
          callbacks.onGoldAdd(amount);
        }
      });

      button.on('pointerover', () => {
        button.setStyle({ backgroundColor: '#008800' });
      });

      button.on('pointerout', () => {
        button.setStyle({ backgroundColor: '#006600' });
      });

      goldButtons.push(button);
    });

    // 閉じるボタン
    const closeButton = this.scene.add.text(0, 170, '閉じる', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#CC0000',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive();

    closeButton.on('pointerdown', () => {
      this.hideDebugMenu();
      if (callbacks.onClose) {
        callbacks.onClose();
      }
    });

    closeButton.on('pointerover', () => {
      closeButton.setStyle({ backgroundColor: '#FF0000' });
    });

    closeButton.on('pointerout', () => {
      closeButton.setStyle({ backgroundColor: '#CC0000' });
    });

    // コンテナに追加
    this.debugMenu = this.scene.add.container(centerX, centerY, [
      background,
      panel,
      title,
      stageTitle,
      ...stageButtons,
      goldTitle,
      ...goldButtons,
      closeButton
    ]);

    this.debugMenu.setDepth(2000);
    this.isDebugMenuVisible = true;
  }

  /**
   * デバッグメニューを表示
   */
  showDebugMenu(callbacks: {
    onStageChange?: (stage: number) => void;
    onGoldAdd?: (amount: number) => void;
    onClose?: () => void;
  }): void {
    if (!this.isDebugMenuVisible) {
      this.createDebugMenu(callbacks);
    }
  }

  /**
   * デバッグメニューを非表示
   */
  hideDebugMenu(): void {
    if (this.debugMenu) {
      this.debugMenu.destroy();
      this.debugMenu = undefined;
      this.isDebugMenuVisible = false;
    }
  }

  /**
   * デバッグメニューが表示されているかどうか
   */
  isDebugMenuOpen(): boolean {
    return this.isDebugMenuVisible;
  }

  /**
   * リソースを破棄
   */
  destroy(): void {
    this.debugElements.forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });
    this.debugElements = [];
    this.hideDebugMenu();
  }
}
