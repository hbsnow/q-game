import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block } from '../types/Block';

describe('氷結ブロックの隣接消去テスト2', () => {
  it('氷結ブロックが2つ隣接している場合、findConnectedBlocksで両方とも検出されるべき', () => {
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
    
    // 両方の氷結ブロックが含まれているか確認
    const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
    expect(positions).toContainEqual({ x: 0, y: 0 });
    expect(positions).toContainEqual({ x: 1, y: 0 });
  });

  it('氷結ブロックと通常ブロックが隣接している場合、findConnectedBlocksで両方とも検出されるべき', () => {
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
    
    // 氷結ブロックをクリックした場合
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 氷結ブロックと通常ブロックの2つが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 両方のブロックが含まれているか確認
    const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
    expect(positions).toContainEqual({ x: 0, y: 0 });
    expect(positions).toContainEqual({ x: 1, y: 0 });
    
    // タイプが正しいか確認
    const types = connectedBlocks.map(block => block.type);
    expect(types).toContain('iceLv1');
    expect(types).toContain('normal');
  });

  it('氷結ブロックLv1とLv2が隣接している場合、findConnectedBlocksで両方とも検出されるべき', () => {
    // 初期状態: 氷結ブロックLv1とLv2が隣接
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
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
    
    // 氷結ブロックLv1とLv2の2つが見つかるはず
    expect(connectedBlocks.length).toBe(2);
    
    // 両方のブロックが含まれているか確認
    const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
    expect(positions).toContainEqual({ x: 0, y: 0 });
    expect(positions).toContainEqual({ x: 1, y: 0 });
    
    // タイプが正しいか確認
    const types = connectedBlocks.map(block => block.type);
    expect(types).toContain('iceLv1');
    expect(types).toContain('iceLv2');
  });
});
