import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';

/**
 * ゲームクリア画面
 */
export class GameCompleteScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private totalScore: number = 0;
  private totalGold: number = 0;

  constructor() {
    super({ key: 'GameCompleteScene' });
  }

  init(data: any): void {
    this.totalScore = data.totalScore || 0;
    this.totalGold = data.totalGold || 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#1E5799');
    
    this.createUI();
    this.addDebugLines();
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleY = 60;
    this.add.text(width / 2, titleY, 'ゲームクリア！', {
      fontSize: '36px',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 4,
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('titleText');
    
    // メインコンテンツエリア
    const contentStartY = 150;
    const lineHeight = 40;
    let currentY = contentStartY;
    
    // おめでとうメッセージ
    this.add.text(width / 2, currentY, 'おめでとう！', {
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight;
    
    this.add.text(width / 2, currentY, '全てのステージを', {
      fontSize: '20px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight;
    
    this.add.text(width / 2, currentY, 'クリアしました！', {
      fontSize: '20px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight + 20;
    
    // 総獲得スコア
    this.add.text(width / 2, currentY, '総獲得スコア:', {
      fontSize: '18px',
      color: '#CCCCCC',
      stroke: '#000000',
      strokeThickness: 1,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += 30;
    
    this.add.text(width / 2, currentY, this.totalScore.toLocaleString(), {
      fontSize: '24px',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight + 10;
    
    // 総獲得ゴールド
    this.add.text(width / 2, currentY, '総獲得ゴールド:', {
      fontSize: '18px',
      color: '#CCCCCC',
      stroke: '#000000',
      strokeThickness: 1,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += 30;
    
    this.add.text(width / 2, currentY, `${this.totalGold.toLocaleString()} G`, {
      fontSize: '24px',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // ボタンエリア
    const buttonY = height - 80;
    const buttonWidth = 200;
    const buttonHeight = 50;
    
    // タイトルへ戻るボタン
    const titleButton = this.add.rectangle(width / 2, buttonY, buttonWidth, buttonHeight, 0x4CAF50)
      .setInteractive()
      .setName('titleButton');
    
    this.add.text(width / 2, buttonY, 'タイトルへ戻る', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('titleText');
    
    titleButton.on('pointerdown', () => {
      // タイトル画面に戻る
      this.scene.start('TitleScene');
    });
    
    // ホバーエフェクト
    titleButton.on('pointerover', () => {
      this.tweens.add({
        targets: [titleButton, this.children.getByName('titleText')],
        scale: 1.05,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });
    
    titleButton.on('pointerout', () => {
      this.tweens.add({
        targets: [titleButton, this.children.getByName('titleText')],
        scale: 1,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });
  }
  
  private addDebugLines(): void {
    if (!GameConfig.DEBUG_MODE) return;
    
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleHeight = 120;
    const titleCenterY = titleHeight / 2;
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // メインコンテンツエリア
    const contentHeight = 400;
    const contentCenterY = titleHeight + contentHeight / 2;
    this.debugHelper.addAreaBorder(width / 2, contentCenterY, width, contentHeight, 0x0000FF, 'メインコンテンツエリア');
    
    // ボタンエリア
    const buttonHeight = 100;
    const buttonCenterY = height - buttonHeight / 2;
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, width, buttonHeight, 0xFF00FF, 'ボタンエリア');
  }
}
