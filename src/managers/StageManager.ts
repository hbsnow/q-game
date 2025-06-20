/**
 * ステージ管理システム
 */

import { StageConfig, StageProgress } from '../types/StageConfig';
import { getStageConfig, isValidStage, getNextStage, isFinalStage, STAGE_DATA } from '../data/StageData';

/**
 * ステージ管理クラス（シングルトン）
 */
export class StageManager {
  private static instance: StageManager;
  private progress: StageProgress;

  private constructor() {
    this.progress = this.initializeProgress();
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): StageManager {
    if (!StageManager.instance) {
      StageManager.instance = new StageManager();
    }
    return StageManager.instance;
  }

  /**
   * 進行状況を初期化
   */
  private initializeProgress(): StageProgress {
    return {
      currentStage: 1,
      clearedStages: new Array(STAGE_DATA.maxStage).fill(false),
      bestScores: new Array(STAGE_DATA.maxStage).fill(0),
      totalScore: 0,
      totalGold: 0,
    };
  }

  /**
   * 現在のステージ番号を取得
   */
  getCurrentStage(): number {
    return this.progress.currentStage;
  }

  /**
   * 現在のステージを設定（デバッグ用）
   */
  setCurrentStage(stage: number): boolean {
    if (!isValidStage(stage)) {
      console.warn(`Invalid stage number: ${stage}`);
      return false;
    }
    
    this.progress.currentStage = stage;
    console.log(`Current stage set to: ${stage}`);
    return true;
  }

  /**
   * 現在のステージ設定を取得
   */
  getCurrentStageConfig(): StageConfig | null {
    return getStageConfig(this.progress.currentStage);
  }

  /**
   * 指定されたステージの設定を取得
   */
  getStageConfig(stage: number): StageConfig | null {
    return getStageConfig(stage);
  }

  /**
   * ステージをクリア
   */
  clearStage(stage: number, score: number): boolean {
    if (!isValidStage(stage)) {
      return false;
    }

    const stageIndex = stage - 1;
    
    // クリア状態を更新
    this.progress.clearedStages[stageIndex] = true;
    
    // 最高スコアを更新
    if (score > this.progress.bestScores[stageIndex]) {
      this.progress.bestScores[stageIndex] = score;
    }
    
    // 総スコアとゴールドを更新
    this.progress.totalScore += score;
    this.progress.totalGold += score; // スコア = ゴールド

    return true;
  }

  /**
   * 次のステージに進む
   */
  advanceToNextStage(): boolean {
    const nextStage = getNextStage(this.progress.currentStage);
    if (nextStage === null) {
      return false; // 最終ステージの場合
    }

    this.progress.currentStage = nextStage;
    return true;
  }

  /**
   * 指定されたステージに移動
   */
  goToStage(stage: number): boolean {
    if (!isValidStage(stage)) {
      return false;
    }

    this.progress.currentStage = stage;
    return true;
  }

  /**
   * ステージがクリア済みかチェック
   */
  isStageCleared(stage: number): boolean {
    if (!isValidStage(stage)) {
      return false;
    }

    return this.progress.clearedStages[stage - 1];
  }

  /**
   * ステージの最高スコアを取得
   */
  getBestScore(stage: number): number {
    if (!isValidStage(stage)) {
      return 0;
    }

    return this.progress.bestScores[stage - 1];
  }

  /**
   * 総獲得スコアを取得
   */
  getTotalScore(): number {
    return this.progress.totalScore;
  }

  /**
   * 総獲得ゴールドを取得
   */
  getTotalGold(): number {
    return this.progress.totalGold;
  }

  /**
   * 現在のステージが最終ステージかチェック
   */
  isCurrentStageFinal(): boolean {
    return isFinalStage(this.progress.currentStage);
  }

  /**
   * 全ステージクリア済みかチェック
   */
  isAllStagesCleared(): boolean {
    return this.progress.clearedStages.every(cleared => cleared);
  }

  /**
   * 進行状況をリセット（デバッグ用）
   */
  resetProgress(): void {
    this.progress = this.initializeProgress();
  }

  /**
   * 進行状況を取得（デバッグ用）
   */
  getProgress(): StageProgress {
    return { ...this.progress };
  }

  /**
   * ゴールドを消費
   */
  spendGold(amount: number): boolean {
    if (this.progress.totalGold < amount) {
      return false;
    }

    this.progress.totalGold -= amount;
    return true;
  }

  /**
   * ゴールドを追加
   */
  addGold(amount: number): void {
    this.progress.totalGold += amount;
  }

  /**
   * 現在の所持ゴールドを取得
   */
  getCurrentGold(): number {
    return this.progress.totalGold;
  }

  /**
   * ステージ情報の文字列表現を取得（デバッグ用）
   */
  getStageInfo(): string {
    const config = this.getCurrentStageConfig();
    if (!config) {
      return `ステージ ${this.progress.currentStage}: 設定なし`;
    }

    return `ステージ ${config.stage}: ${config.name || '無名'} (${config.colors}色, 目標${config.targetScore}点)`;
  }
}
