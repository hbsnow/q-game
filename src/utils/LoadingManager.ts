/**
 * ローディング状態管理システム
 */

import Phaser from 'phaser';

/**
 * ローディングタイプ
 */
export enum LoadingType {
  GACHA_DRAW = 'GACHA_DRAW',
  STAGE_TRANSITION = 'STAGE_TRANSITION',
  BOARD_GENERATION = 'BOARD_GENERATION',
  ITEM_EFFECT = 'ITEM_EFFECT',
  SAVE_DATA = 'SAVE_DATA'
}

/**
 * ローディング設定
 */
interface LoadingConfig {
  type: LoadingType;
  message: string;
  duration?: number;
  showSpinner?: boolean;
  showProgress?: boolean;
  blockInput?: boolean;
}

/**
 * ローディング管理クラス
 */
export class LoadingManager {
  private scene: Phaser.Scene;
  private loadingOverlay: Phaser.GameObjects.Container | null = null;
  private isLoading: boolean = false;
  private currentConfig: LoadingConfig | null = null;
  private progressBar: Phaser.GameObjects.Rectangle | null = null;
  private spinner: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * ローディング開始
   */
  startLoading(config: LoadingConfig): void {
    if (this.isLoading) {
      this.stopLoading(); // 既存のローディングを停止
    }

    this.isLoading = true;
    this.currentConfig = config;
    this.createLoadingOverlay(config);

    // 入力をブロック
    if (config.blockInput !== false) {
      this.blockInput();
    }
  }

  /**
   * ローディング停止
   */
  stopLoading(): void {
    if (!this.isLoading) return;

    this.isLoading = false;
    this.currentConfig = null;
    this.destroyLoadingOverlay();
    this.unblockInput();
  }

  /**
   * プログレス更新
   */
  updateProgress(progress: number): void {
    if (!this.progressBar || !this.currentConfig?.showProgress) return;

    const maxWidth = 200;
    const currentWidth = Math.max(0, Math.min(maxWidth, maxWidth * progress));
    this.progressBar.width = currentWidth;
  }

  /**
   * ガチャローディング開始
   */
  startGachaLoading(isMultiple: boolean = false): void {
    this.startLoading({
      type: LoadingType.GACHA_DRAW,
      message: isMultiple ? '10連ガチャ抽選中...' : 'ガチャ抽選中...',
      duration: isMultiple ? 3000 : 2000,
      showSpinner: true,
      blockInput: true
    });
  }

  /**
   * ステージ遷移ローディング開始
   */
  startStageTransitionLoading(stageNumber: number): void {
    this.startLoading({
      type: LoadingType.STAGE_TRANSITION,
      message: `ステージ ${stageNumber}`,
      duration: 1500,
      showSpinner: false,
      blockInput: true
    });
  }

  /**
   * 盤面生成ローディング開始
   */
  startBoardGenerationLoading(): void {
    this.startLoading({
      type: LoadingType.BOARD_GENERATION,
      message: '盤面を生成中...',
      showSpinner: true,
      showProgress: true,
      blockInput: true
    });
  }

  /**
   * アイテム効果ローディング開始
   */
  startItemEffectLoading(itemName: string): void {
    this.startLoading({
      type: LoadingType.ITEM_EFFECT,
      message: `${itemName} 使用中...`,
      duration: 1000,
      showSpinner: true,
      blockInput: true
    });
  }

  /**
   * ローディングオーバーレイの作成
   */
  private createLoadingOverlay(config: LoadingConfig): void {
    const { width, height } = this.scene.cameras.main;
    
    // 背景オーバーレイ
    const background = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // メインコンテナ
    const container = this.scene.add.container(width / 2, height / 2);
    
    // ローディングボックス
    const loadingBox = this.scene.add.rectangle(0, 0, 300, 150, 0x1a1a1a, 0.9)
      .setStrokeStyle(2, 0x333333);
    
    // メッセージテキスト
    const messageText = this.scene.add.text(0, -30, config.message, {
      fontSize: '18px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5);

    container.add([loadingBox, messageText]);

    // スピナーの追加
    if (config.showSpinner) {
      this.createSpinner(container);
    }

    // プログレスバーの追加
    if (config.showProgress) {
      this.createProgressBar(container);
    }

    // タイプ別の特別な演出
    this.addTypeSpecificEffects(container, config.type);

    this.loadingOverlay = this.scene.add.container(0, 0, [background, container]);
    this.loadingOverlay.setDepth(1000);

    // フェードイン
    this.loadingOverlay.setAlpha(0);
    this.scene.tweens.add({
      targets: this.loadingOverlay,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });

    // 自動停止タイマー
    if (config.duration) {
      this.scene.time.delayedCall(config.duration, () => {
        this.stopLoading();
      });
    }
  }

  /**
   * スピナーの作成
   */
  private createSpinner(container: Phaser.GameObjects.Container): void {
    // シンプルな回転スピナー
    const spinnerGraphics = this.scene.make.graphics({});
    spinnerGraphics.lineStyle(4, 0x4ECDC4);
    spinnerGraphics.arc(0, 0, 20, 0, Math.PI * 1.5);
    spinnerGraphics.generateTexture('spinner', 50, 50);
    spinnerGraphics.destroy();

    this.spinner = this.scene.add.sprite(0, 20, 'spinner');
    container.add(this.spinner);

    // 回転アニメーション
    this.scene.tweens.add({
      targets: this.spinner,
      rotation: Math.PI * 2,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  /**
   * プログレスバーの作成
   */
  private createProgressBar(container: Phaser.GameObjects.Container): void {
    // プログレスバー背景
    const progressBg = this.scene.add.rectangle(0, 40, 200, 10, 0x333333);
    
    // プログレスバー
    this.progressBar = this.scene.add.rectangle(-100, 40, 0, 10, 0x4ECDC4);
    this.progressBar.setOrigin(0, 0.5);

    container.add([progressBg, this.progressBar]);
  }

  /**
   * タイプ別の特別な演出
   */
  private addTypeSpecificEffects(container: Phaser.GameObjects.Container, type: LoadingType): void {
    switch (type) {
      case LoadingType.GACHA_DRAW:
        this.addGachaEffects(container);
        break;
      case LoadingType.STAGE_TRANSITION:
        this.addStageTransitionEffects(container);
        break;
      case LoadingType.BOARD_GENERATION:
        this.addBoardGenerationEffects(container);
        break;
    }
  }

  /**
   * ガチャ演出エフェクト
   */
  private addGachaEffects(container: Phaser.GameObjects.Container): void {
    // 宝箱アイコン
    const treasureBox = this.scene.add.rectangle(0, -60, 40, 30, 0x8B4513)
      .setStrokeStyle(2, 0xFFD700);
    
    container.add(treasureBox);

    // キラキラエフェクト
    for (let i = 0; i < 5; i++) {
      const star = this.scene.add.text(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 100,
        '✨',
        { fontSize: '16px' }
      );
      
      container.add(star);

      this.scene.tweens.add({
        targets: star,
        alpha: 0.3,
        scale: 0.5,
        duration: 1000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * ステージ遷移エフェクト
   */
  private addStageTransitionEffects(container: Phaser.GameObjects.Container): void {
    // 波のエフェクト
    const wave = this.scene.add.ellipse(0, 60, 100, 20, 0x4ECDC4, 0.3);
    container.add(wave);

    this.scene.tweens.add({
      targets: wave,
      scaleX: 3,
      scaleY: 1.5,
      alpha: 0,
      duration: 1500,
      ease: 'Power2'
    });
  }

  /**
   * 盤面生成エフェクト
   */
  private addBoardGenerationEffects(container: Phaser.GameObjects.Container): void {
    // ブロックが落ちてくるような演出
    for (let i = 0; i < 3; i++) {
      const block = this.scene.add.rectangle(
        (i - 1) * 30,
        -80,
        20,
        20,
        [0xFF6B6B, 0x4ECDC4, 0xFFD93D][i]
      );
      
      container.add(block);

      this.scene.tweens.add({
        targets: block,
        y: 60,
        duration: 800,
        delay: i * 200,
        ease: 'Bounce.easeOut',
        repeat: -1,
        yoyo: true
      });
    }
  }

  /**
   * ローディングオーバーレイの破棄
   */
  private destroyLoadingOverlay(): void {
    if (!this.loadingOverlay) return;

    this.scene.tweens.add({
      targets: this.loadingOverlay,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.loadingOverlay?.destroy();
        this.loadingOverlay = null;
        this.progressBar = null;
        this.spinner = null;
      }
    });
  }

  /**
   * 入力をブロック
   */
  private blockInput(): void {
    // 透明な矩形で入力をブロック
    const { width, height } = this.scene.cameras.main;
    const inputBlocker = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setInteractive()
      .setDepth(999);
    
    if (this.loadingOverlay) {
      this.loadingOverlay.add(inputBlocker);
    }
  }

  /**
   * 入力ブロックを解除
   */
  private unblockInput(): void {
    // ローディングオーバーレイの破棄と同時に解除される
  }

  /**
   * ローディング中かどうか
   */
  isCurrentlyLoading(): boolean {
    return this.isLoading;
  }

  /**
   * 現在のローディング設定を取得
   */
  getCurrentConfig(): LoadingConfig | null {
    return this.currentConfig;
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.stopLoading();
  }
}
