import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { StageManager } from '../managers/StageManager';
import { ItemManager } from '../managers/ItemManager';
import { ITEM_DATA } from '../data/ItemData';
import { Item, ItemRarity } from '../types/Item';

/**
 * アイテム選択画面
 */
export class ItemSelectionScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private stageManager: StageManager;
  private itemManager: ItemManager;
  private currentStage: number = 1;
  private availableItems: Item[] = [];
  private selectedSpecialItem: Item | null = null;
  private selectedNormalItem: Item | null = null;

  constructor() {
    super({ key: 'ItemSelectionScene' });
    this.stageManager = StageManager.getInstance();
    this.itemManager = new ItemManager();
  }

  init(data: any): void {
    this.currentStage = data.stage || this.stageManager.getCurrentStage();
    
    // テスト用：基本アイテムを追加（開発・テスト用）
    if (GameConfig.DEBUG_MODE) {
      this.addTestItems();
    }
    
    // 利用可能なアイテムを取得
    this.loadAvailableItems();
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#1E5799');
    
    this.createUI();
    this.addDebugLines();
  }

  /**
   * テスト用アイテムを追加（開発・テスト用）
   */
  private addTestItems(): void {
    // 基本アイテムを追加
    this.itemManager.addItem('swap', 3);
    this.itemManager.addItem('changeOne', 2);
    this.itemManager.addItem('miniBomb', 5);
    this.itemManager.addItem('shuffle', 4);
    this.itemManager.addItem('meltingAgent', 1);
    this.itemManager.addItem('bomb', 1);
    this.itemManager.addItem('scoreBooster', 1);
  }

  /**
   * 利用可能なアイテムを読み込み
   */
  private loadAvailableItems(): void {
    this.availableItems = [];
    const inventory = this.itemManager.getInventory();
    
    // 所持しているアイテムのみを表示
    for (const itemId in inventory) {
      const itemData = ITEM_DATA[itemId];
      if (itemData && inventory[itemId] > 0) {
        this.availableItems.push(itemData);
      }
    }
    
    // レア度順でソート（S > A > B > C > D > E > F）
    this.availableItems.sort((a, b) => {
      const rarityOrder = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleY = 40;
    this.add.text(width / 2, titleY, 'アイテム選択', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // ステージ情報
    this.add.text(width / 2, titleY + 30, `ステージ ${this.currentStage}`, {
      fontSize: '18px',
      color: '#FFFF00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // メインコンテンツエリア
    this.createItemSelection();
    
    // ボタンエリア
    this.createButtons();
  }

  private createItemSelection(): void {
    const { width, height } = this.cameras.main;
    const contentStartY = 120;
    
    // 特殊枠（S・Aレア用）
    this.add.text(width / 2, contentStartY, '◆特殊枠（S・Aレア用）', {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 特殊枠のスロット
    const specialSlotY = contentStartY + 40;
    const slotWidth = 160;
    const slotHeight = 40;
    
    const specialSlotRect = this.add.rectangle(width / 2, specialSlotY, slotWidth, slotHeight, 0x333333, 0.8)
      .setStrokeStyle(2, 0xFFD700)
      .setInteractive({ useHandCursor: true })
      .setName('specialSlot');
    
    const specialSlotText = this.add.text(width / 2, specialSlotY, '未選択', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('specialSlotText');

    // 通常枠（B〜Fレア用）
    const normalFrameY = specialSlotY + 80;
    this.add.text(width / 2, normalFrameY, '◆通常枠（B〜Fレア用）', {
      fontSize: '16px',
      color: '#87CEEB',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 通常枠のスロット
    const normalSlotY = normalFrameY + 40;
    
    const normalSlotRect = this.add.rectangle(width / 2, normalSlotY, slotWidth, slotHeight, 0x333333, 0.8)
      .setStrokeStyle(2, 0x87CEEB)
      .setInteractive({ useHandCursor: true })
      .setName('normalSlot');
    
    const normalSlotText = this.add.text(width / 2, normalSlotY, '未選択', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('normalSlotText');

    // 所持アイテム一覧
    const itemListY = normalSlotY + 80;
    this.add.text(width / 2, itemListY, '◆所持アイテム一覧', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // アイテムリストの表示
    this.createItemList(itemListY + 30);
    
    // スロットクリックイベント
    specialSlotRect.on('pointerdown', () => this.showItemSelectionModal('special'));
    normalSlotRect.on('pointerdown', () => this.showItemSelectionModal('normal'));
  }

  /**
   * アイテムリストを作成
   */
  private createItemList(startY: number): void {
    const { width } = this.cameras.main;
    const itemHeight = 25;
    let currentY = startY;

    if (this.availableItems.length === 0) {
      this.add.text(width / 2, currentY, 'アイテムを所持していません', {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      return;
    }

    this.availableItems.forEach((item, index) => {
      const count = this.itemManager.getItemCount(item.id);
      const rarityColor = this.getRarityColor(item.rarity);
      
      const itemText = `${item.name} ×${count} (${item.rarity})`;
      
      const text = this.add.text(width / 2, currentY, itemText, {
        fontSize: '14px',
        color: rarityColor,
        fontFamily: 'Arial'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setName(`item_${item.id}`);
      
      // アイテム説明をツールチップとして表示
      text.on('pointerover', () => {
        console.log(`${item.name}: ${item.description}`);
      });
      
      currentY += itemHeight;
    });
  }

  /**
   * レア度に応じた色を取得
   */
  private getRarityColor(rarity: ItemRarity): string {
    const colors = {
      S: '#FFD700', // 金色
      A: '#FF0000', // 赤色
      B: '#800080', // 紫色
      C: '#0000FF', // 青色
      D: '#00FF00', // 緑色
      E: '#FFFFFF', // 白色
      F: '#808080'  // 灰色
    };
    return colors[rarity] || '#FFFFFF';
  }

  /**
   * アイテム選択モーダルを表示
   */
  private showItemSelectionModal(slotType: 'special' | 'normal'): void {
    // 簡易実装：最初のアイテムを自動選択
    if (this.availableItems.length > 0) {
      const item = this.availableItems[0];
      
      // 装備制限チェック
      if (slotType === 'normal' && (item.rarity === ItemRarity.S || item.rarity === ItemRarity.A)) {
        console.log('このアイテムは通常枠に装備できません');
        return;
      }
      
      // アイテムを装備
      const success = this.itemManager.equipItem(item, slotType);
      if (success) {
        if (slotType === 'special') {
          this.selectedSpecialItem = item;
          this.updateSlotDisplay('specialSlotText', item);
        } else {
          this.selectedNormalItem = item;
          this.updateSlotDisplay('normalSlotText', item);
        }
      }
    }
  }

  /**
   * スロット表示を更新
   */
  private updateSlotDisplay(textName: string, item: Item): void {
    const text = this.children.getByName(textName) as Phaser.GameObjects.Text;
    if (text) {
      const count = this.itemManager.getItemCount(item.id);
      text.setText(`${item.name} ×${count}`);
      text.setColor(this.getRarityColor(item.rarity));
    }
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height - 60;
    const buttonWidth = 100;
    const buttonHeight = 40;
    const buttonSpacing = 120;
    
    const leftButtonX = width / 2 - buttonSpacing / 2;
    const rightButtonX = width / 2 + buttonSpacing / 2;

    // 決定ボタン
    const confirmButton = this.add.rectangle(leftButtonX, buttonY, buttonWidth, buttonHeight, 0x4CAF50)
      .setInteractive()
      .setName('confirmButton');

    this.add.text(leftButtonX, buttonY, '決定', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('confirmText');

    // キャンセルボタン
    const cancelButton = this.add.rectangle(rightButtonX, buttonY, buttonWidth, buttonHeight, 0x9E9E9E)
      .setInteractive()
      .setName('cancelButton');

    this.add.text(rightButtonX, buttonY, 'キャンセル', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('cancelText');

    // イベントハンドラー
    confirmButton.on('pointerdown', () => {
      // 装備されたアイテム情報を取得
      const equippedItems = this.itemManager.getEquippedItems();
      
      console.log('装備アイテム:', equippedItems);
      
      // ゲーム画面に遷移（装備アイテム情報を渡す）
      this.scene.start('GameScene', { 
        stage: this.currentStage,
        equippedItems: equippedItems
      });
    });

    cancelButton.on('pointerdown', () => {
      // メイン画面に戻る
      this.scene.start('MainScene');
    });

    // ホバーエフェクト
    this.addButtonHoverEffect(confirmButton, 'confirmText');
    this.addButtonHoverEffect(cancelButton, 'cancelText');
  }

  /**
   * ボタンホバーエフェクトを追加
   */
  private addButtonHoverEffect(button: Phaser.GameObjects.Rectangle, textName: string): void {
    const text = this.children.getByName(textName);
    
    button.on('pointerover', () => {
      this.tweens.add({
        targets: [button, text],
        scale: 1.05,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: [button, text],
        scale: 1,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });
  }

  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleHeight = 80;
    const titleCenterY = 40;
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // メインコンテンツエリア
    const contentHeight = 480;
    const contentCenterY = 320;
    this.debugHelper.addAreaBorder(width / 2, contentCenterY, width, contentHeight, 0x0000FF, 'メインコンテンツエリア');
    
    // ボタンエリア
    const buttonHeight = 80;
    const buttonCenterY = height - 40;
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, width, buttonHeight, 0xFF00FF, 'ボタンエリア');
  }
}
