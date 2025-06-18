/**
 * エラーハンドリングシステム
 */

import Phaser from 'phaser';

/**
 * エラーの種類
 */
export enum ErrorType {
  INSUFFICIENT_GOLD = 'INSUFFICIENT_GOLD',
  ITEM_LIMIT_REACHED = 'ITEM_LIMIT_REACHED',
  INVALID_ITEM_USE = 'INVALID_ITEM_USE',
  EQUIPMENT_RESTRICTION = 'EQUIPMENT_RESTRICTION',
  NO_REMOVABLE_BLOCKS = 'NO_REMOVABLE_BLOCKS',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  DATA_INCONSISTENCY = 'DATA_INCONSISTENCY'
}

/**
 * エラー情報
 */
export interface GameError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: number;
}

/**
 * エラーハンドラークラス
 */
export class ErrorHandler {
  private scene: Phaser.Scene;
  private errorQueue: GameError[] = [];
  private currentErrorDisplay: Phaser.GameObjects.Container | null = null;
  private isShowingError: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * エラーを処理
   */
  handleError(type: ErrorType, message: string, details?: any): void {
    const error: GameError = {
      type,
      message,
      details,
      timestamp: Date.now()
    };

    this.errorQueue.push(error);
    this.logError(error);
    this.showErrorMessage(error);
  }

  /**
   * ガチャ関連エラーの処理
   */
  handleGachaError(goldNeeded: number, currentGold: number): void {
    this.handleError(
      ErrorType.INSUFFICIENT_GOLD,
      `ゴールドが不足しています\n必要: ${goldNeeded}G\n所持: ${currentGold}G`,
      { goldNeeded, currentGold }
    );
  }

  /**
   * アイテム所持上限エラーの処理
   */
  handleItemLimitError(itemName: string, discardedCount: number): void {
    this.handleError(
      ErrorType.ITEM_LIMIT_REACHED,
      `所持上限のため ${itemName} ×${discardedCount} を破棄しました`,
      { itemName, discardedCount }
    );
  }

  /**
   * アイテム使用エラーの処理
   */
  handleItemUseError(itemName: string, reason: string): void {
    this.handleError(
      ErrorType.INVALID_ITEM_USE,
      `${itemName}を使用できません\n${reason}`,
      { itemName, reason }
    );
  }

  /**
   * アイテム装備制限エラーの処理
   */
  handleEquipmentError(itemName: string, slotType: string): void {
    this.handleError(
      ErrorType.EQUIPMENT_RESTRICTION,
      `${itemName}はこの枠に装備できません\n${slotType}専用アイテムです`,
      { itemName, slotType }
    );
  }

  /**
   * 消去不可能状態エラーの処理
   */
  handleNoRemovableBlocksError(): void {
    this.handleError(
      ErrorType.NO_REMOVABLE_BLOCKS,
      '消去可能なブロックがありません\nシャッフルアイテムを使用するか\nリタイアしてください'
    );
  }

  /**
   * システムエラーの処理
   */
  handleSystemError(error: Error): void {
    this.handleError(
      ErrorType.SYSTEM_ERROR,
      'エラーが発生しました\nページを再読み込みしてください',
      { error: error.message, stack: error.stack }
    );
  }

  /**
   * データ不整合エラーの処理
   */
  handleDataInconsistencyError(description: string): void {
    this.handleError(
      ErrorType.DATA_INCONSISTENCY,
      'データに不整合が発生しました\nゲームを初期状態にリセットします',
      { description }
    );
  }

  /**
   * エラーメッセージの表示
   */
  private showErrorMessage(error: GameError): void {
    if (this.isShowingError) {
      return; // 既にエラー表示中の場合はキューに追加のみ
    }

    this.isShowingError = true;
    this.displayErrorToast(error);
  }

  /**
   * トースト形式でエラー表示
   */
  private displayErrorToast(error: GameError): void {
    const { width, height } = this.scene.cameras.main;
    
    // 背景
    const background = this.scene.add.rectangle(width / 2, 80, width - 40, 80, this.getErrorColor(error.type), 0.9)
      .setStrokeStyle(2, 0xFFFFFF);
    
    // エラーアイコン
    const icon = this.scene.add.text(50, 80, this.getErrorIcon(error.type), {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // エラーメッセージ
    const message = this.scene.add.text(width / 2, 80, error.message, {
      fontSize: '14px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: width - 120 }
    }).setOrigin(0.5);

    this.currentErrorDisplay = this.scene.add.container(0, -100, [background, icon, message]);

    // スライドイン アニメーション
    this.scene.tweens.add({
      targets: this.currentErrorDisplay,
      y: 0,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 3秒後にスライドアウト
        this.scene.time.delayedCall(3000, () => {
          this.hideErrorMessage();
        });
      }
    });
  }

  /**
   * エラーメッセージを非表示
   */
  private hideErrorMessage(): void {
    if (!this.currentErrorDisplay) return;

    this.scene.tweens.add({
      targets: this.currentErrorDisplay,
      y: -100,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.currentErrorDisplay?.destroy();
        this.currentErrorDisplay = null;
        this.isShowingError = false;
        
        // キューに次のエラーがあれば表示
        if (this.errorQueue.length > 1) {
          this.errorQueue.shift(); // 現在のエラーを削除
          this.showErrorMessage(this.errorQueue[0]);
        } else {
          this.errorQueue = [];
        }
      }
    });
  }

  /**
   * エラータイプに応じた色を取得
   */
  private getErrorColor(type: ErrorType): number {
    switch (type) {
      case ErrorType.INSUFFICIENT_GOLD:
        return 0xFF6B6B; // 赤
      case ErrorType.ITEM_LIMIT_REACHED:
        return 0xFFB347; // オレンジ
      case ErrorType.INVALID_ITEM_USE:
        return 0xFF6B6B; // 赤
      case ErrorType.EQUIPMENT_RESTRICTION:
        return 0xFF6B6B; // 赤
      case ErrorType.NO_REMOVABLE_BLOCKS:
        return 0x4ECDC4; // 青緑（情報）
      case ErrorType.SYSTEM_ERROR:
        return 0x8B0000; // 暗い赤
      case ErrorType.DATA_INCONSISTENCY:
        return 0x8B0000; // 暗い赤
      default:
        return 0xFF6B6B;
    }
  }

  /**
   * エラータイプに応じたアイコンを取得
   */
  private getErrorIcon(type: ErrorType): string {
    switch (type) {
      case ErrorType.INSUFFICIENT_GOLD:
        return '💰';
      case ErrorType.ITEM_LIMIT_REACHED:
        return '📦';
      case ErrorType.INVALID_ITEM_USE:
        return '🚫';
      case ErrorType.EQUIPMENT_RESTRICTION:
        return '⚠️';
      case ErrorType.NO_REMOVABLE_BLOCKS:
        return 'ℹ️';
      case ErrorType.SYSTEM_ERROR:
        return '❌';
      case ErrorType.DATA_INCONSISTENCY:
        return '⚠️';
      default:
        return '❗';
    }
  }

  /**
   * エラーをコンソールにログ出力
   */
  private logError(error: GameError): void {
    console.group(`🚨 Game Error: ${error.type}`);
    console.log('Message:', error.message);
    console.log('Timestamp:', new Date(error.timestamp).toLocaleString());
    if (error.details) {
      console.log('Details:', error.details);
    }
    console.groupEnd();
  }

  /**
   * エラー履歴を取得
   */
  getErrorHistory(): GameError[] {
    return [...this.errorQueue];
  }

  /**
   * エラーキューをクリア
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
    if (this.currentErrorDisplay) {
      this.hideErrorMessage();
    }
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.clearErrorQueue();
    if (this.currentErrorDisplay) {
      this.currentErrorDisplay.destroy();
    }
  }
}
