import Phaser from 'phaser';
import { GAME_CONFIG } from '@/config/gameConfig';
import { TitleScene } from '@/scenes/TitleScene';
import { GameDebugger } from '@/utils';

// Phaserゲーム設定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.gameWidth,
  height: GAME_CONFIG.gameHeight,
  parent: 'game-container',
  backgroundColor: '#1e3c72',
  scene: [
    TitleScene,
    // 他のシーンは後で追加
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    max: {
      width: GAME_CONFIG.gameWidth,
      height: GAME_CONFIG.gameHeight,
    },
  },
  input: {
    activePointers: 1, // タッチ対応
  },
};

// ゲーム開始
const game = new Phaser.Game(config);

// デバッガー初期化
const debugger = GameDebugger.getInstance();
debugger.init();

// デバッグ用のグローバル変数（開発時のみ）
if (process.env.NODE_ENV === 'development') {
  (window as any).game = game;
  (window as any).debugger = debugger;
  console.log('🌊 さめがめオーシャン - 開発モード');
  console.log('ゲームオブジェクト:', game);
  console.log('デバッガー: Ctrl+D でデバッグパネル表示');
}
