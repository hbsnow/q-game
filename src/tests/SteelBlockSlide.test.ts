import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block, BlockType } from '../types/Block';

describe('Steel blocks horizontal slide behavior', () => {
  const blockLogic = new BlockLogic();
  
  it('Steel blocks should not slide horizontally when their column is not empty', () => {
    // 初期配置: 鋼鉄ブロックがある列の左に空の列がある
    const blocks: (Block | null)[][] = [
      [null, null, null, null],
      [null, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // 鋼鉄ブロックは左に移動するべき
    expect(result[1][0]?.type).toBe(BlockType.STEEL);
    expect(result[1][0]?.x).toBe(0);
    expect(result[1][0]?.y).toBe(1);
  });
  
  it('Columns with steel blocks should be considered non-empty', () => {
    // 初期配置: 鋼鉄ブロックがある列の右に通常ブロックがある
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'blue', type: BlockType.STEEL, sprite: null }, null, { x: 3, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    // c列が空なので、d列のブロックがc列に移動するはず
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // 鋼鉄ブロックは左に移動するべき
    expect(result[0][0]?.type).toBe(BlockType.STEEL);
    
    // d列のブロックはc列に移動するべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('red');
    expect(result[0][2]).toBeNull();
    expect(result[0][3]).toBeNull();
  });
  
  it('Blocks should slide around steel blocks', () => {
    // 初期配置: 鋼鉄ブロックの列を挟んで通常ブロックがある
    const blocks: (Block | null)[][] = [
      [{ x: 0, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, null, { x: 2, y: 0, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 3, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null }],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    // b列が空なので、a列のブロックがb列に移動するはず
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // a列のブロックはb列に移動するべき
    expect(result[0][0]?.type).toBe(BlockType.NORMAL);
    expect(result[0][0]?.color).toBe('red');
    
    // 鋼鉄ブロックは左に移動するべき
    expect(result[0][1]?.type).toBe(BlockType.STEEL);
    
    // d列のブロックは移動するべき
    expect(result[0][2]?.type).toBe(BlockType.NORMAL);
    expect(result[0][2]?.color).toBe('green');
    expect(result[0][3]).toBeNull();
  });
  
  it('Steel blocks should slide with their column when all columns to the left are empty', () => {
    // 初期配置: 鋼鉄ブロックの左の列がすべて空
    const blocks: (Block | null)[][] = [
      [null, null, { x: 2, y: 0, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 3, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // 鋼鉄ブロックは左に移動するべき
    expect(result[0][0]?.type).toBe(BlockType.STEEL);
    expect(result[0][0]?.x).toBe(0);
    
    // d列のブロックもa列の次に移動するべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('red');
    expect(result[0][1]?.x).toBe(1);
  });
  
  it('Blocks above steel blocks should move with them during horizontal slide', () => {
    // 初期配置: 鋼鉄ブロックの上に通常ブロックがあり、左の列がすべて空
    const blocks: (Block | null)[][] = [
      [null, null, { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, null],
      [null, null, { x: 2, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, null],
      [null, null, null, null],
      [null, null, null, null]
    ];
    
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // 鋼鉄ブロックは左に移動するべき
    expect(result[1][0]?.type).toBe(BlockType.STEEL);
    expect(result[1][0]?.x).toBe(0);
    
    // 鋼鉄ブロックの上のブロックも一緒に移動するべき
    expect(result[0][0]?.type).toBe(BlockType.NORMAL);
    expect(result[0][0]?.color).toBe('red');
    expect(result[0][0]?.x).toBe(0);
  });
  
  it('Steel blocks should prevent columns from sliding when they are in the middle', () => {
    // 仕様例: 鋼鉄ブロックは固定位置に留まる
    const blocks: (Block | null)[][] = [
      [{ x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 2, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }]
    ];
    
    // b0の赤ブロックをタップすると、b列の赤ブロックが全て消去される想定
    blocks[0][1] = null;
    blocks[2][1] = null;
    blocks[3][1] = null;
    
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // c列とd列のブロックは左にスライドしない
    expect(result[0][2]?.color).toBe('red');
    expect(result[0][3]?.color).toBe('yellow');
  });
  
  it('Steel blocks should prevent columns from sliding when they are at the edge', () => {
    // 仕様例: 鋼鉄ブロックの右隣にブロックがある場合にはその列より右にあるブロックは左側にスライドされない
    const blocks: (Block | null)[][] = [
      [{ x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 2, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }]
    ];
    
    // c列のブロックをすべて消去した場合
    blocks[0][2] = null;
    blocks[1][2] = null;
    blocks[2][2] = null;
    blocks[3][2] = null;
    
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // d列のブロックはc列に移動するべき
    expect(result[0][2]?.color).toBe('yellow');
    expect(result[1][2]?.color).toBe('yellow');
    expect(result[2][2]?.color).toBe('yellow');
    expect(result[3][2]?.color).toBe('red');
    
    // d列は空になるべき
    expect(result[0][3]).toBeNull();
    expect(result[1][3]).toBeNull();
    expect(result[2][3]).toBeNull();
    expect(result[3][3]).toBeNull();
  });
  
  it('Multiple steel blocks should maintain their relative positions', () => {
    // 仕様例: 複数の鋼鉄ブロックがあっても、それぞれが固定位置に留まる
    const blocks: (Block | null)[][] = [
      [{ x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 1, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }]
    ];
    
    // b列の赤ブロックをすべて消去した場合
    blocks[0][1] = null;
    blocks[1][1] = null;
    blocks[2][1] = null;
    blocks[3][1] = null;
    
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // 両方の鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][0]?.type).toBe(BlockType.STEEL);
    expect(result[1][0]?.x).toBe(0);
    expect(result[1][0]?.y).toBe(1);
    
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // c列とd列のブロックは左にスライドするべき
    expect(result[0][2]?.color).toBe('yellow');
    expect(result[1][2]?.color).toBe('yellow');
    expect(result[2][2]?.color).toBe('yellow');
    expect(result[3][2]?.color).toBe('red');
  });
  
  it('Steel blocks with blocks above them should maintain their positions during horizontal slide', () => {
    // 仕様例: 鋼鉄ブロックの上にある緑ブロックは固定位置に留まる
    const blocks: (Block | null)[][] = [
      [{ x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 2, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }]
    ];
    
    // c列のブロックをすべて消去した場合
    blocks[0][2] = null;
    blocks[1][2] = null;
    blocks[2][2] = null;
    blocks[3][2] = null;
    
    const result = blockLogic.applyHorizontalSlide(blocks);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // 鋼鉄ブロックの上の緑ブロックも元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('green');
    expect(result[0][1]?.x).toBe(1);
    expect(result[0][1]?.y).toBe(0);
    
    // d列のブロックはc列に移動するべき
    expect(result[0][2]?.color).toBe('yellow');
    expect(result[1][2]?.color).toBe('yellow');
    expect(result[2][2]?.color).toBe('yellow');
    expect(result[3][2]?.color).toBe('red');
  });
});
