import { describe, it, expect } from 'vitest';
import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockAsciiRenderer } from '../utils/BlockAsciiRenderer';

describe('隣接ブロック消去バグのテスト', () => {
  const blockLogic = new BlockLogic();
  const BLUE = '#1E5799'; // 深い青
  const GREEN = '#2E8B57'; // 海緑

  // テスト用のブロック配列を作成する関数
  function createTestBlocks(): Block[][] {
    // 10x10のブロック配列を作成
    const blocks: Block[][] = [];
    for (let y = 0; y < 10; y++) {
      blocks[y] = [];
      for (let x = 0; x < 10; x++) {
        blocks[y][x] = null;
      }
    }
    return blocks;
  }

  // 問題の再現: h1とg1の隣接する青ブロックが正しく消去されない
  it('隣接する同色ブロックが正しく消去される', () => {
    const blocks = createTestBlocks();
    
    // g1とh1に青ブロックを配置
    blocks[1][6] = { x: 6, y: 1, color: BLUE, type: BlockType.NORMAL, sprite: null }; // g1
    blocks[1][7] = { x: 7, y: 1, color: BLUE, type: BlockType.NORMAL, sprite: null }; // h1
    
    // g2にも青ブロックを配置
    blocks[2][6] = { x: 6, y: 2, color: BLUE, type: BlockType.NORMAL, sprite: null }; // g2
    
    // その他のブロックを配置
    blocks[0][0] = { x: 0, y: 0, color: GREEN, type: BlockType.NORMAL, sprite: null };
    blocks[1][0] = { x: 0, y: 1, color: BLUE, type: BlockType.ICE_LV1, sprite: null };
    
    // デバッグ用に初期状態を出力
    console.log("初期状態:");
    BlockAsciiRenderer.logBlocks(blocks, "初期状態");
    
    // h1の位置(7,1)をクリックした場合の隣接ブロック検出
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 7, 1);
    
    // 隣接ブロックの数を確認（g1, h1, g2の3つが検出されるべき）
    expect(connectedBlocks.length).toBe(3);
    
    // 具体的に検出されたブロックの座標を確認
    const coordinates = connectedBlocks.map(block => `(${block.x},${block.y})`).sort();
    expect(coordinates).toContain('(6,1)'); // g1
    expect(coordinates).toContain('(7,1)'); // h1
    expect(coordinates).toContain('(6,2)'); // g2
    
    // ブロック消去処理
    const updatedBlocks = blockLogic.removeBlocks(blocks, connectedBlocks);
    
    // 消去後の状態を出力
    console.log("消去後:");
    BlockAsciiRenderer.logBlocks(updatedBlocks, "消去後");
    
    // 消去されたことを確認
    expect(updatedBlocks[1][6]).toBeNull(); // g1が消去されている
    expect(updatedBlocks[1][7]).toBeNull(); // h1が消去されている
    expect(updatedBlocks[2][6]).toBeNull(); // g2が消去されている
    
    // 重力適用
    const afterGravity = blockLogic.applyGravity(updatedBlocks);
    
    // 重力適用後の状態を出力
    console.log("重力適用後:");
    BlockAsciiRenderer.logBlocks(afterGravity, "重力適用後");
  });
  
  // 複雑なケース: 複数の隣接ブロックが正しく消去されるか
  it('複雑なパターンでも隣接する同色ブロックが正しく消去される', () => {
    const blocks = createTestBlocks();
    
    // L字型の青ブロックパターン
    blocks[1][1] = { x: 1, y: 1, color: BLUE, type: BlockType.NORMAL, sprite: null };
    blocks[1][2] = { x: 2, y: 1, color: BLUE, type: BlockType.NORMAL, sprite: null };
    blocks[1][3] = { x: 3, y: 1, color: BLUE, type: BlockType.NORMAL, sprite: null };
    blocks[2][1] = { x: 1, y: 2, color: BLUE, type: BlockType.NORMAL, sprite: null };
    blocks[3][1] = { x: 1, y: 3, color: BLUE, type: BlockType.NORMAL, sprite: null };
    
    // 別の色のブロックも配置
    blocks[2][2] = { x: 2, y: 2, color: GREEN, type: BlockType.NORMAL, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: GREEN, type: BlockType.NORMAL, sprite: null };
    
    // デバッグ用に初期状態を出力
    console.log("複雑なパターン - 初期状態:");
    BlockAsciiRenderer.logBlocks(blocks, "複雑なパターン - 初期状態");
    
    // (1,1)の位置をクリックした場合の隣接ブロック検出
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    
    // 隣接ブロックの数を確認（L字型の5つが検出されるべき）
    expect(connectedBlocks.length).toBe(5);
    
    // ブロック消去処理
    const updatedBlocks = blockLogic.removeBlocks(blocks, connectedBlocks);
    
    // 消去後の状態を出力
    console.log("複雑なパターン - 消去後:");
    BlockAsciiRenderer.logBlocks(updatedBlocks, "複雑なパターン - 消去後");
    
    // 消去されたことを確認
    expect(updatedBlocks[1][1]).toBeNull();
    expect(updatedBlocks[1][2]).toBeNull();
    expect(updatedBlocks[1][3]).toBeNull();
    expect(updatedBlocks[2][1]).toBeNull();
    expect(updatedBlocks[3][1]).toBeNull();
    
    // 緑ブロックは消去されていないことを確認
    expect(updatedBlocks[2][2]).not.toBeNull();
    expect(updatedBlocks[2][3]).not.toBeNull();
    
    // 重力適用
    const afterGravity = blockLogic.applyGravity(updatedBlocks);
    
    // 重力適用後の状態を出力
    console.log("複雑なパターン - 重力適用後:");
    BlockAsciiRenderer.logBlocks(afterGravity, "複雑なパターン - 重力適用後");
  });
});
