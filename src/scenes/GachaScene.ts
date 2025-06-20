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
    this.itemManager = ItemManager.getInstance();
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
    
    // ガチャ演出を開始
    this.playGachaAnimation(() => {
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
    });
  }

  private onMultiGacha(): void {
    const cost = this.gachaManager.getTenGachaPrice();
    if (this.currentGold < cost) return;
    
    // ガチャ演出を開始（10連は少し長め）
    this.playGachaAnimation(() => {
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
    }, true); // 10連フラグ
  }

  /**
   * ガチャ演出アニメーション
   */
  private playGachaAnimation(onComplete: () => void, isMulti: boolean = false): void {
    const { width, height } = this.cameras.main;
    
    // 演出用オーバーレイ
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // ギフトボックスをGraphicsで描画（絵文字の代わり）
    const giftBox = this.createGiftBoxGraphics(width / 2, height + 50);
    
    // 演出テキスト
    const animText = this.add.text(width / 2, height / 2 - 60, 
      isMulti ? 'プレゼントを10個開いています...' : 'プレゼントを開いています...', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // 泡エフェクト
    this.createBubbleEffect(width / 2, height / 2);
    
    // ギフト浮上アニメーション
    this.tweens.add({
      targets: giftBox,
      y: height / 2 + 40,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        // ギフトが光る演出
        this.tweens.add({
          targets: giftBox,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // 演出終了、結果画面へ
            overlay.destroy();
            giftBox.destroy();
            animText.destroy();
            onComplete();
          }
        });
      }
    });
    
    // テキストの点滅演出
    this.tweens.add({
      targets: animText,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * ギフトボックスのGraphicsを作成
   */
  private createGiftBoxGraphics(x: number, y: number): Phaser.GameObjects.Graphics {
    const graphics = this.add.graphics();
    graphics.x = x;
    graphics.y = y;
    
    // ギフトボックス本体（赤色）
    graphics.fillStyle(0xFF4444);
    graphics.fillRect(-20, -15, 40, 30);
    
    // リボン（縦）
    graphics.fillStyle(0xFFD700);
    graphics.fillRect(-3, -15, 6, 30);
    
    // リボン（横）
    graphics.fillRect(-20, -3, 40, 6);
    
    // リボンの結び目
    graphics.fillStyle(0xFFAA00);
    graphics.fillCircle(0, -15, 8);
    
    // 光沢効果
    graphics.fillStyle(0xFFFFFF, 0.3);
    graphics.fillRect(-15, -10, 8, 8);
    
    return graphics;
  }

  /**
   * 泡エフェクトを作成
   */
  private createBubbleEffect(centerX: number, centerY: number): void {
    for (let i = 0; i < 8; i++) {
      const bubble = this.add.circle(
        centerX + (Math.random() - 0.5) * 100,
        centerY + 50,
        Math.random() * 8 + 4,
        0x87CEEB,
        0.6
      );
      
      this.tweens.add({
        targets: bubble,
        y: centerY - 100,
        alpha: 0,
        duration: 2000 + Math.random() * 1000,
        delay: Math.random() * 500,
        onComplete: () => {
          bubble.destroy();
        }
      });
    }
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
    
    // 確率表示パネル（角丸風の装飾）
    const panel = this.add.rectangle(width / 2, height / 2, width - 40, height - 100, 0x1E3A8A, 0.95)
      .setStrokeStyle(3, 0x60A5FA, 0.8)
      .setName('ratePanel');
    
    // パネルに海のテーマの装飾を追加
    const decorBg = this.add.rectangle(width / 2, height / 2, width - 50, height - 110, 0x1E40AF, 0.3)
      .setName('rateDecor');
    
    // タイトル（美しいスタイル）
    const titleText = this.add.text(width / 2, 80, '🎰 排出確率 🎰', {
      fontSize: '22px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setName('rateTitle');
    
    // タイトルに輝きエフェクト
    this.tweens.add({
      targets: titleText,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // スクロール可能エリアの設定
    const scrollAreaTop = 110;
    const scrollAreaHeight = height - 220;
    
    // 確率リスト（改善されたデザイン）
    let yOffset = scrollAreaTop;
    this.dropRates.forEach((rarityData, index) => {
      if (yOffset > height - 120) return; // 表示領域を超える場合はスキップ
      
      // レア度カード背景
      const rarityColor = this.getRarityColorForDisplay(rarityData.rarity);
      const cardBg = this.add.rectangle(width / 2, yOffset + 15, width - 80, 30, rarityColor, 0.4)
        .setStrokeStyle(2, rarityColor, 0.8)
        .setName('rateItem');
      
      // レア度ヘッダー（改善されたスタイル）
      const rarityHeader = this.add.text(width / 2, yOffset + 15, 
        `${rarityData.rarity}レア (${rarityData.rate.toFixed(2)}%)`, {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5).setName('rateItem');
      
      yOffset += 40;
      
      // そのレア度のアイテム一覧（コンパクト表示）
      const itemsText = rarityData.items.join(', ');
      if (itemsText.length > 0 && yOffset < height - 120) {
        this.add.text(width / 2, yOffset, itemsText, {
          fontSize: '12px',
          color: '#E5E7EB',
          fontFamily: 'Arial',
          wordWrap: { width: width - 100 },
          align: 'center'
        }).setOrigin(0.5).setName('rateItem');
        yOffset += 25;
      }
      
      yOffset += 10; // レア度間のスペース
    });
    
    // 注意書き
    this.add.text(width / 2, height - 90, '※ 現在のステージで出現可能なアイテムのみ表示', {
      fontSize: '10px',
      color: '#9CA3AF',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setName('rateItem');
    
    // 閉じるボタン（改善されたデザイン）
    const closeButton = new SimpleOceanButton(
      this,
      width / 2,
      height - 50,
      120,
      40,
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

  private getRarityColorForDisplay(rarity: string): number {
    switch (rarity) {
      case 'S': return 0xFFD700; // 金色
      case 'A': return 0xFF0000; // 赤色
      case 'B': return 0x800080; // 紫色
      case 'C': return 0x0000FF; // 青色
      case 'D': return 0x008000; // 緑色
      case 'E': return 0x808080; // 灰色
      case 'F': return 0x654321; // 茶色
      default: return 0x808080;
    }
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
