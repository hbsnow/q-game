import { Scene } from 'phaser';
import { mockItems } from '../data/mockItems';

export class MainScene extends Scene {
  private currentStage: number = 1;
  private gold: number = 1250; // モックデータ

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: any) {
    // 他の画面から戻ってきた時のデータを受け取る
    if (data.currentStage) {
      this.currentStage = data.currentStage;
    }
    if (data.gold !== undefined) {
      this.gold = data.gold;
    }
  }

  create() {
    const { width, height } = this.scale;

    // 背景色設定（海のテーマ）
    this.cameras.main.setBackgroundColor('#1E5799');

    // タイトル表示
    this.add.text(width / 2, 80, '🌊 さめがめオーシャン 🌊', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ゴールド表示
    this.add.text(width - 20, 20, `ゴールド: ${this.gold}`, {
      fontSize: '16px',
      color: '#F4D03F',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // ステージ情報
    this.add.text(width / 2, 180, `ステージ ${this.currentStage}`, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // プレイボタン
    const playButton = this.add.rectangle(width / 2, 250, 200, 60, 0x7DB9E8, 0.9);
    playButton.setInteractive();
    playButton.on('pointerdown', () => {
      // アイテム選択画面へ遷移
      this.scene.start('ItemSelectScene', {
        items: mockItems,
        currentStage: this.currentStage,
        gold: this.gold,
        equipSlots: [
          { type: 'special', item: null, used: false },
          { type: 'normal', item: null, used: false }
        ]
      });
    });

    this.add.text(width / 2, 250, 'プレイ', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // メニューボタン群
    const buttonY = 350;
    const buttonWidth = 120;
    const buttonHeight = 50;

    // アイテムボタン（Phase 4で実装予定）
    const itemButton = this.add.rectangle(width / 2 - 70, buttonY, buttonWidth, buttonHeight, 0x2E8B57, 0.8);
    itemButton.setInteractive();
    itemButton.on('pointerdown', () => {
      console.log('アイテム画面（未実装）');
    });

    this.add.text(width / 2 - 70, buttonY, 'アイテム', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // ガチャボタン（Phase 5で実装予定）
    const gachaButton = this.add.rectangle(width / 2 + 70, buttonY, buttonWidth, buttonHeight, 0xFF6347, 0.8);
    gachaButton.setInteractive();
    gachaButton.on('pointerdown', () => {
      console.log('ガチャ画面（未実装）');
    });

    this.add.text(width / 2 + 70, buttonY, 'ガチャ', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // デバッグ情報（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      this.add.text(10, height - 30, 'Phase 3: UI/画面システム', {
        fontSize: '12px',
        color: '#CCCCCC'
      });
    }
  }
}
