/**
 * デバッグ機能のヘルパークラス
 * 各シーンで共通して使えるデバッグ機能を提供
 */
export class DebugHelper {
  private scene: Phaser.Scene;
  private debugContainer: Phaser.GameObjects.Container;
  private debugVisible: boolean = true;
  private gameStateManager: any;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.debugContainer = scene.add.container(0, 0);
    this.setupShortcuts();
    
    // GameStateManagerを取得（存在する場合）
    try {
      const GameStateManager = require('../utils/GameStateManager').GameStateManager;
      this.gameStateManager = GameStateManager.getInstance();
    } catch (e) {
      console.log('GameStateManager not available in this context');
    }
  }

  /**
   * デバッグショートカットキーを設定
   */
  private setupShortcuts() {
    // Dキー: デバッグライン切り替え
    this.scene.input.keyboard?.on('keydown-D', () => {
      this.toggleDebugLines();
    });

    // Shift+Dキー: デバッグ情報をコンソール出力
    this.scene.input.keyboard?.on('keydown-D', (event: KeyboardEvent) => {
      if (event.shiftKey) {
        this.logDebugInfo();
      }
    });

    // 数字キー: ステージスキップ
    for (let i = 1; i <= 9; i++) {
      this.scene.input.keyboard?.on(`keydown-${i}`, (event: KeyboardEvent) => {
        if (event.altKey) {
          this.skipToStage(i * 10 + 1); // Alt+1 → ステージ11, Alt+2 → ステージ21
        } else if (event.ctrlKey || event.metaKey) {
          this.skipToStage(i); // Ctrl+1 → ステージ1, Ctrl+2 → ステージ2
        }
      });
    }

    console.log('🔧 Debug shortcuts setup:');
    console.log('  - Press "D" to toggle debug lines');
    console.log('  - Press "Shift+D" to log debug info');
    console.log('  - Press "Ctrl+[1-9]" to skip to stages 1-9');
    console.log('  - Press "Alt+[1-9]" to skip to stages 11,21,31...');
  }

  /**
   * 指定したステージにスキップ
   */
  skipToStage(stageNumber: number) {
    if (!this.gameStateManager) {
      console.log('GameStateManager not available, cannot skip stage');
      return;
    }

    try {
      // 現在のステージを保存
      const currentStage = this.gameStateManager.getCurrentStage();
      
      // ステージをスキップ（内部状態を更新）
      this.updateStageNumber(stageNumber);
      
      console.log(`🔄 DEBUG: Skipped from Stage ${currentStage} to Stage ${stageNumber}`);
      
      // MainSceneに戻る（ステージ情報を更新するため）
      this.scene.scene.start('MainScene', {
        gameStateManager: this.gameStateManager
      });
    } catch (e) {
      console.error('Failed to skip stage:', e);
    }
  }

  /**
   * ステージ番号を更新
   */
  private updateStageNumber(stageNumber: number) {
    if (!this.gameStateManager) return;
    
    // GameStateManagerの内部状態を直接変更
    // 注意: これは通常のゲームフローをバイパスするデバッグ機能
    const gameState = this.gameStateManager.getGameState();
    if (gameState) {
      // 現在のステージを更新
      gameState.currentStage = stageNumber;
      
      // 目標スコアを更新
      const stageManager = this.gameStateManager.getStageManager();
      if (stageManager) {
        gameState.targetScore = stageManager.getTargetScore(stageNumber);
      }
      
      // スコアをリセット
      gameState.score = 0;
      
      console.log(`🔧 DEBUG: Stage updated to ${stageNumber}`);
    }
  }

  /**
   * デバッグラインの表示/非表示を切り替え
   */
  toggleDebugLines() {
    this.debugVisible = !this.debugVisible;
    this.debugContainer.setVisible(this.debugVisible);
    
    console.log(`🔧 Debug lines ${this.debugVisible ? 'SHOWN' : 'HIDDEN'}`);
  }

  /**
   * デバッグ情報をコンソールに出力
   */
  private logDebugInfo() {
    const { width, height } = this.scene.cameras.main;
    console.log('🔍 === DEBUG INFO ===');
    console.log('Scene:', this.scene.scene.key);
    console.log('Screen size:', { width, height });
    console.log('Debug container children:', this.debugContainer.list.length);
    console.log('Debug visible:', this.debugVisible);
    
    // GameStateManagerが利用可能な場合は追加情報を表示
    if (this.gameStateManager) {
      console.log('Current Stage:', this.gameStateManager.getCurrentStage());
      console.log('Gold:', this.gameStateManager.getGold());
      console.log('Score:', this.gameStateManager.getScore());
      console.log('Target Score:', this.gameStateManager.getTargetScore());
    }
  }

  /**
   * エリア境界線を追加
   */
  addAreaBorder(x: number, y: number, width: number, height: number, color: number, label: string) {
    const rect = this.scene.add.rectangle(x, y, width, height, 0x000000, 0)
      .setStrokeStyle(2, color);
    
    const text = this.scene.add.text(x - width/2 + 10, y - height/2 + 5, label, {
      fontSize: '10px',
      color: `#${color.toString(16).padStart(6, '0').toUpperCase()}`,
      backgroundColor: '#000000'
    });

    this.debugContainer.add([rect, text]);
  }

  /**
   * 座標情報テキストを追加
   */
  addCoordinateText(x: number, y: number, info: string, color: number = 0xFFFFFF) {
    const text = this.scene.add.text(x, y, info, {
      fontSize: '9px',
      color: `#${color.toString(16).padStart(6, '0').toUpperCase()}`,
      backgroundColor: '#000000'
    });

    this.debugContainer.add(text);
  }

  /**
   * デバッグコンテナを取得
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.debugContainer;
  }

  /**
   * デバッグラインの表示状態を取得
   */
  isVisible(): boolean {
    return this.debugVisible;
  }

  /**
   * デバッグ機能を破棄
   */
  destroy() {
    this.debugContainer.destroy();
  }
}
