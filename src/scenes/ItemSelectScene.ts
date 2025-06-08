import Phaser from 'phaser';
import { Item, EquipSlot } from '../types';
import { GameStateManager } from '../utils/GameStateManager';
import { getRarityColor } from '../data/mockItems';

export class ItemSelectScene extends Phaser.Scene {
  private gameStateManager!: GameStateManager;
  private items: Item[] = [];
  private equipSlots: EquipSlot[] = [];
  private selectedItem: Item | null = null;
  private selectedSlotIndex: number | null = null;
  
  // マスクエリア情報
  private maskStartY: number = 0;
  private maskEndY: number = 0;
  
  // UI要素
  private titleText!: Phaser.GameObjects.Text;
  private specialSlotContainer!: Phaser.GameObjects.Container;
  private normalSlotContainer!: Phaser.GameObjects.Container;
  private specialSlotBg!: Phaser.GameObjects.Rectangle;
  private normalSlotBg!: Phaser.GameObjects.Rectangle;
  private specialSlotText!: Phaser.GameObjects.Text;
  private normalSlotText!: Phaser.GameObjects.Text;
  private specialSlotLabel!: Phaser.GameObjects.Text;
  private itemListContainer!: Phaser.GameObjects.Container;
  
  // 選択カーソル（元の枠線を上書きしない）
  private specialSlotCursor: Phaser.GameObjects.Rectangle | null = null;
  private normalSlotCursor: Phaser.GameObjects.Rectangle | null = null;
  private confirmButton!: Phaser.GameObjects.Container;
  private cancelButton!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  
  // デバッグライン管理
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private debugVisible = true; // 初期表示ON

  constructor() {
    super({ key: 'ItemSelectScene' });
  }

  init(data: any) {
    console.log('ItemSelectScene initialized with data:', data);
    
    // GameStateManagerを受け取る
    this.gameStateManager = data.gameStateManager;
    if (!this.gameStateManager) {
      console.error('GameStateManager not provided to ItemSelectScene');
      return;
    }
    
    // 実データを使用
    this.items = this.gameStateManager.getItemManager().getAllItems();
    this.equipSlots = this.gameStateManager.getItemManager().getEquipSlots();
    
    // 選択状態をリセット
    this.selectedItem = null;
    this.selectedSlotIndex = null;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 🏷️ 画面名をコンソールに表示
    console.log('🎬 === ITEM SELECT SCENE ===');
    console.log('📍 Current Scene: アイテム選択画面');
    console.log('🎯 Purpose: アイテム装備・選択画面');
    console.log('📦 Available Items:', this.items.length);
    console.log('⚔️ Equipment Slots:', this.equipSlots.length);
    
    // デバッグショートカットキーを設定
    this.setupDebugShortcut();
    
    // キーボードショートカットを設定
    this.setupKeyboardShortcuts();
    
    // 🎨 美しい海のグラデーション背景
    const graphics = this.add.graphics();
    
    // グラデーション背景（深い海から浅い海へ）
    graphics.fillGradientStyle(0x0B2F5C, 0x0B2F5C, 0x1E5799, 0x1E5799, 1);
    graphics.fillRect(0, 0, width, height);
    
    // 海の波のような装飾
    const wave1 = this.add.graphics();
    wave1.fillStyle(0x2E8B57, 0.1);
    wave1.fillEllipse(width / 2, height * 0.3, width * 1.5, 100);
    
    const wave2 = this.add.graphics();
    wave2.fillStyle(0x4682B4, 0.1);
    wave2.fillEllipse(width / 2, height * 0.7, width * 1.2, 80);
    
    this.createTitle();
    this.createEquipSlots();
    this.createItemList();
    this.createButtons();
    
    // レイアウト検証
    this.validateLayout();
  }
  
  // キーボードショートカットの設定
  private setupKeyboardShortcuts() {
    // ESCキーでキャンセル
    this.input.keyboard?.on('keydown-ESC', () => {
      this.cancelSelection();
    });
    
    // Enterキーで決定
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.confirmSelection();
    });
    
    console.log('⌨️ Keyboard shortcuts setup:');
    console.log('  - Press "ESC" to cancel');
    console.log('  - Press "ENTER" to confirm');
  }

  private createTitle() {
    const { width } = this.cameras.main;
    
    // 🎨 美しいタイトルデザイン
    // タイトル背景（拡張されたタイトルエリアに合わせて調整）
    const titleBg = this.add.rectangle(width / 2, 35, 250, 40, 0x0B2F5C, 0.8);
    titleBg.setStrokeStyle(2, 0x87CEEB, 0.8);
    
    // レイアウト定数に従ったタイトル配置
    this.titleText = this.add.text(width / 2, 35, '🌊 アイテム選択 🌊', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // タイトル装飾
    const decoration1 = this.add.circle(width / 2 - 80, 35, 4, 0x87CEEB, 0.6);
    const decoration2 = this.add.circle(width / 2 + 80, 35, 4, 0x87CEEB, 0.6);
  }

  private createEquipSlots() {
    const { width } = this.cameras.main;
    
    // レイアウト定数（装備スロットをさらに下に移動）
    const SLOT_Y = 130; // 120 → 130 に変更（さらに10px下に移動）
    const SLOT_HEIGHT = 50;
    const SLOT_WIDTH = 180;
    
    // 🎨 特殊枠（左側）- 豪華なデザイン
    const specialX = 100;
    
    // 🔧 修正：説明文を強制的に見えるように（背景付き）
    const specialLabelBg = this.add.rectangle(specialX, SLOT_Y - 35, 160, 16, 0x000000, 0.8);
    this.add.text(specialX, SLOT_Y - 35, '◆特殊枠（S〜Fレア用）', {
      fontSize: '11px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // 特殊枠の背景（金色のグラデーション）
    this.specialSlotBg = this.add.rectangle(specialX, SLOT_Y, SLOT_WIDTH, SLOT_HEIGHT, 0x1A4B73, 0.9);
    this.specialSlotBg.setStrokeStyle(3, 0xFFD700, 0.8);
    
    // 特殊枠の装飾
    const specialDecor = this.add.rectangle(specialX, SLOT_Y, SLOT_WIDTH - 6, SLOT_HEIGHT - 6, 0xFFD700, 0.1);
    
    this.specialSlotBg.setInteractive();
    this.specialSlotBg.on('pointerdown', () => this.selectSlot(0));
    
    this.specialSlotText = this.add.text(specialX, SLOT_Y, '未選択', {
      fontSize: '12px',
      color: '#CCCCCC',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // 特殊枠の説明テキスト（小さく追加）
    this.add.text(specialX, SLOT_Y + 20, '全レア度装備可能', {
      fontSize: '9px',
      color: '#AAAAAA',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // 🎨 通常枠（右側）- シンプルで上品なデザイン
    const normalX = 300;
    
    // 🔧 修正：説明文を強制的に見えるように（背景付き）
    const normalLabelBg = this.add.rectangle(normalX, SLOT_Y - 35, 160, 16, 0x000000, 0.8);
    this.add.text(normalX, SLOT_Y - 35, '◆通常枠（B〜Fレア用）', {
      fontSize: '11px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // 通常枠の背景（青系のグラデーション）
    this.normalSlotBg = this.add.rectangle(normalX, SLOT_Y, SLOT_WIDTH, SLOT_HEIGHT, 0x1A4B73, 0.9);
    this.normalSlotBg.setStrokeStyle(2, 0x87CEEB, 0.8);
    
    // 通常枠の装飾
    const normalDecor = this.add.rectangle(normalX, SLOT_Y, SLOT_WIDTH - 6, SLOT_HEIGHT - 6, 0x87CEEB, 0.1);
    
    this.normalSlotBg.setInteractive();
    this.normalSlotBg.on('pointerdown', () => this.selectSlot(1));
    
    this.normalSlotText = this.add.text(normalX, SLOT_Y, '未選択', {
      fontSize: '12px',
      color: '#CCCCCC',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // 通常枠の説明テキスト（小さく追加）
    this.add.text(normalX, SLOT_Y + 20, 'S・Aレア装備不可', {
      fontSize: '9px',
      color: '#AAAAAA',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    this.updateSlotDisplay();
  }

  // item-select-scene-todo仕様に完全準拠したレイアウト実装（マスクなし）
  private createItemList() {
    const { width, height } = this.cameras.main;
    
    console.log('🎯 Implementing basic item display WITHOUT mask first...');
    console.log(`Screen dimensions: ${width} x ${height}`);
    
    // レイアウト定数（item-select-scene-todo仕様）
    const LAYOUT_CONSTANTS = {
      SCREEN_WIDTH: 400,
      SCREEN_HEIGHT: 710,
      
      // 各エリアの高さ
      TITLE_HEIGHT: 70, // 60 → 70 に拡張（10px増加）
      SLOT_AREA_HEIGHT: 100, // 90 → 100 に拡張（10px増加）
      ITEM_TITLE_HEIGHT: 40,
      SCROLL_AREA_HEIGHT: 420, // 440 → 420 に調整（20px減少）
      BUTTON_AREA_HEIGHT: 80,
      
      // マージン設定
      SIDE_MARGIN: 30,
      ITEM_SPACING: 8,
      SAFE_MARGIN: 20
    };
    
    // 🎨 アイテム一覧のタイトル（Y=190）- 美しいデザイン
    const itemTitleY = LAYOUT_CONSTANTS.TITLE_HEIGHT + LAYOUT_CONSTANTS.SLOT_AREA_HEIGHT + 20; // 190（20px下に移動）
    
    const itemTitleBg = this.add.rectangle(width / 2, itemTitleY, 200, 30, 0x0B2F5C, 0.7);
    itemTitleBg.setStrokeStyle(1, 0x87CEEB, 0.6);
    itemTitleBg.setDepth(100); // 最前面に表示
    
    const itemTitleText = this.add.text(width / 2, itemTitleY, '🎒 所持アイテム一覧', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    itemTitleText.setDepth(101); // タイトルテキストを最前面に表示
    
    // アイテム表示エリアの定義（マスクなし）
    const itemAreaStartY = itemTitleY + 30; // タイトルの下に十分な余白（Y=220）
    const itemAreaHeight = 420 - 30; // タイトル分を差し引く（390px）
    const itemAreaEndY = itemAreaStartY + itemAreaHeight; // Y=610
    
    console.log('🔧 Item Display Area (No Mask):', {
      itemTitleY,
      itemAreaStartY,
      itemAreaEndY,
      itemAreaHeight,
      gap: itemAreaStartY - itemTitleY
    });
    
    // アイテムを格納するコンテナ
    this.itemListContainer = this.add.container(0, 0);
    
    // アイテム配置設定（左右2列レイアウト）
    const itemWidth = 160; // 幅を狭くして2列に対応
    const itemHeight = 55; // 高さも少し調整
    const itemSpacing = 8;
    
    // 左列と右列の中心X座標
    const leftColumnX = width / 2 - 85;  // 左列
    const rightColumnX = width / 2 + 85; // 右列
    
    // 🔧 修正：アイテム開始位置をタイトルの下に十分な余白を設けて配置
    const itemStartY = itemAreaStartY + LAYOUT_CONSTANTS.SAFE_MARGIN; // タイトル下 + 余白
    
    console.log('🔧 CORRECTED 2-Column Layout Settings:', {
      itemWidth,
      itemHeight,
      itemSpacing,
      leftColumnX,
      rightColumnX,
      itemStartY,
      itemTitleY,
      gapFromTitle: itemStartY - itemTitleY
    });
    
    // 利用可能なアイテムを左右2列に配置
    const availableItems = this.items.filter(item => item.count > 0);
    
    console.log(`Creating ${availableItems.length} items in 2 columns`);
    
    availableItems.forEach((item, index) => {
      // 左右交互に配置
      const isLeftColumn = index % 2 === 0;
      const x = isLeftColumn ? leftColumnX : rightColumnX;
      const rowIndex = Math.floor(index / 2);
      const y = itemStartY + rowIndex * (itemHeight + itemSpacing);
      
      // アイテムがエリア内に収まるかチェック
      if (y + itemHeight/2 <= itemAreaEndY - LAYOUT_CONSTANTS.SAFE_MARGIN) {
        console.log(`Item ${index}: ${item.name} at (${x}, ${y}) - ${isLeftColumn ? 'LEFT' : 'RIGHT'} column`);
        this.createItemButton(item, x, y, itemWidth, itemHeight);
      } else {
        console.log(`Item ${index}: ${item.name} SKIPPED - would exceed bounds`);
      }
    });
    
    // クラス変数に保存（マスク関連削除）
    this.maskStartY = itemAreaStartY; // 互換性のため
    this.maskEndY = itemAreaEndY;     // 互換性のため
    
    // 🎯 2列レイアウト - マスクもスクロールも不要
    console.log('✅ 2-Column layout - No mask, no scrolling needed');
    
    console.log('✅ 2-Column item list layout complete (Clean UI)');
    
    // 🔧 最終状態の確認
    this.debugItemListState();
    
    // 🔧 デバッグ用エリア表示
    this.addDebugLines(width, height, itemTitleY, itemAreaStartY, itemAreaEndY);
    this.debugItemListState();
  }

  private addDebugLines(width: number, height: number, itemTitleY: number, itemAreaStartY: number, itemAreaEndY: number) {
    console.log('🔧 Adding debug rectangles for area visualization...');
    
    // 🚨 緊急修正：直接描画でデバッグラインを強制表示
    
    // タイトルエリア（Y=0-70）- 赤色（拡張）
    const titleRect = this.add.rectangle(width / 2, 35, width - 4, 66, 0x000000, 0)
      .setStrokeStyle(3, 0xFF0000);
    const titleText = this.add.text(10, 5, 'タイトルエリア Y=0-70 (拡張)', {
      fontSize: '12px',
      color: '#FF0000',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(titleRect, titleText);
    
    // 装備スロットエリア（Y=70-170）- 緑色（さらに拡張）
    const slotRect = this.add.rectangle(width / 2, 120, width - 4, 96, 0x000000, 0)
      .setStrokeStyle(3, 0x00FF00);
    const slotText = this.add.text(10, 75, '装備スロットエリア Y=70-170 (さらに拡張)', {
      fontSize: '12px',
      color: '#00FF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(slotRect, slotText);
    
    // アイテムタイトルエリア（Y=170-210）- 青色
    const itemTitleRect = this.add.rectangle(width / 2, 190, width - 4, 36, 0x000000, 0)
      .setStrokeStyle(3, 0x0000FF);
    const itemTitleText = this.add.text(10, 175, 'アイテムタイトルエリア Y=170-210', {
      fontSize: '12px',
      color: '#0000FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(itemTitleRect, itemTitleText);
    
    // アイテム表示エリア（Y=210-630）- 黄色（開始位置を20px下に移動）
    const itemAreaRect = this.add.rectangle(width / 2, 420, width - 4, 416, 0x000000, 0)
      .setStrokeStyle(4, 0xFFFF00);
    const itemAreaText = this.add.text(10, 215, 'アイテム表示エリア Y=210-630', {
      fontSize: '12px',
      color: '#FFFF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(itemAreaRect, itemAreaText);
    
    // ボタンエリア（Y=630-710）- 紫色
    const buttonRect = this.add.rectangle(width / 2, 670, width - 4, 76, 0x000000, 0)
      .setStrokeStyle(3, 0xFF00FF);
    const buttonText = this.add.text(10, 635, 'ボタンエリア Y=630-710', {
      fontSize: '12px',
      color: '#FF00FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(buttonRect, buttonText);
    
    console.log('🔧 ✅ DEBUG LINES FORCE DISPLAYED - DIRECT RENDERING');
    console.log('🔧 Debug elements count:', this.debugElements.length);
  }

  private debugItemListState() {
    console.log('🔍 === ITEM LIST STATE ===');
    
    console.log('Container:', {
      position: { x: this.itemListContainer.x, y: this.itemListContainer.y },
      visible: this.itemListContainer.visible,
      alpha: this.itemListContainer.alpha,
      itemCount: this.itemListContainer.list.length,
      hasMask: !!this.itemListContainer.mask
    });
    
    console.log('Mask vs Items:', {
      maskArea: `${this.maskStartY} - ${this.maskEndY}`,
      firstItemY: this.itemListContainer.list.length > 0 ? 
        this.itemListContainer.list[0].y + this.itemListContainer.y : 'No items'
    });
    
    console.log('🔍 === END ===');
  }

  // スクロール機能は削除 - 2列レイアウトで不要

  private createItemButton(item: Item, x: number, y: number, width: number, height: number) {
    console.log(`Creating item: ${item.name} at (${x}, ${y})`);
    
    const container = this.add.container(x, y);
    
    // 🎨 美しい背景デザイン（海のテーマ）
    const rarityColor = getRarityColor(item.rarity);
    
    // メイン背景（深い海の色）
    const bg = this.add.rectangle(0, 0, width, height, 0x2E5984, 0.9);
    
    // レア度に応じたベース背景（常に表示）
    const baseBg = this.add.rectangle(0, 0, width - 4, height - 4, rarityColor, 0.15);
    
    // ホバー効果専用の背景（初期は非表示）
    const hoverBg = this.add.rectangle(0, 0, width - 4, height - 4, rarityColor, 0.1);
    hoverBg.setVisible(false);
    
    // ストローク（枠線）を別要素として作成（常に表示）
    const strokeBorder = this.add.rectangle(0, 0, width - 4, height - 4, 0x000000, 0);
    strokeBorder.setStrokeStyle(2, rarityColor, 0.8);
    
    // 🎨 アイテム名（より読みやすく）
    const nameText = this.add.text(-width/2 + 15, -12, item.name, {
      fontSize: '15px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    });
    
    // 🎨 所持数（右上に配置、目立つように）
    const countBg = this.add.rectangle(width/2 - 25, -height/2 + 12, 40, 20, rarityColor, 0.8);
    countBg.setStrokeStyle(1, '#FFFFFF', 0.6);
    
    const countText = this.add.text(width/2 - 25, -height/2 + 12, `×${item.count}`, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // 🎨 レア度表示（左下、より目立つように）
    const rarityBg = this.add.rectangle(-width/2 + 30, height/2 - 12, 50, 18, rarityColor, 0.9);
    rarityBg.setStrokeStyle(1, '#FFFFFF', 0.8);
    
    const rarityText = this.add.text(-width/2 + 30, height/2 - 12, `${item.rarity}レア`, {
      fontSize: '11px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // 🎨 微細な装飾（海の泡のような効果）
    const decoration1 = this.add.circle(-width/2 + 8, -height/2 + 8, 3, 0xFFFFFF, 0.3);
    const decoration2 = this.add.circle(width/2 - 8, height/2 - 8, 2, 0xFFFFFF, 0.2);
    
    // 装備制限表示（通常枠に装備できないS・Aレアアイテムの場合）
    let restrictionIcon = null;
    let restrictionText = null;
    if (['S', 'A'].includes(item.rarity)) {
      // 特殊枠専用アイコン
      restrictionIcon = this.add.circle(width/2 - 10, 0, 8, 0xFFD700, 0.8);
      restrictionIcon.setStrokeStyle(1, 0xFFFFFF, 0.8);
      
      restrictionText = this.add.text(width/2 - 10, 0, '特', {
        fontSize: '10px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5);
    }
    
    // 使用済みアイテム表示（装備済みで使用済みの場合）
    let usedOverlay = null;
    let usedText = null;
    
    // 装備スロットをチェックして使用済みかどうか確認
    const isUsed = this.checkIfItemIsUsed(item);
    
    if (isUsed) {
      // 使用済みオーバーレイ
      usedOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5);
      
      // 使用済みテキスト
      usedText = this.add.text(0, 0, '使用済', {
        fontSize: '14px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#FF0000',
        padding: { x: 5, y: 2 }
      }).setOrigin(0.5);
    }
    
    // 全ての要素をコンテナに追加
    const elements = [bg, baseBg, hoverBg, strokeBorder, nameText, countBg, countText, rarityBg, rarityText, decoration1, decoration2];
    
    if (restrictionIcon && restrictionText) {
      elements.push(restrictionIcon, restrictionText);
    }
    
    if (usedOverlay && usedText) {
      elements.push(usedOverlay, usedText);
    }
    
    container.add(elements);
    
    // インタラクション
    container.setSize(width, height);
    container.setInteractive();
    
    // 🎨 ホバー効果（完全修正版：表示/非表示切り替え）
    container.on('pointerover', () => {
      console.log(`[HOVER] ${item.name} - pointerover`);
      container.setScale(1.02);
      hoverBg.setVisible(true);
      console.log(`[HOVER] ${item.name} - applied hover effect`);
    });
    
    container.on('pointerout', () => {
      console.log(`[HOVER] ${item.name} - pointerout`);
      container.setScale(1.0);
      hoverBg.setVisible(false);
      console.log(`[HOVER] ${item.name} - removed hover effect`);
    });
    
    container.on('pointerdown', () => {
      console.log(`[HOVER] ${item.name} - pointerdown`);
      container.setScale(0.98);
    });
    
    container.on('pointerup', () => {
      console.log(`[HOVER] ${item.name} - pointerup`);
      container.setScale(1.0);
      hoverBg.setVisible(false);
      console.log(`[HOVER] ${item.name} - reset to normal state`);
      
      // 使用済みアイテムは選択できない
      if (isUsed) {
        this.showMessage(`${item.name}は既に使用済みです`);
        return;
      }
      
      this.selectItem(item);
    });
    
    this.itemListContainer.add(container);
    
    console.log(`✅ Beautiful item ${item.name} created`);
  }
  
  // アイテムが使用済みかどうかをチェック
  private checkIfItemIsUsed(item: Item): boolean {
    // 装備スロットをチェック
    for (const slot of this.equipSlots) {
      if (slot.item && slot.item.type === item.type && slot.used) {
        return true; // 装備済みで使用済み
      }
    }
    return false;
  }

  private createButtons() {
    const { width, height } = this.cameras.main;
    
    // レイアウト定数に従ったボタン配置（Y=670）
    const buttonY = 670;
    
    // 🎨 決定ボタン（左側）- 美しいデザイン
    this.confirmButton = this.add.container(120, buttonY);
    
    const confirmBg = this.add.rectangle(0, 0, 100, 40, 0x228B22, 0.9);
    confirmBg.setStrokeStyle(2, 0x32CD32, 0.8);
    
    const confirmDecor = this.add.rectangle(0, 0, 96, 36, 0x32CD32, 0.2);
    
    const confirmText = this.add.text(0, 0, '✓ 決定', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    this.confirmButton.add([confirmBg, confirmDecor, confirmText]);
    this.confirmButton.setSize(100, 40);
    this.confirmButton.setInteractive();
    
    // ホバー効果（修正版：確実に元に戻る）
    let isPressed = false;
    
    this.confirmButton.on('pointerover', () => {
      if (!isPressed) {
        this.confirmButton.setScale(1.05);
      }
    });
    this.confirmButton.on('pointerout', () => {
      if (!isPressed) {
        this.confirmButton.setScale(1.0);
      }
    });
    this.confirmButton.on('pointerdown', () => {
      isPressed = true;
      this.confirmButton.setScale(0.95);
    });
    this.confirmButton.on('pointerup', () => {
      isPressed = false;
      this.confirmButton.setScale(1.0);
      this.confirmSelection();
    });
    
    // 🎨 キャンセルボタン（右側）- 美しいデザイン
    this.cancelButton = this.add.container(280, buttonY);
    
    const cancelBg = this.add.rectangle(0, 0, 100, 40, 0xB22222, 0.9);
    cancelBg.setStrokeStyle(2, 0xFF4444, 0.8);
    
    const cancelDecor = this.add.rectangle(0, 0, 96, 36, 0xFF4444, 0.2);
    
    const cancelText = this.add.text(0, 0, '✕ キャンセル', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    this.cancelButton.add([cancelBg, cancelDecor, cancelText]);
    this.cancelButton.setSize(100, 40);
    this.cancelButton.setInteractive();
    
    // ホバー効果（修正版：確実に元に戻る）
    let isCancelPressed = false;
    
    this.cancelButton.on('pointerover', () => {
      if (!isCancelPressed) {
        this.cancelButton.setScale(1.05);
      }
    });
    this.cancelButton.on('pointerout', () => {
      if (!isCancelPressed) {
        this.cancelButton.setScale(1.0);
      }
    });
    this.cancelButton.on('pointerdown', () => {
      isCancelPressed = true;
      this.cancelButton.setScale(0.95);
    });
    this.cancelButton.on('pointerup', () => {
      isCancelPressed = false;
      this.cancelButton.setScale(1.0);
      this.cancelSelection();
    });
  }

  private selectSlot(slotIndex: number) {
    this.selectedSlotIndex = slotIndex;
    console.log(`Selected slot: ${slotIndex} (${this.equipSlots[slotIndex].type})`);
    this.updateSlotDisplay();
  }

  private selectItem(item: Item) {
    if (this.selectedSlotIndex === null) {
      this.showMessage('装備スロットを先に選択してください');
      return;
    }
    
    const itemManager = this.gameStateManager.getItemManager();
    const slotIndex = this.selectedSlotIndex as 0 | 1;
    
    // 装備制限チェック（ItemManagerの機能を使用）
    const slotType = slotIndex === 0 ? 'special' : 'normal';
    const equippableItems = itemManager.getEquippableItems(slotType);
    
    if (!equippableItems.some(equippableItem => equippableItem.type === item.type)) {
      // 装備制限に引っかかる場合、より詳細なエラーメッセージを表示
      if (slotType === 'normal' && ['S', 'A'].includes(item.rarity)) {
        this.showMessage(`${item.rarity}レアアイテムは通常枠に装備できません`);
      } else {
        this.showMessage('このアイテムはこの枠に装備できません');
      }
      return;
    }
    
    // アイテムを装備（ItemManagerを使用）
    const success = itemManager.equipItem(item.type, slotIndex);
    
    if (success) {
      // 装備スロット情報を更新
      this.equipSlots = itemManager.getEquipSlots();
      this.selectedItem = item;
      
      console.log(`Equipped ${item.name} to ${slotType} slot`);
      this.updateSlotDisplay();
      this.showMessage(`${item.name}を装備しました`);
    } else {
      this.showMessage('装備に失敗しました');
    }
  }

  private updateSlotDisplay() {
    // 特殊枠の表示更新
    const specialSlot = this.equipSlots[0];
    if (specialSlot.item) {
      // アイテム名と使用状態を表示
      const usedText = specialSlot.used ? '（使用済）' : '';
      this.specialSlotText.setText(`${specialSlot.item.name}${usedText}`);
      
      // 使用済みの場合は色を変える
      if (specialSlot.used) {
        this.specialSlotText.setColor('#FF6B6B');
      } else {
        this.specialSlotText.setColor('#FFFFFF');
      }
    } else {
      this.specialSlotText.setText('未選択');
      this.specialSlotText.setColor('#CCCCCC');
    }
    
    // 通常枠の表示更新
    const normalSlot = this.equipSlots[1];
    if (normalSlot.item) {
      // アイテム名と使用状態を表示
      const usedText = normalSlot.used ? '（使用済）' : '';
      this.normalSlotText.setText(`${normalSlot.item.name}${usedText}`);
      
      // 使用済みの場合は色を変える
      if (normalSlot.used) {
        this.normalSlotText.setColor('#FF6B6B');
      } else {
        this.normalSlotText.setColor('#FFFFFF');
      }
    } else {
      this.normalSlotText.setText('未選択');
      this.normalSlotText.setColor('#CCCCCC');
    }
    
    // 選択カーソルの表示（元の枠線は保持）
    if (this.selectedSlotIndex === 0) {
      // 特殊枠選択時 - カーソル風の選択表示
      if (this.specialSlotCursor) this.specialSlotCursor.destroy();
      this.specialSlotCursor = this.add.rectangle(100, 130, 190, 60, 0x000000, 0)
        .setStrokeStyle(4, 0xFFFFFF, 0.9); // 白い太い枠でカーソル表現
      
      // カーソルの点滅効果
      this.tweens.add({
        targets: this.specialSlotCursor,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // 通常枠のカーソルを削除
      if (this.normalSlotCursor) {
        this.normalSlotCursor.destroy();
        this.normalSlotCursor = null;
      }
    } else if (this.selectedSlotIndex === 1) {
      // 通常枠選択時 - カーソル風の選択表示
      if (this.normalSlotCursor) this.normalSlotCursor.destroy();
      this.normalSlotCursor = this.add.rectangle(300, 130, 190, 60, 0x000000, 0)
        .setStrokeStyle(4, 0xFFFFFF, 0.9); // 白い太い枠でカーソル表現
      
      // カーソルの点滅効果
      this.tweens.add({
        targets: this.normalSlotCursor,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // 特殊枠のカーソルを削除
      if (this.specialSlotCursor) {
        this.specialSlotCursor.destroy();
        this.specialSlotCursor = null;
      }
    } else {
      // どちらも選択されていない状態 - カーソルを削除
      if (this.specialSlotCursor) {
        this.specialSlotCursor.destroy();
        this.specialSlotCursor = null;
      }
      if (this.normalSlotCursor) {
        this.normalSlotCursor.destroy();
        this.normalSlotCursor = null;
      }
    }
  }

  private showMessage(text: string) {
    if (this.messageText) {
      this.messageText.destroy();
    }
    
    const { width } = this.cameras.main;
    this.messageText = this.add.text(width / 2, 300, text, {
      fontSize: '14px',
      color: '#FF6B6B',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // 3秒後に消去
    this.time.delayedCall(3000, () => {
      if (this.messageText) {
        this.messageText.destroy();
      }
    });
  }

  // 決定ボタンの処理
  private confirmSelection() {
    console.log('🎯 決定ボタンが押されました');
    
    // GameStateManagerから最新の装備情報を取得
    const equipSlots = this.gameStateManager.getItemManager().getEquipSlots();
    
    // 装備スロットが空の場合は警告
    if (!equipSlots[0].item && !equipSlots[1].item) {
      this.showMessage('少なくとも1つのアイテムを装備してください');
      return;
    }
    
    console.log('📦 装備データ:', equipSlots);
    
    // ゲーム画面に遷移（GameStateManagerを渡す）
    this.scene.start('GameScene', {
      gameStateManager: this.gameStateManager
    });
  }

  // キャンセルボタンの処理
  private cancelSelection() {
    console.log('🔙 キャンセルボタンが押されました');
    
    // メイン画面に戻る（GameStateManagerを渡す）
    this.scene.start('MainScene', {
      gameStateManager: this.gameStateManager
    });
  }

  // 使用されていないaddDebugDisplay関数は削除

  private validateLayout() {
    const LAYOUT_CONSTANTS = {
      TITLE_HEIGHT: 60,
      SLOT_AREA_HEIGHT: 60,
      ITEM_TITLE_HEIGHT: 40,
      SCROLL_AREA_HEIGHT: 470,
      BUTTON_AREA_HEIGHT: 80,
      SCREEN_HEIGHT: 710
    };
    
    const totalHeight = 
      LAYOUT_CONSTANTS.TITLE_HEIGHT +
      LAYOUT_CONSTANTS.SLOT_AREA_HEIGHT +
      LAYOUT_CONSTANTS.ITEM_TITLE_HEIGHT +
      LAYOUT_CONSTANTS.SCROLL_AREA_HEIGHT +
      LAYOUT_CONSTANTS.BUTTON_AREA_HEIGHT;
    
    if (totalHeight !== LAYOUT_CONSTANTS.SCREEN_HEIGHT) {
      console.error('❌ Layout height mismatch!', {
        calculated: totalHeight,
        expected: LAYOUT_CONSTANTS.SCREEN_HEIGHT,
        difference: totalHeight - LAYOUT_CONSTANTS.SCREEN_HEIGHT
      });
    } else {
      console.log('✅ Layout validation passed:', {
        totalHeight,
        expectedHeight: LAYOUT_CONSTANTS.SCREEN_HEIGHT
      });
    }
  }

  private setupDebugShortcut() {
    // Dキーでデバッグライン切り替え
    this.input.keyboard?.on('keydown-D', (event: KeyboardEvent) => {
      if (event.shiftKey) {
        // Shift+D: 詳細デバッグ情報出力
        this.logDetailedDebugInfo();
      } else {
        // D: デバッグライン切り替え
        this.toggleDebugLines();
      }
    });
    
    console.log('🔧 [ITEM SELECT SCENE] Debug shortcut setup:');
    console.log('  - Press "D" to toggle debug lines');
    console.log('  - Press "Shift+D" to log detailed debug info');
  }

  private toggleDebugLines() {
    this.debugVisible = !this.debugVisible;
    
    // 全てのデバッグ要素の表示/非表示を切り替え
    this.debugElements.forEach(element => {
      element.setVisible(this.debugVisible);
    });
    
    console.log(`🔧 [ITEM SELECT SCENE] Debug lines ${this.debugVisible ? 'SHOWN' : 'HIDDEN'} (Press D to toggle)`);
    console.log(`🔧 Toggled ${this.debugElements.length} debug elements`);
  }

  private logDetailedDebugInfo() {
    const { width, height } = this.cameras.main;
    console.log('🔍 === DETAILED DEBUG INFO [ITEM SELECT SCENE] ===');
    console.log('📍 Current Screen:', {
      sceneName: 'ItemSelectScene',
      displayName: 'アイテム選択画面',
      purpose: 'アイテム装備・選択画面',
      sceneKey: this.scene.key,
      isActive: this.scene.isActive(),
      isPaused: this.scene.isPaused(),
      isVisible: this.scene.isVisible()
    });
    console.log('📱 Screen Info:', {
      width: width,
      height: height,
      devicePixelRatio: window.devicePixelRatio
    });
    console.log('📦 Items Info:', {
      totalItems: this.items.length,
      itemsByRarity: this.items.reduce((acc, item) => {
        acc[item.rarity] = (acc[item.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      itemsWithCount: this.items.map(item => ({
        name: item.name,
        rarity: item.rarity,
        count: item.count
      }))
    });
    console.log('⚔️ Equipment Slots:', {
      totalSlots: this.equipSlots.length,
      slots: this.equipSlots.map((slot, index) => ({
        index: index,
        type: slot.type,
        hasItem: !!slot.item,
        itemName: slot.item?.name || 'None'
      }))
    });
    console.log('🎯 Selection State:', {
      selectedItem: this.selectedItem?.name || 'None',
      selectedSlotIndex: this.selectedSlotIndex
    });
    console.log('🎨 Debug Elements:', {
      count: this.debugElements.length,
      visible: this.debugVisible
    });
    console.log('🔧 Performance:', {
      fps: this.game.loop.actualFps.toFixed(1),
      delta: this.game.loop.delta
    });
    console.log('=== END DEBUG INFO ===');
  }
}
