import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { StageManager } from '../managers/StageManager';
import { ItemManager } from '../managers/ItemManager';
import { ITEM_DATA } from '../data/ItemData';
import { Item, ItemRarity } from '../types/Item';
import { SoundManager } from '../utils/SoundManager';
import { AnimationManager, TransitionType } from '../utils/AnimationManager';
import { BackgroundManager } from '../utils/BackgroundManager';
import { SimpleOceanButton } from '../components/SimpleOceanButton';
import { Logger } from '../utils/Logger';

/**
 * アイテム選択画面
 */
export class ItemSelectionScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private stageManager: StageManager;
  private itemManager: ItemManager;
  private soundManager!: SoundManager;
  private animationManager!: AnimationManager;
  private backgroundManager!: BackgroundManager;
  private currentStage: number = 1;
  private availableItems: Item[] = [];
  private selectedSpecialItem: Item | null = null;
  private selectedNormalItem: Item | null = null;

  constructor() {
    super({ key: 'ItemSelectionScene' });
    this.stageManager = StageManager.getInstance();
    this.itemManager = ItemManager.getInstance();
  }

  init(data: any): void {
    this.currentStage = data.stage || this.stageManager.getCurrentStage();
    
    // 利用可能なアイテムを取得
    this.loadAvailableItems();
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#1E5799');
    
    Logger.debug('ItemSelectionScene create開始');
    
    // サウンドマネージャーを初期化
    this.soundManager = new SoundManager(this);
    this.soundManager.preloadSounds();
    
    // アニメーションマネージャーを初期化
    this.animationManager = new AnimationManager(this);
    
    // 背景マネージャーを初期化
    this.backgroundManager = new BackgroundManager(this);
    
    // 美しい海の背景を作成
    this.backgroundManager.createOceanBackground('light');
    
    // タイトルBGMを開始（メイン画面と同じBGM）
    this.soundManager.playTitleBgm();
    
    this.createUI();
    this.addDebugLines();
    
    // テスト用：自動的にアイテムを装備（必ず実行）
    Logger.debug('DEBUG_MODE:', GameConfig.DEBUG_MODE);
    this.autoEquipTestItems();
  }

  /**
   * 利用可能なアイテムを読み込み
   */
  private loadAvailableItems(): void {
    this.availableItems = [];
    const inventory = this.itemManager.getInventory();
    
    Logger.debug('loadAvailableItems開始');
    Logger.debug('インベントリ:', inventory);
    
    // 所持しているアイテムのみを表示
    for (const itemId in inventory) {
      const itemData = ITEM_DATA[itemId];
      if (itemData && inventory[itemId] > 0) {
        this.availableItems.push(itemData);
        Logger.debug(`アイテム追加: ${itemData.name} (${itemId}) x${inventory[itemId]}`);
      }
    }
    
    Logger.debug('利用可能なアイテム数:', this.availableItems.length);
    
    // レア度順でソート（S > A > B > C > D > E > F）
    this.availableItems.sort((a, b) => {
      const rarityOrder = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
    
    Logger.debug('ソート後のアイテム一覧:', this.availableItems.map(item => `${item.name}(${item.rarity})`));
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

    // 特殊枠の装備解除ボタン
    const specialUnequipButton = this.add.text(width / 2 + slotWidth / 2 + 20, specialSlotY, '×', {
      fontSize: '16px',
      color: '#FF0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setName('specialUnequipButton')
      .setVisible(false);

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

    // 通常枠の装備解除ボタン
    const normalUnequipButton = this.add.text(width / 2 + slotWidth / 2 + 20, normalSlotY, '×', {
      fontSize: '16px',
      color: '#FF0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setName('normalUnequipButton')
      .setVisible(false);

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
    specialSlotRect.on('pointerdown', () => {
      this.soundManager.playButtonTap();
      this.showItemSelectionModal('special');
    });
    normalSlotRect.on('pointerdown', () => {
      this.soundManager.playButtonTap();
      this.showItemSelectionModal('normal');
    });
    
    // 装備解除イベント
    specialUnequipButton.on('pointerdown', () => {
      this.soundManager.playButtonTap();
      this.unequipItem('special');
    });
    normalUnequipButton.on('pointerdown', () => {
      this.soundManager.playButtonTap();
      this.unequipItem('normal');
    });
  }

  /**
   * アイテムリストを作成
   */
  private createItemList(startY: number): void {
    const { width, height } = this.cameras.main;
    
    // 利用可能な空間を計算
    const buttonAreaHeight = 80; // ボタンエリアの高さ
    const availableHeight = height - startY - buttonAreaHeight - 20; // 20pxは余白
    
    if (this.availableItems.length === 0) {
      this.add.text(width / 2, startY, 'アイテムを所持していません', {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      return;
    }

    // 2列表示の設定
    const columns = 2;
    const columnWidth = width / columns;
    const leftColumnX = columnWidth / 2;
    const rightColumnX = leftColumnX + columnWidth;
    
    // 行数を計算（全13アイテムを基準）
    const maxItems = 13; // 実装されている全アイテム数
    const maxRows = Math.ceil(maxItems / columns); // 最大7行
    const itemHeight = Math.max(22, Math.floor(availableHeight / maxRows)); // 最小22px
    
    // フォントサイズを適切に設定（読みやすさ重視）
    const fontSize = itemHeight >= 30 ? '14px' : itemHeight >= 25 ? '13px' : '12px';

    this.availableItems.forEach((item, index) => {
      const count = this.itemManager.getItemCount(item.id);
      const rarityColor = this.getRarityColor(item.rarity);
      
      // 2列配置の計算
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = col === 0 ? leftColumnX : rightColumnX;
      const y = startY + row * itemHeight;
      
      const itemText = `${item.name} ×${count} (${item.rarity})`;
      
      // アイテム背景（クリック範囲を明確にするため）
      const itemBg = this.add.rectangle(x, y, columnWidth - 10, itemHeight - 2, 0x000000, 0.1)
        .setInteractive({ useHandCursor: true })
        .setName(`itemBg_${item.id}`);
      
      const text = this.add.text(x, y, itemText, {
        fontSize: fontSize,
        color: rarityColor,
        fontFamily: 'Arial'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setName(`item_${item.id}`);
      
      // ホバーエフェクト
      const addHoverEffect = (target: Phaser.GameObjects.GameObject) => {
        target.on('pointerover', () => {
          itemBg.setFillStyle(0x333333, 0.3);
          Logger.debug(`${item.name}: ${item.description}`);
        });
        
        target.on('pointerout', () => {
          itemBg.setFillStyle(0x000000, 0.1);
        });
      };
      
      addHoverEffect(itemBg);
      addHoverEffect(text);
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
    const { width, height } = this.cameras.main;
    
    // 装備可能なアイテムをフィルタリング
    const equipableItems = this.availableItems.filter(item => {
      if (slotType === 'normal') {
        // 通常枠：B〜Fレアのみ
        return item.rarity !== ItemRarity.S && item.rarity !== ItemRarity.A;
      } else {
        // 特殊枠：全てのアイテム装備可能
        return true;
      }
    });

    if (equipableItems.length === 0) {
      Logger.debug('装備可能なアイテムがありません');
      return;
    }

    // モーダル背景
    const modalBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive()
      .setName('modalBackground');

    // 固定サイズ設定（全13アイテムが表示できるサイズ）
    const modalWidth = width * 0.85;
    const titleHeight = 50;
    const buttonHeight = 40;
    const padding = 20;
    
    // 全アイテム数（13個）を基準にアイテム高さを計算
    const maxItems = 13; // 実装されている全アイテム数
    const availableHeight = height * 0.8 - titleHeight - buttonHeight - padding * 2;
    const itemHeight = Math.floor(availableHeight / maxItems);
    
    // 実際のモーダル高さを計算
    const actualItemAreaHeight = equipableItems.length * itemHeight;
    const modalHeight = titleHeight + actualItemAreaHeight + buttonHeight + padding * 2;

    // モーダルウィンドウ
    const modal = this.add.rectangle(width / 2, height / 2, modalWidth, modalHeight, 0x333333, 0.95)
      .setStrokeStyle(2, 0xFFFFFF)
      .setName('modal');

    // モーダルタイトル
    const slotTypeName = slotType === 'special' ? '特殊枠' : '通常枠';
    this.add.text(width / 2, height / 2 - modalHeight / 2 + titleHeight / 2, `${slotTypeName}に装備するアイテムを選択`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('modalTitle');

    // アイテムリスト表示
    const itemStartY = height / 2 - modalHeight / 2 + titleHeight + padding;
    
    equipableItems.forEach((item, index) => {
      const itemY = itemStartY + index * itemHeight + itemHeight / 2;
      const count = this.itemManager.getItemCount(item.id);
      const rarityColor = this.getRarityColor(item.rarity);
      
      // アイテム背景
      const itemBg = this.add.rectangle(width / 2, itemY, modalWidth - 40, itemHeight - 2, 0x555555, 0.8)
        .setInteractive({ useHandCursor: true })
        .setName(`modalItem_${item.id}`);
      
      // アイテムテキスト（フォントサイズを調整）
      const fontSize = itemHeight > 30 ? '14px' : '12px';
      const itemText = `${item.name} ×${count} (${item.rarity})`;
      this.add.text(width / 2, itemY, itemText, {
        fontSize: fontSize,
        color: rarityColor,
        fontFamily: 'Arial'
      }).setOrigin(0.5).setName(`modalItemText_${item.id}`);

      // アイテム選択イベント
      itemBg.on('pointerdown', () => {
        this.soundManager.playButtonTap();
        this.selectItemForSlot(item, slotType);
        this.closeModal();
      });

      // ホバーエフェクト
      itemBg.on('pointerover', () => {
        itemBg.setFillStyle(0x777777, 0.8);
      });

      itemBg.on('pointerout', () => {
        itemBg.setFillStyle(0x555555, 0.8);
      });
    });

    // 閉じるボタン
    const closeButtonY = height / 2 + modalHeight / 2 - buttonHeight / 2 - padding / 2;
    const closeButton = this.add.rectangle(width / 2, closeButtonY, 100, 30, 0x9E9E9E)
      .setInteractive({ useHandCursor: true })
      .setName('modalCloseButton');
    
    this.add.text(width / 2, closeButtonY, '閉じる', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setName('modalCloseText');

    closeButton.on('pointerdown', () => {
      this.closeModal();
    });

    // モーダル背景クリックで閉じる
    modalBg.on('pointerdown', () => {
      this.closeModal();
    });
  }

  /**
   * アイテムをスロットに装備
   */
  private selectItemForSlot(item: Item, slotType: 'special' | 'normal'): void {
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
      console.log(`${item.name}を${slotType === 'special' ? '特殊枠' : '通常枠'}に装備しました`);
    } else {
      console.log('アイテムの装備に失敗しました');
    }
  }

  /**
   * モーダルを閉じる
   */
  private closeModal(): void {
    // モーダル関連のオブジェクトを削除
    const modalObjects = [
      'modalBackground',
      'modal',
      'modalTitle',
      'modalCloseButton',
      'modalCloseText'
    ];

    modalObjects.forEach(name => {
      const obj = this.children.getByName(name);
      if (obj) {
        obj.destroy();
      }
    });

    // アイテム関連のオブジェクトも削除
    this.availableItems.forEach(item => {
      const itemBg = this.children.getByName(`modalItem_${item.id}`);
      const itemText = this.children.getByName(`modalItemText_${item.id}`);
      if (itemBg) itemBg.destroy();
      if (itemText) itemText.destroy();
    });
  }

  /**
   * スロット表示を更新
   */
  private updateSlotDisplay(textName: string, item: Item | null): void {
    const text = this.children.getByName(textName) as Phaser.GameObjects.Text;
    const slotType = textName.includes('special') ? 'special' : 'normal';
    const unequipButtonName = `${slotType}UnequipButton`;
    const unequipButton = this.children.getByName(unequipButtonName) as Phaser.GameObjects.Text;
    
    if (text) {
      if (item) {
        const count = this.itemManager.getItemCount(item.id);
        text.setText(`${item.name} ×${count}`);
        text.setColor(this.getRarityColor(item.rarity));
        if (unequipButton) {
          unequipButton.setVisible(true);
        }
      } else {
        text.setText('未選択');
        text.setColor('#FFFFFF');
        if (unequipButton) {
          unequipButton.setVisible(false);
        }
      }
    }
  }

  /**
   * アイテムの装備を解除
   */
  private unequipItem(slotType: 'special' | 'normal'): void {
    this.itemManager.unequipItem(slotType);
    
    if (slotType === 'special') {
      this.selectedSpecialItem = null;
      this.updateSlotDisplay('specialSlotText', null);
    } else {
      this.selectedNormalItem = null;
      this.updateSlotDisplay('normalSlotText', null);
    }
    
    console.log(`${slotType === 'special' ? '特殊枠' : '通常枠'}のアイテムを解除しました`);
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height - 60;
    
    // ボタン配置
    const leftButtonX = width / 2 - 80;
    const rightButtonX = width / 2 + 80;

    // 決定ボタン
    const confirmButton = new SimpleOceanButton(
      this,
      leftButtonX,
      buttonY,
      120,
      45,
      '決定',
      'success',
      () => {
        this.soundManager.playButtonTap();
        this.soundManager.playScreenTransition();
        
        // 装備されたアイテム情報を取得
        const equippedItems = this.itemManager.getEquippedItems();
        
        console.log('装備アイテム:', equippedItems);
        
        // ゲーム画面に遷移（装備アイテム情報を渡す）
        this.animationManager.screenTransition('ItemSelectionScene', 'GameScene', TransitionType.WAVE).then(() => {
          this.scene.start('GameScene', { 
            stage: this.currentStage,
            equippedItems: equippedItems
          });
        });
      }
    );

    // キャンセルボタン
    const cancelButton = new SimpleOceanButton(
      this,
      rightButtonX,
      buttonY,
      120,
      45,
      'キャンセル',
      'secondary',
      () => {
        this.soundManager.playButtonTap();
        this.soundManager.playScreenTransition();
        
        // メイン画面に戻る
        this.animationManager.screenTransition('ItemSelectionScene', 'MainScene', TransitionType.BUBBLE).then(() => {
          this.scene.start('MainScene');
        });
      }
    );
  }

  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア（ステージ情報含む）80pxに統一
    const titleHeight = 80;
    const titleCenterY = 40;
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // 装備枠エリア（特殊枠 + 通常枠）
    const equipmentStartY = 100; // タイトルエリア80px直下から開始
    const equipmentHeight = 200; // 特殊枠(60px) + 通常枠(60px) + 間隔(80px)
    const equipmentCenterY = equipmentStartY + equipmentHeight / 2;
    this.debugHelper.addAreaBorder(width / 2, equipmentCenterY, width, equipmentHeight, 0x00FF00, '装備枠エリア');
    
    // 所持アイテム一覧エリア（2列表示）
    const itemListStartY = equipmentStartY + equipmentHeight + 30; // タイトル分を追加
    const buttonAreaHeight = 80;
    const itemListHeight = height - itemListStartY - buttonAreaHeight;
    const itemListCenterY = itemListStartY + itemListHeight / 2;
    this.debugHelper.addAreaBorder(width / 2, itemListCenterY, width, itemListHeight, 0x0000FF, '所持アイテム一覧エリア（2列）');
    
    // ボタンエリア
    const buttonHeight = 80;
    const buttonCenterY = height - 40;
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, width, buttonHeight, 0xFF00FF, 'ボタン/アクションエリア');
  }

  /**
   * テスト用：自動的にアイテムを装備
   */
  private autoEquipTestItems(): void {
    console.log('autoEquipTestItems開始');
    console.log('利用可能なアイテム:', this.availableItems);
    
    // 利用可能なアイテムから自動装備
    const availableItems = this.availableItems.filter(item => this.itemManager.getItemCount(item.id) > 0);
    console.log('所持しているアイテム:', availableItems);
    
    if (availableItems.length > 0) {
      // 特殊枠に最初のアイテムを装備
      const firstItem = availableItems[0];
      console.log('特殊枠に装備予定:', firstItem);
      const success1 = this.itemManager.equipItem(firstItem, 'special');
      if (success1) {
        this.selectedSpecialItem = firstItem;
        this.updateSlotDisplay('specialSlotText', firstItem);
        console.log(`自動装備成功: ${firstItem.name}を特殊枠に装備`);
      } else {
        console.log(`自動装備失敗: ${firstItem.name}を特殊枠に装備できませんでした`);
      }
      
      // 通常枠に2番目のアイテムを装備（あれば）
      if (availableItems.length > 1) {
        const secondItem = availableItems[1];
        console.log('通常枠に装備予定:', secondItem, 'レア度:', secondItem.rarity);
        // 通常枠の制限をチェック（B〜Fレアのみ）
        if (['B', 'C', 'D', 'E', 'F'].includes(secondItem.rarity)) {
          const success2 = this.itemManager.equipItem(secondItem, 'normal');
          if (success2) {
            this.selectedNormalItem = secondItem;
            this.updateSlotDisplay('normalSlotText', secondItem);
            console.log(`自動装備成功: ${secondItem.name}を通常枠に装備`);
          } else {
            console.log(`自動装備失敗: ${secondItem.name}を通常枠に装備できませんでした`);
          }
        } else {
          console.log(`${secondItem.name}は通常枠に装備できません（レア度: ${secondItem.rarity}）`);
          // B〜Fレアのアイテムを探す
          const normalSlotItem = availableItems.find(item => ['B', 'C', 'D', 'E', 'F'].includes(item.rarity));
          if (normalSlotItem) {
            console.log('代替アイテムを通常枠に装備:', normalSlotItem);
            const success2 = this.itemManager.equipItem(normalSlotItem, 'normal');
            if (success2) {
              this.selectedNormalItem = normalSlotItem;
              this.updateSlotDisplay('normalSlotText', normalSlotItem);
              console.log(`自動装備成功: ${normalSlotItem.name}を通常枠に装備`);
            } else {
              console.log(`自動装備失敗: ${normalSlotItem.name}を通常枠に装備できませんでした`);
            }
          } else {
            console.log('通常枠に装備可能なアイテムが見つかりませんでした');
          }
        }
      } else {
        console.log('通常枠に装備するアイテムがありません');
      }
    } else {
      Logger.debug('装備可能なアイテムがありません');
    }
    
    // 最終的な装備状況を確認
    const finalEquipped = this.itemManager.getEquippedItems();
    console.log('最終装備状況:', finalEquipped);
  }

  /**
   * シーン終了時のクリーンアップ
   */
  shutdown(): void {
    // サウンドマネージャーをクリーンアップ
    if (this.soundManager) {
      this.soundManager.destroy();
    }
  }
}
