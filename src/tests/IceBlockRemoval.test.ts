import { describe, it, expect, beforeEach } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block } from '../types/Block';

/**
 * 氷結ブロックの消去処理に関するテスト
 * 仕様: 氷結ブロックは直接消去されるのではなく、レベルが下がるだけ
 * - 氷結ブロックLv1 → 通常ブロック
 * - 氷結ブロックLv2 → 氷結ブロックLv1
 */
describe('氷結ブロックの消去処理', () => {
  let mockGameScene: {
    blocks: (Block | null)[][];
    score: number;
    updateIceBlocks: (blocks: Block[]) => void;
    removeBlocks: (blocks: Block[]) => void;
  };
  
  beforeEach(() => {
    // モックのGameSceneを作成
    mockGameScene = {
      blocks: [],
      score: 0,
      updateIceBlocks: function(blocks: Block[]) {
        // 氷結ブロックのレベルを下げる処理
        blocks.forEach(block => {
          if (this.blocks[block.y][block.x]?.type === 'iceLv2') {
            this.blocks[block.y][block.x] = {
              ...this.blocks[block.y][block.x]!,
              type: 'iceLv1'
            };
          } else if (this.blocks[block.y][block.x]?.type === 'iceLv1') {
            this.blocks[block.y][block.x] = {
              ...this.blocks[block.y][block.x]!,
              type: 'normal'
            };
          }
        });
      },
      removeBlocks: function(blocks: Block[]) {
        // 通常ブロックのみを消去する処理
        blocks.forEach(block => {
          if (block.type === 'normal') {
            this.blocks[block.y][block.x] = null;
          }
        });
      }
    };
  });
  
  it('氷結ブロックLv1が2つ隣接している場合、クリックすると両方とも通常ブロックになるべき', () => {
    // 初期状態:
    // _*R _*R
    // __Y __B
    mockGameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    const blockLogic = new BlockLogic();
    
    // 氷結ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(mockGameScene.blocks, 0, 0);
    
    // 2つの氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    mockGameScene.updateIceBlocks(connectedBlocks);
    
    // 両方の氷結ブロックが通常ブロックになっているか確認
    expect(mockGameScene.blocks[0][0]).not.toBeNull();
    expect(mockGameScene.blocks[0][1]).not.toBeNull();
    expect(mockGameScene.blocks[0][0]?.type).toBe('normal');
    expect(mockGameScene.blocks[0][1]?.type).toBe('normal');
  });
  
  it('氷結ブロックLv2が2つ隣接している場合、クリックすると両方とも氷結ブロックLv1になるべき', () => {
    // 初期状態:
    // **R **R
    // __Y __B
    mockGameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv2', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    const blockLogic = new BlockLogic();
    
    // 氷結ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(mockGameScene.blocks, 0, 0);
    
    // 2つの氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    mockGameScene.updateIceBlocks(connectedBlocks);
    
    // 両方の氷結ブロックが氷結ブロックLv1になっているか確認
    expect(mockGameScene.blocks[0][0]).not.toBeNull();
    expect(mockGameScene.blocks[0][1]).not.toBeNull();
    expect(mockGameScene.blocks[0][0]?.type).toBe('iceLv1');
    expect(mockGameScene.blocks[0][1]?.type).toBe('iceLv1');
  });
  
  it('氷結ブロックLv1と通常ブロックが隣接している場合、氷結ブロックは通常ブロックになり、通常ブロックは消去されるべき', () => {
    // 初期状態:
    // _*R __R
    // __Y __B
    mockGameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    const blockLogic = new BlockLogic();
    
    // 氷結ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(mockGameScene.blocks, 0, 0);
    
    // 氷結ブロックと通常ブロックの2つが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    mockGameScene.updateIceBlocks(connectedBlocks);
    
    // 通常ブロックを消去
    mockGameScene.removeBlocks(connectedBlocks);
    
    // 氷結ブロックが通常ブロックになっているか確認
    expect(mockGameScene.blocks[0][0]).not.toBeNull();
    expect(mockGameScene.blocks[0][0]?.type).toBe('normal');
    
    // 通常ブロックが消去されているか確認
    expect(mockGameScene.blocks[0][1]).toBeNull();
  });
  
  it('氷結ブロックLv2と通常ブロックが隣接している場合、氷結ブロックはLv1になり、通常ブロックは消去されるべき', () => {
    // 初期状態:
    // **R __R
    // __Y __B
    mockGameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv2', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    const blockLogic = new BlockLogic();
    
    // 氷結ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(mockGameScene.blocks, 0, 0);
    
    // 氷結ブロックと通常ブロックの2つが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    mockGameScene.updateIceBlocks(connectedBlocks);
    
    // 通常ブロックを消去
    mockGameScene.removeBlocks(connectedBlocks);
    
    // 氷結ブロックがLv1になっているか確認
    expect(mockGameScene.blocks[0][0]).not.toBeNull();
    expect(mockGameScene.blocks[0][0]?.type).toBe('iceLv1');
    
    // 通常ブロックが消去されているか確認
    expect(mockGameScene.blocks[0][1]).toBeNull();
  });
  
  it('氷結ブロックLv1とLv2が隣接している場合、それぞれレベルが下がるべき', () => {
    // 初期状態:
    // _*R **R
    // __Y __B
    mockGameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    const blockLogic = new BlockLogic();
    
    // 氷結ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(mockGameScene.blocks, 0, 0);
    
    // 2つの氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    mockGameScene.updateIceBlocks(connectedBlocks);
    
    // 氷結ブロックLv1が通常ブロックになっているか確認
    expect(mockGameScene.blocks[0][0]).not.toBeNull();
    expect(mockGameScene.blocks[0][0]?.type).toBe('normal');
    
    // 氷結ブロックLv2が氷結ブロックLv1になっているか確認
    expect(mockGameScene.blocks[0][1]).not.toBeNull();
    expect(mockGameScene.blocks[0][1]?.type).toBe('iceLv1');
  });
  
  it('複雑なパターン: 通常ブロックと氷結ブロックの混合グループで、氷結ブロックはレベルが下がり、通常ブロックは消去されるべき', () => {
    // 初期状態:
    // __R _*R **R
    // __R __Y __B
    mockGameScene.blocks = [
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
    
    const blockLogic = new BlockLogic();
    
    // 通常ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(mockGameScene.blocks, 0, 0);
    
    // 4つのブロックが見つかるはず
    expect(connectedBlocks.length).toBe(4);
    
    // 氷結ブロックを更新
    mockGameScene.updateIceBlocks(connectedBlocks);
    
    // 通常ブロックを消去
    mockGameScene.removeBlocks(connectedBlocks);
    
    // 氷結ブロックLv1が通常ブロックになっているか確認
    expect(mockGameScene.blocks[0][1]).not.toBeNull();
    expect(mockGameScene.blocks[0][1]?.type).toBe('normal');
    
    // 氷結ブロックLv2が氷結ブロックLv1になっているか確認
    expect(mockGameScene.blocks[0][2]).not.toBeNull();
    expect(mockGameScene.blocks[0][2]?.type).toBe('iceLv1');
    
    // 通常ブロックが消去されているか確認
    expect(mockGameScene.blocks[0][0]).toBeNull();
    expect(mockGameScene.blocks[1][0]).toBeNull();
    
    // 他の色のブロックは残っているか確認
    expect(mockGameScene.blocks[1][1]).not.toBeNull();
    expect(mockGameScene.blocks[1][2]).not.toBeNull();
  });
  
  it('通常ブロックが消去される前に隣接する同色の氷結ブロックのレベルが下がるべき', () => {
    // 初期状態:
    // __R __R _*R
    // __Y **R __B
    mockGameScene.blocks = [
      [
        { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'normal', sprite: null },
        { x: 2, y: 0, color: 'red', type: 'iceLv1', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'red', type: 'iceLv2', sprite: null },
        { x: 2, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];
    
    const blockLogic = new BlockLogic();
    
    // 通常ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(mockGameScene.blocks, 0, 0);
    
    // 通常ブロックと氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(4);
    
    // 氷結ブロックを更新
    mockGameScene.updateIceBlocks(connectedBlocks);
    
    // 通常ブロックを消去
    mockGameScene.removeBlocks(connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(mockGameScene.blocks[0][2]?.type).toBe('normal');
    expect(mockGameScene.blocks[1][1]?.type).toBe('iceLv1');
    
    // 通常ブロックが消去されているか確認
    expect(mockGameScene.blocks[0][0]).toBeNull();
    expect(mockGameScene.blocks[0][1]).toBeNull();
    
    // 他のブロックは残っているか確認
    expect(mockGameScene.blocks[1][0]).not.toBeNull();
    expect(mockGameScene.blocks[1][2]).not.toBeNull();
  });
});
