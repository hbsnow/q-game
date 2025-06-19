import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';
import { Item, ItemRarity } from '../types/Item';
import { getRarityColor } from '../data/ItemData';
import { ParticleManager } from '../utils/ParticleManager';
import { SoundManager } from '../utils/SoundManager';

/**
 * ガチャ結果画面
 */
export class GachaResultScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private gameStateManager: GameStateManager;
  private particleManager!: ParticleManager;
  private soundManager!: SoundManager;
  private resultItems: Item[] = [];
  private totalCost: number = 0;
  private isMulti: boolean = false;

  constructor() {
    super({ key: 'GachaResultScene' });
    this.gameStateManager = GameStateManager.getInstance();
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
    
    // ガチャBGMを開始
    this.soundManager.playGachaBgm();
    
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#1E5799');
    
    this.createUI();
    this.addDebugLines();
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleY = 40;
    this.add.text(width / 2, titleY, 'ガチャ結果', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // メインコンテンツエリア
    this.createResultContent();
    
    // ボタンエリア
    this.createButtons();
  }

  private createResultContent(): void {
    const { width, height } = this.cameras.main;
    
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
    if (item.rarity === ItemRarity.S || item.rarity === ItemRarity.A || item.rarity === ItemRarity.B) {
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
    
    // アイテム表示エリア
    const itemY = height / 2 - 50;
    
    // レア度に応じた背景色
    const rarityColor = this.getRarityColorHex(item.rarity);
    const itemBg = this.add.rectangle(width / 2, itemY, 200, 100, rarityColor, 0.3);
    
    // レアアイテム（S・A・B）の場合はパーティクルエフェクト
    if (item.rarity === ItemRarity.S || item.rarity === ItemRarity.A || item.rarity === ItemRarity.B) {
      this.particleManager.createRareItemEffect({
        x: width / 2,
        y: itemY,
        color: rarityColor,
        count: item.rarity === ItemRarity.S ? 20 : (item.rarity === ItemRarity.A ? 15 : 10),
        duration: 1500
      });
    }
    
    // アイテム名
    this.add.text(width / 2, itemY - 20, item.name, {
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
    this.add.text(width / 2, itemY + 70, item.description, {
      fontSize: '12px',
      color: '#CCCCCC',
      fontFamily: 'Arial',
      wordWrap: { width: 300 }
    }).setOrigin(0.5);
  }

  private createMultiResult(): void {
    const { width, height } = this.cameras.main;
    const startY = 100;
    const itemsPerRow = 2;
    const itemWidth = 160;
    const itemHeight = 70;
    const spacingX = 20;
    const spacingY = 15;
    
    // ガチャ開封音を再生
    this.soundManager.playGachaOpen();
    
    // レアアイテムがあるかチェック
    const hasRareItem = this.resultItems.some(item => 
      item.rarity === ItemRarity.S || item.rarity === ItemRarity.A || item.rarity === ItemRarity.B
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
    
    // 10連結果をグリッド表示
    this.resultItems.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      
      // 中央揃えの計算を修正
      const totalWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * spacingX;
      const startX = (width - totalWidth) / 2 + itemWidth / 2;
      
      const x = startX + col * (itemWidth + spacingX);
      const y = startY + row * (itemHeight + spacingY);
      
      // レア度に応じた背景色
      const rarityColor = this.getRarityColorHex(item.rarity);
      const itemBg = this.add.rectangle(x, y, itemWidth, itemHeight, rarityColor, 0.3);
      
      // アイテム名（長い名前は省略）
      const displayName = item.name.length > 8 ? item.name.substring(0, 7) + '...' : item.name;
      this.add.text(x, y - 15, displayName, {
        fontSize: '12px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);
      
      // レア度表示
      this.add.text(x, y + 5, `${item.rarity}`, {
        fontSize: '12px',
        color: `#${rarityColor.toString(16).padStart(6, '0')}`,
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      
      // 星表示（小さく）
      this.createStarDisplay(x, y + 22, item.rarity, 0.5);
    });
    
    // 合計表示
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
    const rarityCounts: Record<ItemRarity, number> = {
      [ItemRarity.S]: 0,
      [ItemRarity.A]: 0,
      [ItemRarity.B]: 0,
      [ItemRarity.C]: 0,
      [ItemRarity.D]: 0,
      [ItemRarity.E]: 0,
      [ItemRarity.F]: 0,
    };
    
    this.resultItems.forEach(item => {
      rarityCounts[item.rarity]++;
    });
    
    // 0でないレア度のみ表示
    const summaryY = height - 120;
    let summaryText = '内訳: ';
    
    Object.keys(rarityCounts).forEach(rarityKey => {
      const rarity = rarityKey as ItemRarity;
      const count = rarityCounts[rarity];
      if (count > 0) {
        summaryText += `${rarity}×${count} `;
      }
    });
    
    this.add.text(width / 2, summaryY, summaryText, {
      fontSize: '14px',
      color: '#CCCCCC',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private createStarDisplay(x: number, y: number, rarity: ItemRarity, scale: number = 1): void {
    const starCount = this.getStarCount(rarity);
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
    
    // もう一度引くボタン
    const againButton = this.add.rectangle(width / 2 - 80, buttonY, 140, 40, 0x0066CC)
      .setInteractive({ useHandCursor: true });
    
    const againText = this.add.text(width / 2 - 80, buttonY, 'もう一度', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    againButton.on('pointerdown', () => {
      this.soundManager.playButtonTap();
      this.onAgain();
    });
    this.addButtonHoverEffect(againButton, againText);
    
    // 戻るボタン
    const backButton = this.add.rectangle(width / 2 + 80, buttonY, 140, 40, 0x666666)
      .setInteractive({ useHandCursor: true });
    
    const backText = this.add.text(width / 2 + 80, buttonY, '戻る', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    backButton.on('pointerdown', () => {
      this.soundManager.playButtonTap();
      this.onBack();
    });
    this.addButtonHoverEffect(backButton, backText);
  }

  private onAgain(): void {
    this.soundManager.playScreenTransition();
    this.scene.start('GachaScene');
  }

  private onBack(): void {
    this.soundManager.playScreenTransition();
    this.scene.start('GachaScene');
  }

  private getRarityColorHex(rarity: ItemRarity): number {
    const colorString = getRarityColor(rarity);
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
    
    // タイトルエリア（0-80px → 中心点: 40px）
    this.debugHelper.addAreaBorder(width / 2, 40, width, 80, 0xFF0000, 'タイトルエリア');
    
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
