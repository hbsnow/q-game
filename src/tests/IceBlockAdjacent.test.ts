import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block } from '../types/Block';

describe('氷結ブロックの隣接消去テスト', () => {
  it('氷結ブロックが2つ隣接している場合、一度に消えるべきではない', () => {
    // 初期状態: 2つの隣接した氷結ブロック
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
    
    // 氷結ブロックをクリックした場合
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 氷結ブロックは2つ見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 仕様に従って、氷結ブロックは一度に消えるべきではなく、レベルが下がるべき
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][1]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('normal');
    expect(updatedBlocks[0][1]?.type).toBe('normal');
  });

  it('氷結ブロックLv2が2つ隣接している場合、両方ともLv1に下がるべき', () => {
    // 初期状態: 2つの隣接した氷結ブロックLv2
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv2', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null },
        null,
        null
      ],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];

    const blockLogic = new BlockLogic();
    
    // 氷結ブロックをクリックした場合
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 氷結ブロックは2つ見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 仕様に従って、氷結ブロックLv2はLv1に下がるべき
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックのレベルが下がっているか確認
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][1]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('iceLv1');
    expect(updatedBlocks[0][1]?.type).toBe('iceLv1');
  });

  it('氷結ブロックと通常ブロックが隣接している場合、氷結ブロックのレベルが下がるべき', () => {
    // 初期状態: 氷結ブロックと通常ブロックが隣接
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'normal', sprite: null },
        null,
        null
      ],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];

    const blockLogic = new BlockLogic();
    
    // 通常ブロックをクリックした場合
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
    
    // 通常ブロックと氷結ブロックの2つが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックが通常ブロックになっているか確認
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('normal');
    
    // 通常ブロックはまだ消去されていないはず
    expect(updatedBlocks[0][1]).not.toBeNull();
    expect(updatedBlocks[0][1]?.type).toBe('normal');
  });
});
