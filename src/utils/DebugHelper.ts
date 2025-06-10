/**
 * デバッグ機能のヘルパークラス
 * 各シーンで共通して使えるデバッグ機能を提供
 */
export class DebugHelper {
  private scene: Phaser.Scene;
  private debugContainer: Phaser.GameObjects.Container;
  private debugVisible: boolean = true;
  private gameStateManager: any;
  private stageControlPanel: Phaser.GameObjects.Container | null = null;
  private stageNumberText: Phaser.GameObjects.Text | null = null;
  private isPanelVisible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.debugContainer = scene.add.container(0, 0);
    
    // GameStateManagerを取得
    // MainSceneから直接受け取る
    if (scene.scene.key === 'MainScene' && (scene as any).gameStateManager) {
      this.gameStateManager = (scene as any).gameStateManager;
      console.log('GameStateManager received from MainScene');
    } else {
      // フォールバック: 直接インポート
      try {
        const GameStateManager = require('../utils/GameStateManager').GameStateManager;
        this.gameStateManager = GameStateManager.getInstance();
        console.log('GameStateManager loaded via require');
      } catch (e) {
        console.log('GameStateManager not available in this context');
      }
    }
    
    this.setupShortcuts();
    
    // デバッグパネルボタンを追加（MainSceneの場合のみ）
    if (scene.scene.key === 'MainScene') {
      this.addDebugPanelButton();
    }
  }

  /**
   * GameStateManagerを設定
   */
  setGameStateManager(gameStateManager: any) {
    this.gameStateManager = gameStateManager;
    console.log('GameStateManager explicitly set to DebugHelper');
  }

  /**
   * デバッグパネルボタンを追加
   */
  private addDebugPanelButton() {
    const { width, height } = this.scene.cameras.main;
    
    // デバッグパネルボタン
    const debugButton = this.scene.add.text(width - 30, height - 30, "🔧", { 
      fontSize: '24px',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 1).setInteractive();
    
    // クリックでデバッグパネル表示/非表示を切り替え
    debugButton.on('pointerdown', () => {
      this.toggleStageControlPanel();
    });
    
    // デバッグコンテナに追加
    this.debugContainer.add(debugButton);
  }

  /**
   * ステージ操作パネルの表示/非表示を切り替え
   */
  private toggleStageControlPanel() {
    if (this.isPanelVisible && this.stageControlPanel) {
      // パネルを非表示
      this.stageControlPanel.setVisible(false);
      this.isPanelVisible = false;
    } else {
      // パネルを表示
      if (!this.stageControlPanel) {
        this.createStageControlPanel();
      } else {
        this.stageControlPanel.setVisible(true);
      }
      this.isPanelVisible = true;
      
      // 現在のステージ番号を更新
      this.updateStageNumberDisplay();
    }
  }

  /**
   * ステージ操作パネルを作成
   */
  private createStageControlPanel() {
    const { width, height } = this.scene.cameras.main;
    
    // パネルコンテナ
    this.stageControlPanel = this.scene.add.container(width / 2, height - 100);
    
    // 背景
    const panelBg = this.scene.add.rectangle(0, 0, 300, 50, 0x000000, 0.8)
      .setStrokeStyle(2, 0xFFFFFF);
    this.stageControlPanel.add(panelBg);
    
    // ボタンの配置
    const buttonWidth = 40;
    const buttonHeight = 30;
    
    // -10 ボタン
    const minus10Button = this.scene.add.rectangle(-100, 0, buttonWidth, buttonHeight, 0x444444)
      .setInteractive();
    minus10Button.on('pointerdown', () => {
      console.log('Clicked -10 button');
      this.changeStage(-10);
    });
    
    const minus10Text = this.scene.add.text(-100, 0, "-10", { 
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // -1 ボタン
    const minus1Button = this.scene.add.rectangle(-50, 0, buttonWidth, buttonHeight, 0x444444)
      .setInteractive();
    minus1Button.on('pointerdown', () => {
      console.log('Clicked -1 button');
      this.changeStage(-1);
    });
    
    const minus1Text = this.scene.add.text(-50, 0, "-1", { 
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // ステージ番号表示
    this.stageNumberText = this.scene.add.text(0, 0, "1", { 
      fontSize: '18px',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // +1 ボタン
    const plus1Button = this.scene.add.rectangle(50, 0, buttonWidth, buttonHeight, 0x444444)
      .setInteractive();
    plus1Button.on('pointerdown', () => {
      console.log('Clicked +1 button');
      this.changeStage(1);
    });
    
    const plus1Text = this.scene.add.text(50, 0, "+1", { 
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // +10 ボタン
    const plus10Button = this.scene.add.rectangle(100, 0, buttonWidth, buttonHeight, 0x444444)
      .setInteractive();
    plus10Button.on('pointerdown', () => {
      console.log('Clicked +10 button');
      this.changeStage(10);
    });
    
    const plus10Text = this.scene.add.text(100, 0, "+10", { 
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // パネルにボタンを追加
    this.stageControlPanel.add([
      panelBg,
      minus10Button, minus10Text,
      minus1Button, minus1Text,
      this.stageNumberText,
      plus1Button, plus1Text,
      plus10Button, plus10Text
    ]);
    
    // デバッグコンテナに追加
    this.debugContainer.add(this.stageControlPanel);
    
    // 現在のステージ番号を表示
    this.updateStageNumberDisplay();
  }

  /**
   * ステージ番号表示を更新
   */
  private updateStageNumberDisplay() {
    if (!this.stageNumberText || !this.gameStateManager) return;
    
    const currentStage = this.gameStateManager.getCurrentStage();
    this.stageNumberText.setText(`${currentStage}`);
  }

  /**
   * ステージを変更（相対値）
   */
  private changeStage(delta: number) {
    if (!this.gameStateManager) {
      console.log('GameStateManager not available');
      
      // MainSceneから再取得を試みる
      if (this.scene.scene.key === 'MainScene' && (this.scene as any).gameStateManager) {
        this.gameStateManager = (this.scene as any).gameStateManager;
        console.log('GameStateManager re-acquired from MainScene');
      } else {
        return;
      }
    }
    
    try {
      const currentStage = this.gameStateManager.getCurrentStage();
      console.log(`Current stage: ${currentStage}, delta: ${delta}`);
      
      // StageManagerを取得
      const stageManager = this.gameStateManager.getStageManager();
      if (!stageManager) {
        console.log('StageManager not available');
        return;
      }
      
      const maxStage = stageManager.getMaxStage();
      console.log(`Max stage: ${maxStage}`);
      
      // 新しいステージ番号（1-100の範囲に制限）
      const newStage = Math.max(1, Math.min(maxStage, currentStage + delta));
      console.log(`New stage: ${newStage}`);
      
      // 変更がなければ何もしない
      if (newStage === currentStage) {
        console.log('No change in stage number');
        return;
      }
      
      // ステージをスキップ
      this.skipToStage(newStage);
    } catch (e) {
      console.error('Error in changeStage:', e);
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

    console.log('🔧 Debug shortcuts setup:');
    console.log('  - Press "D" to toggle debug lines');
    console.log('  - Press "Shift+D" to log debug info');
    console.log('  - Click 🔧 button for stage navigation');
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
