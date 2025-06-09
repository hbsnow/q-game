import { Scene } from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';
import { GachaManager } from '../utils/GachaManager';
import { getRarityColor, ITEM_DATA } from '../data/ItemData';
import { ItemType } from '../types';
import { DebugHelper } from '../utils/DebugHelper';

export class GachaScene extends Scene {
  private gameStateManager!: GameStateManager;
  private gachaManager!: GachaManager;
  private currentStage: number = 1;
  private gold: number = 0;
  private errorMessage: Phaser.GameObjects.Text | null = null;
  // ゴールド表示用テキスト - updateButtonStatesで使用
  private goldText!: Phaser.GameObjects.Text;
  private singleButton!: Phaser.GameObjects.Rectangle; // 1回ガチャボタン
  private tenButton!: Phaser.GameObjects.Rectangle; // 10連ガチャボタン
  private rateDetailsContainer: Phaser.GameObjects.Container | null = null;
  private isDrawing: boolean = false; // ガチャ実行中フラグ
  private loadingSpinner: Phaser.GameObjects.Container | null = null; // ローディングスピナー
  private debugHelper!: DebugHelper;

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
    this.add.rectangle(width / 2, 90, 200, 30, 0x000000, 0.5);
    this.goldText = this.add.text(width / 2, 90, `ゴールド: ${this.gold}`, {
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ガチャ価格表示
    this.add.rectangle(width / 2, 150, 250, 40, 0x1A3A5A, 0.7);
    
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

    // 10連ガチャの特典表示
    this.add.rectangle(width / 2, 270, 300, 30, 0x1A3A5A, 0.6);
    this.add.text(width / 2, 270, '10連ガチャ: Dレア以上1枠確定!', {
      fontSize: '12px',
      color: '#32CD32',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 確率表示ボタン
    const rateButton = this.add.rectangle(width / 2, 310, 200, 40, 0x1A3A5A, 0.7);
    rateButton.setStrokeStyle(1, 0x87CEEB, 0.5);
    rateButton.setInteractive();
    
    // ホバーエフェクト
    rateButton.on('pointerover', () => {
      rateButton.setFillStyle(0x2A4A6A, 0.8);
    });
    rateButton.on('pointerout', () => {
      rateButton.setFillStyle(0x1A3A5A, 0.7);
    });
    
    rateButton.on('pointerdown', () => {
      this.showRateDetails();
    });

    this.add.text(width / 2, 310, '排出確率を表示', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 排出アイテム一覧
    const itemListBg = this.add.rectangle(width / 2, 450, width - 40, 300, 0x1A3A5A, 0.6);
    itemListBg.setStrokeStyle(1, 0x87CEEB, 0.5);
    
    this.add.text(width / 2, 350, '排出アイテム:', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 排出確率表示
    const rarityRates = this.gachaManager.getRarityRates();
    let rateY = 380;
    
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
    let leftY = 450;
    let rightY = 450;
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
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // エリア境界線を追加
    this.addDebugLines();
  }
  
  private addDebugLines() {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア（赤色）
    this.debugHelper.addAreaBorder(width / 2, 30, width, 60, 0xFF0000, 'タイトルエリア');
    
    // ゴールド表示エリア（青色）
    this.debugHelper.addAreaBorder(width / 2, 90, width, 30, 0x0000FF, 'ゴールド表示');
    
    // ガチャ価格表示エリア（青色）
    this.debugHelper.addAreaBorder(width / 2, 150, width, 40, 0x0000FF, 'ガチャ価格表示');
    
    // ボタンエリア（紫色）
    this.debugHelper.addAreaBorder(width / 2, 220, width, 50, 0xFF00FF, 'ガチャボタンエリア');
    
    // 10連ガチャ特典表示エリア（青色）
    this.debugHelper.addAreaBorder(width / 2, 270, width, 30, 0x0000FF, '10連特典表示');
    
    // 確率表示ボタンエリア（紫色）
    this.debugHelper.addAreaBorder(width / 2, 310, width, 40, 0xFF00FF, '確率表示ボタン');
    
    // 排出アイテム見出しエリア（青色）
    this.debugHelper.addAreaBorder(width / 2, 350, width, 30, 0x0000FF, '排出アイテム見出し');
    
    // 排出確率表示エリア（黄色）
    const rarityRates = this.gachaManager.getRarityRates();
    const visibleRarities = Object.values(rarityRates).filter(rate => rate > 0).length;
    const rateHeight = 20 * visibleRarities;
    const rateY = 380 + (rateHeight / 2);
    this.debugHelper.addAreaBorder(width / 2, rateY, width, rateHeight, 0xFFFF00, '排出確率表示');
    
    // 排出アイテム一覧エリア（黄色）
    const availableItems = this.gachaManager.getAvailableItems();
    const itemsHeight = Math.ceil(availableItems.length / 2) * 20;
    const itemsY = rateY + (rateHeight / 2) + (itemsHeight / 2) + 10; // 10pxの間隔を追加
    this.debugHelper.addAreaBorder(width / 2, itemsY, width, itemsHeight, 0xFFFF00, '排出アイテム一覧');
    
    // 戻るボタンエリア（紫色）
    this.debugHelper.addAreaBorder(width / 2, height - 80, width, 50, 0xFF00FF, '戻るボタン');
  }

  private drawGacha(count: number) {
    // ガチャ実行中なら処理しない
    if (this.isDrawing) return;
    
    const cost = count === 1 ? 
      this.gachaManager.getGachaPrice() : 
      this.gachaManager.getGacha10Price();
    
    if (this.gold < cost) {
      this.showError(`ゴールドが不足しています (必要: ${cost}G)`);
      return;
    }

    console.log(`🎰 ガチャを${count}回引きます (コスト: ${cost}G)`);
    
    // ガチャ実行中フラグをセット
    this.isDrawing = true;
    
    // ローディングスピナーを表示
    this.showLoadingSpinner();
    
    // ガチャ演出のための遅延（実際のゲームでは適切な時間に調整）
    this.time.delayedCall(1500, () => {
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
      
      // 獲得アイテムの詳細情報を作成（集約されたアイテムを展開）
      const drawnItems = result.items.flatMap(item => {
        // 各アイテムをcount分だけ複製して展開
        return Array(item.count).fill(null).map(() => ({
          id: `${item.type}_temp`,
          type: item.type as ItemType,
          name: ITEM_DATA[item.type].name,
          rarity: ITEM_DATA[item.type].rarity,
          count: 1,
          description: ITEM_DATA[item.type].description,
          unlockStage: ITEM_DATA[item.type].unlockStage
        }));
      });
      
      console.log(`展開後のアイテム数: ${drawnItems.length}`);
      
      // ローディングスピナーを非表示
      this.hideLoadingSpinner();
      
      // ガチャ結果画面に遷移
      this.scene.start('GachaResultScene', {
        gameStateManager: this.gameStateManager,
        drawnItems: drawnItems,
        drawCount: count,
        isRare: result.isRare,
        guaranteedItemIndex: result.guaranteedItemIndex
      });
    });
  }

  private showLoadingSpinner() {
    const { width, height } = this.cameras.main;
    
    // ローディングスピナーのコンテナ
    this.loadingSpinner = this.add.container(width / 2, height / 2);
    
    // 半透明の背景オーバーレイ
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5);
    overlay.setOrigin(0.5);
    
    // スピナーの背景
    const spinnerBg = this.add.circle(0, 0, 50, 0x1A3A5A, 0.8);
    spinnerBg.setStrokeStyle(3, 0x87CEEB, 0.8);
    
    // スピナーのドット
    const dots = [];
    const dotCount = 8;
    const radius = 30;
    
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const size = 5;
      
      const dot = this.add.circle(x, y, size, 0xFFFFFF, 0.5 + (i / dotCount) * 0.5);
      dots.push(dot);
    }
    
    // 「抽選中...」テキスト
    const loadingText = this.add.text(0, 70, '抽選中...', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 宝箱アイコン
    const treasureIcon = this.add.rectangle(0, 0, 30, 20, 0xFFD700, 1);
    treasureIcon.setStrokeStyle(2, 0xFFFFFF, 0.8);
    
    // コンテナに追加
    this.loadingSpinner.add([overlay, spinnerBg, ...dots, loadingText, treasureIcon]);
    
    // スピナーのアニメーション
    this.tweens.add({
      targets: spinnerBg,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });
    
    // ドットのアニメーション
    dots.forEach((dot, i) => {
      this.tweens.add({
        targets: dot,
        scale: { from: 0.5, to: 1.5, yoyo: true },
        alpha: { from: 0.3, to: 1, yoyo: true },
        duration: 1000,
        repeat: -1,
        delay: i * (1000 / dotCount)
      });
    });
    
    // 宝箱のアニメーション
    this.tweens.add({
      targets: treasureIcon,
      y: { from: -5, to: 5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 泡エフェクト
    this.time.addEvent({
      delay: 300,
      callback: () => {
        if (this.loadingSpinner) {
          const bubbleX = Phaser.Math.Between(-40, 40);
          const bubbleY = Phaser.Math.Between(-40, 40);
          const bubbleSize = Phaser.Math.Between(2, 5);
          
          const bubble = this.add.circle(bubbleX, bubbleY, bubbleSize, 0xFFFFFF, 0.6);
          this.loadingSpinner.add(bubble);
          
          this.tweens.add({
            targets: bubble,
            y: bubbleY - 50,
            x: bubbleX + Phaser.Math.Between(-20, 20),
            alpha: 0,
            scale: { from: 1, to: 0 },
            duration: 1000,
            onComplete: () => {
              bubble.destroy();
            }
          });
        }
      },
      repeat: 20
    });
    
    // ボタンを無効化
    this.singleButton.disableInteractive();
    this.tenButton.disableInteractive();
  }

  private hideLoadingSpinner() {
    if (this.loadingSpinner) {
      this.loadingSpinner.destroy();
      this.loadingSpinner = null;
    }
    
    // ガチャ実行中フラグをリセット
    this.isDrawing = false;
    
    // ボタンの状態を更新
    this.updateButtonStates();
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
    
    // ガチャ実行中は全てのボタンを無効化
    if (this.isDrawing) {
      this.singleButton.setFillStyle(0x888888, 0.5);
      this.singleButton.disableInteractive();
      this.tenButton.setFillStyle(0x888888, 0.5);
      this.tenButton.disableInteractive();
      return;
    }
    
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
    
    // ゴールド表示を更新
    this.goldText.setText(`ゴールド: ${this.gold}`);
  }

  private showRateDetails() {
    // 既に表示されている場合は閉じる
    if (this.rateDetailsContainer) {
      this.rateDetailsContainer.destroy();
      this.rateDetailsContainer = null;
      return;
    }
    
    const { width, height } = this.cameras.main;
    
    // 確率詳細表示用のコンテナ
    this.rateDetailsContainer = this.add.container(width / 2, height / 2);
    
    // 背景オーバーレイ
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0.5);
    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      this.rateDetailsContainer?.destroy();
      this.rateDetailsContainer = null;
    });
    
    // 詳細パネル
    const panel = this.add.rectangle(0, 0, width - 60, height - 200, 0x1A3A5A, 0.9);
    panel.setStrokeStyle(2, 0x87CEEB, 0.8);
    
    // タイトル
    const titleText = this.add.text(0, -panel.height / 2 + 30, '排出確率詳細', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 閉じるボタン
    const closeButton = this.add.rectangle(panel.width / 2 - 30, -panel.height / 2 + 30, 40, 40, 0xFF5555, 0.8);
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      this.rateDetailsContainer?.destroy();
      this.rateDetailsContainer = null;
    });
    
    const closeText = this.add.text(panel.width / 2 - 30, -panel.height / 2 + 30, '×', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // レア度ごとの確率
    const rarityRates = this.gachaManager.getRarityRates();
    let rateY = -panel.height / 2 + 80;
    
    // レア度ごとの確率表示（表形式）
    const tableWidth = panel.width - 100;
    const tableHeight = 40;
    const tableX = 0;
    
    // テーブルヘッダー
    const headerBg = this.add.rectangle(tableX, rateY, tableWidth, tableHeight, 0x2A4A6A, 0.9);
    headerBg.setStrokeStyle(1, 0xFFFFFF, 0.5);
    
    this.add.text(tableX - tableWidth / 3, rateY, 'レア度', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(tableX, rateY, '排出確率', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(tableX + tableWidth / 3, rateY, '出現アイテム数', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    rateY += tableHeight;
    
    // 各レア度の行
    const rarities: string[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const availableItems = this.gachaManager.getAvailableItems();
    
    rarities.forEach((rarity, index) => {
      const rowBg = this.add.rectangle(tableX, rateY, tableWidth, tableHeight, index % 2 === 0 ? 0x1A3A5A : 0x2A4A6A, 0.7);
      rowBg.setStrokeStyle(1, 0x87CEEB, 0.3);
      
      // レア度
      this.add.text(tableX - tableWidth / 3, rateY, rarity, {
        fontSize: '16px',
        color: getRarityColor(rarity as any),
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 排出確率
      const rate = rarityRates[rarity as keyof typeof rarityRates] || 0;
      this.add.text(tableX, rateY, `${rate.toFixed(1)}%`, {
        fontSize: '16px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      // 出現アイテム数
      const itemCount = availableItems.filter(item => item.rarity === rarity).length;
      this.add.text(tableX + tableWidth / 3, rateY, `${itemCount}個`, {
        fontSize: '16px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      rateY += tableHeight;
    });
    
    // 10連ガチャの確定枠説明
    rateY += 20;
    const guaranteedBg = this.add.rectangle(tableX, rateY, tableWidth, 60, 0x32CD32, 0.2);
    guaranteedBg.setStrokeStyle(1, 0x32CD32, 0.5);
    
    this.add.text(tableX, rateY, '10連ガチャ: Dレア以上1枠確定!', {
      fontSize: '16px',
      color: '#32CD32',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(tableX, rateY + 25, '（通常の抽選でDレア以上が出なかった場合のみ）', {
      fontSize: '12px',
      color: '#CCCCCC'
    }).setOrigin(0.5);
    
    // 出現アイテム一覧
    rateY += 100;
    this.add.text(0, rateY, '出現アイテム一覧', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    rateY += 30;
    
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
      const rarityBg = this.add.rectangle(0, currentY, tableWidth, 30, parseInt(getRarityColor(rarity as any).replace('#', '0x')), 0.3);
      rarityBg.setStrokeStyle(1, parseInt(getRarityColor(rarity as any).replace('#', '0x')), 0.5);
      
      this.add.text(0, currentY, `${rarity}レア (${items.length}個)`, {
        fontSize: '14px',
        color: getRarityColor(rarity as any),
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      currentY += 35;
      
      // アイテム一覧（3列に分ける）
      const columns = 3;
      const columnWidth = tableWidth / columns;
      
      items.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        const x = -tableWidth / 2 + columnWidth / 2 + col * columnWidth;
        const y = currentY + row * 25;
        
        this.add.text(x, y, item.name, {
          fontSize: '12px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
      });
      
      currentY += Math.ceil(items.length / columns) * 25 + 15;
    });
    
    // 閉じるボタン（下部）
    const bottomCloseButton = this.add.rectangle(0, panel.height / 2 - 30, 150, 40, 0x2196F3, 0.8);
    bottomCloseButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    bottomCloseButton.setInteractive();
    bottomCloseButton.on('pointerdown', () => {
      this.rateDetailsContainer?.destroy();
      this.rateDetailsContainer = null;
    });
    
    this.add.text(0, panel.height / 2 - 30, '閉じる', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // コンテナに追加
    this.rateDetailsContainer.add([
      overlay, panel, titleText, closeButton, closeText,
      headerBg, guaranteedBg, bottomCloseButton
    ]);
    
    // スクロール可能なコンテンツエリアを作成（必要に応じて）
    if (currentY > panel.height / 2 - 50) {
      // スクロール機能の実装（Phaserのマスク機能を使用）
      // 実装は複雑になるため、必要に応じて追加
    }
  }
}
