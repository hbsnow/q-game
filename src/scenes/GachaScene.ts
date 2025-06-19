import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';
import { GachaManager, GachaResult } from '../managers/GachaManager';
import { StageManager } from '../managers/StageManager';
import { ItemManager } from '../managers/ItemManager';
import { SoundManager } from '../utils/SoundManager';
import { AnimationManager, TransitionType } from '../utils/AnimationManager';
import { BackgroundManager } from '../utils/BackgroundManager';
import { SimpleOceanButton } from '../components/SimpleOceanButton';

/**
 * ガチャ画面
 */
export class GachaScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private gameStateManager: GameStateManager;
  private stageManager: StageManager;
  private itemManager: ItemManager;
  private gachaManager: GachaManager;
  private soundManager!: SoundManager;
  private animationManager!: AnimationManager;
  private backgroundManager!: BackgroundManager;
  private currentStage: number = 1;
  private currentGold: number = 0;
  private dropRates: { rarity: string; rate: number; items: string[] }[] = [];
  private showingRates: boolean = false;

  constructor() {
    super({ key: 'GachaScene' });
    this.gameStateManager = GameStateManager.getInstance();
    this.stageManager = StageManager.getInstance();
    this.itemManager = new ItemManager();
    this.gachaManager = GachaManager.getInstance(this.itemManager, this.stageManager);
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // サウンドマネージャーを初期化
    this.soundManager = new SoundManager(this);
    this.soundManager.preloadSounds();
    
    // アニメーションマネージャーを初期化
    this.animationManager = new AnimationManager(this);
    
    // 背景マネージャーを初期化
    this.backgroundManager = new BackgroundManager(this);
    
    // 美しい海の背景を作成
    this.backgroundManager.createOceanBackground('normal');
    
    // 現在のステージとゴールドを取得
    this.currentStage = this.stageManager.getCurrentStage();
    this.currentGold = this.stageManager.getCurrentGold();
    
    // 排出確率を取得
    this.dropRates = this.gachaManager.getCurrentRates();
    
    this.createUI();
    this.addDebugLines();
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア（80pxに統一）
    const titleY = 40; // 80pxエリアの中心位置
    this.add.text(width / 2, titleY, 'ガチャ', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // ゴールド表示（統一されたデザイン）
    this.createGoldDisplay();

    // メインコンテンツエリア
    this.createGachaContent();
    
    // ボタンエリア
    this.createButtons();
  }

  private createGachaContent(): void {
    const { width, height } = this.cameras.main;
    const contentY = 110; // タイトルエリア80px直下から開始
    
    // ガチャ名
    this.add.text(width / 2, contentY, 'オーシャンガチャ', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // ガチャ価格
    const singleCost = this.gachaManager.getGachaPrice();
    this.add.text(width / 2, contentY + 30, `(${singleCost}G)`, {
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
    const singleCost = this.gachaManager.getGachaPrice();
    const tenCost = this.gachaManager.getTenGachaPrice();
    
    // ガチャボタンの配置
    const leftButtonX = width / 2 - 90;
    const rightButtonX = width / 2 + 90;
    
    // 1回引くボタン
    const singleButton = new SimpleOceanButton(
      this,
      leftButtonX,
      buttonY,
      160,
      50,
      `1回引く (${singleCost}G)`,
      'primary',
      () => this.onSingleGacha()
    );
    
    // ゴールド不足時は無効化
    if (this.currentGold < singleCost) {
      singleButton.setEnabled(false);
    }
    
    // 10回引くボタン
    const multiButton = new SimpleOceanButton(
      this,
      rightButtonX,
      buttonY,
      160,
      50,
      `10回引く (${tenCost}G)`,
      'primary',
      () => this.onMultiGacha()
    );
    
    // ゴールド不足時は無効化
    if (this.currentGold < tenCost) {
      multiButton.setEnabled(false);
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
    const allItems: string[] = [];
    this.dropRates.forEach(rarityData => {
      allItems.push(...rarityData.items);
    });
    
    const displayItems = allItems.slice(0, 6);
    displayItems.forEach((itemName, index) => {
      const itemY = listY + 40 + (index * 25);
      this.add.text(width / 2, itemY, `• ${itemName}`, {
        fontSize: '14px',
        color: '#CCCCCC',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });
    
    // 確率表示ボタン
    const rateButton = new SimpleOceanButton(
      this,
      width / 2,
      height - 120,
      120,
      35,
      '確率表示',
      'secondary',
      () => this.toggleRateDisplay()
    );
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    
    // 戻るボタン
    const backButton = new SimpleOceanButton(
      this,
      width / 2,
      height - 60,
      120,
      40,
      '戻る',
      'secondary',
      () => this.onBack()
    );
  }

  private onSingleGacha(): void {
    const cost = this.gachaManager.getGachaPrice();
    if (this.currentGold < cost) return;
    
    // ガチャ実行
    const result = this.gachaManager.drawSingle();
    if (!result) return;
    
    // ゴールド消費
    this.stageManager.spendGold(cost);
    
    // アイテム追加
    this.itemManager.addItem(result.itemId, result.count);
    
    // ガチャ結果画面に遷移
    this.scene.start('GachaResultScene', {
      items: [result],
      cost: cost,
      isMulti: false
    });
  }

  private onMultiGacha(): void {
    const cost = this.gachaManager.getTenGachaPrice();
    if (this.currentGold < cost) return;
    
    // ガチャ実行
    const results = this.gachaManager.drawTen();
    if (results.length === 0) return;
    
    // ゴールド消費
    this.stageManager.spendGold(cost);
    
    // アイテム追加
    results.forEach(result => {
      this.itemManager.addItem(result.itemId, result.count);
    });
    
    // ガチャ結果画面に遷移
    this.scene.start('GachaResultScene', {
      items: results,
      cost: cost,
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
    let yOffset = 120;
    this.dropRates.forEach((rarityData) => {
      // レア度ヘッダー
      this.add.text(50, yOffset, `${rarityData.rarity}レア (${rarityData.rate.toFixed(2)}%)`, {
        fontSize: '16px',
        color: '#FFFF00',
        fontFamily: 'Arial'
      }).setName('rateItem');
      yOffset += 25;
      
      // そのレア度のアイテム一覧
      rarityData.items.forEach((itemName) => {
        if (yOffset < height - 100) {
          this.add.text(70, yOffset, `• ${itemName}`, {
            fontSize: '14px',
            color: '#FFFFFF',
            fontFamily: 'Arial'
          }).setName('rateItem');
          yOffset += 20;
        }
      });
      yOffset += 10; // レア度間のスペース
    });
    
    // 閉じるボタン
    const closeButton = new SimpleOceanButton(
      this,
      width / 2,
      height - 50,
      100,
      35,
      '閉じる',
      'secondary',
      () => this.hideRateDisplay()
    );
    
    // ダイアログ用の名前を設定
    closeButton.setName('rateClose');
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
    this.soundManager.playButtonTap();
    
    // 戻るボタンのクリックアニメーション（簡易版）
    const backButton = this.children.list.find(child => 
      child instanceof Phaser.GameObjects.Rectangle && 
      child.x === this.cameras.main.width / 2 && 
      child.y === this.cameras.main.height - 60
    );
    
    if (backButton) {
      this.animationManager.buttonClick(backButton, () => {
        this.soundManager.playScreenTransition();
        
        this.animationManager.screenTransition('GachaScene', 'MainScene', TransitionType.BUBBLE).then(() => {
          this.scene.start('MainScene');
        });
      });
    } else {
      // フォールバック
      this.soundManager.playScreenTransition();
      this.animationManager.screenTransition('GachaScene', 'MainScene', TransitionType.BUBBLE).then(() => {
        this.scene.start('MainScene');
      });
    }
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

  /**
   * 統一されたゴールド表示を作成
   */
  private createGoldDisplay(): void {
    const { width } = this.cameras.main;
    
    // ゴールド表示の背景（半透明背景）
    const goldBg = this.add.rectangle(width - 70, 40, 120, 30, 0x000000, 0.4);
    goldBg.setStrokeStyle(1, 0x333333);
    
    // ゴールドアイコン（コイン）
    this.add.text(width - 115, 40, '💰', {
      fontSize: '14px'
    }).setOrigin(0.5);
    
    // ゴールド数値
    this.add.text(width - 95, 40, `${this.currentGold.toLocaleString()}G`, {
      fontSize: '14px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
  }

  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // DebugHelperは中心点座標を期待するため、左上座標から中心点座標に変換
    
    // タイトルエリア（0-80px → 中心点: 40px）80pxに統一
    this.debugHelper.addAreaBorder(width / 2, 40, width, 80, 0xFF0000, 'タイトルエリア');
    
    // ガチャ名・価格エリア（80-180px → 中心点: 130px）
    this.debugHelper.addAreaBorder(width / 2, 130, width, 100, 0x0000FF, 'ガチャ名・価格エリア');
    
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
