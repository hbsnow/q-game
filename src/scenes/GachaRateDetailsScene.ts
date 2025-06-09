import { Scene } from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';
import { GachaManager } from '../utils/GachaManager';
import { getRarityColor } from '../data/ItemData';
import { ItemType } from '../types';

export class GachaRateDetailsScene extends Scene {
  private gameStateManager!: GameStateManager;
  private gachaManager!: GachaManager;

  constructor() {
    super({ key: 'GachaRateDetailsScene' });
  }

  init(data: any) {
    this.gameStateManager = data.gameStateManager || GameStateManager.getInstance();
    this.gachaManager = GachaManager.getInstance();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景色設定（半透明の黒）
    this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.7)');
    
    // タイトル
    this.add.text(width / 2, 30, '排出確率詳細', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 閉じるボタン
    const closeButton = this.add.rectangle(width - 30, 30, 30, 30, 0xFF5555, 0.8);
    closeButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      this.scene.resume('GachaScene');
      this.scene.stop();
    });
    
    this.add.text(width - 30, 30, '×', {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // テーブルヘッダー
    const headerBg = this.add.rectangle(width / 2, 70, width - 40, 25, 0x2A4A6A, 0.9);
    headerBg.setStrokeStyle(1, 0xFFFFFF, 0.5);
    
    this.add.text(width / 2 - 100, 70, 'レア度', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 70, '排出確率', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(width / 2 + 100, 70, '出現数', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // レア度ごとの確率
    const rarityRates = this.gachaManager.getRarityRates();
    let rateY = 95; // ヘッダーの下から開始
    
    // 各レア度の行
    const rarities: string[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const availableItems = this.gachaManager.getAvailableItems();
    
    rarities.forEach((rarity, index) => {
      const rowBg = this.add.rectangle(width / 2, rateY, width - 40, 25, index % 2 === 0 ? 0x1A3A5A : 0x2A4A6A, 0.7);
      rowBg.setStrokeStyle(1, 0x87CEEB, 0.3);
      
      // レア度
      this.add.text(width / 2 - 100, rateY, rarity, {
        fontSize: '14px',
        color: getRarityColor(rarity as any),
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 排出確率
      const rate = rarityRates[rarity as keyof typeof rarityRates] || 0;
      this.add.text(width / 2, rateY, `${rate.toFixed(1)}%`, {
        fontSize: '14px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      // 出現アイテム数
      const itemCount = availableItems.filter(item => item.rarity === rarity).length;
      this.add.text(width / 2 + 100, rateY, `${itemCount}個`, {
        fontSize: '14px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      rateY += 25;
    });
    
    // 10連ガチャの確定枠説明
    rateY += 10;
    const guaranteedBg = this.add.rectangle(width / 2, rateY, width - 40, 40, 0x32CD32, 0.2);
    guaranteedBg.setStrokeStyle(1, 0x32CD32, 0.5);
    
    this.add.text(width / 2, rateY - 8, '10連ガチャ: Dレア以上1枠確定!', {
      fontSize: '14px',
      color: '#32CD32',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, rateY + 10, '（Dレア以上が出なかった場合のみ）', {
      fontSize: '10px',
      color: '#CCCCCC'
    }).setOrigin(0.5);
    
    // 出現アイテム一覧
    rateY += 50;
    this.add.text(width / 2, rateY, '出現アイテム一覧', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    rateY += 20;
    
    // レア度ごとにアイテムをグループ化
    const itemsByRarity: { [key: string]: { name: string, type: ItemType }[] } = {};
    
    availableItems.forEach(item => {
      if (!itemsByRarity[item.rarity]) {
        itemsByRarity[item.rarity] = [];
      }
      itemsByRarity[item.rarity].push({ name: item.name, type: item.type });
    });
    
    // レア度ごとにアイテムを表示
    let currentY = rateY;
    
    rarities.forEach(rarity => {
      const items = itemsByRarity[rarity];
      if (!items || items.length === 0) return;
      
      // レア度ヘッダー
      const rarityBg = this.add.rectangle(width / 2, currentY, width - 40, 25, parseInt(getRarityColor(rarity as any).replace('#', '0x')), 0.3);
      rarityBg.setStrokeStyle(1, parseInt(getRarityColor(rarity as any).replace('#', '0x')), 0.5);
      
      this.add.text(width / 2, currentY, `${rarity}レア (${items.length}個)`, {
        fontSize: '14px',
        color: getRarityColor(rarity as any),
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      currentY += 25;
      
      // アイテム一覧（3列に分ける）
      const columns = 3;
      const columnWidth = (width - 40) / columns;
      
      // 最大表示数を制限（画面に収まる数）
      const maxRows = 2;
      const displayItems = items.slice(0, columns * maxRows);
      const hasMore = items.length > displayItems.length;
      
      displayItems.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        const x = width / 2 - (width - 40) / 2 + columnWidth / 2 + col * columnWidth;
        const y = currentY + row * 18;
        
        this.add.text(x, y, item.name, {
          fontSize: '10px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
      });
      
      currentY += Math.min(Math.ceil(items.length / columns), maxRows) * 18;
      
      // 表示しきれないアイテムがある場合
      if (hasMore) {
        this.add.text(width / 2, currentY, `...他 ${items.length - displayItems.length} アイテム`, {
          fontSize: '10px',
          color: '#AAAAAA',
          fontStyle: 'italic'
        }).setOrigin(0.5);
        currentY += 15;
      }
      
      currentY += 5;
    });
    
    // 閉じるボタン（下部）
    const bottomCloseButton = this.add.rectangle(width / 2, height - 30, 120, 30, 0x2196F3, 0.8);
    bottomCloseButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    bottomCloseButton.setInteractive();
    bottomCloseButton.on('pointerdown', () => {
      this.scene.resume('GachaScene');
      this.scene.stop();
    });
    
    this.add.text(width / 2, height - 30, '閉じる', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 表示要素が多すぎる場合は省略表示
    if (currentY > height - 50) {
      // 省略メッセージを追加
      this.add.text(width / 2, height - 60, '※ 一部のアイテムは省略表示されています', {
        fontSize: '10px',
        color: '#CCCCCC',
        fontStyle: 'italic'
      }).setOrigin(0.5);
    }
    
    // 画面全体をクリックで閉じる
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 閉じるボタンの領域をクリックした場合は何もしない（ボタン自身のイベントが処理する）
      if ((pointer.x > width - 45 && pointer.x < width - 15 && pointer.y > 15 && pointer.y < 45) ||
          (pointer.x > width / 2 - 60 && pointer.x < width / 2 + 60 && pointer.y > height - 45 && pointer.y < height - 15)) {
        return;
      }
      
      this.scene.resume('GachaScene');
      this.scene.stop();
    });
  }
}
