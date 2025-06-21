import { GameConfig } from "../config/gameConfig";

/**
 * デバッグログ用のユーティリティクラス
 * DEBUG_MODEがfalseの場合はログを出力しない
 */
export class Logger {
  /**
   * デバッグログを出力
   */
  static debug(...args: any[]): void {
    if (GameConfig.DEBUG_MODE) {
      console.log(...args);
    }
  }

  /**
   * 警告ログを出力
   */
  static warn(...args: any[]): void {
    if (GameConfig.DEBUG_MODE) {
      console.warn(...args);
    }
  }

  /**
   * エラーログを出力（DEBUG_MODEに関係なく常に出力）
   */
  static error(...args: any[]): void {
    console.error(...args);
  }

  /**
   * 情報ログを出力
   */
  static info(...args: any[]): void {
    if (GameConfig.DEBUG_MODE) {
      console.info(...args);
    }
  }
}
