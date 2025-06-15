import { describe, it, expect } from 'vitest';
import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';

describe('氷結ブロックの挙動テスト', () => {
  const blockLogic = new BlockLogic();
  const RED = '#FF6347'; // 珊瑚赤
  const BLUE = '#1E5799'; // 深い青

  // テスト用のブロック配列を作成する関数
  function createTestBlocks(): Block[][] {
    // 5x5のブロック配列を作成
    const blocks: Block[][] = [];
    for (let y = 0; y < 5; y++) {
      blocks[y] = [];
      for (let x = 0; x < 5; x++) {
        blocks[y][x] = null;
      }
    }
    return blocks;
  }

  // 氷結ブロックLv2のテスト
  it('氷結ブロックLv2は隣接ブロック消去時にLv1に変化する', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.ICE_LV2, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][2] = { x: 2, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 3, 2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックLv2がLv1に変化していることを確認
    expect(updatedBlocks[2][2].type).toBe(BlockType.ICE_LV1);
    expect(updatedBlocks[2][2].color).toBe(RED);
  });

  // 氷結ブロックLv1のテスト
  it('氷結ブロックLv1は隣接ブロック消去時に通常ブロックに変化する', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.ICE_LV1, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][2] = { x: 2, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 3, 2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックLv1が通常ブロックに変化していることを確認
    expect(updatedBlocks[2][2].type).toBe(BlockType.NORMAL);
    expect(updatedBlocks[2][2].color).toBe(RED);
  });

  // 氷結カウンター+ブロックのテスト
  it('氷結カウンター+ブロックは隣接ブロック消去時に通常ブロックに変化する', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.ICE_COUNTER_PLUS, counterValue: 3, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][2] = { x: 2, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 3, 2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結カウンター+ブロックが通常ブロックに変化していることを確認
    expect(updatedBlocks[2][2].type).toBe(BlockType.NORMAL);
    expect(updatedBlocks[2][2].color).toBe(RED);
  });

  // 氷結カウンター-ブロックのテスト
  it('氷結カウンター-ブロックは隣接ブロック消去時に通常ブロックに変化する', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.ICE_COUNTER_MINUS, counterValue: 3, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][2] = { x: 2, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 3, 2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結カウンター-ブロックが通常ブロックに変化していることを確認
    expect(updatedBlocks[2][2].type).toBe(BlockType.NORMAL);
    expect(updatedBlocks[2][2].color).toBe(RED);
  });

  // 異なる色の氷結ブロックのテスト
  it('異なる色の氷結ブロックは変化しない', () => {
    const blocks = createTestBlocks();
    
    // 赤色と青色のブロックを配置
    blocks[2][2] = { x: 2, y: 2, color: BLUE, type: BlockType.ICE_LV2, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][2] = { x: 2, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得（赤色のブロック）
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 3, 2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 青色の氷結ブロックは変化していないことを確認
    expect(updatedBlocks[2][2].type).toBe(BlockType.ICE_LV2);
    expect(updatedBlocks[2][2].color).toBe(BLUE);
  });

  // 複数の氷結ブロックのテスト
  it('複数の氷結ブロックが同時に変化する', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置
    blocks[1][1] = { x: 1, y: 1, color: RED, type: BlockType.ICE_LV2, sprite: null };
    blocks[1][2] = { x: 2, y: 1, color: RED, type: BlockType.ICE_LV1, sprite: null };
    blocks[2][1] = { x: 1, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 2, 2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックが適切に変化していることを確認
    expect(updatedBlocks[1][1].type).toBe(BlockType.ICE_LV1);
    expect(updatedBlocks[1][2].type).toBe(BlockType.NORMAL);
  });
});
