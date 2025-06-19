import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { StageManager } from '../managers/StageManager';
import { SoundManager } from '../utils/SoundManager';
import { AnimationManager, TransitionType } from '../utils/AnimationManager';
import { TooltipManager } from '../utils/TooltipManager';
import { SimpleOceanButton } from '../components/SimpleOceanButton';

/**
 * メイン画面（ステージ選択画面）
 */
export class MainScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private stageManager: StageManager;
  private soundManager!: SoundManager;
  private animationManager!: AnimationManager;
  private tooltipManager!: TooltipManager;

  constructor() {
    super({ key: 'MainScene' });
    this.stageManager = StageManager.getInstance();
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // サウンドマネージャーを初期化
    this.soundManager = new SoundManager(this);
    this.soundManager.preloadSounds();
    
    // アニメーションマネージャーを初期化
    this.animationManager = new AnimationManager(this);
    
    // ツールチップマネージャーを初期化
    this.tooltipManager = new TooltipManager(this);
    
    // タイトルBGMを開始
    this.soundManager.playTitleBgm();
    
    // 背景演出を追加
    this.createBackgroundEffects();
    
    // テスト用：初期ゴールドを追加（開発・テスト用）
    if (GameConfig.DEBUG_MODE) {
      this.stageManager.addGold(5000);
    }
    
    // StageManagerから現在の状態を取得
    const currentStage = this.stageManager.getCurrentStage();
    const gold = this.stageManager.getCurrentGold();
    const stageConfig = this.stageManager.getCurrentStageConfig();
    
    // ヘッダー（ゴールド表示）
    const goldText = this.add.text(width - 10, 30, `ゴールド: ${gold.toLocaleString()}`, {
      fontSize: '18px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0.5);
    
    // ステージ情報
    const stageTitle = stageConfig?.name || `ステージ ${currentStage}`;
    const stageText = this.add.text(width / 2, height / 4, stageTitle, {
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // 軽やかな浮遊アニメーション
    this.tweens.add({
      targets: stageText,
      y: height / 4 - 3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // ステージ詳細情報
    if (stageConfig) {
      const detailText = `${stageConfig.colors}色 - 目標: ${stageConfig.targetScore}点`;
      this.add.text(width / 2, height / 4 + 50, detailText, {
        fontSize: '16px',
        color: '#CCCCCC',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);
      
      if (stageConfig.description) {
        this.add.text(width / 2, height / 4 + 75, stageConfig.description, {
          fontSize: '14px',
          color: '#AAAAAA',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
      }
      
      // 妨害ブロック情報（存在する場合）
      if (stageConfig.obstacles.length > 0) {
        const obstacleTypes = [...new Set(stageConfig.obstacles.map(obs => obs.type))];
        const obstacleText = `妨害ブロック: ${obstacleTypes.join(', ')}`;
        this.add.text(width / 2, height / 4 + 100, obstacleText, {
          fontSize: '12px',
          color: '#FFAA00',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
      }
    }
    
    // クリア状況表示
    const isCleared = this.stageManager.isStageCleared(currentStage);
    const bestScore = this.stageManager.getBestScore(currentStage);
    
    if (isCleared) {
      this.add.text(width / 2, height / 4 + 125, `✓ クリア済み (最高: ${bestScore}点)`, {
        fontSize: '14px',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);
    }
    
    // プライマリボタン（プレイボタン）
    const playButton = new SimpleOceanButton(
      this,
      width / 2,
      height / 2,
      200,
      60,
      'プレイ',
      'primary',
      () => {
        this.soundManager.playButtonTap();
        this.soundManager.playScreenTransition();
        
        this.scene.start('ItemSelectionScene', { 
          stage: currentStage
        });
      }
    );
    
    // セカンダリボタン（アイテムボタン）
    const itemButton = new SimpleOceanButton(
      this,
      width / 2 - 80,
      height * 0.75,
      140,
      50,
      'アイテム',
      'secondary',
      () => {
        this.soundManager.playButtonTap();
        this.soundManager.playScreenTransition();
        
        this.scene.start('ItemListScene');
      }
    );
    
    // 危険ボタン（ガチャボタン）
    const gachaButton = new SimpleOceanButton(
      this,
      width / 2 + 80,
      height * 0.75,
      140,
      50,
      'ガチャ',
      'danger',
      () => {
        this.soundManager.playButtonTap();
        this.soundManager.playScreenTransition();
        
        this.scene.start('GachaScene');
      }
    );
    
    // ツールチップを追加
    this.tooltipManager.addButtonTooltip(playButton, 'ゲームを開始します\nアイテムを選択してステージに挑戦');
    this.tooltipManager.addButtonTooltip(itemButton, '所持しているアイテムを確認できます');
    this.tooltipManager.addButtonTooltip(gachaButton, 'ゴールドを使ってアイテムを獲得できます');
    
    // デバッグライン
    if (GameConfig.DEBUG_MODE) {
      this.addDebugLines();
    }
  }
  
  /**
   * 背景演出を作成
   */
  private createBackgroundEffects(): void {
    const { width, height } = this.cameras.main;
    
    // 控えめな泡のパーティクルエフェクトのみ
    this.createBubbleParticles();
  }
  
  /**
   * 泡のパーティクルエフェクトを作成（控えめ版）
   */
  private createBubbleParticles(): void {
    const { width, height } = this.cameras.main;
    
    // 定期的に泡を生成（頻度を下げる）
    this.time.addEvent({
      delay: 4000, // 4秒に1回に変更
      callback: () => {
        // 泡の数を減らす
        for (let i = 0; i < 2; i++) {
          const bubble = this.add.circle(
            Phaser.Math.Between(50, width - 50),
            height + 20,
            Phaser.Math.Between(2, 5), // サイズを小さく
            0x87CEEB,
            0.4 // 透明度を下げる
          );
          
          bubble.setStrokeStyle(1, 0xFFFFFF, 0.6);
          
          // 泡の上昇アニメーション（ゆっくり）
          this.tweens.add({
            targets: bubble,
            y: -20,
            x: bubble.x + Phaser.Math.Between(-20, 20),
            alpha: 0,
            duration: Phaser.Math.Between(6000, 8000), // より長く
            ease: 'Sine.easeOut',
            onComplete: () => {
              bubble.destroy();
            }
          });
        }
      },
      loop: true
    });
  }
  
  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // StageManagerから現在の状態を取得
    const currentStage = this.stageManager.getCurrentStage();
    
    // タイトルエリア（ゴールド表示）
    const titleHeight = 60;
    const titleCenterY = 30;
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // コンテンツエリア（ステージ情報）
    const contentHeight = 80;
    const contentCenterY = height / 4;
    this.debugHelper.addAreaBorder(width / 2, contentCenterY, width, contentHeight, 0x0000FF, 'コンテンツエリア');
    
    // 上部空白エリア
    const titleBottomY = titleCenterY + titleHeight / 2;
    const contentTopY = contentCenterY - contentHeight / 2;
    const topSpaceHeight = contentTopY - titleBottomY;
    
    if (topSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, titleBottomY + topSpaceHeight / 2, width, topSpaceHeight, 0x0000FF, '上部空白エリア');
    }
    // 中上部空白エリア
    const contentBottomY = contentCenterY + contentHeight / 2;
    const buttonHeight = 60;
    const buttonCenterY = height / 2;
    const buttonTopY = buttonCenterY - buttonHeight / 2;
    const middleTopSpaceHeight = buttonTopY - contentBottomY;
    
    if (middleTopSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, contentBottomY + middleTopSpaceHeight / 2, width, middleTopSpaceHeight, 0x0000FF, '中上部空白エリア');
    }
    
    // ボタン/アクションエリア（プレイボタン）
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, 200, buttonHeight, 0xFF00FF, 'ボタン/アクションエリア');
    
    // ボタン左右の空白エリア
    if (width > 200) {
      // 左側空白
      this.debugHelper.addAreaBorder(
        (width - 200) / 4,
        buttonCenterY,
        (width - 200) / 2,
        buttonHeight,
        0x0000FF,
        'ボタン左側空白'
      );
      
      // 右側空白
      this.debugHelper.addAreaBorder(
        width - (width - 200) / 4,
        buttonCenterY,
        (width - 200) / 2,
        buttonHeight,
        0x0000FF,
        'ボタン右側空白'
      );
    }
    
    // 中下部空白エリア
    const buttonBottomY = buttonCenterY + buttonHeight / 2;
    const navHeight = 50;
    const navCenterY = height * 0.75;
    const navTopY = navCenterY - navHeight / 2;
    const middleBottomSpaceHeight = navTopY - buttonBottomY;
    if (middleBottomSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, buttonBottomY + middleBottomSpaceHeight / 2, width, middleBottomSpaceHeight, 0x0000FF, '中下部空白エリア');
    }
    
    // ナビゲーション/メニューエリア（アイテム・ガチャボタン）
    this.debugHelper.addAreaBorder(width / 2, navCenterY, width, navHeight, 0x00FF00, 'ナビゲーション/メニューエリア');
    
    // 下部空白エリア
    const navBottomY = navCenterY + navHeight / 2;
    const bottomSpaceHeight = height - navBottomY;
    if (bottomSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(width / 2, navBottomY + bottomSpaceHeight / 2, width, bottomSpaceHeight, 0x0000FF, '下部空白エリア');
    }
  }

  /**
   * シーン終了時のクリーンアップ
   */
  shutdown(): void {
    // サウンドマネージャーをクリーンアップ
    if (this.soundManager) {
      this.soundManager.destroy();
    }
    
    // アニメーションマネージャーをクリーンアップ
    if (this.animationManager) {
      this.animationManager.destroy();
    }
    
    // ツールチップマネージャーをクリーンアップ
    if (this.tooltipManager) {
      this.tooltipManager.destroy();
    }
  }
}
