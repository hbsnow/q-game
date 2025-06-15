import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block, BlockType } from '../types/Block';

describe('Steel blocks gravity behavior', () => {
  const blockLogic = new BlockLogic();
  
  it('Steel blocks should remain fixed during gravity', () => {
    // 初期配置: 鋼鉄ブロックが中央にある
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, null, null],
      [null, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    const result = blockLogic.applyGravity(blocks);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
  });
  
  it('Blocks above steel blocks should also remain fixed', () => {
    // 初期配置: 鋼鉄ブロックの上に通常ブロックがある
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, null, null],
      [null, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    const result = blockLogic.applyGravity(blocks);
    
    // 鋼鉄ブロックの上のブロックも元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.x).toBe(1);
    expect(result[0][1]?.y).toBe(0);
    
    // 鋼鉄ブロックも元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
  });
  
  it('Normal blocks should fall around steel blocks', () => {
    // 初期配置: 鋼鉄ブロックの横に通常ブロックがあり、下に空白がある
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null }, null],
      [null, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    const result = blockLogic.applyGravity(blocks);
    
    // 鋼鉄ブロックの上のブロックは元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('red');
    
    // 鋼鉄ブロックの横のブロックは落下するべき
    expect(result[3][2]?.type).toBe(BlockType.NORMAL);
    expect(result[3][2]?.color).toBe('green');
  });
  
  it('Steel blocks should not move when blocks below are removed', () => {
    // 初期配置: 鋼鉄ブロックの下に通常ブロックがある
    const blocks: (Block | null)[][] = [
      [null, null, null, null],
      [null, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, null, null],
      [null, { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, null, null],
      [null, null, null, null]
    ];
    
    // 下のブロックを消去
    blocks[2][1] = null;
    
    const result = blockLogic.applyGravity(blocks);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
  });
  
  it('Multiple steel blocks should all remain fixed', () => {
    // 初期配置: 複数の鋼鉄ブロックがある
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, null, null],
      [{ x: 0, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, null, { x: 2, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    const result = blockLogic.applyGravity(blocks);
    
    // 両方の鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][0]?.type).toBe(BlockType.STEEL);
    expect(result[1][0]?.x).toBe(0);
    expect(result[1][0]?.y).toBe(1);
    
    expect(result[1][2]?.type).toBe(BlockType.STEEL);
    expect(result[1][2]?.x).toBe(2);
    expect(result[1][2]?.y).toBe(1);
    
    // 通常ブロックは落下するべき
    expect(result[3][1]?.type).toBe(BlockType.NORMAL);
  });
});
