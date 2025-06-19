import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';
import { Item, ItemRarity } from '../types/Item';
import { GachaResult, GachaManager } from '../managers/GachaManager';
import { ITEM_DATA, getRarityColor } from '../data/ItemData';
import { ParticleManager } from '../utils/ParticleManager';
import { SoundManager } from '../utils/SoundManager';
import { AnimationManager, TransitionType } from '../utils/AnimationManager';
import { BackgroundManager } from '../utils/BackgroundManager';
import { SimpleOceanButton } from '../components/SimpleOceanButton';
import { StageManager } from '../managers/StageManager';
import { ItemManager } from '../managers/ItemManager';

/**
 * ガチャ結果画面
 */
export class GachaResultScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private gameStateManager: GameStateManager;
  private stageManager: StageManager;
  private itemManager: ItemManager;
  private gachaManager: GachaManager;
  private particleManager!: ParticleManager;
  private soundManager!: SoundManager;
  private animationManager!: AnimationManager;
  private backgroundManager!: BackgroundManager;
  private resultItems: GachaResult[] = [];
  private totalCost: number = 0;
  private isMulti: boolean = false;

  constructor() {
    super({ key: 'GachaResultScene' });
    this.gameStateManager = GameStateManager.getInstance();
    this.stageManager = StageManager.getInstance();
    this.itemManager = new ItemManager();
    this.gachaManager = GachaManager.getInstance(this.itemManager, this.stageManager);
  }

  init(data: any): void {
    this.resultItems = data.items || [];
    this.totalCost = data.cost || 0;
    this.isMulti = data.isMulti || false;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // パーティクルマネージャーを初期化
    this.particleManager = new ParticleManager(this);
    
    // サウンドマネージャーを初期化
    this.soundManager = new SoundManager(this);
    this.soundManager.preloadSounds();
    
    // アニメーションマネージャーを初期化
    this.animationManager = new AnimationManager(this);
    this.soundManager.preloadSounds();
    
    // 背景マネージャーを初期化
    this.backgroundManager = new BackgroundManager(this);
    
    // 美しい海の背景を作成（ガチャ結果は華やかに）
    this.backgroundManager.createOceanBackground('heavy');
    
    // ガチャBGMを開始
    this.soundManager.playGachaBgm();
    
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#1E5799');
    
    this.createUI();
    this.addDebugLines();
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア（ゲーム画面と同じ高さ80pxに統一）
    const titleY = 40; // 80pxエリアの中心位置
    this.add.text(width / 2, titleY, 'ガチャ結果', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // ゴールド表示
    this.createGoldDisplay();

    // メインコンテンツエリア
    this.createResultContent();
    
    // ボタンエリア
    this.createButtons();
  }

  private createGoldDisplay(): void {
    const { width, height } = this.cameras.main;
    
    // 現在のゴールドを取得
    const currentGold = this.stageManager.getCurrentGold();
    
    // ゴールド表示の背景（タイトルエリア内に配置）
    const goldBg = this.add.rectangle(width - 70, 40, 120, 30, 0x000000, 0.4);
    goldBg.setStrokeStyle(1, 0x333333);
    
    // ゴールドアイコン（コイン）
    this.add.text(width - 115, 40, '💰', {
      fontSize: '14px'
    }).setOrigin(0.5);
    
    // ゴールド数値
    this.add.text(width - 95, 40, `${currentGold.toLocaleString()}G`, {
      fontSize: '14px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
  }

  private createResultContent(): void {
    
    if (this.isMulti) {
      this.createMultiResult();
    } else {
      this.createSingleResult();
    }
  }

  private createSingleResult(): void {
    const { width, height } = this.cameras.main;
    const item = this.resultItems[0];
    
    if (!item) return;
    
    // ガチャ開封音を再生
    this.soundManager.playGachaOpen();
    
    // レアアイテムの場合は特別音を再生
    if (item.rarity === 'S' || item.rarity === 'A' || item.rarity === 'B') {
      // 少し遅らせてレア音を再生
      this.time.delayedCall(500, () => {
        this.soundManager.playRareItem();
      });
    } else {
      // 通常アイテム音を再生
      this.time.delayedCall(300, () => {
        this.soundManager.playCommonItem();
      });
    }
    
    // アイテム表示エリア（タイトルエリア80px直下から開始）
    const itemY = height / 2 - 10; // 少し上に調整
    
    // レア度に応じた背景色
    const rarityColor = this.getRarityColorHex(item.rarity);
    const itemBg = this.add.rectangle(width / 2, itemY, 200, 100, rarityColor, 0.3);
    
    // レアアイテム（S・A・B）の場合はパーティクルエフェクト
    if (item.rarity === 'S' || item.rarity === 'A' || item.rarity === 'B') {
      this.particleManager.createRareItemEffect({
        x: width / 2,
        y: itemY,
        color: rarityColor,
        count: item.rarity === 'S' ? 20 : (item.rarity === 'A' ? 15 : 10),
        duration: 1500
      });
    }
    
    // アイテム名
    this.add.text(width / 2, itemY - 20, item.itemName, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // レア度表示
    this.add.text(width / 2, itemY + 10, `${item.rarity}レア`, {
      fontSize: '16px',
      color: `#${rarityColor.toString(16).padStart(6, '0')}`,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 星表示
    this.createStarDisplay(width / 2, itemY + 35, item.rarity);
    
    // アイテム説明
    const itemData = ITEM_DATA[item.itemId];
    const description = itemData ? itemData.description : 'アイテムの説明';
    this.add.text(width / 2, itemY + 70, description, {
      fontSize: '12px',
      color: '#CCCCCC',
      fontFamily: 'Arial',
      wordWrap: { width: 300 }
    }).setOrigin(0.5);
  }

  private createMultiResult(): void {
    const { width, height } = this.cameras.main;
    
    // アイテムグリッドエリアの定義（デバッグラインと一致させる）
    const gridAreaTop = 80;  // タイトルエリア直下
    const gridAreaBottom = 430; // 集計表示エリアの上
    const gridAreaHeight = gridAreaBottom - gridAreaTop; // 350px
    
    const itemsPerRow = 2;
    const itemWidth = 140; // 少し小さくして余裕を持たせる
    const itemHeight = 60; // 少し小さくして余裕を持たせる
    const spacingX = 20;
    const spacingY = 10;
    
    // ガチャ開封音を再生
    this.soundManager.playGachaOpen();
    
    // レアアイテムがあるかチェック
    const hasRareItem = this.resultItems.some(item => 
      item.rarity === 'S' || item.rarity === 'A' || item.rarity === 'B'
    );
    
    if (hasRareItem) {
      // レア音を遅らせて再生
      this.time.delayedCall(800, () => {
        this.soundManager.playRareItem();
      });
    } else {
      // 通常音を再生
      this.time.delayedCall(500, () => {
        this.soundManager.playCommonItem();
      });
    }
    
    // グリッドの総サイズを計算
    const totalRows = Math.ceil(this.resultItems.length / itemsPerRow);
    const totalGridHeight = totalRows * itemHeight + (totalRows - 1) * spacingY;
    const totalGridWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * spacingX;
    
    // グリッドをエリア内で中央配置
    const gridStartX = (width - totalGridWidth) / 2;
    const gridStartY = gridAreaTop + (gridAreaHeight - totalGridHeight) / 2;
    
    // 10連結果をグリッド表示
    this.resultItems.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      
      const x = gridStartX + col * (itemWidth + spacingX) + itemWidth / 2;
      const y = gridStartY + row * (itemHeight + spacingY) + itemHeight / 2;
      
      // レア度に応じた背景色
      const rarityColor = this.getRarityColorHex(item.rarity);
      const itemBg = this.add.rectangle(x, y, itemWidth, itemHeight, rarityColor, 0.3);
      
      // アイテム名（長い名前は省略）
      const displayName = item.itemName.length > 8 ? item.itemName.substring(0, 7) + '...' : item.itemName;
      this.add.text(x, y - 15, displayName, {
        fontSize: '11px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);
      
      // レア度表示
      this.add.text(x, y + 5, `${item.rarity}`, {
        fontSize: '11px',
        color: `#${rarityColor.toString(16).padStart(6, '0')}`,
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      
      // 星表示（小さく）
      this.createStarDisplay(x, y + 20, item.rarity, 0.4);
    });
    
    // 合計表示（集計表示エリア内に配置）
    this.add.text(width / 2, height - 150, `合計: ${this.resultItems.length}個`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // レア度別集計
    this.createRaritySummary();
  }

  private createRaritySummary(): void {
    const { width, height } = this.cameras.main;
    
    // レア度別にカウント
    const rarityCounts: { [key: string]: number } = {
      'S': 0,
      'A': 0,
      'B': 0,
      'C': 0,
      'D': 0,
      'E': 0,
      'F': 0,
    };
    
    this.resultItems.forEach(item => {
      rarityCounts[item.rarity]++;
    });
    
    // 0でないレア度のみ表示
    const summaryY = height - 120;
    let summaryText = '内訳: ';
    
    Object.keys(rarityCounts).forEach(rarityKey => {
      const count = rarityCounts[rarityKey];
      if (count > 0) {
        summaryText += `${rarityKey}×${count} `;
      }
    });
    
    this.add.text(width / 2, summaryY, summaryText, {
      fontSize: '14px',
      color: '#CCCCCC',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private createStarDisplay(x: number, y: number, rarity: string, scale: number = 1): void {
    const rarityEnum = rarity as ItemRarity;
    const starCount = this.getStarCount(rarityEnum);
    const starSize = 12 * scale;
    const starSpacing = 15 * scale;
    const startX = x - (starCount - 1) * starSpacing / 2;
    
    for (let i = 0; i < starCount; i++) {
      const starX = startX + i * starSpacing;
      this.add.text(starX, y, '★', {
        fontSize: `${starSize}px`,
        color: '#FFD700',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height - 60;
    
    // 現在のゴールドと必要コストを取得
    const currentGold = this.stageManager.getCurrentGold();
    const requiredCost = this.isMulti ? this.gachaManager.getTenGachaPrice() : this.gachaManager.getGachaPrice();
    const canAfford = currentGold >= requiredCost;
    
    // もう一度引くボタンのテキストを動的に設定
    const againButtonText = this.isMulti ? 'もう一度10連' : 'もう一度1回';
    
    // もう一度引くボタン
    const againButton = new SimpleOceanButton(
      this,
      width / 2 - 80,
      buttonY,
      140,
      45,
      againButtonText,
      canAfford ? 'primary' : 'secondary',
      () => {
        if (canAfford) {
          this.soundManager.playButtonTap();
          this.onAgain();
        } else {
          // ゴールド不足の場合は通常のタップ音を再生
          this.soundManager.playButtonTap();
        }
      }
    );
    
    // ゴールド不足の場合はボタンを無効化
    if (!canAfford) {
      againButton.setEnabled(false);
    }
    
    // 戻るボタン
    const backButton = new SimpleOceanButton(
      this,
      width / 2 + 80,
      buttonY,
      120,
      45,
      '戻る',
      'secondary',
      () => {
        this.soundManager.playButtonTap();
        this.onBack();
      }
    );
  }

  private onAgain(): void {
    this.soundManager.playButtonTap();
    
    // 現在のゴールドを取得
    const currentGold = this.stageManager.getCurrentGold();
    
    // 必要なコストを計算
    const requiredCost = this.isMulti ? this.gachaManager.getTenGachaPrice() : this.gachaManager.getGachaPrice();
    
    // ゴールド不足の場合はガチャ画面に戻る
    if (currentGold < requiredCost) {
      this.soundManager.playScreenTransition();
      this.scene.start('GachaScene');
      return;
    }
    
    // 直接ガチャを実行
    if (this.isMulti) {
      this.executeMultiGacha();
    } else {
      this.executeSingleGacha();
    }
  }
  
  private executeSingleGacha(): void {
    const cost = this.gachaManager.getGachaPrice();
    
    // ガチャ実行
    const result = this.gachaManager.drawSingle();
    if (!result) return;
    
    // ゴールド消費
    this.stageManager.spendGold(cost);
    
    // アイテム追加
    this.itemManager.addItem(result.itemId, result.count);
    
    // 新しい結果で画面を再初期化
    this.scene.restart({
      items: [result],
      cost: cost,
      isMulti: false
    });
  }
  
  private executeMultiGacha(): void {
    const cost = this.gachaManager.getTenGachaPrice();
    
    // ガチャ実行
    const results = this.gachaManager.drawTen();
    if (results.length === 0) return;
    
    // ゴールド消費
    this.stageManager.spendGold(cost);
    
    // アイテム追加
    results.forEach(result => {
      this.itemManager.addItem(result.itemId, result.count);
    });
    
    // 新しい結果で画面を再初期化
    this.scene.restart({
      items: results,
      cost: cost,
      isMulti: true
    });
  }

  private onBack(): void {
    this.soundManager.playScreenTransition();
    
    this.animationManager.screenTransition('GachaResultScene', 'GachaScene', TransitionType.BUBBLE).then(() => {
      this.scene.start('GachaScene');
    });
  }

  private getRarityColorHex(rarity: string): number {
    // 文字列のレア度をItemRarityに変換
    const rarityEnum = rarity as ItemRarity;
    const colorString = getRarityColor(rarityEnum);
    return parseInt(colorString.replace('#', '0x'));
  }

  private getStarCount(rarity: ItemRarity): number {
    switch (rarity) {
      case ItemRarity.S: return 5;
      case ItemRarity.A: return 4;
      case ItemRarity.B: return 3;
      case ItemRarity.C: return 2;
      case ItemRarity.D: return 1;
      case ItemRarity.E: return 0;
      case ItemRarity.F: return 0;
      default: return 0;
    }
  }

  private addButtonHoverEffect(button: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text): void {
    const originalColor = button.fillColor;
    const originalTextColor = text.style.color;
    
    button.on('pointerover', () => {
      button.setFillStyle(originalColor + 0x222222);
      text.setColor('#FFFF00');
    });
    
    button.on('pointerout', () => {
      button.setFillStyle(originalColor);
      text.setColor(originalTextColor);
    });
  }

  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // DebugHelperは中心点座標を期待するため、左上座標から中心点座標に変換
    
    // タイトル・ゴールドエリア（0-80px → 中心点: 40px）ゲーム画面と同じ高さ
    this.debugHelper.addAreaBorder(width / 2, 40, width, 80, 0xFF0000, 'タイトル・ゴールドエリア');
    
    if (this.isMulti) {
      // 10連ガチャの場合
      // アイテムグリッド表示エリア（80-430px → 中心点: 255px）
      this.debugHelper.addAreaBorder(width / 2, 255, width, 350, 0x0000FF, 'アイテムグリッドエリア');
      
      // 合計・集計表示エリア（height-150からheight-80 → 中心点: height-115px）
      this.debugHelper.addAreaBorder(width / 2, height - 115, width, 70, 0xFFFF00, '集計表示エリア');
    } else {
      // 1回ガチャの場合
      // アイテム表示エリア（80からheight-160 → 中心点: (80 + height-160)/2）
      const contentHeight = height - 160 - 80;
      this.debugHelper.addAreaBorder(width / 2, 80 + contentHeight / 2, width, contentHeight, 0x0000FF, 'アイテム表示エリア');
    }
    
    // ボタンエリア（height-80からheight → 中心点: height-40px）
    this.debugHelper.addAreaBorder(width / 2, height - 40, width, 80, 0xFF00FF, 'ボタンエリア');
  }

  /**
   * シーン終了時のクリーンアップ
   */
  shutdown(): void {
    // パーティクルマネージャーをクリーンアップ
    if (this.particleManager) {
      this.particleManager.destroy();
    }
    
    // サウンドマネージャーをクリーンアップ
    if (this.soundManager) {
      this.soundManager.destroy();
    }
  }
}
