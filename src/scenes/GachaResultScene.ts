import { Scene } from 'phaser';
import { Item } from '../types/Item';

export class GachaResultScene extends Scene {
  private currentStage: number = 1;
  private gold: number = 1250;
  private drawnItems: Item[] = [];
  private drawCount: number = 1;

  constructor() {
    super({ key: 'GachaResultScene' });
  }

  init(data: any) {
    if (data.currentStage) {
      this.currentStage = data.currentStage;
    }
    if (data.gold !== undefined) {
      this.gold = data.gold;
    }
    if (data.drawnItems) {
      this.drawnItems = data.drawnItems;
    }
    if (data.drawCount) {
      this.drawCount = data.drawCount;
    }
  }

  create() {
    const { width, height } = this.cameras.main;

    console.log('🎬 === GACHA RESULT SCENE ===');
    console.log('📍 Current Scene: ガチャ結果画面');
    console.log('🎁 獲得アイテム:', this.drawnItems);

    // 背景色設定
    this.cameras.main.setBackgroundColor('#2E4057');

    // タイトル
    this.add.text(width / 2, 50, '🎁 ガチャ結果 🎁', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 結果表示
    if (this.drawCount === 1) {
      // 1回引きの場合
      const item = this.drawnItems[0];
      if (item) {
        // アイテム名
        this.add.text(width / 2, 200, item.name, {
          fontSize: '24px',
          color: this.getRarityColor(item.rarity),
          fontStyle: 'bold'
        }).setOrigin(0.5);

        // レア度表示
        this.add.text(width / 2, 240, `レア度: ${item.rarity}`, {
          fontSize: '16px',
          color: this.getRarityColor(item.rarity)
        }).setOrigin(0.5);

        // 獲得数
        this.add.text(width / 2, 280, '×1', {
          fontSize: '18px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
      }
    } else {
      // 10回引きの場合
      this.add.text(width / 2, 120, `${this.drawCount}回の結果:`, {
        fontSize: '16px',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      let yPos = 160;
      const itemCounts: { [key: string]: number } = {};

      // アイテムをカウント
      this.drawnItems.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
      });

      // 結果表示
      Object.entries(itemCounts).forEach(([itemName, count]) => {
        const item = this.drawnItems.find(i => i.name === itemName);
        if (item) {
          this.add.text(width / 2, yPos, `${itemName} ×${count} (${item.rarity})`, {
            fontSize: '14px',
            color: this.getRarityColor(item.rarity)
          }).setOrigin(0.5);
          yPos += 25;
        }
      });
    }

    // ボタン配置
    const buttonY = height - 120;

    // もう一度ボタン
    const againButton = this.add.rectangle(width / 2 - 80, buttonY, 120, 50, 0x4CAF50, 0.8);
    againButton.setInteractive();
    againButton.on('pointerdown', () => {
      this.scene.start('GachaScene', {
        currentStage: this.currentStage,
        gold: this.gold
      });
    });

    this.add.text(width / 2 - 80, buttonY, 'もう一度', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 戻るボタン
    const backButton = this.add.rectangle(width / 2 + 80, buttonY, 120, 50, 0x2196F3, 0.8);
    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.start('GachaScene', {
        currentStage: this.currentStage,
        gold: this.gold
      });
    });

    this.add.text(width / 2 + 80, buttonY, '戻る', {
      fontSize: '14px',
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
