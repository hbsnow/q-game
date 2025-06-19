import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { StageManager } from '../managers/StageManager';
import { ButtonFactory } from '../utils/ButtonStyles';

/**
 * リザルト画面
 */
export class ResultScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private stageManager: StageManager;
  private clearedStage: number = 1;
  private finalScore: number = 0;
  private earnedGold: number = 0;
  private isGameComplete: boolean = false;
  private isStageCleared: boolean = true; // ステージクリア成功かどうか
  private targetScore: number = 500; // ステージの目標スコア

  constructor() {
    super({ key: 'ResultScene' });
    this.stageManager = StageManager.getInstance();
  }

  init(data: any): void {
    this.clearedStage = data.stage || 1;
    this.finalScore = data.score || 0;
    this.earnedGold = data.earnedGold || 0;
    this.isGameComplete = data.isGameComplete || false;
    this.isStageCleared = data.isStageCleared !== false; // デフォルトはtrue（クリア成功）
    
    // StageManagerからステージ設定を取得
    const stageConfig = this.stageManager.getStageConfig(this.clearedStage);
    this.targetScore = stageConfig?.targetScore || 500;
    
    // ステージクリア処理を実行（クリア成功時のみ）
    if (this.isStageCleared) {
      this.processStageCompletion();
    }
  }

  /**
   * ステージクリア処理
   */
  private processStageCompletion(): void {
    // StageManagerでステージクリア処理
    const success = this.stageManager.clearStage(this.clearedStage, this.finalScore);
    
    if (success) {
      console.log(`ステージ ${this.clearedStage} クリア処理完了`);
      console.log(`獲得スコア: ${this.finalScore}`);
      console.log(`獲得ゴールド: ${this.finalScore}`);
      console.log(`総ゴールド: ${this.stageManager.getCurrentGold()}`);
    }
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
    const titleText = this.isGameComplete 
      ? 'ゲームクリア！' 
      : this.isStageCleared 
        ? `ステージ ${this.clearedStage} クリア！`
        : `ステージ ${this.clearedStage} 失敗...`;
    
    this.add.text(width / 2, titleY, titleText, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // メインコンテンツエリア
    const contentStartY = 120;
    const lineHeight = 40;
    let currentY = contentStartY;

    // スコア表示
    this.add.text(width / 2, currentY, `スコア: ${this.finalScore}`, {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    currentY += lineHeight;

    // 目標スコア表示
    if (this.isStageCleared) {
      this.add.text(width / 2, currentY, `目標: ${this.targetScore} ✓`, {
        fontSize: '18px',
        color: '#00FF00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, currentY, `目標: ${this.targetScore} ✗`, {
        fontSize: '18px',
        color: '#FF0000',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
    currentY += lineHeight * 1.5;

    // 獲得ゴールド表示（クリア時のみ）
    if (this.isStageCleared) {
      this.add.text(width / 2, currentY, `獲得ゴールド: ${this.finalScore}`, {
        fontSize: '18px',
        color: '#FFD700',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      currentY += lineHeight;
      
      // 現在の総ゴールド表示
      this.add.text(width / 2, currentY, `総ゴールド: ${this.stageManager.getCurrentGold().toLocaleString()}`, {
        fontSize: '16px',
        color: '#CCCCCC',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      currentY += lineHeight;
    } else {
      this.add.text(width / 2, currentY, '獲得ゴールド: 0', {
        fontSize: '18px',
        color: '#888888',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      currentY += lineHeight * 2;
    }

    // ボタンエリア
    this.createButtons();
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height - 60;

    if (this.isGameComplete) {
      // ゲーム完了時はタイトルへ戻るボタンのみ（プライマリ・Lサイズ）
      const { button: titleButton } = ButtonFactory.createPrimaryButton(
        this,
        width / 2,
        buttonY,
        'タイトルへ戻る',
        'L',
        () => {
          // ゲームクリア画面に遷移
          this.scene.start('GameClearScene', {
            totalScore: this.stageManager.getTotalScore(),
            totalGold: this.stageManager.getTotalGold()
          });
        }
      );
    } else {
      // 通常のステージクリア時またはステージ失敗時
      const buttonSpacing = 160; // 統一デザインに合わせて間隔を調整
      const leftButtonX = width / 2 - buttonSpacing / 2;
      const rightButtonX = width / 2 + buttonSpacing / 2;

      if (this.isStageCleared) {
        // ステージクリア成功時：次へボタン（プライマリ・Mサイズ）
        const { button: nextButton } = ButtonFactory.createPrimaryButton(
          this,
          leftButtonX,
          buttonY,
          '次へ',
          'M',
          () => this.goToNextStage()
        );
      } else {
        // ステージ失敗時：リトライボタン（セカンダリ・Mサイズ）
        const { button: retryButton } = ButtonFactory.createSecondaryButton(
          this,
          leftButtonX,
          buttonY,
          'リトライ',
          'M',
          () => {
            // 同じステージをリトライ（アイテム選択画面を経由）
            this.scene.start('ItemSelectionScene', { 
              stage: this.clearedStage 
            });
          }
        );
      }

      // メイン画面ボタン（ニュートラル・Mサイズ）
      const { button: mainButton } = ButtonFactory.createNeutralButton(
        this,
        rightButtonX,
        buttonY,
        'メイン画面',
        'M',
        () => this.scene.start('MainScene')
      );
    }
  }

  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleHeight = 80;
    const titleCenterY = 40;
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // メインコンテンツエリア
    const contentHeight = 280;
    const contentCenterY = 260;
    this.debugHelper.addAreaBorder(width / 2, contentCenterY, width, contentHeight, 0x0000FF, 'メインコンテンツエリア');
    
    // ボタンエリア
    const buttonHeight = 80;
    const buttonCenterY = height - 40;
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, width, buttonHeight, 0xFF00FF, 'ボタンエリア');
  }

  /**
   * 次のステージに進む処理
   */
  private goToNextStage(): void {
    // 現在のステージが最終ステージかチェック
    if (this.stageManager.isCurrentStageFinal()) {
      // 最終ステージの場合はゲームクリア画面に遷移
      this.scene.start('GameClearScene', {
        totalScore: this.stageManager.getTotalScore(),
        totalGold: this.stageManager.getTotalGold()
      });
    } else {
      // StageManagerで次のステージに進む
      const success = this.stageManager.advanceToNextStage();
      
      if (success) {
        // アイテム選択画面に遷移（次のステージ番号を渡す）
        this.scene.start('ItemSelectionScene', { 
          stage: this.stageManager.getCurrentStage() 
        });
      } else {
        // 念のため：進行に失敗した場合もゲームクリア画面に遷移
        this.scene.start('GameClearScene', {
          totalScore: this.stageManager.getTotalScore(),
          totalGold: this.stageManager.getTotalGold()
        });
      }
    }
  }
}
