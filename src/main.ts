import Phaser from "phaser";
import { GAME_CONFIG } from "@/config/gameConfig";
import { TitleScene } from "@/scenes/TitleScene";
import { MainScene } from "./scenes/MainScene";
import { ItemSelectScene } from "./scenes/ItemSelectScene";
import { ItemListScene } from "./scenes/ItemListScene";
import { GachaScene } from "./scenes/GachaScene";
import { GachaResultScene } from "./scenes/GachaResultScene";
import { GachaRateDetailsScene } from "./scenes/GachaRateDetailsScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";
import { GameCompleteScene } from "./scenes/GameCompleteScene";
import { GameDebugger } from "@/utils";
import { GameStateManager } from "./utils/GameStateManager";

// Phaserゲーム設定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.gameWidth,
  height: GAME_CONFIG.gameHeight,
  parent: "game-container",
  backgroundColor: "#1e3c72",
  scene: [
    TitleScene,
    MainScene,
    ItemSelectScene,
    ItemListScene,
    GachaScene,
    GachaResultScene,
    GachaRateDetailsScene,
    GameScene,
    ResultScene,
    GameCompleteScene,
  ],
  physics: {
    default: "arcade",
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

// GameStateManagerを初期化
const gameStateManager = GameStateManager.getInstance();

// デバッグ用のテストアイテムを追加（開発時のみ）
if (process.env.NODE_ENV === "development") {
  gameStateManager.debugAddTestItems();
  console.log("🎒 テスト用アイテムを追加しました");
}

// デバッガー初期化
const gameDebugger = GameDebugger.getInstance();
gameDebugger.init();

// デバッグ用のグローバル変数（開発時のみ）
if (process.env.NODE_ENV === "development") {
  (window as any).game = game;
  (window as any).debugger = gameDebugger;
  (window as any).gameStateManager = gameStateManager;
  console.log("🌊 さめがめオーシャン - 開発モード");
  console.log("ゲームオブジェクト:", game);
  console.log("ゲーム状態管理:", gameStateManager);
  console.log("デバッグ用コマンド:");
  console.log("  debugger.showDebugInfo() - デバッグ情報表示");
  console.log("  debugger.skipToStage(n) - ステージnにスキップ");
  console.log("  gameStateManager.debugLog() - ゲーム状態表示");
}
