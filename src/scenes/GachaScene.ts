import { Scene } from 'phaser';
import { mockItems } from '../data/mockItems';

export class GachaScene extends Scene {
  private currentStage: number = 1;
  private gold: number = 1250;

  constructor() {
    super({ key: 'GachaScene' });
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

    console.log('🎬 === GACHA SCENE ===');
    console.log('📍 Current Scene: ガチャ画面');

    // 背景色設定
    this.cameras.main.setBackgroundColor('#2E4057');

    // タイトル
    this.add.text(width / 2, 50, '🎰 オーシャンガチャ 🎰', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ゴールド表示
    this.add.text(width / 2, 90, `ゴールド: ${this.gold}`, {
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ガチャ価格表示
    this.add.text(width / 2, 150, '1回 100G', {
      fontSize: '18px',
      color: '#87CEEB'
    }).setOrigin(0.5);

    // 1回引くボタン
    const singleButton = this.add.rectangle(width / 2 - 80, 220, 120, 50, 0x4CAF50, 0.8);
    singleButton.setInteractive();
    singleButton.on('pointerdown', () => {
      this.drawGacha(1);
    });

    this.add.text(width / 2 - 80, 220, '1回引く', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 10回引くボタン
    const tenButton = this.add.rectangle(width / 2 + 80, 220, 120, 50, 0xFF9800, 0.8);
    tenButton.setInteractive();
    tenButton.on('pointerdown', () => {
      this.drawGacha(10);
    });

    this.add.text(width / 2 + 80, 220, '10回引く', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 排出アイテム一覧
    this.add.text(width / 2, 300, '排出アイテム:', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    let yPos = 340;
    mockItems.slice(0, 6).forEach(item => {
      this.add.text(width / 2, yPos, `• ${item.name} (${item.rarity})`, {
        fontSize: '14px',
        color: this.getRarityColor(item.rarity)
      }).setOrigin(0.5);
      yPos += 25;
    });

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

  private drawGacha(count: number) {
    const cost = count * 100;
    
    if (this.gold < cost) {
      console.log('💰 ゴールドが不足しています');
      return;
    }

    console.log(`🎰 ガチャを${count}回引きます`);
    
    // ランダムでアイテムを選択（モック実装）
    const availableItems = mockItems.filter(item => item.count > 0);
    const drawnItems = [];
    
    for (let i = 0; i < count; i++) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      drawnItems.push(randomItem);
    }

    // ゴールドを消費
    this.gold -= cost;

    // ガチャ結果画面に遷移
    this.scene.start('GachaResultScene', {
      currentStage: this.currentStage,
      gold: this.gold,
      drawnItems: drawnItems,
      drawCount: count
    });
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
