/**
 * ステージデータ定義
 */

import { StageConfig, StageConfigData } from '../types/StageConfig';

/**
 * 初期ステージ設定（ステージ1-20）
 */
const initialStages: StageConfig[] = [
  // ステージ1-3: 基本操作習得（3色、妨害ブロックなし）
  {
    stage: 1,
    colors: 3,
    targetScore: 500,
    obstacles: [],
    name: "はじめの一歩",
    description: "基本操作を覚えよう"
  },
  {
    stage: 2,
    colors: 3,
    targetScore: 500,
    obstacles: [],
    name: "慣れてきた",
    description: "同じ色のブロックを消そう"
  },
  {
    stage: 3,
    colors: 3,
    targetScore: 500,
    obstacles: [],
    name: "コツを掴もう",
    description: "大きな塊を作って高得点を狙おう"
  },

  // ステージ4-6: 色数増加（4色）
  {
    stage: 4,
    colors: 4,
    targetScore: 500,
    obstacles: [],
    name: "色が増えた",
    description: "4色になって少し複雑に"
  },
  {
    stage: 5,
    colors: 4,
    targetScore: 500,
    obstacles: [],
    name: "慎重に",
    description: "色の組み合わせを考えよう"
  },
  {
    stage: 6,
    colors: 4,
    targetScore: 500,
    obstacles: [],
    name: "4色マスター",
    description: "4色の配置に慣れよう"
  },

  // ステージ7-10: さらに色数増加（5色）
  {
    stage: 7,
    colors: 5,
    targetScore: 500,
    obstacles: [],
    name: "5色の挑戦",
    description: "さらに複雑になった盤面"
  },
  {
    stage: 8,
    colors: 5,
    targetScore: 500,
    obstacles: [],
    name: "戦略的思考",
    description: "どの色から消すか考えよう"
  },
  {
    stage: 9,
    colors: 5,
    targetScore: 500,
    obstacles: [],
    name: "集中力",
    description: "落ち着いて最適解を見つけよう"
  },
  {
    stage: 10,
    colors: 5,
    targetScore: 500,
    obstacles: [],
    name: "基本完了",
    description: "基本ルールはマスターした"
  },

  // ステージ11-15: 氷結Lv1登場（色数を一時的に減らして学習しやすく）
  {
    stage: 11,
    colors: 3,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 4, y: 6, color: '#7DB9E8' }, // 水色の氷結ブロック
      { type: 'iceLv1', x: 5, y: 7, color: '#FF6347' }, // 珊瑚赤の氷結ブロック
    ],
    name: "氷の登場",
    description: "氷結ブロックが現れた！隣接消去で解除しよう"
  },
  {
    stage: 12,
    colors: 4,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 2, y: 4, color: '#2E8B57' }, // 海緑の氷結ブロック
      { type: 'iceLv1', x: 6, y: 8, color: '#F4D03F' }, // 砂金色の氷結ブロック
      { type: 'iceLv1', x: 7, y: 5, color: '#7DB9E8' }, // 水色の氷結ブロック
    ],
    name: "氷が増えた",
    description: "複数の氷結ブロックを解除しよう"
  },
  {
    stage: 13,
    colors: 4,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 1, y: 3, color: '#FF6347' },
      { type: 'iceLv1', x: 3, y: 5, color: '#FF6347' },
      { type: 'iceLv1', x: 5, y: 7, color: '#FF6347' },
      { type: 'iceLv1', x: 7, y: 9, color: '#FF6347' },
    ],
    name: "氷の連鎖",
    description: "同じ色の氷結ブロックを効率よく解除"
  },
  {
    stage: 14,
    colors: 5,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 2, y: 2, color: '#1E5799' },
      { type: 'iceLv1', x: 4, y: 4, color: '#7DB9E8' },
      { type: 'iceLv1', x: 6, y: 6, color: '#2E8B57' },
      { type: 'iceLv1', x: 3, y: 8, color: '#FF6347' },
      { type: 'iceLv1', x: 5, y: 10, color: '#F4D03F' },
    ],
    name: "氷の配置",
    description: "戦略的に氷結ブロックを解除しよう"
  },
  {
    stage: 15,
    colors: 5,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 0, y: 1, color: '#7DB9E8' },
      { type: 'iceLv1', x: 2, y: 3, color: '#7DB9E8' },
      { type: 'iceLv1', x: 4, y: 5, color: '#7DB9E8' },
      { type: 'iceLv1', x: 6, y: 7, color: '#7DB9E8' },
      { type: 'iceLv1', x: 8, y: 9, color: '#7DB9E8' },
    ],
    name: "氷の道",
    description: "氷結ブロックの配置パターンを読もう"
  },

  // ステージ16-20: 氷結に慣れる（色数を戻す）
  {
    stage: 16,
    colors: 6,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 1, y: 2, color: '#F5F5F5' }, // 真珠白
      { type: 'iceLv1', x: 3, y: 4, color: '#1E5799' }, // 深い青
      { type: 'iceLv1', x: 5, y: 6, color: '#2E8B57' }, // 海緑
      { type: 'iceLv1', x: 7, y: 8, color: '#FF6347' }, // 珊瑚赤
    ],
    name: "6色と氷",
    description: "全色と氷結ブロックの組み合わせ"
  },
  {
    stage: 17,
    colors: 6,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 2, y: 1, color: '#7DB9E8' },
      { type: 'iceLv1', x: 4, y: 3, color: '#F4D03F' },
      { type: 'iceLv1', x: 6, y: 5, color: '#FF6347' },
      { type: 'iceLv1', x: 3, y: 7, color: '#2E8B57' },
      { type: 'iceLv1', x: 5, y: 9, color: '#1E5799' },
      { type: 'iceLv1', x: 1, y: 11, color: '#F5F5F5' },
    ],
    name: "氷の庭園",
    description: "美しい氷の配置を攻略しよう"
  },
  {
    stage: 18,
    colors: 6,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 0, y: 0, color: '#7DB9E8' },
      { type: 'iceLv1', x: 8, y: 0, color: '#7DB9E8' },
      { type: 'iceLv1', x: 0, y: 12, color: '#FF6347' },
      { type: 'iceLv1', x: 8, y: 12, color: '#FF6347' },
      { type: 'iceLv1', x: 4, y: 6, color: '#F4D03F' },
    ],
    name: "氷の四隅",
    description: "角の氷結ブロックを上手く活用しよう"
  },
  {
    stage: 19,
    colors: 6,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 1, y: 1, color: '#1E5799' },
      { type: 'iceLv1', x: 3, y: 2, color: '#7DB9E8' },
      { type: 'iceLv1', x: 5, y: 3, color: '#2E8B57' },
      { type: 'iceLv1', x: 7, y: 4, color: '#FF6347' },
      { type: 'iceLv1', x: 2, y: 8, color: '#F4D03F' },
      { type: 'iceLv1', x: 4, y: 9, color: '#F5F5F5' },
      { type: 'iceLv1', x: 6, y: 10, color: '#1E5799' },
    ],
    name: "氷の階段",
    description: "段階的に氷結ブロックを解除していこう"
  },
  {
    stage: 20,
    colors: 6,
    targetScore: 500,
    obstacles: [
      { type: 'iceLv1', x: 2, y: 2, color: '#7DB9E8' },
      { type: 'iceLv1', x: 3, y: 2, color: '#7DB9E8' },
      { type: 'iceLv1', x: 4, y: 2, color: '#7DB9E8' },
      { type: 'iceLv1', x: 5, y: 2, color: '#7DB9E8' },
      { type: 'iceLv1', x: 6, y: 2, color: '#7DB9E8' },
      { type: 'iceLv1', x: 4, y: 10, color: '#FF6347' },
    ],
    name: "氷の壁",
    description: "氷の壁を突破して高得点を狙おう"
  },
];

/**
 * ステージ設定データ
 */
export const STAGE_DATA: StageConfigData = {
  stages: initialStages,
  maxStage: initialStages.length,
};

/**
 * 指定されたステージの設定を取得
 */
export function getStageConfig(stage: number): StageConfig | null {
  const config = STAGE_DATA.stages.find(s => s.stage === stage);
  return config || null;
}

/**
 * 指定されたステージが存在するかチェック
 */
export function isValidStage(stage: number): boolean {
  return stage >= 1 && stage <= STAGE_DATA.maxStage;
}

/**
 * 次のステージ番号を取得
 */
export function getNextStage(currentStage: number): number | null {
  const nextStage = currentStage + 1;
  return isValidStage(nextStage) ? nextStage : null;
}

/**
 * 最終ステージかどうかチェック
 */
export function isFinalStage(stage: number): boolean {
  return stage === STAGE_DATA.maxStage;
}
