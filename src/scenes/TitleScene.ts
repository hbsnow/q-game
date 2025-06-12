import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';

/**
 * タイトル画面
 */
export class TitleScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // タイトルテキスト
    const titleText = this.add.text(width / 2, height / 4, '🌊 さめがめ\nオーシャン 🌊', {
      fontSize: '36px',
      color: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // ゲーム開始ボタン
    const startButton = this.add.rectangle(width / 2, height / 2, 200, 60, 0x0088FF)
      .setInteractive({ useHandCursor: true });
    
    const startText = this.add.text(width / 2, height / 2, 'ゲーム開始', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // バージョン表示
    const versionText = this.add.text(width / 2, height - 20, 'Ver 1.0.0', {
      fontSize: '12px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // ボタンクリックイベント
    startButton.on('pointerdown', () => {
      this.scene.start('MainScene');
    });
    
    // ボタンホバーエフェクト
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x00AAFF);
    });
    
    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x0088FF);
    });
    
    // デバッグライン
    if (GameConfig.DEBUG_MODE) {
      this.addDebugLines();
    }
  }
  
  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    this.debugHelper.addAreaBorder(width / 2, height / 4, width - 4, 100, 0xFF0000, 'タイトルエリア');
    
    // ボタンエリア
    this.debugHelper.addAreaBorder(width / 2, height / 2, 200, 60, 0xFF00FF, 'ボタンエリア');
    
    // バージョンエリア
    this.debugHelper.addAreaBorder(width / 2, height - 20, width - 4, 40, 0x00FFFF, 'バージョンエリア');
  }
}
