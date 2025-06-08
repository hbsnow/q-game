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
    
    // 🏷️ 画面名をコンソールに表示
    console.log('🎬 === RESULT SCENE ===');
    console.log('📍 Current Scene: リザルト画面');
    console.log('🎯 Purpose: ステージ結果表示画面');
    console.log('🎮 Stage:', currentStage);
    console.log('📊 Score:', currentScore, '/', targetScore);
    console.log('🏆 All Clear:', this.isAllClear);
    console.log('💰 Gold Total:', currentGold);
    
    // デバッグショートカットキーを設定
    this.setupDebugShortcut();
    
    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x001122, 0.9);
    
    // タイトル
    const titleText = isTargetAchieved 
      ? `ステージ ${currentStage} クリア！`
      : `ステージ ${currentStage} 失敗`;
    
    const titleColor = isTargetAchieved ? '#00FF00' : '#FF6347';
    
    this.add.text(width / 2, 100, titleText, {
      fontSize: '24px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // スコア詳細
    const scoreY = 180;
    this.add.text(width / 2, scoreY, `スコア: ${currentScore}`, {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    const targetColor = isTargetAchieved ? '#00FF00' : '#FF6347';
    const targetSymbol = isTargetAchieved ? '✓' : '✗';
    
    this.add.text(width / 2, scoreY + 40, `目標: ${targetScore} ${targetSymbol}`, {
      fontSize: '18px',
      color: targetColor
    }).setOrigin(0.5);
    
    // 全消しボーナス表示
    if (this.isAllClear) {
      this.add.text(width / 2, scoreY + 80, '🏆 全消しボーナス達成！', {
        fontSize: '16px',
        color: '#FFD700',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }
    
    // 獲得ゴールド（今回のスコア分）
    this.add.text(width / 2, scoreY + 120, `獲得ゴールド: ${currentScore}`, {
      fontSize: '18px',
      color: '#FFFF00'
    }).setOrigin(0.5);
    
    // 総ゴールド
    this.add.text(width / 2, scoreY + 150, `総ゴールド: ${currentGold}`, {
      fontSize: '16px',
      color: '#FFFF00'
    }).setOrigin(0.5);
    
    // ボタン配置
    this.createButtons();
  }
  
  private createButtons() {
    const { width, height } = this.cameras.main;
    const buttonY = 450;
    const currentStage = this.gameStateManager.getCurrentStage();
    const isTargetAchieved = this.gameStateManager.isTargetScoreAchieved();
    
    if (isTargetAchieved) {
      // クリア時：次のステージまたはメイン画面
      if (currentStage < 100) {
        // 次のステージボタン
        const nextButton = this.add.rectangle(width / 2 - 80, buttonY, 120, 50, 0x4CAF50, 0.8);
        nextButton.setInteractive();
        nextButton.on('pointerdown', () => {
          this.goToNextStage();
        });
        
        this.add.text(width / 2 - 80, buttonY, '次へ', {
          fontSize: '16px',
          color: '#FFFFFF',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      } else {
        // 最終ステージクリア：ゲームクリア画面へ
        const gameCompleteButton = this.add.rectangle(width / 2 - 80, buttonY, 120, 50, 0xFFD700, 0.8);
        gameCompleteButton.setInteractive();
        gameCompleteButton.on('pointerdown', () => {
          this.scene.start('GameCompleteScene', {
            gameStateManager: this.gameStateManager
          });
        });
        
        this.add.text(width / 2 - 80, buttonY, 'エンディング', {
          fontSize: '14px',
          color: '#000000',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      }
    } else {
      // 失敗時：リトライボタン
      const retryButton = this.add.rectangle(width / 2 - 80, buttonY, 120, 50, 0xFF9800, 0.8);
      retryButton.setInteractive();
      retryButton.on('pointerdown', () => {
        this.retryStage();
      });
      
      this.add.text(width / 2 - 80, buttonY, 'リトライ', {
        fontSize: '16px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }
    
    // メイン画面ボタン
    const mainButton = this.add.rectangle(width / 2 + 80, buttonY, 120, 50, 0x2196F3, 0.8);
    mainButton.setInteractive();
    mainButton.on('pointerdown', () => {
      this.scene.start('MainScene', {
        gameStateManager: this.gameStateManager
      });
    });
    
    this.add.text(width / 2 + 80, buttonY, 'メイン画面', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // デバッグライン追加は create() メソッドで既に実行されているため削除
  }

  // 次のステージに進む
  private goToNextStage() {
    console.log('🎯 次のステージに進みます');
    
    // 次のステージに進む
    this.gameStateManager.nextStage();
    
    const nextStage = this.gameStateManager.getCurrentStage();
    console.log('📊 次のステージ:', nextStage);
    
    // アイテム選択画面に遷移
    this.scene.start('ItemSelectScene', {
      gameStateManager: this.gameStateManager
    });
  }

  // ステージをリトライする
  private retryStage() {
    console.log('🔄 ステージをリトライします');
    
    // リトライ処理
    this.gameStateManager.retryStage();
    
    const currentStage = this.gameStateManager.getCurrentStage();
    console.log('📊 リトライするステージ:', currentStage);
    
    // アイテム選択画面に遷移
    this.scene.start('ItemSelectScene', {
      gameStateManager: this.gameStateManager
    });
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
    
    // タイトルエリア（Y=0-150）- 赤色
    const titleRect = this.add.rectangle(width / 2, 75, width - 4, 146, 0x000000, 0)
      .setStrokeStyle(3, 0xFF0000);
    const titleText = this.add.text(10, 5, 'タイトルエリア Y=0-150', {
      fontSize: '12px',
      color: '#FF0000',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(titleRect, titleText);
    
    // スコア情報エリア（Y=150-400）- 緑色
    const scoreRect = this.add.rectangle(width / 2, 275, width - 4, 246, 0x000000, 0)
      .setStrokeStyle(3, 0x00FF00);
    const scoreText = this.add.text(10, 155, 'スコア情報エリア Y=150-400', {
      fontSize: '12px',
      color: '#00FF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(scoreRect, scoreText);
    
    // 報酬・詳細エリア（Y=400-550）- 青色
    const rewardRect = this.add.rectangle(width / 2, 475, width - 4, 146, 0x000000, 0)
      .setStrokeStyle(3, 0x0000FF);
    const rewardText = this.add.text(10, 405, '報酬・詳細エリア Y=400-550', {
      fontSize: '12px',
      color: '#0000FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(rewardRect, rewardText);
    
    // ボタンエリア（Y=550-710）- 紫色
    const buttonRect = this.add.rectangle(width / 2, 630, width - 4, 156, 0x000000, 0)
      .setStrokeStyle(3, 0xFF00FF);
    const buttonText = this.add.text(10, 555, 'ボタンエリア Y=550-710', {
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
    
    const gameState = this.gameStateManager.getGameState();
    const currentStage = this.gameStateManager.getCurrentStage();
    const currentScore = this.gameStateManager.getScore();
    const targetScore = this.gameStateManager.getTargetScore();
    const currentGold = this.gameStateManager.getGold();
    const isTargetAchieved = this.gameStateManager.isTargetScoreAchieved();
    
    console.log('🏆 Result Data:', {
      stage: currentStage,
      score: currentScore,
      targetScore: targetScore,
      isAllClear: this.isAllClear,
      gold: currentGold,
      isSuccess: isTargetAchieved
    });
    console.log('📊 Score Analysis:', {
      scorePercentage: ((currentScore / targetScore) * 100).toFixed(1) + '%',
      bonusScore: this.isAllClear ? Math.floor(currentScore * 0.5) : 0,
      goldEarned: currentScore
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
