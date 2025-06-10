import { Scene } from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';
import { DebugHelper } from '../utils/DebugHelper';

export class MainScene extends Scene {
  private gameStateManager!: GameStateManager;
  private debugHelper!: DebugHelper;
  
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

    // デバッグヘルパーを初期化（GameStateManagerを渡す）
    this.debugHelper = new DebugHelper(this);
    
    // 明示的にGameStateManagerを設定
    if ((this.debugHelper as any).gameStateManager === undefined) {
      (this.debugHelper as any).gameStateManager = this.gameStateManager;
      console.log('Explicitly set GameStateManager to DebugHelper');
    }

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
      
      // デバッグモード表示
      this.add.text(10, height - 50, 'デバッグモード: ON', {
        fontSize: '12px',
        color: '#FFFF00',
        backgroundColor: '#000000'
      });
      
      // デバッグ操作説明
      this.add.text(10, height - 70, 'D: デバッグライン表示/非表示', {
        fontSize: '10px',
        color: '#FFFF00',
        backgroundColor: '#000000'
      });
      
      this.add.text(10, height - 90, '🔧: ステージ移動パネル', {
        fontSize: '10px',
        color: '#FFFF00',
        backgroundColor: '#000000'
      });
    }

    // デバッグライン追加
    this.addDebugLines(width, height);
  }

  private addDebugLines(width: number, height: number) {
    console.log('🔧 [MAIN SCENE] Adding debug rectangles for area visualization...');
    
    // 実際のボタン位置を計算
    const playButtonY = 250;
    const menuButtonY = 350;
    
    // ヘッダーエリア（Y=0-120）- 赤色
    this.debugHelper.addAreaBorder(width / 2, 60, width - 4, 116, 0xFF0000, 'ヘッダーエリア Y=0-120');
    
    // ステージ情報エリア（Y=120-220）- 緑色
    this.debugHelper.addAreaBorder(width / 2, 170, width - 4, 96, 0x00FF00, 'ステージ情報エリア Y=120-220');
    
    // プレイボタンエリア（Y=220-280）- 青色（実際のプレイボタン位置Y=250を含む）
    this.debugHelper.addAreaBorder(width / 2, 250, width - 4, 56, 0x0000FF, `プレイボタンエリア Y=220-280 (実際: ${playButtonY})`);
    
    // メニューボタンエリア（Y=320-380）- 黄色（実際のメニューボタン位置Y=350を含む）
    this.debugHelper.addAreaBorder(width / 2, 350, width - 4, 56, 0xFFFF00, `メニューボタンエリア Y=320-380 (実際: ${menuButtonY})`);
  }
}
