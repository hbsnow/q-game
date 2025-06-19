/**
 * エラー管理システム
 * ユーザーフレンドリーなエラー表示とハンドリングを提供
 */
export class ErrorManager {
  private scene: Phaser.Scene;
  private errorModal: Phaser.GameObjects.Container | null = null;
  private isShowingError: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * エラーを表示
   */
  showError(errorType: ErrorType, message?: string): void {
    if (this.isShowingError) return;
    
    this.isShowingError = true;
    const errorInfo = this.getErrorInfo(errorType, message);
    this.createErrorModal(errorInfo);
  }

  /**
   * エラー情報を取得
   */
  private getErrorInfo(errorType: ErrorType, customMessage?: string): ErrorInfo {
    const errorMessages: Record<ErrorType, ErrorInfo> = {
      [ErrorType.INSUFFICIENT_GOLD]: {
        title: 'ゴールド不足',
        message: 'ゴールドが不足しています。\nステージをクリアしてゴールドを獲得してください。',
        icon: '💰',
        color: 0xFFD700,
        actions: [
          { text: 'OK', action: 'close' }
        ]
      },
      [ErrorType.ITEM_EQUIP_FAILED]: {
        title: 'アイテム装備エラー',
        message: 'このアイテムはこの枠に装備できません。\n装備制限を確認してください。',
        icon: '⚠️',
        color: 0xFF6B47,
        actions: [
          { text: 'OK', action: 'close' }
        ]
      },
      [ErrorType.INVALID_OPERATION]: {
        title: '無効な操作',
        message: 'この操作は実行できません。\n条件を確認してください。',
        icon: '❌',
        color: 0xFF4444,
        actions: [
          { text: 'OK', action: 'close' }
        ]
      },
      [ErrorType.NETWORK_ERROR]: {
        title: 'ネットワークエラー',
        message: 'ネットワーク接続を確認してください。',
        icon: '🌐',
        color: 0xFF8C00,
        actions: [
          { text: 'リトライ', action: 'retry' },
          { text: 'キャンセル', action: 'close' }
        ]
      },
      [ErrorType.GAME_STATE_ERROR]: {
        title: 'ゲーム状態エラー',
        message: 'ゲーム状態に問題が発生しました。\nゲームを再開してください。',
        icon: '🎮',
        color: 0xFF69B4,
        actions: [
          { text: '再開', action: 'restart' },
          { text: 'メイン画面', action: 'main' }
        ]
      },
      [ErrorType.AUDIO_ERROR]: {
        title: '音声エラー',
        message: '音声の再生に失敗しました。\nブラウザの設定を確認してください。',
        icon: '🔊',
        color: 0x9370DB,
        actions: [
          { text: 'OK', action: 'close' }
        ]
      },
      [ErrorType.UNKNOWN_ERROR]: {
        title: '予期しないエラー',
        message: customMessage || '予期しないエラーが発生しました。\nページを再読み込みしてください。',
        icon: '❓',
        color: 0x808080,
        actions: [
          { text: '再読み込み', action: 'reload' },
          { text: 'OK', action: 'close' }
        ]
      }
    };

    return errorMessages[errorType];
  }

  /**
   * エラーモーダルを作成
   */
  private createErrorModal(errorInfo: ErrorInfo): void {
    const { width, height } = this.scene.cameras.main;
    
    // モーダルコンテナ
    this.errorModal = this.scene.add.container(0, 0);
    this.errorModal.setDepth(1000);
    
    // 背景オーバーレイ
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setInteractive();
    this.errorModal.add(overlay);
    
    // モーダル背景
    const modalBg = this.scene.add.graphics();
    modalBg.fillStyle(0xFFFFFF, 1);
    modalBg.lineStyle(3, errorInfo.color, 1);
    modalBg.fillRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 20);
    modalBg.strokeRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 20);
    this.errorModal.add(modalBg);
    
    // アイコン
    const iconText = this.scene.add.text(width / 2, height / 2 - 100, errorInfo.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.errorModal.add(iconText);
    
    // タイトル
    const titleText = this.scene.add.text(width / 2, height / 2 - 50, errorInfo.title, {
      fontSize: '24px',
      color: `#${errorInfo.color.toString(16).padStart(6, '0')}`,
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.errorModal.add(titleText);
    
    // メッセージ
    const messageText = this.scene.add.text(width / 2, height / 2, errorInfo.message, {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 350 }
    }).setOrigin(0.5);
    this.errorModal.add(messageText);
    
    // アクションボタン
    this.createActionButtons(errorInfo.actions, width, height);
    
    // 登場アニメーション
    this.errorModal.setScale(0.8);
    this.errorModal.setAlpha(0);
    
    this.scene.tweens.add({
      targets: this.errorModal,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  /**
   * アクションボタンを作成
   */
  private createActionButtons(actions: ErrorAction[], width: number, height: number): void {
    const buttonWidth = 120;
    const buttonHeight = 40;
    const spacing = 20;
    const totalWidth = (buttonWidth * actions.length) + (spacing * (actions.length - 1));
    const startX = width / 2 - totalWidth / 2 + buttonWidth / 2;
    
    actions.forEach((action, index) => {
      const x = startX + index * (buttonWidth + spacing);
      const y = height / 2 + 80;
      
      // ボタン背景
      const buttonBg = this.scene.add.graphics();
      buttonBg.fillStyle(action.action === 'close' ? 0x666666 : 0x4CAF50, 1);
      buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
      this.errorModal!.add(buttonBg);
      
      // ボタンテキスト
      const buttonText = this.scene.add.text(x, y, action.text, {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.errorModal!.add(buttonText);
      
      // ボタンインタラクション
      const buttonArea = this.scene.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0);
      buttonArea.setInteractive({ useHandCursor: true });
      
      buttonArea.on('pointerdown', () => {
        this.handleAction(action.action);
      });
      
      buttonArea.on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillStyle(action.action === 'close' ? 0x888888 : 0x66BB6A, 1);
        buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
      });
      
      buttonArea.on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillStyle(action.action === 'close' ? 0x666666 : 0x4CAF50, 1);
        buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
      });
      
      this.errorModal!.add(buttonArea);
    });
  }

  /**
   * アクションを処理
   */
  private handleAction(action: string): void {
    switch (action) {
      case 'close':
        this.closeModal();
        break;
      case 'retry':
        this.closeModal();
        // リトライ処理（実装は呼び出し元で行う）
        this.scene.events.emit('error-retry');
        break;
      case 'restart':
        this.closeModal();
        this.scene.scene.start('GameScene');
        break;
      case 'main':
        this.closeModal();
        this.scene.scene.start('MainScene');
        break;
      case 'reload':
        window.location.reload();
        break;
    }
  }

  /**
   * モーダルを閉じる
   */
  private closeModal(): void {
    if (!this.errorModal) return;
    
    this.scene.tweens.add({
      targets: this.errorModal,
      scale: 0.8,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.errorModal?.destroy();
        this.errorModal = null;
        this.isShowingError = false;
      }
    });
  }

  /**
   * 簡単なトーストメッセージを表示
   */
  showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const { width, height } = this.scene.cameras.main;
    
    const colors = {
      info: 0x2196F3,
      success: 0x4CAF50,
      warning: 0xFF9800,
      error: 0xF44336
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    // トースト背景
    const toastBg = this.scene.add.graphics();
    toastBg.fillStyle(colors[type], 0.9);
    toastBg.fillRoundedRect(width / 2 - 150, 50, 300, 60, 15);
    toastBg.setDepth(999);
    
    // アイコン
    const iconText = this.scene.add.text(width / 2 - 120, 80, icons[type], {
      fontSize: '20px'
    }).setOrigin(0.5).setDepth(999);
    
    // メッセージ
    const messageText = this.scene.add.text(width / 2 - 80, 80, message, {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      wordWrap: { width: 200 }
    }).setOrigin(0, 0.5).setDepth(999);
    
    // 登場アニメーション
    const toastElements = [toastBg, iconText, messageText];
    toastElements.forEach(element => {
      element.setAlpha(0);
      element.setY(element.y - 20);
    });
    
    this.scene.tweens.add({
      targets: toastElements,
      alpha: 1,
      y: '+=20',
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // 自動消去
    this.scene.time.delayedCall(3000, () => {
      this.scene.tweens.add({
        targets: toastElements,
        alpha: 0,
        y: '-=20',
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          toastElements.forEach(element => element.destroy());
        }
      });
    });
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    if (this.errorModal) {
      this.errorModal.destroy();
      this.errorModal = null;
    }
    this.isShowingError = false;
  }
}

/**
 * エラータイプ列挙
 */
export enum ErrorType {
  INSUFFICIENT_GOLD = 'insufficient_gold',
  ITEM_EQUIP_FAILED = 'item_equip_failed',
  INVALID_OPERATION = 'invalid_operation',
  NETWORK_ERROR = 'network_error',
  GAME_STATE_ERROR = 'game_state_error',
  AUDIO_ERROR = 'audio_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * エラー情報インターフェース
 */
interface ErrorInfo {
  title: string;
  message: string;
  icon: string;
  color: number;
  actions: ErrorAction[];
}

/**
 * エラーアクションインターフェース
 */
interface ErrorAction {
  text: string;
  action: string;
}
