import { describe, it, expect } from 'vitest';
import { GravityProcessor } from '@/utils/GravityProcessor';
import { Block } from '@/types';

/**
 * 重力処理の統合テスト
 * このテストは実際のゲーム動作で発生した問題を防ぐためのものです
 */
describe('Gravity Integration Tests', () => {
  /**
   * 基本的な重力処理テスト
   */
  it('should apply gravity correctly', () => {
    const blocks: Block[] = [
      { id: 'top', type: 'normal', color: 'lightBlue', x: 0, y: 0 },
      { id: 'bottom', type: 'normal', color: 'coralRed', x: 0, y: 13 }
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    // 結果の検証
    expect(result.blocks).toHaveLength(2);
    expect(result.movements).toHaveLength(2);
    
    const topBlock = result.blocks.find(b => b.id === 'top');
    const bottomBlock = result.blocks.find(b => b.id === 'bottom');
    
    // 重力処理後の位置確認
    expect(topBlock?.y).toBe(13); // 最下部
    expect(bottomBlock?.y).toBe(12); // 下から2番目
  });

  /**
   * 複数列での重力処理テスト
   */
  it('should handle multiple columns correctly', () => {
    const blocks: Block[] = [
      // 列0
      { id: 'col0-top', type: 'normal', color: 'lightBlue', x: 0, y: 0 },
      { id: 'col0-bottom', type: 'normal', color: 'coralRed', x: 0, y: 10 },
      // 列1
      { id: 'col1-middle', type: 'normal', color: 'sandGold', x: 1, y: 5 },
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    // 列0の確認
    const col0Blocks = result.blocks.filter(b => b.x === 0).sort((a, b) => b.y - a.y);
    expect(col0Blocks[0].y).toBe(13); // 最下部
    expect(col0Blocks[1].y).toBe(12); // 下から2番目
    
    // 列1の確認
    const col1Block = result.blocks.find(b => b.x === 1);
    expect(col1Block?.y).toBe(13); // 最下部
  });

  /**
   * 空きスペースの検出テスト
   */
  it('should correctly identify empty positions', () => {
    const blocks: Block[] = [
      { id: 'single', type: 'normal', color: 'lightBlue', x: 0, y: 5 }
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    // ブロックは最下部に移動
    const block = result.blocks[0];
    expect(block.y).toBe(13);
    
    // 空きポジションの確認（列0のy=0からy=12まで）
    const col0EmptyPositions = result.emptyPositions.filter(p => p.x === 0);
    expect(col0EmptyPositions).toHaveLength(13); // y=0からy=12まで
    expect(col0EmptyPositions.every(p => p.y <= 12)).toBe(true);
  });

  /**
   * 移動距離の計算テスト
   */
  it('should calculate movement distances correctly', () => {
    const blocks: Block[] = [
      { id: 'far', type: 'normal', color: 'lightBlue', x: 0, y: 0 },   // 13マス移動
      { id: 'near', type: 'normal', color: 'coralRed', x: 0, y: 11 },  // 1マス移動
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    const farMovement = result.movements.find(m => m.blockId === 'far');
    const nearMovement = result.movements.find(m => m.blockId === 'near');
    
    expect(farMovement?.distance).toBe(13);
    expect(nearMovement?.distance).toBe(1); // y=11 → y=12 (1マス移動)
  });

  /**
   * 鋼鉄ブロック（固定ブロック）のテスト
   */
  it('should handle steel blocks correctly', () => {
    const blocks: Block[] = [
      { id: 'normal', type: 'normal', color: 'lightBlue', x: 0, y: 0 },
      { id: 'steel', type: 'steel', color: 'lightBlue', x: 0, y: 10 },
      { id: 'normal2', type: 'normal', color: 'coralRed', x: 0, y: 5 },
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    const steelBlock = result.blocks.find(b => b.id === 'steel');
    const normalBlocks = result.blocks.filter(b => b.type === 'normal').sort((a, b) => b.y - a.y);
    
    // 鋼鉄ブロックは移動しない
    expect(steelBlock?.y).toBe(10);
    
    // 通常ブロックは鋼鉄ブロックの下に配置される
    expect(normalBlocks[0].y).toBe(13); // 最下部
    expect(normalBlocks[1].y).toBe(12); // 下から2番目
  });

  /**
   * 座標系の一貫性テスト
   * このテストは上下反転問題を防ぐためのものです
   */
  it('should maintain coordinate system consistency', () => {
    // 明確に上下の位置関係があるブロック配置
    const blocks: Block[] = [
      { id: 'definitely-top', type: 'normal', color: 'lightBlue', x: 0, y: 0 },
      { id: 'definitely-middle', type: 'normal', color: 'coralRed', x: 0, y: 7 },
      { id: 'definitely-bottom', type: 'normal', color: 'sandGold', x: 0, y: 13 },
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    // 重力処理後の位置を取得
    const topBlock = result.blocks.find(b => b.id === 'definitely-top');
    const middleBlock = result.blocks.find(b => b.id === 'definitely-middle');
    const bottomBlock = result.blocks.find(b => b.id === 'definitely-bottom');
    
    // 下から順に配置されることを確認
    expect(topBlock?.y).toBe(13);    // 最下部（配列の最初）
    expect(middleBlock?.y).toBe(12); // 下から2番目
    expect(bottomBlock?.y).toBe(11); // 下から3番目
    
    // 視覚的位置の計算（GameSceneと同じ計算）
    const BOARD_OFFSET_Y = 75;
    const BLOCK_SIZE = 40;
    
    const topVisualY = BOARD_OFFSET_Y + topBlock!.y * BLOCK_SIZE + BLOCK_SIZE / 2;
    const middleVisualY = BOARD_OFFSET_Y + middleBlock!.y * BLOCK_SIZE + BLOCK_SIZE / 2;
    const bottomVisualY = BOARD_OFFSET_Y + bottomBlock!.y * BLOCK_SIZE + BLOCK_SIZE / 2;
    
    // 視覚的位置の順序確認（大きいY座標ほど画面下部）
    expect(topVisualY).toBeGreaterThan(middleVisualY);
    expect(middleVisualY).toBeGreaterThan(bottomVisualY);
  });
});
