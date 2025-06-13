import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block } from '../types/Block';

/**
 * 氷結ブロックの正しい挙動に関するテスト
 * 仕様: 氷結ブロックは消去されるのではなく、レベルが下がるだけ
 */
describe('氷結ブロックの正しい挙動', () => {
  it('氷結ブロックLv1は通常ブロックになるべきで、消去されるべきではない', () => {
    // 初期状態:
    // _*R _*R
    // __Y __B
    const blocks: (Block | null)[][] = [
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
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 2つの氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 両方の氷結ブロックが通常ブロックになっているか確認
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][1]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('normal');
    expect(updatedBlocks[0][1]?.type).toBe('normal');
  });
  
  it('氷結ブロックLv2は氷結ブロックLv1になるべきで、消去されるべきではない', () => {
    // 初期状態:
    // **R **R
    // __Y __B
    const blocks: (Block | null)[][] = [
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
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 2つの氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 両方の氷結ブロックが氷結ブロックLv1になっているか確認
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][1]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('iceLv1');
    expect(updatedBlocks[0][1]?.type).toBe('iceLv1');
  });
  
  it('通常ブロックと氷結ブロックの混合グループでは、通常ブロックのみが消去され、氷結ブロックはレベルダウンするべき', () => {
    // 初期状態:
    // __R _*R **R
    // __R __Y __B
    const blocks: (Block | null)[][] = [
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
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 4つのブロックが見つかるはず
    expect(connectedBlocks.length).toBe(4);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(updatedBlocks[0][1]?.type).toBe('normal');
    expect(updatedBlocks[0][2]?.type).toBe('iceLv1');
    
    // 通常ブロックのみを消去
    const finalBlocks = JSON.parse(JSON.stringify(updatedBlocks));
    connectedBlocks.forEach(block => {
      if (block.type === 'normal') {
        finalBlocks[block.y][block.x] = null;
      }
    });
    
    // 通常ブロックが消去されているか確認
    expect(finalBlocks[0][0]).toBeNull();
    expect(finalBlocks[1][0]).toBeNull();
    
    // 元々氷結ブロックだったものはレベルダウンしているが消去されていないことを確認
    expect(finalBlocks[0][1]).not.toBeNull();
    expect(finalBlocks[0][2]).not.toBeNull();
    expect(finalBlocks[0][1]?.type).toBe('normal');
    expect(finalBlocks[0][2]?.type).toBe('iceLv1');
  });
});
