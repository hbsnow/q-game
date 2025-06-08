import { Scene } from 'phaser';
import { mockItems } from '../data/mockItems';

interface ResultData {
  stage: number;
  score: number;
  targetScore: number;
  isAllClear: boolean;
  gold: number;
}

export class ResultScene extends Scene {
  private resultData!: ResultData;
  
  // デバッグライン管理
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private debugVisible = true; // 初期表示ON

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultData) {
    this.resultData = data;
  }

  create() {
    const { width, height } = this.scale;
    
    // 🏷️ 画面名をコンソールに表示
    console.log('🎬 === RESULT SCENE ===');
    console.log('📍 Current Scene: リザルト画面');
    console.log('🎯 Purpose: ステージ結果表示画面');
    console.log('🎮 Stage:', this.resultData.stage);
    console.log('📊 Score:', this.resultData.score, '/', this.resultData.targetScore);
    console.log('🏆 All Clear:', this.resultData.isAllClear);
    console.log('💰 Gold Earned:', this.resultData.gold);
    
    // デバッグショートカットキーを設定
    this.setupDebugShortcut();
    
    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x001122, 0.9);
    
    // タイトル
    const titleText = this.resultData.score >= this.resultData.targetScore 
      ? `ステージ ${this.resultData.stage} クリア！`
      : `ステージ ${this.resultData.stage} 失敗`;
    
    const titleColor = this.resultData.score >= this.resultData.targetScore ? '#00FF00' : '#FF6347';
    
    this.add.text(width / 2, 100, titleText, {
      fontSize: '24px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // スコア詳細
    const scoreY = 180;
    this.add.text(width / 2, scoreY, `スコア: ${this.resultData.score}`, {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    const targetColor = this.resultData.score >= this.resultData.targetScore ? '#00FF00' : '#FF6347';
    const targetSymbol = this.resultData.score >= this.resultData.targetScore ? '✓' : '✗';
    
    this.add.text(width / 2, scoreY + 40, `目標: ${this.resultData.targetScore} ${targetSymbol}`, {
      fontSize: '18px',
      color: targetColor
    }).setOrigin(0.5);
    
    // 全消しボーナス表示
    if (this.resultData.isAllClear) {
      this.add.text(width / 2, scoreY + 80, '🏆 全消しボーナス達成！', {
        fontSize: '16px',
        color: '#FFD700',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }
    
    // 獲得ゴールド
    this.add.text(width / 2, scoreY + 120, `獲得ゴールド: ${this.resultData.gold}`, {
      fontSize: '18px',
      color: '#FFFF00'
    }).setOrigin(0.5);
    
    // ボタン配置
    this.createButtons();
  }
  
  private createButtons() {
    const { width } = this.scale;
    const buttonY = 450;
    
    if (this.resultData.score >= this.resultData.targetScore) {
      // クリア時：次のステージまたはメイン画面
      if (this.resultData.stage < 100) {
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
            totalScore: this.resultData.score, // 実際は累計スコアを渡すべき
            totalGold: this.resultData.gold   // 実際は累計ゴールドを渡すべき
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
        currentStage: this.resultData.stage,
        gold: this.resultData.gold
      });
    });
    
    this.add.text(width / 2 + 80, buttonY, 'メイン画面', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
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
  
  private goToNextStage() {
    // 次のステージのアイテム選択画面へ
    this.scene.start('ItemSelectScene', {
      items: mockItems,
      currentStage: this.resultData.stage + 1,
      gold: this.resultData.gold,
      equipSlots: [
        { type: 'special', item: null, used: false },
        { type: 'normal', item: null, used: false }
      ]
    });
  }

  private logDetailedDebugInfo() {
    const { width, height } = this.scale;
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
    console.log('🏆 Result Data:', {
      stage: this.resultData.stage,
      score: this.resultData.score,
      targetScore: this.resultData.targetScore,
      isAllClear: this.resultData.isAllClear,
      gold: this.resultData.gold,
      isSuccess: this.resultData.score >= this.resultData.targetScore
    });
    console.log('📊 Score Analysis:', {
      scorePercentage: ((this.resultData.score / this.resultData.targetScore) * 100).toFixed(1) + '%',
      bonusScore: this.resultData.isAllClear ? Math.floor(this.resultData.score * 0.5) : 0,
      goldEarned: this.resultData.gold
    });
    console.log('📦 Mock Items Info:', {
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
  
  private retryStage() {
    // 同じステージのアイテム選択画面へ
    this.scene.start('ItemSelectScene', {
      items: mockItems,
      currentStage: this.resultData.stage,
      gold: this.resultData.gold,
      equipSlots: [
        { type: 'special', item: null, used: false },
        { type: 'normal', item: null, used: false }
      ]
    });
  }
}
