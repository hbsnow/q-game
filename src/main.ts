import Phaser from "phaser";
import { GameConfig } from "./config/gameConfig";
import { LoadingScene } from "./scenes/LoadingScene";
import { TitleScene } from "./scenes/TitleScene";
import { MainScene } from "./scenes/MainScene";
import { ItemSelectionScene } from "./scenes/ItemSelectionScene";
import { ItemListScene } from "./scenes/ItemListScene";
import { GachaScene } from "./scenes/GachaScene";
import { GachaResultScene } from "./scenes/GachaResultScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";
import { GameClearScene } from "./scenes/GameClearScene";
import { GameCompleteScene } from "./scenes/GameCompleteScene";

// ゲームの設定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.GAME_WIDTH,
  height: GameConfig.GAME_HEIGHT,
  backgroundColor: GameConfig.BACKGROUND_COLOR,
  parent: "game",
  scene: [
    LoadingScene, // 最初にローディング画面を表示
    TitleScene,
    MainScene,
    ItemSelectionScene,
    ItemListScene,
    GachaScene,
    GachaResultScene,
    GameScene,
    ResultScene,
    GameClearScene,
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
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// ゲームインスタンスの作成
window.addEventListener("load", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const game = new Phaser.Game(config);
});
