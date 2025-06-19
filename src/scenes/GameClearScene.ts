import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';
import { BackgroundManager } from '../utils/BackgroundManager';

/**
 * ゲームクリア画面
 */
export class GameClearScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private backgroundManager!: BackgroundManager;
  private gameStateManager: GameStateManager;
  private totalScore: number = 0;
  private totalGold: number = 0;

  constructor() {
    super({ key: 'GameClearScene' });
    this.gameStateManager = GameStateManager.getInstance();
  }

  init(data: any): void {
    this.totalScore = data.totalScore || 0;
    this.totalGold = data.totalGold || 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // 背景マネージャーを初期化
    this.backgroundManager = new BackgroundManager(this);
    
    // 美しい海の背景を作成（ゲームクリアは最も華やかに）
    this.backgroundManager.createOceanBackground('heavy');
    
    this.createUI();
    this.addDebugLines();
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア（80pxに統一）
    const titleY = 40; // 80pxエリアの中心位置
    this.add.text(width / 2, titleY, 'ゲームクリア！', {
      fontSize: '28px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // メインコンテンツエリア
    const contentStartY = 160;
    const lineHeight = 50;
    let currentY = contentStartY;

    // 祝福メッセージ
    this.add.text(width / 2, currentY, 'おめでとう！', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight;

    this.add.text(width / 2, currentY, '全てのステージを', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight * 0.8;

    this.add.text(width / 2, currentY, 'クリアしました！', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight * 1.5;

    // 総合成績
    this.add.text(width / 2, currentY, `総獲得スコア:`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight * 0.6;

    this.add.text(width / 2, currentY, `${this.totalScore.toLocaleString()}`, {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    currentY += lineHeight;

    this.add.text(width / 2, currentY, `総獲得ゴールド:`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight * 0.6;

    this.add.text(width / 2, currentY, `${this.totalGold.toLocaleString()} G`, {
      fontSize: '20px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ボタンエリア
    this.createButtons();
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height - 60;
    const buttonWidth = 180;
    const buttonHeight = 40;

    // タイトルへ戻るボタン
    const titleButton = this.add.rectangle(width / 2, buttonY, buttonWidth, buttonHeight, 0x4CAF50)
      .setInteractive()
      .setName('titleButton');

    this.add.text(width / 2, buttonY, 'タイトルへ戻る', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('titleText');

    titleButton.on('pointerdown', () => {
      // ゲーム状態をリセット（新しいゲームを始められるように）
      this.gameStateManager.resetGame();
      this.scene.start('TitleScene');
    });

    // ホバーエフェクト
    titleButton.on('pointerover', () => {
      titleButton.setFillStyle(0x66BB6A);
    });

    titleButton.on('pointerout', () => {
      titleButton.setFillStyle(0x4CAF50);
    });
  }

  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア（80pxに統一）
    const titleHeight = 80;
    const titleCenterY = 40;
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // メインコンテンツエリア
    const contentHeight = 440; // タイトルエリア縮小分を追加
    const contentCenterY = 300; // タイトルエリア80px直下から開始
    this.debugHelper.addAreaBorder(width / 2, contentCenterY, width, contentHeight, 0x0000FF, 'メインコンテンツエリア');
    
    // ボタンエリア
    const buttonHeight = 80;
    const buttonCenterY = height - 40;
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, width, buttonHeight, 0xFF00FF, 'ボタンエリア');
  }
}
