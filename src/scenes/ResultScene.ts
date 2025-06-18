import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';
import { StageManager } from '../managers/StageManager';

/**
 * リザルト画面
 */
export class ResultScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private gameStateManager: GameStateManager;
  private stageManager: StageManager;
  private clearedStage: number = 1;
  private finalScore: number = 0;
  private earnedGold: number = 0;
  private isGameComplete: boolean = false;
  private isStageCleared: boolean = true; // ステージクリア成功かどうか

  constructor() {
    super({ key: 'ResultScene' });
    this.gameStateManager = GameStateManager.getInstance();
    this.stageManager = new StageManager();
  }

  init(data: any): void {
    this.clearedStage = data.stage || 1;
    this.finalScore = data.score || 0;
    this.earnedGold = data.earnedGold || 0;
    this.isGameComplete = data.isGameComplete || false;
    this.isStageCleared = data.isStageCleared !== false; // デフォルトはtrue（クリア成功）
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
      this.add.text(width / 2, currentY, `目標: ${GameConfig.TARGET_SCORE} ✓`, {
        fontSize: '18px',
        color: '#00FF00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, currentY, `目標: ${GameConfig.TARGET_SCORE} ✗`, {
        fontSize: '18px',
        color: '#FF0000',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
    currentY += lineHeight * 1.5;

    // 獲得ゴールド表示（クリア時のみ）
    if (this.isStageCleared) {
      this.add.text(width / 2, currentY, `獲得ゴールド: ${this.earnedGold}`, {
        fontSize: '18px',
        color: '#FFD700',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      currentY += lineHeight * 2;
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
    const buttonWidth = 120;
    const buttonHeight = 40;

    if (this.isGameComplete) {
      // ゲーム完了時はタイトルへ戻るボタンのみ
      const titleButton = this.add.rectangle(width / 2, buttonY, buttonWidth * 1.5, buttonHeight, 0x4CAF50)
        .setInteractive()
        .setName('titleButton');

      this.add.text(width / 2, buttonY, 'タイトルへ戻る', {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Arial'
      }).setOrigin(0.5).setName('titleText');

      titleButton.on('pointerdown', () => {
        // ゲームクリア画面に遷移
        this.scene.start('GameClearScene', {
          totalScore: this.gameStateManager.getGold(), // 総獲得ゴールドを総スコアとして使用
          totalGold: this.gameStateManager.getGold()
        });
      });

      // ホバーエフェクト
      titleButton.on('pointerover', () => {
        this.tweens.add({
          targets: [titleButton, this.children.getByName('titleText')],
          scale: 1.05,
          duration: GameConfig.ANIMATION.HOVER_DURATION,
          ease: 'Power2'
        });
      });

      titleButton.on('pointerout', () => {
        this.tweens.add({
          targets: [titleButton, this.children.getByName('titleText')],
          scale: 1,
          duration: GameConfig.ANIMATION.HOVER_DURATION,
          ease: 'Power2'
        });
      });
    } else {
      // 通常のステージクリア時またはステージ失敗時
      const buttonSpacing = 140;
      const leftButtonX = width / 2 - buttonSpacing / 2;
      const rightButtonX = width / 2 + buttonSpacing / 2;

      if (this.isStageCleared) {
        // ステージクリア成功時：次へボタン
        const nextButton = this.add.rectangle(leftButtonX, buttonY, buttonWidth, buttonHeight, 0x2196F3)
          .setInteractive()
          .setName('nextButton');

        this.add.text(leftButtonX, buttonY, '次へ', {
          fontSize: '16px',
          color: '#FFFFFF',
          fontFamily: 'Arial'
        }).setOrigin(0.5).setName('nextText');

        nextButton.on('pointerdown', () => {
          // 次のステージに進む（アイテム選択画面を経由）
          this.goToNextStage();
        });

        // ホバーエフェクト
        nextButton.on('pointerover', () => {
          this.tweens.add({
            targets: [nextButton, this.children.getByName('nextText')],
            scale: 1.05,
            duration: GameConfig.ANIMATION.HOVER_DURATION,
            ease: 'Power2'
          });
        });

        nextButton.on('pointerout', () => {
          this.tweens.add({
            targets: [nextButton, this.children.getByName('nextText')],
            scale: 1,
            duration: GameConfig.ANIMATION.HOVER_DURATION,
            ease: 'Power2'
          });
        });
      } else {
        // ステージ失敗時：リトライボタン
        const retryButton = this.add.rectangle(leftButtonX, buttonY, buttonWidth, buttonHeight, 0xFF9800)
          .setInteractive()
          .setName('retryButton');

        this.add.text(leftButtonX, buttonY, 'リトライ', {
          fontSize: '16px',
          color: '#FFFFFF',
          fontFamily: 'Arial'
        }).setOrigin(0.5).setName('retryText');

        retryButton.on('pointerdown', () => {
          // 同じステージをリトライ（アイテム選択画面を経由）
          this.scene.start('ItemSelectionScene', { 
            stage: this.clearedStage 
          });
        });

        // ホバーエフェクト
        retryButton.on('pointerover', () => {
          this.tweens.add({
            targets: [retryButton, this.children.getByName('retryText')],
            scale: 1.05,
            duration: GameConfig.ANIMATION.HOVER_DURATION,
            ease: 'Power2'
          });
        });

        retryButton.on('pointerout', () => {
          this.tweens.add({
            targets: [retryButton, this.children.getByName('retryText')],
            scale: 1,
            duration: GameConfig.ANIMATION.HOVER_DURATION,
            ease: 'Power2'
          });
        });
      }

      // メイン画面ボタン（共通）
      const mainButton = this.add.rectangle(rightButtonX, buttonY, buttonWidth, buttonHeight, 0x9E9E9E)
        .setInteractive()
        .setName('mainButton');

      this.add.text(rightButtonX, buttonY, 'メイン画面', {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Arial'
      }).setOrigin(0.5).setName('mainText');

      mainButton.on('pointerdown', () => {
        this.scene.start('MainScene');
      });

      // ホバーエフェクト
      mainButton.on('pointerover', () => {
        this.tweens.add({
          targets: [mainButton, this.children.getByName('mainText')],
          scale: 1.05,
          duration: GameConfig.ANIMATION.HOVER_DURATION,
          ease: 'Power2'
        });
      });

      mainButton.on('pointerout', () => {
        this.tweens.add({
          targets: [mainButton, this.children.getByName('mainText')],
          scale: 1,
          duration: GameConfig.ANIMATION.HOVER_DURATION,
          ease: 'Power2'
        });
      });
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
    // StageManagerで次のステージに進む
    const success = this.stageManager.advanceToNextStage();
    
    if (success) {
      // アイテム選択画面に遷移（次のステージ番号を渡す）
      this.scene.start('ItemSelectionScene', { 
        stage: this.stageManager.getCurrentStage() 
      });
    } else {
      // 最終ステージの場合はゲームクリア画面に遷移
      this.scene.start('GameCompleteScene', {
        totalScore: this.stageManager.getTotalScore(),
        totalGold: this.stageManager.getTotalGold()
      });
    }
  }
}
