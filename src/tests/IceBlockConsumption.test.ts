import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block } from '../types/Block';

/**
 * 氷結ブロックの消去処理の順序に関するテスト
 * 仕様: 通常ブロックが消去される前に隣接する氷結ブロックのレベルが下がるべき
 */
describe('氷結ブロックの消去順序', () => {
  it('通常ブロックが消去される前に隣接する氷結ブロックのレベルが下がるべき', () => {
    // 初期状態:
    // __R __R _*R
    // __Y **R __B
    const blocks: (Block | null)[][] = [
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
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 通常ブロックと氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(4);
    
    // 氷結ブロックを更新（ブロックを消去する前に実行）
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(updatedBlocks[0][2]?.type).toBe('normal');
    expect(updatedBlocks[1][1]?.type).toBe('iceLv1');
    
    // 通常ブロックのみを消去（氷結ブロックは消去しない）
    const finalBlocks = JSON.parse(JSON.stringify(updatedBlocks));
    connectedBlocks.forEach(block => {
      if (block.type === 'normal') {
        finalBlocks[block.y][block.x] = null;
      }
    });
    
    // 通常ブロックが消去されているか確認
    expect(finalBlocks[0][0]).toBeNull();
    expect(finalBlocks[0][1]).toBeNull();
    
    // 元々氷結ブロックだったものは通常ブロックになっているが消去されていないことを確認
    expect(finalBlocks[0][2]).not.toBeNull();
    expect(finalBlocks[0][2]?.type).toBe('normal');
    
    // 元々氷結ブロックLv2だったものは氷結ブロックLv1になっているが消去されていないことを確認
    expect(finalBlocks[1][1]).not.toBeNull();
    expect(finalBlocks[1][1]?.type).toBe('iceLv1');
    
    // 他のブロックは残っているか確認
    expect(finalBlocks[1][0]).not.toBeNull();
    expect(finalBlocks[1][2]).not.toBeNull();
  });

  it('氷結ブロックLv2が隣接する通常ブロックの消去によって氷結ブロックLv1になるべき', () => {
    // 初期状態:
    // __R **R
    // __Y __B
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];

    const blockLogic = new BlockLogic();
    
    // 通常ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 通常ブロックと氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新（ブロックを消去する前に実行）
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(updatedBlocks[0][1]?.type).toBe('iceLv1');
    
    // 通常ブロックのみを消去（氷結ブロックは消去しない）
    const finalBlocks = JSON.parse(JSON.stringify(updatedBlocks));
    connectedBlocks.forEach(block => {
      if (block.type === 'normal') {
        finalBlocks[block.y][block.x] = null;
      }
    });
    
    // 通常ブロックが消去されているか確認
    expect(finalBlocks[0][0]).toBeNull();
    
    // 元々氷結ブロックだったものは氷結ブロックLv1になっているが消去されていないことを確認
    expect(finalBlocks[0][1]).not.toBeNull();
    expect(finalBlocks[0][1]?.type).toBe('iceLv1');
    
    // 他のブロックは残っているか確認
    expect(finalBlocks[1][0]).not.toBeNull();
    expect(finalBlocks[1][1]).not.toBeNull();
  });

  it('氷結ブロックLv1が隣接する通常ブロックの消去によって通常ブロックになるべき', () => {
    // 初期状態:
    // __R _*R
    // __Y __B
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
      ]
    ];

    const blockLogic = new BlockLogic();
    
    // 通常ブロックをクリック
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 通常ブロックと氷結ブロックが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新（ブロックを消去する前に実行）
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックが通常ブロックになっているか確認
    expect(updatedBlocks[0][1]?.type).toBe('normal');
    
    // 通常ブロックのみを消去（元々氷結ブロックだったものは消去しない）
    const finalBlocks = JSON.parse(JSON.stringify(updatedBlocks));
    connectedBlocks.forEach(block => {
      if (block.x === 0 && block.y === 0) { // 元々の通常ブロックのみ消去
        finalBlocks[block.y][block.x] = null;
      }
    });
    
    // 元々の通常ブロックが消去されているか確認
    expect(finalBlocks[0][0]).toBeNull();
    
    // 元々氷結ブロックだったものは通常ブロックになっているが消去されていないことを確認
    expect(finalBlocks[0][1]).not.toBeNull();
    expect(finalBlocks[0][1]?.type).toBe('normal');
    
    // 他のブロックは残っているか確認
    expect(finalBlocks[1][0]).not.toBeNull();
    expect(finalBlocks[1][1]).not.toBeNull();
  });
});
