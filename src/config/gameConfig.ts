import { GameConfig, BlockColor } from '@/types';

// ゲームの基本設定
export const GAME_CONFIG: GameConfig = {
  // 盤面設定
  boardWidth: 10,
  boardHeight: 14,
  
  // 画面設定
  gameWidth: 400,
  gameHeight: 710,
  blockSize: 40,
  
  // ブロック色設定（海のテーマ）
  colors: [
    'lightBlue',    // 水色（浅瀬の海）
    'coralRed',     // 珊瑚赤（珊瑚）
    'sandGold',     // 砂金色（砂浜）
    'seaGreen',     // 海緑（海藻）
    'blue',         // 深い青（深海）
    'pearlWhite'    // 真珠白（真珠・貝殻）
  ],
  
  // ガチャ設定
  gachaPrice: 100,
  gacha10Price: 1000,
};

// 色の16進数カラーコード
export const COLOR_CODES: Record<BlockColor, string> = {
  blue: '#1E5799',        // 深い青
  lightBlue: '#7DB9E8',   // 水色
  seaGreen: '#2E8B57',    // 海緑
  coralRed: '#FF6347',    // 珊瑚赤
  sandGold: '#F4D03F',    // 砂金色
  pearlWhite: '#F5F5F5'   // 真珠白
};

// レア度の色設定
export const RARITY_COLORS = {
  S: '#FFD700', // 金色
  A: '#FF0000', // 赤色
  B: '#800080', // 紫色
  C: '#0000FF', // 青色
  D: '#008000', // 緑色
  E: '#FFFFFF', // 白色
  F: '#808080'  // 灰色
};

// スコア計算設定
export const SCORE_CONFIG = {
  ALL_CLEAR_MULTIPLIER: 1.5,
  SCORE_BOOSTER_MULTIPLIER: 1.5,
  TARGET_SCORE: 500, // 全ステージ共通の目標スコア
};

// アニメーション設定
export const ANIMATION_CONFIG = {
  BLOCK_FALL_DURATION: 300,
  BLOCK_DESTROY_DURATION: 200,
  SCORE_POPUP_DURATION: 1000,
  TRANSITION_DURATION: 300,
};

// デバッグ設定
export const DEBUG_CONFIG = {
  SHOW_GRID: false,
  SHOW_BLOCK_IDS: false,
  ENABLE_CHEATS: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
};
