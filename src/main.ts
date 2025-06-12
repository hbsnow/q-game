import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { TitleScene } from './scenes/TitleScene';
import { MainScene } from './scenes/MainScene';
import { GameScene } from './scenes/GameScene';

// ゲームの設定
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.GAME_WIDTH,
  height: GameConfig.GAME_HEIGHT,
  backgroundColor: GameConfig.BACKGROUND_COLOR,
  parent: 'game',
  scene: [TitleScene, MainScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// ゲームインスタンスの作成
window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});
