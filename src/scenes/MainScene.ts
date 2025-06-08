import { Scene } from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

export class MainScene extends Scene {
  private gameStateManager!: GameStateManager;
  
  // デバッグライン管理
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private debugVisible = true; // 初期表示ON

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: any) {
    // GameStateManagerを受け取る
    this.gameStateManager = data.gameStateManager || GameStateManager.getInstance();
    console.log('MainScene initialized with GameStateManager:', this.gameStateManager);
  }

  create() {
    const { width, height } = this.cameras.main;

    // 🏷️ 画面名をコンソールに表示
    console.log('🎬 === MAIN SCENE ===');
    console.log('📍 Current Scene: メイン画面');
    console.log('🎯 Purpose: ステージ選択・メニュー画面');
    console.log('📊 Current Stage:', this.gameStateManager.getCurrentStage());
    console.log('💰 Current Gold:', this.gameStateManager.getGold());

    // デバッグショートカットキーを設定
    this.setupDebugShortcut();

    // 背景色設定（海のテーマ）
    this.cameras.main.setBackgroundColor('#1E5799');

    // タイトル表示
    this.add.text(width / 2, 80, '🌊 さめがめオーシャン 🌊', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ゴールド表示（実データ使用）
    const currentGold = this.gameStateManager.getGold();
    this.add.text(width - 20, 20, `ゴールド: ${currentGold}`, {
      fontSize: '16px',
      color: '#F4D03F',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // ステージ情報（実データ使用）
    const currentStage = this.gameStateManager.getCurrentStage();
    this.add.text(width / 2, 180, `ステージ ${currentStage}`, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // プレイボタン
    const playButton = this.add.rectangle(width / 2, 250, 200, 60, 0x7DB9E8, 0.9);
    playButton.setInteractive();
    playButton.on('pointerdown', () => {
      // アイテム選択画面へ遷移（GameStateManagerを渡す）
      this.scene.start('ItemSelectScene', {
        gameStateManager: this.gameStateManager
      });
    });

    this.add.text(width / 2, 250, 'プレイ', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // メニューボタン群
    const buttonY = 350;
    const buttonWidth = 120;
    const buttonHeight = 50;

    // アイテムボタン
    const itemButton = this.add.rectangle(width / 2 - 70, buttonY, buttonWidth, buttonHeight, 0x2E8B57, 0.8);
    itemButton.setInteractive();
    itemButton.on('pointerdown', () => {
      this.scene.start('ItemListScene', {
        gameStateManager: this.gameStateManager
      });
    });

    this.add.text(width / 2 - 70, buttonY, 'アイテム', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // ガチャボタン
    const gachaButton = this.add.rectangle(width / 2 + 70, buttonY, buttonWidth, buttonHeight, 0xFF6347, 0.8);
    gachaButton.setInteractive();
    gachaButton.on('pointerdown', () => {
      this.scene.start('GachaScene', {
        gameStateManager: this.gameStateManager
      });
    });

    this.add.text(width / 2 + 70, buttonY, 'ガチャ', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // デバッグ情報（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      this.add.text(10, height - 30, 'Phase 3: UI/画面システム', {
        fontSize: '12px',
        color: '#CCCCCC'
      });
    }

    // デバッグライン追加
    this.addDebugLines(width, height);
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
    
    console.log('🔧 [MAIN SCENE] Debug shortcut setup:');
    console.log('  - Press "D" to toggle debug lines');
    console.log('  - Press "Shift+D" to log detailed debug info');
  }

  private toggleDebugLines() {
    this.debugVisible = !this.debugVisible;
    
    // 全てのデバッグ要素の表示/非表示を切り替え
    this.debugElements.forEach(element => {
      element.setVisible(this.debugVisible);
    });
    
    console.log(`🔧 [MAIN SCENE] Debug lines ${this.debugVisible ? 'SHOWN' : 'HIDDEN'} (Press D to toggle)`);
  }

  private addDebugLines(width: number, height: number) {
    console.log('🔧 [MAIN SCENE] Adding debug rectangles for area visualization...');
    
    // 実際のボタン位置を計算
    const playButtonY = 250;
    const menuButtonY = 350;
    
    // ヘッダーエリア（Y=0-120）- 赤色
    const headerRect = this.add.rectangle(width / 2, 60, width - 4, 116, 0x000000, 0)
      .setStrokeStyle(3, 0xFF0000);
    const headerText = this.add.text(10, 5, 'ヘッダーエリア Y=0-120', {
      fontSize: '12px',
      color: '#FF0000',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(headerRect, headerText);
    
    // ステージ情報エリア（Y=120-220）- 緑色
    const stageRect = this.add.rectangle(width / 2, 170, width - 4, 96, 0x000000, 0)
      .setStrokeStyle(3, 0x00FF00);
    const stageText = this.add.text(10, 125, 'ステージ情報エリア Y=120-220', {
      fontSize: '12px',
      color: '#00FF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(stageRect, stageText);
    
    // プレイボタンエリア（Y=220-280）- 青色（実際のプレイボタン位置Y=250を含む）
    const playRect = this.add.rectangle(width / 2, 250, width - 4, 56, 0x000000, 0)
      .setStrokeStyle(3, 0x0000FF);
    const playText = this.add.text(10, 225, `プレイボタンエリア Y=220-280 (実際: ${playButtonY})`, {
      fontSize: '12px',
      color: '#0000FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(playRect, playText);
    
    // メニューボタンエリア（Y=320-380）- 黄色（実際のメニューボタン位置Y=350を含む）
    const menuRect = this.add.rectangle(width / 2, 350, width - 4, 56, 0x000000, 0)
      .setStrokeStyle(3, 0xFFFF00);
    const menuText = this.add.text(10, 325, `メニューボタンエリア Y=320-380 (実際: ${menuButtonY})`, {
      fontSize: '12px',
      color: '#FFFF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(menuRect, menuText);
    
    // 空白フッターエリアは削除（実際のコンテンツがないため）
    
    console.log('🔧 [MAIN SCENE] Debug elements count:', this.debugElements.length);
  }

  private logDetailedDebugInfo() {
    const { width, height } = this.cameras.main;
    console.log('🔍 === DETAILED DEBUG INFO [MAIN SCENE] ===');
    console.log('📍 Current Screen:', {
      sceneName: 'MainScene',
      displayName: 'メイン画面',
      purpose: 'ステージ選択・メニュー画面',
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
    console.log('🎮 Game State:', {
      currentStage: this.currentStage,
      gold: this.gold
    });
    console.log('📦 Mock Items:', {
      totalItems: mockItems.length,
      itemsByRarity: mockItems.reduce((acc, item) => {
        acc[item.rarity] = (acc[item.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
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
