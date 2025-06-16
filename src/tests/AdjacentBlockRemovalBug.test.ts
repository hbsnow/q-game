import { describe, it, expect, beforeEach } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block, BlockType } from '../types/Block';

describe('BlockLogic - removeBlocks', () => {
  let blockLogic: BlockLogic;
  let blocks: Block[][];
  
  // テスト用の色定数
  const RED = '#FF0000';
  const BLUE = '#0000FF';
  const GREEN = '#00FF00';
  const YELLOW = '#FFFF00';
  
  beforeEach(() => {
    // 各テスト前にBlockLogicインスタンスを初期化
    blockLogic = new BlockLogic();
    
    // テスト用のブロック配列を初期化
    blocks = [
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null]
    ];
  });
  
  it('指定したブロックを正しく消去する', () => {
    // テスト用のブロック配置
    // R R B
    // R B B
    // G Y G
    blocks[0][0] = { x: 0, y: 0, color: RED, type: BlockType.NORMAL };
    blocks[0][1] = { x: 1, y: 0, color: RED, type: BlockType.NORMAL };
    blocks[0][2] = { x: 2, y: 0, color: BLUE, type: BlockType.NORMAL };
    blocks[1][0] = { x: 0, y: 1, color: RED, type: BlockType.NORMAL };
    blocks[1][1] = { x: 1, y: 1, color: BLUE, type: BlockType.NORMAL };
    blocks[1][2] = { x: 2, y: 1, color: BLUE, type: BlockType.NORMAL };
    blocks[2][0] = { x: 0, y: 2, color: GREEN, type: BlockType.NORMAL };
    blocks[2][1] = { x: 1, y: 2, color: YELLOW, type: BlockType.NORMAL };
    blocks[2][2] = { x: 2, y: 2, color: GREEN, type: BlockType.NORMAL };
    
    // 赤ブロックを消去
    const redBlocks = [blocks[0][0], blocks[0][1], blocks[1][0]];
    const updatedBlocks = blockLogic.removeBlocks(blocks, redBlocks);
    
    // 赤ブロックが消去されていることを確認
    expect(updatedBlocks[0][0]).toBeNull();
    expect(updatedBlocks[0][1]).toBeNull();
    expect(updatedBlocks[1][0]).toBeNull();
    
    // 他のブロックは残っていることを確認
    expect(updatedBlocks[0][2]?.color).toBe(BLUE);
    expect(updatedBlocks[1][1]?.color).toBe(BLUE);
    expect(updatedBlocks[1][2]?.color).toBe(BLUE);
    expect(updatedBlocks[2][0]?.color).toBe(GREEN);
    expect(updatedBlocks[2][1]?.color).toBe(YELLOW);
    expect(updatedBlocks[2][2]?.color).toBe(GREEN);
  });
  
  it('隣接する同色ブロックを全て消去する', () => {
    // テスト用のブロック配置
    // R R B
    // R B B
    // G Y G
    blocks[0][0] = { x: 0, y: 0, color: RED, type: BlockType.NORMAL };
    blocks[0][1] = { x: 1, y: 0, color: RED, type: BlockType.NORMAL };
    blocks[0][2] = { x: 2, y: 0, color: BLUE, type: BlockType.NORMAL };
    blocks[1][0] = { x: 0, y: 1, color: RED, type: BlockType.NORMAL };
    blocks[1][1] = { x: 1, y: 1, color: BLUE, type: BlockType.NORMAL };
    blocks[1][2] = { x: 2, y: 1, color: BLUE, type: BlockType.NORMAL };
    blocks[2][0] = { x: 0, y: 2, color: GREEN, type: BlockType.NORMAL };
    blocks[2][1] = { x: 1, y: 2, color: YELLOW, type: BlockType.NORMAL };
    blocks[2][2] = { x: 2, y: 2, color: GREEN, type: BlockType.NORMAL };
    
    // 隣接する赤ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 隣接する赤ブロックを消去
    const updatedBlocks = blockLogic.removeBlocks(blocks, connectedBlocks);
    
    // 赤ブロックが消去されていることを確認
    expect(updatedBlocks[0][0]).toBeNull();
    expect(updatedBlocks[0][1]).toBeNull();
    expect(updatedBlocks[1][0]).toBeNull();
    
    // 他のブロックは残っていることを確認
    expect(updatedBlocks[0][2]?.color).toBe(BLUE);
    expect(updatedBlocks[1][1]?.color).toBe(BLUE);
    expect(updatedBlocks[1][2]?.color).toBe(BLUE);
    expect(updatedBlocks[2][0]?.color).toBe(GREEN);
    expect(updatedBlocks[2][1]?.color).toBe(YELLOW);
    expect(updatedBlocks[2][2]?.color).toBe(GREEN);
  });
  
  it('範囲外のブロック指定を安全に処理する', () => {
    // テスト用のブロック配置
    blocks[0][0] = { x: 0, y: 0, color: RED, type: BlockType.NORMAL };
    
    // 範囲外の座標を含むブロック配列
    const invalidBlocks = [
      { x: -1, y: 0, color: RED, type: BlockType.NORMAL },
      { x: 0, y: -1, color: RED, type: BlockType.NORMAL },
      { x: 10, y: 0, color: RED, type: BlockType.NORMAL },
      { x: 0, y: 10, color: RED, type: BlockType.NORMAL }
    ];
    
    // エラーが発生しないことを確認
    expect(() => {
      blockLogic.removeBlocks(blocks, invalidBlocks);
    }).not.toThrow();
    
    // 有効なブロックは残っていることを確認
    const updatedBlocks = blockLogic.removeBlocks(blocks, invalidBlocks);
    expect(updatedBlocks[0][0]?.color).toBe(RED);
  });
  
  it('元のブロック配列が変更されないことを確認', () => {
    // テスト用のブロック配置
    blocks[0][0] = { x: 0, y: 0, color: RED, type: BlockType.NORMAL };
    blocks[0][1] = { x: 1, y: 0, color: RED, type: BlockType.NORMAL };
    
    // ブロックを消去
    const blocksToRemove = [blocks[0][0]];
    const originalBlocks = JSON.parse(JSON.stringify(blocks));
    
    blockLogic.removeBlocks(blocks, blocksToRemove);
    
    // 元の配列が変更されていないことを確認
    expect(blocks).toEqual(originalBlocks);
  });
  
  it('複雑なパターンでも正しく消去する', () => {
    // テスト用のブロック配置 (L字型の青ブロック)
    // R B B
    // R B G
    // B B B
    blocks[0][0] = { x: 0, y: 0, color: RED, type: BlockType.NORMAL };
    blocks[0][1] = { x: 1, y: 0, color: BLUE, type: BlockType.NORMAL };
    blocks[0][2] = { x: 2, y: 0, color: BLUE, type: BlockType.NORMAL };
    blocks[1][0] = { x: 0, y: 1, color: RED, type: BlockType.NORMAL };
    blocks[1][1] = { x: 1, y: 1, color: BLUE, type: BlockType.NORMAL };
    blocks[1][2] = { x: 2, y: 1, color: GREEN, type: BlockType.NORMAL };
    blocks[2][0] = { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL };
    blocks[2][1] = { x: 1, y: 2, color: BLUE, type: BlockType.NORMAL };
    blocks[2][2] = { x: 2, y: 2, color: BLUE, type: BlockType.NORMAL };
    
    // 隣接する青ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
    
    // 隣接する青ブロックを消去
    const updatedBlocks = blockLogic.removeBlocks(blocks, connectedBlocks);
    
    // 青ブロックが消去されていることを確認
    expect(updatedBlocks[0][1]).toBeNull();
    expect(updatedBlocks[0][2]).toBeNull();
    expect(updatedBlocks[1][1]).toBeNull();
    expect(updatedBlocks[2][0]).toBeNull();
    expect(updatedBlocks[2][1]).toBeNull();
    expect(updatedBlocks[2][2]).toBeNull();
    
    // 他のブロックは残っていることを確認
    expect(updatedBlocks[0][0]?.color).toBe(RED);
    expect(updatedBlocks[1][0]?.color).toBe(RED);
    expect(updatedBlocks[1][2]?.color).toBe(GREEN);
  });
});
