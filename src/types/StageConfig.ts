/**
 * ステージ設定の型定義
 */

/**
 * 妨害ブロックの配置情報
 */
export interface ObstacleConfig {
  /** ブロックタイプ */
  type: 'iceLv1' | 'iceLv2' | 'counterPlus' | 'counterMinus' | 'iceCounterPlus' | 'iceCounterMinus' | 'rock' | 'steel';
  /** X座標（0-8） */
  x: number;
  /** Y座標（0-12） */
  y: number;
  /** カウンター値（カウンター系ブロックの場合） */
  counter?: number;
  /** 色（通常ブロックと同じ色を持つ妨害ブロックの場合） */
  color?: string;
}

/**
 * ステージ設定
 */
export interface StageConfig {
  /** ステージ番号 */
  stage: number;
  /** 使用する色数（3-6） */
  colors: number;
  /** 目標スコア */
  targetScore: number;
  /** 妨害ブロックの配置 */
  obstacles: ObstacleConfig[];
  /** ステージ名（オプション） */
  name?: string;
  /** ステージの説明（オプション） */
  description?: string;
}

/**
 * 全ステージの設定
 */
export interface StageConfigData {
  /** 全ステージの設定配列 */
  stages: StageConfig[];
  /** 最大ステージ数 */
  maxStage: number;
}

/**
 * ステージ進行状態
 */
export interface StageProgress {
  /** 現在のステージ番号 */
  currentStage: number;
  /** 各ステージのクリア状態 */
  clearedStages: boolean[];
  /** 各ステージの最高スコア */
  bestScores: number[];
  /** 総獲得スコア */
  totalScore: number;
  /** 総獲得ゴールド */
  totalGold: number;
}
