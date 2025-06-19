import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { BackgroundManager } from '../utils/BackgroundManager';

/**
 * タイトル画面
 */
export class TitleScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private backgroundManager!: BackgroundManager;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // 背景マネージャーを初期化
    this.backgroundManager = new BackgroundManager(this);
    
    // 美しい海の背景を作成（タイトルは華やかに）
    this.backgroundManager.createOceanBackground('heavy');
    
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
    
    // 上部空白エリア
    const topSpaceHeight = height / 4 - 80 / 2;
    if (topSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, topSpaceHeight / 2, width, topSpaceHeight, 0x0000FF, '上部空白エリア');
    }
    
    // タイトルエリア（80pxに統一）
    this.debugHelper.addAreaBorder(width / 2, height / 4, width, 80, 0xFF0000, 'タイトルエリア');
    
    // 中上部空白エリア
    const middleTopSpaceHeight = height / 2 - height / 4 - 80 / 2 - 60 / 2;
    if (middleTopSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, height / 4 + 80 / 2 + middleTopSpaceHeight / 2, width, middleTopSpaceHeight, 0x0000FF, '中上部空白エリア');
    }
    
    // ボタン/アクションエリア
    this.debugHelper.addAreaBorder(width / 2, height / 2, 200, 60, 0xFF00FF, 'ボタン/アクションエリア');
    
    // ボタン左右の空白エリア
    if (width > 200) {
      // 左側空白
      this.debugHelper.addAreaBorder(
        (width - 200) / 4,
        height / 2,
        (width - 200) / 2,
        60,
        0x0000FF,
        'ボタン左側空白'
      );
      
      // 右側空白
      this.debugHelper.addAreaBorder(
        width - (width - 200) / 4,
        height / 2,
        (width - 200) / 2,
        60,
        0x0000FF,
        'ボタン右側空白'
      );
    }
    
    // 中下部空白エリア
    const footerHeight = 40;
    const buttonBottomY = height / 2 + 60 / 2;
    const footerTopY = height - footerHeight;
    const middleBottomSpaceHeight = footerTopY - buttonBottomY;
    
    if (middleBottomSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(
        width / 2, 
        buttonBottomY + middleBottomSpaceHeight / 2, 
        width, 
        middleBottomSpaceHeight, 
        0x0000FF, 
        '中下部空白エリア'
      );
    }
    
    // フッターエリア
    this.debugHelper.addAreaBorder(width / 2, height - 20, width, 40, 0x00FFFF, 'フッターエリア');
  }
}
