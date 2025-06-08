import { Scene } from 'phaser';
import { mockItems } from '../data/mockItems';

export class MainScene extends Scene {
  private currentStage: number = 1;
  private gold: number = 1250; // モックデータ
  
  // デバッグライン管理
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private debugVisible = true; // 初期表示ON

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: any) {
    // 他の画面から戻ってきた時のデータを受け取る
    if (data.currentStage) {
      this.currentStage = data.currentStage;
    }
    if (data.gold !== undefined) {
      this.gold = data.gold;
    }
  }

  create() {
    const { width, height } = this.scale;

    // 🏷️ 画面名をコンソールに表示
    console.log('🎬 === MAIN SCENE ===');
    console.log('📍 Current Scene: メイン画面');
    console.log('🎯 Purpose: ステージ選択・メニュー画面');
    console.log('📊 Current Stage:', this.currentStage);
    console.log('💰 Current Gold:', this.gold);

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

    // ゴールド表示
    this.add.text(width - 20, 20, `ゴールド: ${this.gold}`, {
      fontSize: '16px',
      color: '#F4D03F',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // ステージ情報
    this.add.text(width / 2, 180, `ステージ ${this.currentStage}`, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // プレイボタン
    const playButton = this.add.rectangle(width / 2, 250, 200, 60, 0x7DB9E8, 0.9);
    playButton.setInteractive();
    playButton.on('pointerdown', () => {
      // アイテム選択画面へ遷移
      this.scene.start('ItemSelectScene', {
        items: mockItems,
        currentStage: this.currentStage,
        gold: this.gold,
        equipSlots: [
          { type: 'special', item: null, used: false },
          { type: 'normal', item: null, used: false }
        ]
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

    // アイテムボタン（Phase 4で実装予定）
    const itemButton = this.add.rectangle(width / 2 - 70, buttonY, buttonWidth, buttonHeight, 0x2E8B57, 0.8);
    itemButton.setInteractive();
    itemButton.on('pointerdown', () => {
      console.log('アイテム画面（未実装）');
    });

    this.add.text(width / 2 - 70, buttonY, 'アイテム', {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // ガチャボタン（Phase 5で実装予定）
    const gachaButton = this.add.rectangle(width / 2 + 70, buttonY, buttonWidth, buttonHeight, 0xFF6347, 0.8);
    gachaButton.setInteractive();
    gachaButton.on('pointerdown', () => {
      console.log('ガチャ画面（未実装）');
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
    
    // ステージ情報エリア（Y=120-350）- 緑色
    const stageRect = this.add.rectangle(width / 2, 235, width - 4, 226, 0x000000, 0)
      .setStrokeStyle(3, 0x00FF00);
    const stageText = this.add.text(10, 125, 'ステージ情報エリア Y=120-350', {
      fontSize: '12px',
      color: '#00FF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(stageRect, stageText);
    
    // プレイボタンエリア（Y=350-450）- 青色
    const playRect = this.add.rectangle(width / 2, 400, width - 4, 96, 0x000000, 0)
      .setStrokeStyle(3, 0x0000FF);
    const playText = this.add.text(10, 355, 'プレイボタンエリア Y=350-450', {
      fontSize: '12px',
      color: '#0000FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(playRect, playText);
    
    // メニューボタンエリア（Y=450-550）- 黄色
    const menuRect = this.add.rectangle(width / 2, 500, width - 4, 96, 0x000000, 0)
      .setStrokeStyle(3, 0xFFFF00);
    const menuText = this.add.text(10, 455, 'メニューボタンエリア Y=450-550', {
      fontSize: '12px',
      color: '#FFFF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(menuRect, menuText);
    
    // フッターエリア（Y=550-710）- 紫色
    const footerRect = this.add.rectangle(width / 2, 630, width - 4, 156, 0x000000, 0)
      .setStrokeStyle(3, 0xFF00FF);
    const footerText = this.add.text(10, 555, 'フッターエリア Y=550-710', {
      fontSize: '12px',
      color: '#FF00FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(footerRect, footerText);
    
    console.log('🔧 [MAIN SCENE] Debug elements count:', this.debugElements.length);
  }

  private logDetailedDebugInfo() {
    const { width, height } = this.scale;
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
