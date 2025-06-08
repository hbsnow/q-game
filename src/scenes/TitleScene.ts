import { Scene } from 'phaser';

export class TitleScene extends Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 背景色設定（深い海のイメージ）
    this.cameras.main.setBackgroundColor('#0F3460');

    // タイトルロゴ
    this.add.text(width / 2, height / 2 - 100, '🌊 さめがめ', {
      fontSize: '32px',
      color: '#7DB9E8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 60, 'オーシャン 🌊', {
      fontSize: '32px',
      color: '#7DB9E8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ゲーム開始ボタン
    const startButton = this.add.rectangle(width / 2, height / 2 + 50, 200, 60, 0x2E8B57, 0.9);
    startButton.setInteractive();
    startButton.on('pointerdown', () => {
      this.scene.start('MainScene', {
        currentStage: 1,
        gold: 1250 // モックデータ
      });
    });
    
    // ボタンのホバーエフェクト
    startButton.on('pointerover', () => {
      startButton.setAlpha(0.8);
    });
    startButton.on('pointerout', () => {
      startButton.setAlpha(1.0);
    });

    this.add.text(width / 2, height / 2 + 50, 'ゲーム開始', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // バージョン表示
    this.add.text(width / 2, height - 50, 'Ver 1.0.0', {
      fontSize: '14px',
      color: '#CCCCCC'
    }).setOrigin(0.5);

    // 開発情報（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      this.add.text(10, 10, 'Phase 3: UI/画面システム実装中', {
        fontSize: '12px',
        color: '#CCCCCC'
      });
    }
  }
}
