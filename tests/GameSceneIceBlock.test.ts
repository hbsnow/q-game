import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameScene } from '../src/scenes/GameScene';
import { Block } from '../src/types/Block';

// Phaserのモック
vi.mock('phaser', () => {
  return {
    Scene: class MockScene {
      add = {
        sprite: () => ({
          setTint: () => ({}),
          setDisplaySize: () => ({}),
          setAlpha: () => ({}),
          destroy: vi.fn()
        }),
        text: () => ({
          setOrigin: () => ({})
        })
      };
      tweens = {
        add: vi.fn((config) => {
          if (config.onComplete) {
            config.onComplete();
          }
        })
      };
      input = {
        on: vi.fn()
      };
    }
  };
});

describe('GameScene氷結ブロック処理', () => {
  let gameScene: GameScene;
  
  beforeEach(() => {
    gameScene = new GameScene();
    
    // ブロック配列を手動で設定
    gameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null },
        { x: 2, y: 1, color: 'green', type: 'normal', sprite: null }
      ]
    ];
    
    // スプライト配列を初期化
    gameScene.blockSprites = [
      [null, null, null],
      [null, null, null]
    ];
  });
  
  it('氷結ブロックを含むグループで、通常ブロックのみが消去されるべき', () => {
    // 消去対象のブロックグループ
    const connectedBlocks: Block[] = [
      { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
      { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null },
      { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null }
    ];
    
    // 氷結ブロックを更新
    gameScene.updateIceBlocks(connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(gameScene.blocks[0][1]?.type).toBe('normal');
    expect(gameScene.blocks[0][2]?.type).toBe('iceLv1');
    
    // 通常ブロックのみを消去
    const normalBlocks = connectedBlocks.filter(block => {
      const updatedBlock = gameScene.blocks[block.y][block.x];
      return updatedBlock && updatedBlock.type === 'normal';
    });
    
    // 通常ブロックを消去
    gameScene['removeBlocks'](normalBlocks);
    
    // 通常ブロックが消去されているか確認
    expect(gameScene.blocks[0][0]).toBeNull();
    expect(gameScene.blocks[0][1]).toBeNull(); // 元々氷結ブロックだったが、通常ブロックになったので消去される
    
    // 元々氷結ブロックLv2だったものは氷結ブロックLv1になっているが消去されていないことを確認
    expect(gameScene.blocks[0][2]).not.toBeNull();
    expect(gameScene.blocks[0][2]?.type).toBe('iceLv1');
  });
  
  it('氷結ブロックLv2が隣接する通常ブロックの消去によって氷結ブロックLv1になるべき', () => {
    // 消去対象のブロックグループ
    const connectedBlocks: Block[] = [
      { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
      { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null }
    ];
    
    // 氷結ブロックを更新
    gameScene.updateIceBlocks(connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(gameScene.blocks[0][2]?.type).toBe('iceLv1');
    
    // 通常ブロックのみを消去
    const normalBlocks = connectedBlocks.filter(block => {
      const updatedBlock = gameScene.blocks[block.y][block.x];
      return updatedBlock && updatedBlock.type === 'normal';
    });
    
    // 通常ブロックを消去
    gameScene['removeBlocks'](normalBlocks);
    
    // 通常ブロックが消去されているか確認
    expect(gameScene.blocks[0][0]).toBeNull();
    
    // 元々氷結ブロックだったものは氷結ブロックLv1になっているが消去されていないことを確認
    expect(gameScene.blocks[0][2]).not.toBeNull();
    expect(gameScene.blocks[0][2]?.type).toBe('iceLv1');
  });
});
