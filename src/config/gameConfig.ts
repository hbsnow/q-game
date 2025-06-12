/**
 * ゲーム全体の設定を管理する定数
 */
export const GameConfig = {
  // 画面サイズ
  GAME_WIDTH: 400,
  GAME_HEIGHT: 710,
  
  // 背景色
  BACKGROUND_COLOR: '#87CEEB', // 海をイメージした水色
  
  // ゲーム盤面のサイズ
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 14,
  
  // ブロックサイズ
  BLOCK_SIZE: 40,
  
  // ブロックの色（海のテーマに合わせた色）
  BLOCK_COLORS: {
    DEEP_BLUE: '#1E5799', // 深海のイメージ
    LIGHT_BLUE: '#7DB9E8', // 浅瀬の海のイメージ
    SEA_GREEN: '#2E8B57', // 海藻のイメージ
    CORAL_RED: '#FF6347', // 珊瑚のイメージ
    SAND_GOLD: '#F4D03F', // 砂浜のイメージ
    PEARL_WHITE: '#F5F5F5', // 真珠や貝殻のイメージ
  },
  
  // ステージ設定
  MAX_STAGE: 100,
  TARGET_SCORE: 500, // 全ステージ共通の目標スコア
  
  // デバッグモード
  DEBUG_MODE: true,
};
