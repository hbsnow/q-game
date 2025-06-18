import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';
import { GachaManager, ItemDropRate } from '../managers/GachaManager';
import { StageManager } from '../managers/StageManager';
import { ItemManager } from '../managers/ItemManager';

/**
 * ガチャ画面
 */
export class GachaScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private gameStateManager: GameStateManager;
  private stageManager: StageManager;
  private itemManager: ItemManager;
  private currentStage: number = 1;
  private currentGold: number = 0;
  private dropRates: ItemDropRate[] = [];
  private showingRates: boolean = false;

  constructor() {
    super({ key: 'GachaScene' });
    this.gameStateManager = GameStateManager.getInstance();
    this.stageManager = StageManager.getInstance();
    this.itemManager = new ItemManager();
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#1E5799');
    
    // 現在のステージとゴールドを取得
    this.currentStage = this.stageManager.getCurrentStage();
    this.currentGold = this.gameStateManager.getGold();
    
    // 排出確率を取得
    this.dropRates = GachaManager.getDropRates(this.currentStage);
    
    this.createUI();
    this.addDebugLines();
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleY = 30;
    this.add.text(width / 2, titleY, 'ガチャ', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // ゴールド表示
    this.add.text(width - 10, titleY, `ゴールド: ${this.currentGold}`, {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'Arial'
    }).setOrigin(1, 0.5);

    // メインコンテンツエリア
    this.createGachaContent();
    
    // ボタンエリア
    this.createButtons();
  }

  private createGachaContent(): void {
    const { width, height } = this.cameras.main;
    const contentY = 100;
    
    // ガチャ名
    this.add.text(width / 2, contentY, 'オーシャンガチャ', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // ガチャ価格
    const costs = GachaManager.getCosts();
    this.add.text(width / 2, contentY + 30, `(${costs.single}G)`, {
      fontSize: '16px',
      color: '#FFFF00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // ガチャボタン
    this.createGachaButtons();
    
    // 排出アイテム一覧
    this.createItemList();
  }

  private createGachaButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = 200;
    const costs = GachaManager.getCosts();
    
    // 1回引くボタン
    const singleButton = this.add.rectangle(width / 2 - 80, buttonY, 140, 50, 0x0066CC)
      .setInteractive({ useHandCursor: this.currentGold >= costs.single });
    
    const singleText = this.add.text(width / 2 - 80, buttonY, '1回引く', {
      fontSize: '16px',
      color: this.currentGold >= costs.single ? '#FFFFFF' : '#AAAAAA',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    if (this.currentGold >= costs.single) {
      singleButton.on('pointerdown', () => this.onSingleGacha());
      this.addButtonHoverEffect(singleButton, singleText);
    } else {
      singleButton.setFillStyle(0x666666);
    }
    
    // 10回引くボタン
    const multiButton = this.add.rectangle(width / 2 + 80, buttonY, 140, 50, 0x0066CC)
      .setInteractive({ useHandCursor: this.currentGold >= costs.multi });
    
    const multiText = this.add.text(width / 2 + 80, buttonY, '10回引く', {
      fontSize: '16px',
      color: this.currentGold >= costs.multi ? '#FFFFFF' : '#AAAAAA',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    if (this.currentGold >= costs.multi) {
      multiButton.on('pointerdown', () => this.onMultiGacha());
      this.addButtonHoverEffect(multiButton, multiText);
    } else {
      multiButton.setFillStyle(0x666666);
    }
  }

  private createItemList(): void {
    const { width, height } = this.cameras.main;
    const listY = 280;
    
    // 排出アイテムタイトル
    this.add.text(width / 2, listY, '排出アイテム:', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // アイテムリスト（最初の6個まで表示）
    const displayItems = this.dropRates.slice(0, 6);
    displayItems.forEach((item, index) => {
      const itemY = listY + 40 + (index * 25);
      this.add.text(width / 2, itemY, `• ${item.item.name}`, {
        fontSize: '14px',
        color: '#CCCCCC',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });
    
    // 確率表示ボタン
    const rateButton = this.add.rectangle(width / 2, height - 120, 120, 30, 0x444444)
      .setInteractive({ useHandCursor: true });
    
    const rateText = this.add.text(width / 2, height - 120, '確率表示', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    rateButton.on('pointerdown', () => this.toggleRateDisplay());
    this.addButtonHoverEffect(rateButton, rateText);
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    
    // 戻るボタン
    const backButton = this.add.rectangle(width / 2, height - 60, 120, 40, 0x666666)
      .setInteractive({ useHandCursor: true });
    
    const backText = this.add.text(width / 2, height - 60, '戻る', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    backButton.on('pointerdown', () => this.onBack());
    this.addButtonHoverEffect(backButton, backText);
  }

  private onSingleGacha(): void {
    const costs = GachaManager.getCosts();
    if (this.currentGold < costs.single) return;
    
    // ガチャ実行
    const result = GachaManager.drawSingle(this.currentStage);
    
    // ゴールド消費
    this.gameStateManager.spendGold(result.totalCost);
    
    // アイテム追加
    result.items.forEach(item => {
      this.itemManager.addItem(item.id, 1);
    });
    
    // ガチャ結果画面に遷移
    this.scene.start('GachaResultScene', {
      items: result.items,
      cost: result.totalCost,
      isMulti: false
    });
  }

  private onMultiGacha(): void {
    const costs = GachaManager.getCosts();
    if (this.currentGold < costs.multi) return;
    
    // ガチャ実行
    const result = GachaManager.drawMulti(this.currentStage);
    
    // ゴールド消費
    this.gameStateManager.spendGold(result.totalCost);
    
    // アイテム追加
    result.items.forEach(item => {
      this.itemManager.addItem(item.id, 1);
    });
    
    // ガチャ結果画面に遷移
    this.scene.start('GachaResultScene', {
      items: result.items,
      cost: result.totalCost,
      isMulti: true
    });
  }

  private toggleRateDisplay(): void {
    this.showingRates = !this.showingRates;
    
    if (this.showingRates) {
      this.showRateDisplay();
    } else {
      this.hideRateDisplay();
    }
  }

  private showRateDisplay(): void {
    const { width, height } = this.cameras.main;
    
    // オーバーレイ背景
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setInteractive()
      .setName('rateOverlay');
    
    // 確率表示パネル
    const panel = this.add.rectangle(width / 2, height / 2, width - 40, height - 100, 0x333333)
      .setName('ratePanel');
    
    // タイトル
    this.add.text(width / 2, 80, '排出確率', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('rateTitle');
    
    // 確率リスト
    this.dropRates.forEach((item, index) => {
      const itemY = 120 + (index * 30);
      if (itemY < height - 100) {
        this.add.text(50, itemY, `${item.item.name} (${item.item.rarity})`, {
          fontSize: '14px',
          color: '#FFFFFF',
          fontFamily: 'Arial'
        }).setName('rateItem');
        
        this.add.text(width - 50, itemY, `${item.rate.toFixed(2)}%`, {
          fontSize: '14px',
          color: '#FFFF00',
          fontFamily: 'Arial'
        }).setOrigin(1, 0).setName('rateItem');
      }
    });
    
    // 閉じるボタン
    const closeButton = this.add.rectangle(width / 2, height - 50, 100, 30, 0x666666)
      .setInteractive({ useHandCursor: true })
      .setName('rateClose');
    
    const closeText = this.add.text(width / 2, height - 50, '閉じる', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('rateClose');
    
    // シンプルなクリックイベントのみ（ホバーエフェクトは削除）
    closeButton.on('pointerdown', () => this.hideRateDisplay());
  }

  private hideRateDisplay(): void {
    // 確率表示関連のオブジェクトを削除（配列のコピーを作成して安全に削除）
    const childrenToDestroy = this.children.list.filter(child => {
      return child.name && (
        child.name === 'rateOverlay' ||
        child.name === 'ratePanel' ||
        child.name === 'rateTitle' ||
        child.name === 'rateItem' ||
        child.name === 'rateClose'
      );
    });
    
    // 安全に削除
    childrenToDestroy.forEach(child => {
      if (child && !child.scene) return; // 既に破棄されている場合はスキップ
      try {
        child.destroy();
      } catch (error) {
        console.warn('Error destroying child:', error);
      }
    });
    
    this.showingRates = false;
  }

  private onBack(): void {
    this.scene.start('MainScene');
  }

  private addButtonHoverEffect(button: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text): void {
    const originalColor = button.fillColor;
    const originalTextColor = text.style.color;
    
    button.on('pointerover', () => {
      // オブジェクトが有効かチェック
      if (!button.scene || !text.scene) return;
      try {
        button.setFillStyle(originalColor + 0x222222);
        text.setColor('#FFFF00');
      } catch (error) {
        console.warn('Error in hover effect:', error);
      }
    });
    
    button.on('pointerout', () => {
      // オブジェクトが有効かチェック
      if (!button.scene || !text.scene) return;
      try {
        button.setFillStyle(originalColor);
        text.setColor(originalTextColor);
      } catch (error) {
        console.warn('Error in hover effect:', error);
      }
    });
  }

  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // DebugHelperは中心点座標を期待するため、左上座標から中心点座標に変換
    
    // タイトルエリア（0-70px → 中心点: 35px）
    this.debugHelper.addAreaBorder(width / 2, 35, width, 70, 0xFF0000, 'タイトルエリア');
    
    // ガチャ名・価格エリア（70-170px → 中心点: 120px）
    this.debugHelper.addAreaBorder(width / 2, 120, width, 100, 0x0000FF, 'ガチャ名・価格エリア');
    
    // ガチャボタンエリア（170-250px → 中心点: 210px）
    this.debugHelper.addAreaBorder(width / 2, 210, width, 80, 0x00FF00, 'ガチャボタンエリア');
    
    // アイテムリストエリア（250-530px → 中心点: 390px）
    this.debugHelper.addAreaBorder(width / 2, 390, width, 280, 0xFFFF00, 'アイテムリストエリア');
    
    // 確率表示ボタンエリア（height-135からheight-105px → 中心点: height-120px）
    this.debugHelper.addAreaBorder(width / 2, height - 120, width, 30, 0x00FFFF, '確率表示ボタンエリア');
    
    // 戻るボタンエリア（height-80からheight → 中心点: height-40px）
    this.debugHelper.addAreaBorder(width / 2, height - 40, width, 80, 0xFF00FF, '戻るボタンエリア');
  }
}
