import { Scene } from 'phaser';
import { mockItems } from '../data/mockItems';

export class ItemListScene extends Scene {
  private currentStage: number = 1;
  private gold: number = 1250;

  constructor() {
    super({ key: 'ItemListScene' });
  }

  init(data: any) {
    if (data.currentStage) {
      this.currentStage = data.currentStage;
    }
    if (data.gold !== undefined) {
      this.gold = data.gold;
    }
  }

  create() {
    const { width, height } = this.cameras.main;

    console.log('🎬 === ITEM LIST SCENE ===');
    console.log('📍 Current Scene: アイテム一覧画面');

    // 背景色設定
    this.cameras.main.setBackgroundColor('#1E5799');

    // タイトル
    this.add.text(width / 2, 50, '🎒 アイテム一覧 🎒', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // アイテムリスト表示
    let yPos = 120;
    let totalItems = 0;

    mockItems.forEach((item, index) => {
      if (item.count > 0) {
        // アイテム名と個数
        this.add.text(50, yPos, `${item.name}`, {
          fontSize: '16px',
          color: '#FFFFFF'
        });

        this.add.text(width - 80, yPos, `×${item.count}`, {
          fontSize: '16px',
          color: '#FFFF99'
        });

        // レア度表示
        this.add.text(width - 150, yPos, `(${item.rarity})`, {
          fontSize: '14px',
          color: this.getRarityColor(item.rarity)
        });

        yPos += 40;
        totalItems += item.count;
      }
    });

    // 総アイテム数表示
    this.add.text(width / 2, yPos + 40, `総アイテム数: ${totalItems}`, {
      fontSize: '16px',
      color: '#87CEEB',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 戻るボタン
    const backButton = this.add.rectangle(width / 2, height - 80, 150, 50, 0x2196F3, 0.8);
    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.start('MainScene', {
        currentStage: this.currentStage,
        gold: this.gold
      });
    });

    this.add.text(width / 2, height - 80, '戻る', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private getRarityColor(rarity: string): string {
    const colors: { [key: string]: string } = {
      'S': '#FFD700', // 金色
      'A': '#FF4444', // 赤色
      'B': '#9966FF', // 紫色
      'C': '#4488FF', // 青色
      'D': '#44FF44', // 緑色
      'E': '#FFFFFF', // 白色
      'F': '#CCCCCC'  // 灰色
    };
    return colors[rarity] || '#FFFFFF';
  }
}
