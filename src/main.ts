import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { TitleScene } from './scenes/TitleScene';
import { MainScene } from './scenes/MainScene';
import { ItemSelectionScene } from './scenes/ItemSelectionScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';
import { GameClearScene } from './scenes/GameClearScene';

// ゲームの設定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.GAME_WIDTH,
  height: GameConfig.GAME_HEIGHT,
  backgroundColor: GameConfig.BACKGROUND_COLOR,
  parent: 'game',
  scene: [TitleScene, MainScene, ItemSelectionScene, GameScene, ResultScene, GameClearScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// ゲームインスタンスの作成
window.addEventListener('load', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const game = new Phaser.Game(config);
});
