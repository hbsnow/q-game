import { Scene } from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';
import { GachaManager } from '../utils/GachaManager';
import { getRarityColor } from '../data/ItemData';
import { ItemType } from '../types';

export class GachaScene extends Scene {
  private gameStateManager!: GameStateManager;
  private gachaManager!: GachaManager;
  private currentStage: number = 1;
  private gold: number = 0;
  private errorMessage: Phaser.GameObjects.Text | null = null;
  private goldText!: Phaser.GameObjects.Text;
  private singleButton!: Phaser.GameObjects.Rectangle;
  private tenButton!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'GachaScene' });
  }

  init(data: any) {
    // GameStateManagerを取得
    this.gameStateManager = data.gameStateManager || GameStateManager.getInstance();
    
    // GachaManagerを取得
    this.gachaManager = GachaManager.getInstance();
    
    // 現在のステージと所持ゴールドを取得
    this.currentStage = this.gameStateManager.getCurrentStage();
    this.gold = this.gameStateManager.getGold();
    
    // ガチャマネージャーに現在のステージを設定
    this.gachaManager.setCurrentStage(this.currentStage);
    
    console.log(`GachaScene initialized: Stage ${this.currentStage}, Gold ${this.gold}`);
  }

  create() {
    const { width, height } = this.cameras.main;

    console.log('🎬 === GACHA SCENE ===');
    console.log('📍 Current Scene: ガチャ画面');

    // 背景色設定（海のグラデーション）
    this.cameras.main.setBackgroundColor('#2E4057');
    
    // 海の波のような背景エフェクト
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x1E3B5E, 0x1E3B5E, 0x2E4057, 0x2E4057, 1);
    bgGraphics.fillRect(0, 0, width, height);
    
    // 波エフェクト
    const wave1 = this.add.graphics();
    wave1.fillStyle(0x3A6EA5, 0.2);
    wave1.fillEllipse(width / 2, height * 0.7, width * 1.5, 100);
    
    const wave2 = this.add.graphics();
    wave2.fillStyle(0x87CEEB, 0.1);
    wave2.fillEllipse(width / 2, height * 0.3, width * 1.2, 80);

    // タイトル
    const titleBg = this.add.rectangle(width / 2, 50, 300, 50, 0x1A3A5A, 0.8);
    titleBg.setStrokeStyle(2, 0x87CEEB, 0.8);
    
    this.add.text(width / 2, 50, '🎰 オーシャンガチャ 🎰', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ゴールド表示
    const goldBg = this.add.rectangle(width / 2, 90, 200, 30, 0x000000, 0.5);
    this.goldText = this.add.text(width / 2, 90, `ゴールド: ${this.gold}`, {
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ガチャ価格表示
    const priceBg = this.add.rectangle(width / 2, 150, 250, 40, 0x1A3A5A, 0.7);
    
    const singlePrice = this.gachaManager.getGachaPrice();
    const tenPrice = this.gachaManager.getGacha10Price();
    
    this.add.text(width / 2, 150, `1回 ${singlePrice}G / 10回 ${tenPrice}G`, {
      fontSize: '16px',
      color: '#87CEEB'
    }).setOrigin(0.5);

    // 1回引くボタン
    this.singleButton = this.add.rectangle(width / 2 - 80, 220, 120, 50, 0x4CAF50, 0.8);
    this.singleButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    this.singleButton.setInteractive();
    
    // ホバーエフェクト
    this.singleButton.on('pointerover', () => {
      this.singleButton.setFillStyle(0x5DBF60, 0.9);
    });
    this.singleButton.on('pointerout', () => {
      this.singleButton.setFillStyle(0x4CAF50, 0.8);
    });
    
    this.singleButton.on('pointerdown', () => {
      this.drawGacha(1);
    });

    this.add.text(width / 2 - 80, 220, '1回引く', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 10回引くボタン
    this.tenButton = this.add.rectangle(width / 2 + 80, 220, 120, 50, 0xFF9800, 0.8);
    this.tenButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    this.tenButton.setInteractive();
    
    // ホバーエフェクト
    this.tenButton.on('pointerover', () => {
      this.tenButton.setFillStyle(0xFFA726, 0.9);
    });
    this.tenButton.on('pointerout', () => {
      this.tenButton.setFillStyle(0xFF9800, 0.8);
    });
    
    this.tenButton.on('pointerdown', () => {
      this.drawGacha(10);
    });

    this.add.text(width / 2 + 80, 220, '10回引く', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 排出アイテム一覧
    const itemListBg = this.add.rectangle(width / 2, 450, width - 40, 300, 0x1A3A5A, 0.6);
    itemListBg.setStrokeStyle(1, 0x87CEEB, 0.5);
    
    this.add.text(width / 2, 300, '排出アイテム:', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 排出確率表示
    const rarityRates = this.gachaManager.getRarityRates();
    let rateY = 330;
    
    Object.entries(rarityRates).forEach(([rarity, rate]) => {
      if (rate > 0) {
        this.add.text(width / 2, rateY, `${rarity}レア: ${rate.toFixed(1)}%`, {
          fontSize: '12px',
          color: getRarityColor(rarity as any),
          fontStyle: 'bold'
        }).setOrigin(0.5);
        rateY += 20;
      }
    });
    
    // 排出アイテム一覧
    const availableItems = this.gachaManager.getAvailableItems();
    
    // 左右2列に分けて表示
    let leftY = 400;
    let rightY = 400;
    const midX = width / 2;
    
    availableItems.forEach((item, index) => {
      const isLeft = index % 2 === 0;
      const x = isLeft ? midX - 80 : midX + 80;
      const y = isLeft ? leftY : rightY;
      
      this.add.text(x, y, `• ${item.name} (${item.rarity})`, {
        fontSize: '12px',
        color: getRarityColor(item.rarity)
      }).setOrigin(0.5);
      
      if (isLeft) {
        leftY += 20;
      } else {
        rightY += 20;
      }
    });

    // 戻るボタン
    const backButton = this.add.rectangle(width / 2, height - 80, 150, 50, 0x2196F3, 0.8);
    backButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    backButton.setInteractive();
    
    // ホバーエフェクト
    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x42A5F5, 0.9);
    });
    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x2196F3, 0.8);
    });
    
    backButton.on('pointerdown', () => {
      this.scene.start('MainScene', {
        gameStateManager: this.gameStateManager
      });
    });

    this.add.text(width / 2, height - 80, '戻る', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // ボタンの有効/無効状態を更新
    this.updateButtonStates();
  }

  private drawGacha(count: number) {
    const cost = count === 1 ? 
      this.gachaManager.getGachaPrice() : 
      this.gachaManager.getGacha10Price();
    
    if (this.gold < cost) {
      this.showError(`ゴールドが不足しています (必要: ${cost}G)`);
      return;
    }

    console.log(`🎰 ガチャを${count}回引きます (コスト: ${cost}G)`);
    
    // ガチャを実行
    const result = count === 1 ? 
      this.gachaManager.drawGacha() : 
      this.gachaManager.draw10Gacha();
    
    // ゴールドを消費
    this.gold -= cost;
    this.gameStateManager.getGameState().gold = this.gold;
    
    // 獲得したアイテムを所持アイテムに追加
    const itemManager = this.gameStateManager.getItemManager();
    result.items.forEach(item => {
      itemManager.addItem(item.type, item.count);
    });
    
    // 獲得アイテムの詳細情報を作成
    const drawnItems = result.items.map(item => {
      const itemData = this.gameStateManager.getItemManager().getAllItems()
        .find(i => i.type === item.type);
      
      return itemData || {
        id: `${item.type}_temp`,
        type: item.type as ItemType,
        name: item.type,
        rarity: 'E',
        count: item.count,
        description: '',
        unlockStage: 1
      };
    });

    // ガチャ結果画面に遷移
    this.scene.start('GachaResultScene', {
      gameStateManager: this.gameStateManager,
      drawnItems: drawnItems,
      drawCount: count,
      isRare: result.isRare
    });
  }

  private showError(message: string) {
    // 既存のエラーメッセージがあれば削除
    if (this.errorMessage) {
      this.errorMessage.destroy();
    }
    
    const { width } = this.cameras.main;
    
    // エラーメッセージ背景
    const errorBg = this.add.rectangle(width / 2, 280, 300, 40, 0xFF0000, 0.7);
    
    // エラーメッセージテキスト
    this.errorMessage = this.add.text(width / 2, 280, message, {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 3秒後に消える
    this.time.delayedCall(3000, () => {
      if (this.errorMessage) {
        this.errorMessage.destroy();
        errorBg.destroy();
        this.errorMessage = null;
      }
    });
  }
  
  private updateButtonStates() {
    const singlePrice = this.gachaManager.getGachaPrice();
    const tenPrice = this.gachaManager.getGacha10Price();
    
    // 1回ガチャボタンの状態更新
    if (this.gold < singlePrice) {
      this.singleButton.setFillStyle(0x888888, 0.5);
      this.singleButton.disableInteractive();
    } else {
      this.singleButton.setFillStyle(0x4CAF50, 0.8);
      this.singleButton.setInteractive();
    }
    
    // 10連ガチャボタンの状態更新
    if (this.gold < tenPrice) {
      this.tenButton.setFillStyle(0x888888, 0.5);
      this.tenButton.disableInteractive();
    } else {
      this.tenButton.setFillStyle(0xFF9800, 0.8);
      this.tenButton.setInteractive();
    }
  }
}
