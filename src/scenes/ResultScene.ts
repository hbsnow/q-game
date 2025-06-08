import { Scene } from 'phaser';

interface ResultData {
  stage: number;
  score: number;
  targetScore: number;
  isAllClear: boolean;
  gold: number;
}

export class ResultScene extends Scene {
  private resultData!: ResultData;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultData) {
    this.resultData = data;
  }

  create() {
    const { width, height } = this.scale;
    
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
      this.scene.start('MainScene');
    });
    
    this.add.text(width / 2 + 80, buttonY, 'メイン画面', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
  
  private goToNextStage() {
    // 次のステージのアイテム選択画面へ
    // Phase 4でアイテム選択画面実装後に正しい遷移に変更
    this.scene.start('GameScene', {
      stage: this.resultData.stage + 1,
      equippedItems: [] // 暫定：空のアイテム配列
    });
  }
  
  private retryStage() {
    // 同じステージのアイテム選択画面へ
    // Phase 4でアイテム選択画面実装後に正しい遷移に変更
    this.scene.start('GameScene', {
      stage: this.resultData.stage,
      equippedItems: [] // 暫定：空のアイテム配列
    });
  }
}
