/**
 * 高度なデバッグ機能ヘルパー
 */

import Phaser from 'phaser';
import { Block } from '../types/Block';
import { ItemManager } from '../managers/ItemManager';
import { StageManager } from '../managers/StageManager';
import { GachaManager } from '../managers/GachaManager';

/**
 * 高度なデバッグ機能クラス
 */
export class AdvancedDebugHelper {
  private scene: Phaser.Scene;
  private debugPanel: Phaser.GameObjects.Container | null = null;
  private isDebugMode: boolean = false;
  private performanceMonitor: PerformanceMonitor;
  private cheatCodeManager: CheatCodeManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.performanceMonitor = new PerformanceMonitor(scene);
    this.cheatCodeManager = new CheatCodeManager(scene);
    this.setupDebugControls();
  }

  /**
   * デバッグコントロールの設定
   */
  private setupDebugControls(): void {
    // F1キー: デバッグパネル表示/非表示
    this.scene.input.keyboard?.addKey('F1').on('down', () => {
      this.toggleDebugPanel();
    });

    // F2キー: ステージスキップ
    this.scene.input.keyboard?.addKey('F2').on('down', () => {
      this.skipStage();
    });

    // F3キー: パフォーマンス監視表示/非表示
    this.scene.input.keyboard?.addKey('F3').on('down', () => {
      this.performanceMonitor.toggle();
    });

    // F4キー: チートコード入力モード
    this.scene.input.keyboard?.addKey('F4').on('down', () => {
      this.cheatCodeManager.openCheatInput();
    });

    // F5キー: ゲーム状態の完全ログ出力
    this.scene.input.keyboard?.addKey('F5').on('down', () => {
      this.logCompleteGameState();
    });
  }

  /**
   * デバッグパネルの表示/非表示切り替え
   */
  private toggleDebugPanel(): void {
    if (this.debugPanel) {
      this.debugPanel.destroy();
      this.debugPanel = null;
      this.isDebugMode = false;
    } else {
      this.createDebugPanel();
      this.isDebugMode = true;
    }
  }

  /**
   * デバッグパネルの作成
   */
  private createDebugPanel(): void {
    const { width, height } = this.scene.cameras.main;
    
    // 背景パネル
    const background = this.scene.add.rectangle(width - 150, 100, 280, 400, 0x000000, 0.8);
    
    // タイトル
    const title = this.scene.add.text(width - 150, 50, 'Debug Panel', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // デバッグ情報テキスト
    const debugInfo = this.scene.add.text(width - 280, 80, this.getDebugInfoText(), {
      fontSize: '12px',
      color: '#FFFFFF',
      wordWrap: { width: 260 }
    });

    // ボタン群
    const buttons = this.createDebugButtons(width - 150, 200);

    this.debugPanel = this.scene.add.container(0, 0, [background, title, debugInfo, ...buttons]);
    
    // 定期更新
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.debugPanel && debugInfo) {
          debugInfo.setText(this.getDebugInfoText());
        }
      },
      loop: true
    });
  }

  /**
   * デバッグ情報テキストの取得
   */
  private getDebugInfoText(): string {
    const stageManager = StageManager.getInstance();
    const itemManager = new ItemManager();
    const equippedItems = itemManager.getEquippedItems();
    
    return [
      `Stage: ${stageManager.getCurrentStage()}`,
      `Gold: ${stageManager.getCurrentGold()}`,
      `FPS: ${Math.round(this.scene.game.loop.actualFps)}`,
      `Memory: ${this.getMemoryUsage()}MB`,
      ``,
      `Equipped Items:`,
      `Special: ${equippedItems.specialSlot?.name || 'None'}`,
      `Normal: ${equippedItems.normalSlot?.name || 'None'}`,
      ``,
      `Controls:`,
      `F1: Toggle Panel`,
      `F2: Skip Stage`,
      `F3: Performance`,
      `F4: Cheat Codes`,
      `F5: Full Log`
    ].join('\n');
  }

  /**
   * デバッグボタンの作成
   */
  private createDebugButtons(centerX: number, startY: number): Phaser.GameObjects.GameObject[] {
    const buttons: Phaser.GameObjects.GameObject[] = [];
    const buttonData = [
      { text: 'Add 1000 Gold', action: () => this.cheatCodeManager.addGold(1000) },
      { text: 'Clear Stage', action: () => this.cheatCodeManager.clearCurrentStage() },
      { text: 'Add All Items', action: () => this.cheatCodeManager.addAllItems() },
      { text: 'Reset Game', action: () => this.cheatCodeManager.resetGame() }
    ];

    buttonData.forEach((data, index) => {
      const y = startY + index * 40;
      
      const buttonBg = this.scene.add.rectangle(centerX, y, 200, 30, 0x333333)
        .setInteractive()
        .on('pointerdown', data.action)
        .on('pointerover', () => buttonBg.setFillStyle(0x555555))
        .on('pointerout', () => buttonBg.setFillStyle(0x333333));
      
      const buttonText = this.scene.add.text(centerX, y, data.text, {
        fontSize: '12px',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      buttons.push(buttonBg, buttonText);
    });

    return buttons;
  }

  /**
   * ステージスキップ
   */
  private skipStage(): void {
    console.log('Debug: Skipping stage...');
    // GameSceneのステージクリア処理を呼び出し
    if (this.scene.scene.key === 'GameScene') {
      (this.scene as any).handleStageComplete?.();
    }
  }

  /**
   * 完全なゲーム状態のログ出力
   */
  private logCompleteGameState(): void {
    const stageManager = StageManager.getInstance();
    const itemManager = new ItemManager();
    const gachaManager = new GachaManager();
    
    console.group('🎮 Complete Game State Debug Log');
    
    console.group('📊 Stage Information');
    console.log('Current Stage:', stageManager.getCurrentStage());
    console.log('Gold:', stageManager.getCurrentGold());
    console.log('Stage Config:', stageManager.getCurrentStageConfig());
    console.groupEnd();
    
    console.group('🎒 Item Information');
    console.log('Equipped Items:', itemManager.getEquippedItems());
    console.groupEnd();
    
    console.group('🎰 Gacha Information');
    console.log('Current Stage:', stageManager.getCurrentStage());
    console.groupEnd();
    
    console.group('⚡ Performance Information');
    console.log('FPS:', Math.round(this.scene.game.loop.actualFps));
    console.log('Memory Usage:', this.getMemoryUsage(), 'MB');
    console.log('Active Tweens:', this.scene.tweens.getTweens().length);
    console.log('Active Timers:', (this.scene.time as any).pendingEvents?.length || 0);
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * メモリ使用量の取得
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  /**
   * デバッグモードかどうか
   */
  isInDebugMode(): boolean {
    return this.isDebugMode;
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    if (this.debugPanel) {
      this.debugPanel.destroy();
    }
    this.performanceMonitor.destroy();
    this.cheatCodeManager.destroy();
  }
}

/**
 * パフォーマンス監視クラス
 */
class PerformanceMonitor {
  private scene: Phaser.Scene;
  private performanceText: Phaser.GameObjects.Text | null = null;
  private isVisible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private show(): void {
    if (this.performanceText) return;

    this.performanceText = this.scene.add.text(10, 10, '', {
      fontSize: '12px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setDepth(1000);

    this.isVisible = true;
    this.updatePerformanceInfo();
  }

  private hide(): void {
    if (this.performanceText) {
      this.performanceText.destroy();
      this.performanceText = null;
    }
    this.isVisible = false;
  }

  private updatePerformanceInfo(): void {
    if (!this.performanceText || !this.isVisible) return;

    const fps = Math.round(this.scene.game.loop.actualFps);
    const memory = this.getMemoryUsage();
    const activeTweens = this.scene.tweens.getTweens().length;
    
    const info = [
      `FPS: ${fps}`,
      `Memory: ${memory}MB`,
      `Tweens: ${activeTweens}`,
      `Objects: ${this.scene.children.length}`
    ].join('\n');

    this.performanceText.setText(info);

    // 次のフレームで更新
    this.scene.time.delayedCall(100, () => this.updatePerformanceInfo());
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  destroy(): void {
    this.hide();
  }
}

/**
 * チートコード管理クラス
 */
class CheatCodeManager {
  private scene: Phaser.Scene;
  private inputField: HTMLInputElement | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  openCheatInput(): void {
    if (this.inputField) return;

    // HTML入力フィールドを作成
    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Enter cheat code...';
    this.inputField.style.position = 'fixed';
    this.inputField.style.top = '50%';
    this.inputField.style.left = '50%';
    this.inputField.style.transform = 'translate(-50%, -50%)';
    this.inputField.style.zIndex = '10000';
    this.inputField.style.padding = '10px';
    this.inputField.style.fontSize = '16px';
    this.inputField.style.border = '2px solid #333';
    this.inputField.style.borderRadius = '5px';

    document.body.appendChild(this.inputField);
    this.inputField.focus();

    // Enterキーで実行
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.executeCheatCode(this.inputField!.value);
        this.closeCheatInput();
      } else if (e.key === 'Escape') {
        this.closeCheatInput();
      }
    });
  }

  private closeCheatInput(): void {
    if (this.inputField) {
      document.body.removeChild(this.inputField);
      this.inputField = null;
    }
  }

  private executeCheatCode(code: string): void {
    const stageManager = StageManager.getInstance();
    const itemManager = new ItemManager();

    switch (code.toLowerCase()) {
      case 'gold1000':
        this.addGold(1000);
        break;
      case 'gold10000':
        this.addGold(10000);
        break;
      case 'allitems':
        this.addAllItems();
        break;
      case 'clearstage':
        this.clearCurrentStage();
        break;
      case 'nextstage':
        console.log('Next stage cheat (not implemented)');
        break;
      case 'resetgame':
        this.resetGame();
        break;
      case 'godmode':
        console.log('God mode activated (not implemented)');
        break;
      default:
        console.log(`Unknown cheat code: ${code}`);
        console.log('Available codes: gold1000, gold10000, allitems, clearstage, nextstage, resetgame, godmode');
    }
  }

  addGold(amount: number): void {
    const stageManager = StageManager.getInstance();
    stageManager.addGold(amount);
    console.log(`Added ${amount} gold. Total: ${stageManager.getCurrentGold()}`);
  }

  addAllItems(): void {
    const itemManager = new ItemManager();
    const allItemIds = [
      'swap', 'changeOne', 'miniBomb', 'shuffle',
      'meltingAgent', 'changeArea', 'counterReset', 'adPlus',
      'bomb', 'scoreBooster', 'hammer', 'steelHammer', 'specialHammer'
    ];

    allItemIds.forEach(itemId => {
      itemManager.addItem(itemId, 10);
    });

    console.log('Added 10 of each item to inventory');
  }

  clearCurrentStage(): void {
    console.log('Clearing current stage...');
    // GameSceneのステージクリア処理を呼び出し
    if (this.scene.scene.key === 'GameScene') {
      (this.scene as any).handleStageComplete?.();
    }
  }

  resetGame(): void {
    const stageManager = StageManager.getInstance();
    const itemManager = new ItemManager();
    
    // ゲーム状態をリセット（簡略化）
    console.log('Game reset to initial state (simplified)');
    
    // タイトル画面に戻る
    this.scene.scene.start('TitleScene');
  }

  destroy(): void {
    this.closeCheatInput();
  }
}
