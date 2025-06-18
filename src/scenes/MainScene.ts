import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';

/**
 * メイン画面（ステージ選択画面）
 */
export class MainScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private gameStateManager: GameStateManager;

  constructor() {
    super({ key: 'MainScene' });
    this.gameStateManager = GameStateManager.getInstance();
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // GameStateManagerから現在の状態を取得
    const currentStage = this.gameStateManager.getCurrentStage();
    const gold = this.gameStateManager.getGold();
    
    // ヘッダー（ゴールド表示）
    const goldText = this.add.text(width - 10, 30, `ゴールド: ${gold}`, {
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0.5);
    
    // ステージ情報
    const stageText = this.add.text(width / 2, height / 4, `ステージ ${currentStage}`, {
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // プレイボタン
    const playButton = this.add.rectangle(width / 2, height / 2, 200, 60, 0x0088FF)
      .setInteractive({ useHandCursor: true });
    
    const playText = this.add.text(width / 2, height / 2, 'プレイ', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // アイテムボタン
    const itemButton = this.add.rectangle(width / 4, height * 0.75, 120, 50, 0x22AA22)
      .setInteractive({ useHandCursor: true });
    
    const itemText = this.add.text(width / 4, height * 0.75, 'アイテム', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // ガチャボタン
    const gachaButton = this.add.rectangle(width * 0.75, height * 0.75, 120, 50, 0xAA2222)
      .setInteractive({ useHandCursor: true });
    
    const gachaText = this.add.text(width * 0.75, height * 0.75, 'ガチャ', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // ボタンクリックイベント
    playButton.on('pointerdown', () => {
      // アイテム選択画面に遷移
      this.scene.start('ItemSelectionScene', { stage: currentStage });
    });
    
    // ボタンホバーエフェクト
    playButton.on('pointerover', () => {
      this.tweens.add({
        targets: [playButton, playText],
        scale: 1.05,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });
    
    playButton.on('pointerout', () => {
      this.tweens.add({
        targets: [playButton, playText],
        scale: 1,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });
    
    playButton.on('pointerdown', () => {
      // クリック時の押し込みエフェクト
      this.tweens.add({
        targets: [playButton, playText],
        scale: 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    });
    
    // デバッグライン
    if (GameConfig.DEBUG_MODE) {
      this.addDebugLines();
    }
  }
  
  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // GameStateManagerから現在の状態を取得
    const currentStage = this.gameStateManager.getCurrentStage();
    
    // タイトルエリア（ゴールド表示）
    const titleHeight = 60;
    const titleCenterY = 30;
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // コンテンツエリア（ステージ情報）
    const contentHeight = 80;
    const contentCenterY = height / 4;
    this.debugHelper.addAreaBorder(width / 2, contentCenterY, width, contentHeight, 0x0000FF, 'コンテンツエリア');
    
    // 上部空白エリア
    const titleBottomY = titleCenterY + titleHeight / 2;
    const contentTopY = contentCenterY - contentHeight / 2;
    const topSpaceHeight = contentTopY - titleBottomY;
    
    if (topSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, titleBottomY + topSpaceHeight / 2, width, topSpaceHeight, 0x0000FF, '上部空白エリア');
    }
    // 中上部空白エリア
    const contentBottomY = contentCenterY + contentHeight / 2;
    const buttonHeight = 60;
    const buttonCenterY = height / 2;
    const buttonTopY = buttonCenterY - buttonHeight / 2;
    const middleTopSpaceHeight = buttonTopY - contentBottomY;
    
    if (middleTopSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, contentBottomY + middleTopSpaceHeight / 2, width, middleTopSpaceHeight, 0x0000FF, '中上部空白エリア');
    }
    
    // ボタン/アクションエリア（プレイボタン）
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, 200, buttonHeight, 0xFF00FF, 'ボタン/アクションエリア');
    
    // ボタン左右の空白エリア
    if (width > 200) {
      // 左側空白
      this.debugHelper.addAreaBorder(
        (width - 200) / 4,
        buttonCenterY,
        (width - 200) / 2,
        buttonHeight,
        0x0000FF,
        'ボタン左側空白'
      );
      
      // 右側空白
      this.debugHelper.addAreaBorder(
        width - (width - 200) / 4,
        buttonCenterY,
        (width - 200) / 2,
        buttonHeight,
        0x0000FF,
        'ボタン右側空白'
      );
    }
    
    // 中下部空白エリア
    const buttonBottomY = buttonCenterY + buttonHeight / 2;
    const navHeight = 50;
    const navCenterY = height * 0.75;
    const navTopY = navCenterY - navHeight / 2;
    const middleBottomSpaceHeight = navTopY - buttonBottomY;
    if (middleBottomSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, buttonBottomY + middleBottomSpaceHeight / 2, width, middleBottomSpaceHeight, 0x0000FF, '中下部空白エリア');
    }
    
    // ナビゲーション/メニューエリア（アイテム・ガチャボタン）
    this.debugHelper.addAreaBorder(width / 2, navCenterY, width, navHeight, 0x00FF00, 'ナビゲーション/メニューエリア');
    
    // 下部空白エリア
    const navBottomY = navCenterY + navHeight / 2;
    const bottomSpaceHeight = height - navBottomY;
    if (bottomSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, navBottomY + bottomSpaceHeight / 2, width, bottomSpaceHeight, 0x0000FF, '下部空白エリア');
    }
  }
}
