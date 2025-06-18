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
  BOARD_WIDTH: 9,
  BOARD_HEIGHT: 13,
  
  // ブロックサイズ
  BLOCK_SIZE: 44,
  
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
  
  // アニメーション設定
  ANIMATION: {
    BLOCK_REMOVE_DURATION: 200,      // ブロック消去アニメーション時間
    BLOCK_FALL_DURATION: 300,        // ブロック落下アニメーション時間
    HOVER_DURATION: 150,             // ホバーエフェクト時間
    PULSE_DURATION: 800,             // 脈動エフェクト時間
    PROCESSING_DELAY: 300,           // 処理間の待機時間
    SCORE_ANIMATION_DURATION: 1200,  // スコア表示アニメーション時間
  },
  
  // デバッグモード
  DEBUG_MODE: true,
};
