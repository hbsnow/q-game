import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';

/**
 * アイテム選択画面（モック版）
 */
export class ItemSelectionScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private gameStateManager: GameStateManager;
  private currentStage: number = 1;

  constructor() {
    super({ key: 'ItemSelectionScene' });
    this.gameStateManager = GameStateManager.getInstance();
  }

  init(data: any): void {
    this.currentStage = data.stage || this.gameStateManager.getCurrentStage();
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

    // 特殊枠のスロット（モック）
    const specialSlotY = contentStartY + 40;
    const slotWidth = 120;
    const slotHeight = 40;
    const slotSpacing = 140;
    
    const leftSlotX = width / 2 - slotSpacing / 2;
    const rightSlotX = width / 2 + slotSpacing / 2;

    // 左の特殊枠スロット
    this.add.rectangle(leftSlotX, specialSlotY, slotWidth, slotHeight, 0x333333, 0.8)
      .setStrokeStyle(2, 0xFFD700);
    this.add.text(leftSlotX, specialSlotY, '未選択', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 右の特殊枠スロット
    this.add.rectangle(rightSlotX, specialSlotY, slotWidth, slotHeight, 0x333333, 0.8)
      .setStrokeStyle(2, 0xFFD700);
    this.add.text(rightSlotX, specialSlotY, '未選択', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 通常枠（B〜Fレア用）
    const normalFrameY = specialSlotY + 80;
    this.add.text(width / 2, normalFrameY, '◆通常枠（B〜Fレア用）', {
      fontSize: '16px',
      color: '#87CEEB',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 通常枠のスロット（モック）
    const normalSlotY = normalFrameY + 40;

    // 左の通常枠スロット
    this.add.rectangle(leftSlotX, normalSlotY, slotWidth, slotHeight, 0x333333, 0.8)
      .setStrokeStyle(2, 0x87CEEB);
    this.add.text(leftSlotX, normalSlotY, '未選択', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 右の通常枠スロット
    this.add.rectangle(rightSlotX, normalSlotY, slotWidth, slotHeight, 0x333333, 0.8)
      .setStrokeStyle(2, 0x87CEEB);
    this.add.text(rightSlotX, normalSlotY, '未選択', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 所持アイテム一覧（モック）
    const itemListY = normalSlotY + 80;
    this.add.text(width / 2, itemListY, '◆所持アイテム一覧', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // モックアイテムリスト
    const mockItems = [
      'スワップ×3 (E)',
      'チェンジワン×2 (D)',
      'ミニ爆弾×5 (F)',
      'シャッフル×1 (E)'
    ];

    let itemY = itemListY + 30;
    mockItems.forEach(item => {
      this.add.text(width / 2, itemY, item, {
        fontSize: '14px',
        color: '#CCCCCC',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      itemY += 25;
    });
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
      // ゲーム画面に遷移
      this.scene.start('GameScene', { stage: this.currentStage });
    });

    cancelButton.on('pointerdown', () => {
      // メイン画面に戻る
      this.scene.start('MainScene');
    });

    // ホバーエフェクト
    confirmButton.on('pointerover', () => {
      this.tweens.add({
        targets: [confirmButton, this.children.getByName('confirmText')],
        scale: 1.05,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });

    confirmButton.on('pointerout', () => {
      this.tweens.add({
        targets: [confirmButton, this.children.getByName('confirmText')],
        scale: 1,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });

    cancelButton.on('pointerover', () => {
      this.tweens.add({
        targets: [cancelButton, this.children.getByName('cancelText')],
        scale: 1.05,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });

    cancelButton.on('pointerout', () => {
      this.tweens.add({
        targets: [cancelButton, this.children.getByName('cancelText')],
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
