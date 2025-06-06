import Phaser from 'phaser';
import { GAME_CONFIG } from '@/config/gameConfig';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景グラデーション
    this.add.rectangle(width / 2, height / 2, width, height, 0x1e3c72);
    
    // タイトルテキスト
    const titleText = this.add.text(width / 2, height * 0.3, '🌊 さめがめ\nオーシャン 🌊', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2,
    });
    titleText.setOrigin(0.5);
    
    // ゲーム開始ボタン
    const startButton = this.add.rectangle(width / 2, height * 0.6, 200, 60, 0x2a5298);
    startButton.setStrokeStyle(2, 0xffffff);
    startButton.setInteractive({ useHandCursor: true });
    
    const startText = this.add.text(width / 2, height * 0.6, 'ゲーム開始', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    });
    startText.setOrigin(0.5);
    
    // ボタンのホバー効果
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x3a62a8);
    });
    
    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x2a5298);
    });
    
    // ボタンクリック処理
    startButton.on('pointerdown', () => {
      this.startGame();
    });
    
    // バージョン表示
    this.add.text(width / 2, height * 0.9, 'Ver 1.0.0', {
      fontSize: '14px',
      color: '#cccccc',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    
    // 波のアニメーション効果（簡易版）
    this.createWaveEffect();
  }
  
  private createWaveEffect() {
    const { width, height } = this.cameras.main;
    
    // 簡単な波エフェクト
    for (let i = 0; i < 3; i++) {
      const wave = this.add.ellipse(
        -50, 
        height * 0.8 + i * 20, 
        100, 
        20, 
        0x7db9e8, 
        0.3
      );
      
      this.tweens.add({
        targets: wave,
        x: width + 50,
        duration: 3000 + i * 500,
        repeat: -1,
        ease: 'Linear',
      });
    }
  }
  
  private startGame() {
    console.log('ゲーム開始！');
    // TODO: メイン画面シーンに遷移
    // this.scene.start('MainScene');
    
    // 現在は開発中メッセージを表示
    const { width, height } = this.cameras.main;
    
    // 既存の要素を非表示
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.GameObject) {
        child.setVisible(false);
      }
    });
    
    // 開発中メッセージ
    this.add.text(width / 2, height / 2, '🚧 開発中 🚧\n\nPhase 1: 基盤システム構築完了\n\n次はPhase 2でゲーム画面を\n実装予定です', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);
    
    // 戻るボタン
    const backButton = this.add.rectangle(width / 2, height * 0.8, 150, 40, 0x2a5298);
    backButton.setStrokeStyle(2, 0xffffff);
    backButton.setInteractive({ useHandCursor: true });
    
    const backText = this.add.text(width / 2, height * 0.8, '戻る', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    });
    backText.setOrigin(0.5);
    
    backButton.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}
