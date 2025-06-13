import { describe, it, expect, beforeEach } from 'vitest';
import { GameScene } from '../utils/GameScene';
import { Block } from '../types/Block';

/**
 * GameSceneクラスの氷結ブロック処理に関するテスト
 */
describe('GameSceneの氷結ブロック処理', () => {
  let gameScene: GameScene;
  
  beforeEach(() => {
    gameScene = new GameScene();
  });
  
  it('氷結ブロックLv1と通常ブロックが隣接している場合、氷結ブロックは通常ブロックになり、両方とも消去されるべき', () => {
    // 初期状態:
    // _*R __R
    // __Y __B
    gameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    // 氷結ブロックをクリック
    const connectedBlocks = gameScene.blockLogic.findConnectedBlocks(gameScene.blocks, 0, 0);
    
    // 2つのブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    gameScene.updateIceBlocks(connectedBlocks);
    
    // 氷結ブロックが通常ブロックになっているか確認
    expect(gameScene.blocks[0][0]).not.toBeNull();
    expect(gameScene.blocks[0][0]?.type).toBe('normal');
    
    // 通常ブロックを消去
    gameScene.removeBlocks(connectedBlocks);
    
    // 元々氷結ブロックだったものも通常ブロックになったので消去されるべき
    expect(gameScene.blocks[0][0]).toBeNull();
    
    // 通常ブロックが消去されているか確認
    expect(gameScene.blocks[0][1]).toBeNull();
  });
  
  it('氷結ブロックLv2と通常ブロックが隣接している場合、氷結ブロックはLv1になり、通常ブロックのみが消去されるべき', () => {
    // 初期状態:
    // **R __R
    // __Y __B
    gameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv2', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    // 氷結ブロックをクリック
    const connectedBlocks = gameScene.blockLogic.findConnectedBlocks(gameScene.blocks, 0, 0);
    
    // 2つのブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    gameScene.updateIceBlocks(connectedBlocks);
    
    // 氷結ブロックがLv1になっているか確認
    expect(gameScene.blocks[0][0]).not.toBeNull();
    expect(gameScene.blocks[0][0]?.type).toBe('iceLv1');
    
    // 通常ブロックを消去
    gameScene.removeBlocks(connectedBlocks);
    
    // 氷結ブロックは残っているか確認
    expect(gameScene.blocks[0][0]).not.toBeNull();
    
    // 通常ブロックが消去されているか確認
    expect(gameScene.blocks[0][1]).toBeNull();
  });
  
  it('複雑なパターン: 通常ブロックと氷結ブロックの混合グループで、氷結ブロックはレベルダウンし、通常ブロックのみが消去されるべき', () => {
    // 初期状態:
    // __R _*R **R
    // __R __Y __B
    gameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'red', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 2, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    // 通常ブロックをクリック
    const connectedBlocks = gameScene.blockLogic.findConnectedBlocks(gameScene.blocks, 0, 0);
    
    // 4つのブロックが見つかるはず
    expect(connectedBlocks.length).toBe(4);
    
    // 氷結ブロックを更新
    gameScene.updateIceBlocks(connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(gameScene.blocks[0][1]).not.toBeNull();
    expect(gameScene.blocks[0][2]).not.toBeNull();
    expect(gameScene.blocks[0][1]?.type).toBe('normal');
    expect(gameScene.blocks[0][2]?.type).toBe('iceLv1');
    
    // 通常ブロックを消去
    gameScene.removeBlocks(connectedBlocks);
    
    // 元々氷結ブロックLv1だったものは通常ブロックになったので消去されるべき
    expect(gameScene.blocks[0][1]).toBeNull();
    
    // 元々氷結ブロックLv2だったものは氷結ブロックLv1になって残っているはず
    expect(gameScene.blocks[0][2]).not.toBeNull();
    expect(gameScene.blocks[0][2]?.type).toBe('iceLv1');
    
    // 通常ブロックが消去されているか確認
    expect(gameScene.blocks[0][0]).toBeNull();
    expect(gameScene.blocks[1][0]).toBeNull();
  });
});
