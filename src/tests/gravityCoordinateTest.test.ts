import { describe, it, expect } from 'vitest';
import { GravityProcessor } from '@/utils/GravityProcessor';
import { Block } from '@/types';

describe('GravityProcessor Coordinate System Tests', () => {
  /**
   * 座標系の基本テスト
   * y=0が上、y=13が下であることを確認
   */
  it('should maintain correct coordinate system (y=0 is top, y=13 is bottom)', () => {
    // 上部（y=0）と下部（y=13）にブロックを配置
    const blocks: Block[] = [
      { id: 'top', type: 'normal', color: 'lightBlue', x: 0, y: 0 },    // 上部
      { id: 'bottom', type: 'normal', color: 'coralRed', x: 0, y: 13 }  // 下部
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    // 重力処理後、上部のブロックは下に落ちるべき
    const topBlock = result.blocks.find(b => b.id === 'top');
    const bottomBlock = result.blocks.find(b => b.id === 'bottom');
    
    expect(topBlock?.y).toBe(12); // 上部のブロックは下から2番目に
    expect(bottomBlock?.y).toBe(13); // 下部のブロックは最下部に残る
  });

  /**
   * 複数ブロックの落下順序テスト
   */
  it('should maintain correct falling order', () => {
    // 縦一列に3つのブロックを配置（間に空きあり）
    const blocks: Block[] = [
      { id: 'block1', type: 'normal', color: 'lightBlue', x: 0, y: 0 },  // 最上部
      { id: 'block2', type: 'normal', color: 'coralRed', x: 0, y: 5 },   // 中間
      { id: 'block3', type: 'normal', color: 'sandGold', x: 0, y: 10 }   // 下部
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    // 重力処理後の位置を確認
    const block1 = result.blocks.find(b => b.id === 'block1');
    const block2 = result.blocks.find(b => b.id === 'block2');
    const block3 = result.blocks.find(b => b.id === 'block3');
    
    // 下から順に詰まって配置されるべき
    expect(block3?.y).toBe(13); // 最下部
    expect(block2?.y).toBe(12); // 下から2番目
    expect(block1?.y).toBe(11); // 下から3番目
    
    // 元の順序が保たれているかも確認
    expect(block1?.y).toBeLessThan(block2?.y!);
    expect(block2?.y).toBeLessThan(block3?.y!);
  });

  /**
   * 空きスペースの検出テスト
   */
  it('should correctly identify empty positions after gravity', () => {
    const blocks: Block[] = [
      { id: 'block1', type: 'normal', color: 'lightBlue', x: 0, y: 0 },
      { id: 'block2', type: 'normal', color: 'coralRed', x: 0, y: 10 }
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    // 空きポジションは上部に集まるべき
    const emptyPositions = result.emptyPositions.filter(p => p.x === 0);
    
    // y=0からy=11までが空きになるべき
    expect(emptyPositions.length).toBe(12);
    expect(emptyPositions.every(p => p.y <= 11)).toBe(true);
  });

  /**
   * 移動情報の正確性テスト
   */
  it('should provide correct movement information', () => {
    const blocks: Block[] = [
      { id: 'moving', type: 'normal', color: 'lightBlue', x: 0, y: 5 }
    ];

    const result = GravityProcessor.applyGravity(blocks);
    
    expect(result.movements).toHaveLength(1);
    const movement = result.movements[0];
    
    expect(movement.blockId).toBe('moving');
    expect(movement.from).toEqual({ x: 0, y: 5 });
    expect(movement.to).toEqual({ x: 0, y: 13 });
    expect(movement.distance).toBe(8);
  });
});

/**
 * GameSceneとの統合テスト
 */
describe('GameScene Gravity Integration Tests', () => {
  /**
   * 視覚的位置と論理的位置の一致テスト
   */
  it('should maintain visual-logical position consistency', () => {
    // このテストは実際のGameSceneの動作をモックして検証
    const initialBlocks: Block[] = [
      { id: 'test1', type: 'normal', color: 'lightBlue', x: 0, y: 0 },
      { id: 'test2', type: 'normal', color: 'coralRed', x: 0, y: 5 }
    ];

    const gravityResult = GravityProcessor.applyGravity(initialBlocks);
    
    // 重力処理後のブロック位置を検証
    const test1 = gravityResult.blocks.find(b => b.id === 'test1');
    const test2 = gravityResult.blocks.find(b => b.id === 'test2');
    
    // 論理的位置の確認
    expect(test2?.y).toBe(13); // 下部
    expect(test1?.y).toBe(12); // その上
    
    // 視覚的位置の計算（GameSceneと同じ計算式）
    const BOARD_OFFSET_Y = 75;
    const BLOCK_SIZE = 40;
    
    const test1VisualY = BOARD_OFFSET_Y + test1!.y * BLOCK_SIZE + BLOCK_SIZE / 2;
    const test2VisualY = BOARD_OFFSET_Y + test2!.y * BLOCK_SIZE + BLOCK_SIZE / 2;
    
    // 視覚的にも正しい順序になっているか確認
    expect(test1VisualY).toBeLessThan(test2VisualY); // test1が上、test2が下
  });
});
