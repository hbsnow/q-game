import { Scene } from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

export class ResultScene extends Scene {
  private gameStateManager!: GameStateManager;
  private isAllClear: boolean = false;
  
  // デバッグライン管理
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private debugVisible = true; // 初期表示ON

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: any) {
    // GameStateManagerを受け取る
    this.gameStateManager = data.gameStateManager || GameStateManager.getInstance();
    this.isAllClear = data.isAllClear || false;
    
    console.log('ResultScene initialized with GameStateManager:', this.gameStateManager);
    console.log('Is all clear:', this.isAllClear);
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // GameStateManagerからデータを取得
    const gameState = this.gameStateManager.getGameState();
    const currentStage = this.gameStateManager.getCurrentStage();
    const currentScore = this.gameStateManager.getScore();
    const targetScore = this.gameStateManager.getTargetScore();
    const currentGold = this.gameStateManager.getGold();
    const isTargetAchieved = this.gameStateManager.isTargetScoreAchieved();
    
    // 最終ステージかどうかをチェック
    const isFinalStage = this.gameStateManager.isFinalStage();
    
    // 🏷️ 画面名をコンソールに表示
    console.log('🎬 === RESULT SCENE ===');
    console.log('📍 Current Scene: リザルト画面');
    console.log('🎯 Purpose: ステージ結果表示画面');
    console.log('🎮 Stage:', currentStage);
    console.log('📊 Score:', currentScore, '/', targetScore);
    console.log('🏆 All Clear:', this.isAllClear);
    console.log('💰 Gold Total:', currentGold);
    console.log('🏁 Final Stage:', isFinalStage);
    
    // デバッグショートカットキーを設定
    this.setupDebugShortcut();
    
    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x001122, 0.9);
    
    // ヘッダー
    this.add.rectangle(width / 2, 40, width, 80, 0x2E8B57, 0.8);
    
    // ステージクリア表示
    this.add.text(width / 2, 40, `ステージ ${currentStage} ${isTargetAchieved ? 'クリア！' : '未クリア'}`, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // スコア表示
    this.add.text(width / 2 - 80, 120, 'スコア:', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);
    
    this.add.text(width / 2 + 80, 120, `${currentScore}`, {
      fontSize: '18px',
      color: isTargetAchieved ? '#7FFF7F' : '#FFFFFF',
      fontStyle: isTargetAchieved ? 'bold' : 'normal'
    }).setOrigin(1, 0.5);
    
    // 目標スコア表示
    this.add.text(width / 2 - 80, 150, '目標:', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);
    
    const targetScoreText = this.add.text(width / 2 + 60, 150, `${targetScore}`, {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(1, 0.5);
    
    // 達成チェックマーク
    if (isTargetAchieved) {
      this.add.text(width / 2 + 80, 150, '✓', {
        fontSize: '18px',
        color: '#7FFF7F',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);
    }
    
    // 獲得ゴールド表示（クリア時のみ）
    if (isTargetAchieved) {
      this.add.text(width / 2 - 80, 200, '獲得ゴールド:', {
        fontSize: '18px',
        color: '#FFFFFF'
      }).setOrigin(0, 0.5);
      
      this.add.text(width / 2 + 80, 200, `${currentScore}`, {
        fontSize: '18px',
        color: '#FFD700',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);
    }
    
    // 使用アイテム表示
    this.add.text(width / 2, 250, '使用アイテム:', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5, 0.5);
    
    // 使用アイテムリスト（仮）
    const usedItems = gameState.usedItems;
    if (usedItems.length > 0) {
      usedItems.forEach((itemId, index) => {
        const item = gameState.items.find(i => i.id === itemId);
        if (item) {
          this.add.text(width / 2, 280 + index * 30, `• ${item.name} ×1`, {
            fontSize: '16px',
            color: '#CCCCCC'
          }).setOrigin(0.5, 0.5);
        }
      });
    } else {
      this.add.text(width / 2, 280, '• なし', {
        fontSize: '16px',
        color: '#CCCCCC'
      }).setOrigin(0.5, 0.5);
    }
    
    // ボタン配置
    const buttonY = height - 100;
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonSpacing = 20;
    
    // 最終ステージクリア時はゲームクリア画面へ
    if (isTargetAchieved && isFinalStage) {
      // ゲームクリアボタン
      const gameCompleteButton = this.add.rectangle(width / 2, buttonY, buttonWidth, buttonHeight, 0x4CAF50, 0.9);
      gameCompleteButton.setInteractive();
      gameCompleteButton.on('pointerdown', () => {
        this.scene.start('GameCompleteScene', {
          gameStateManager: this.gameStateManager
        });
      });
      
      this.add.text(width / 2, buttonY, 'ゲームクリア', {
        fontSize: '16px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      return; // 他のボタンは表示しない
    }
    
    // 次へボタン（クリア時のみ）
    if (isTargetAchieved) {
      const nextButton = this.add.rectangle(width / 2 - buttonWidth / 2 - buttonSpacing / 2, buttonY, buttonWidth, buttonHeight, 0x4CAF50, 0.9);
      nextButton.setInteractive();
      nextButton.on('pointerdown', () => {
        // ステージクリア処理
        this.gameStateManager.onStageClear();
        
        // 次のステージへ進む
        this.gameStateManager.nextStage();
        
        // アイテム選択画面へ
        this.scene.start('ItemSelectScene', {
          gameStateManager: this.gameStateManager
        });
      });
      
      this.add.text(width / 2 - buttonWidth / 2 - buttonSpacing / 2, buttonY, '次へ', {
        fontSize: '16px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      // リトライボタン（未クリア時）
      const retryButton = this.add.rectangle(width / 2 - buttonWidth / 2 - buttonSpacing / 2, buttonY, buttonWidth, buttonHeight, 0xFF9800, 0.9);
      retryButton.setInteractive();
      retryButton.on('pointerdown', () => {
        // 現在のステージをリトライ
        this.gameStateManager.retryStage();
        
        // アイテム選択画面へ
        this.scene.start('ItemSelectScene', {
          gameStateManager: this.gameStateManager
        });
      });
      
      this.add.text(width / 2 - buttonWidth / 2 - buttonSpacing / 2, buttonY, 'リトライ', {
        fontSize: '16px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }
    
    // メイン画面ボタン
    const mainButton = this.add.rectangle(width / 2 + buttonWidth / 2 + buttonSpacing / 2, buttonY, buttonWidth, buttonHeight, 0x2196F3, 0.9);
    mainButton.setInteractive();
    mainButton.on('pointerdown', () => {
      // クリア時のみゴールドを獲得
      if (isTargetAchieved) {
        this.gameStateManager.onStageClear();
      }
      
      // メイン画面へ
      this.scene.start('MainScene', {
        gameStateManager: this.gameStateManager
      });
    });
    
    this.add.text(width / 2 + buttonWidth / 2 + buttonSpacing / 2, buttonY, 'メイン画面', {
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
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
    
    console.log('🔧 [RESULT SCENE] Debug shortcut setup:');
    console.log('  - Press "D" to toggle debug lines');
    console.log('  - Press "Shift+D" to log detailed debug info');
  }

  private toggleDebugLines() {
    this.debugVisible = !this.debugVisible;
    
    // 全てのデバッグ要素の表示/非表示を切り替え
    this.debugElements.forEach(element => {
      element.setVisible(this.debugVisible);
    });
    
    console.log(`🔧 [RESULT SCENE] Debug lines ${this.debugVisible ? 'SHOWN' : 'HIDDEN'} (Press D to toggle)`);
  }

  private addDebugLines(width: number, height: number) {
    console.log('🔧 [RESULT SCENE] Adding debug rectangles for area visualization...');
    
    // ヘッダーエリア（Y=0-80）- 赤色
    const headerRect = this.add.rectangle(width / 2, 40, width - 4, 76, 0x000000, 0)
      .setStrokeStyle(3, 0xFF0000);
    const headerText = this.add.text(10, 5, 'ヘッダーエリア Y=0-80', {
      fontSize: '12px',
      color: '#FF0000',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(headerRect, headerText);
    
    // スコア表示エリア（Y=80-230）- 緑色
    const scoreRect = this.add.rectangle(width / 2, 155, width - 4, 150, 0x000000, 0)
      .setStrokeStyle(3, 0x00FF00);
    const scoreText = this.add.text(10, 85, 'スコア表示エリア Y=80-230', {
      fontSize: '12px',
      color: '#00FF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(scoreRect, scoreText);
    
    // アイテム表示エリア（Y=230-350）- 青色
    const itemRect = this.add.rectangle(width / 2, 290, width - 4, 120, 0x000000, 0)
      .setStrokeStyle(3, 0x0000FF);
    const itemText = this.add.text(10, 235, 'アイテム表示エリア Y=230-350', {
      fontSize: '12px',
      color: '#0000FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(itemRect, itemText);
    
    // ボタンエリア（Y=610-660）- 紫色
    const buttonRect = this.add.rectangle(width / 2, height - 100, width - 4, 50, 0x000000, 0)
      .setStrokeStyle(3, 0xFF00FF);
    const buttonText = this.add.text(10, height - 125, 'ボタンエリア Y=610-660', {
      fontSize: '12px',
      color: '#FF00FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(buttonRect, buttonText);
    
    console.log('🔧 [RESULT SCENE] Debug elements count:', this.debugElements.length);
  }

  private logDetailedDebugInfo() {
    const { width, height } = this.cameras.main;
    console.log('🔍 === DETAILED DEBUG INFO [RESULT SCENE] ===');
    console.log('📍 Current Screen:', {
      sceneName: 'ResultScene',
      displayName: 'リザルト画面',
      purpose: 'ステージ結果表示画面',
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
      currentStage: this.gameStateManager.getCurrentStage(),
      score: this.gameStateManager.getScore(),
      targetScore: this.gameStateManager.getTargetScore(),
      isTargetAchieved: this.gameStateManager.isTargetScoreAchieved(),
      gold: this.gameStateManager.getGold(),
      isAllClear: this.isAllClear,
      isFinalStage: this.gameStateManager.isFinalStage()
    });
    console.log('🎨 Debug Elements:', {
      count: this.debugElements.length,
      visible: this.debugVisible,
      types: this.debugElements.map(el => el.type)
    });
    console.log('=== END DEBUG INFO ===');
  }
}
