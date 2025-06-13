import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../src/utils/BlockLogic';
import { Block } from '../src/types/Block';

/**
 * 氷結ブロックの基本的な挙動に関するシンプルなテスト
 */
describe('氷結ブロックの基本挙動', () => {
  it('氷結ブロックLv1は通常ブロックにダウングレードされるべき', () => {
    // 初期状態: 氷結ブロックLv1が2つ隣接している
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        null,
        null
      ],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];

    const blockLogic = new BlockLogic();
    
    // 消去可能なブロックグループを取得
    const group = blockLogic.findConnectedBlocks(blocks, 0, 0);
    expect(group).not.toBeNull();
    expect(group?.length).toBe(2);
    
    // 氷結ブロックをダウングレード
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, group);
    
    // 氷結ブロックLv1は通常ブロックになるべき
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][1]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('normal');
    expect(updatedBlocks[0][1]?.type).toBe('normal');
  });

  it('氷結ブロックLv2は氷結ブロックLv1にダウングレードされるべき', () => {
    // 初期状態: 氷結ブロックLv2が2つ隣接している
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'blue', type: 'iceLv2', sprite: null },
        { x: 1, y: 0, color: 'blue', type: 'iceLv2', sprite: null },
        null,
        null
      ],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];

    const blockLogic = new BlockLogic();
    
    // 消去可能なブロックグループを取得
    const group = blockLogic.findConnectedBlocks(blocks, 0, 0);
    expect(group).not.toBeNull();
    expect(group?.length).toBe(2);
    
    // 氷結ブロックをダウングレード
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, group);
    
    // 氷結ブロックLv2は氷結ブロックLv1になるべき
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][1]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('iceLv1');
    expect(updatedBlocks[0][1]?.type).toBe('iceLv1');
  });

  it('通常ブロックと氷結ブロックが混在する場合、氷結ブロックはダウングレードされ、通常ブロックのみ消去されるべき', () => {
    // 初期状態: 通常ブロックと氷結ブロックLv1が隣接している
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'green', type: 'normal', sprite: null },
        { x: 1, y: 0, color: 'green', type: 'iceLv1', sprite: null },
        { x: 2, y: 0, color: 'green', type: 'normal', sprite: null },
        null
      ],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];

    const blockLogic = new BlockLogic();
    
    // 消去可能なブロックグループを取得
    const group = blockLogic.findConnectedBlocks(blocks, 0, 0);
    expect(group).not.toBeNull();
    expect(group?.length).toBe(3);
    
    // 氷結ブロックをダウングレード
    let updatedBlocks = blockLogic.updateIceBlocks(blocks, group);
    
    // 氷結ブロックLv1は通常ブロックになるべき
    expect(updatedBlocks[0][1]?.type).toBe('normal');
    
    // 通常ブロックのみを消去
    const normalBlocks = group.filter(block => {
      const updatedBlock = updatedBlocks[block.y][block.x];
      return updatedBlock && updatedBlock.type === 'normal';
    });
    
    // 通常ブロックのみを消去するシミュレーション
    const finalBlocks = JSON.parse(JSON.stringify(updatedBlocks));
    normalBlocks.forEach(block => {
      finalBlocks[block.y][block.x] = null;
    });
    
    // 全ての通常ブロックが消去されているか確認
    expect(finalBlocks[0][0]).toBeNull();
    expect(finalBlocks[0][1]).toBeNull(); // 元々氷結ブロックだったが、通常ブロックになったので消去される
    expect(finalBlocks[0][2]).toBeNull();
  });
});
