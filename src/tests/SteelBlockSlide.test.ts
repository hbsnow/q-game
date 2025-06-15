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
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
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
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.STEEL);
    
    // d列のブロックはc列に移動するべき
    expect(result[0][2]?.type).toBe(BlockType.NORMAL);
    expect(result[0][2]?.color).toBe('red');
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
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('red');
    expect(result[0][0]).toBeNull();
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[0][2]?.type).toBe(BlockType.STEEL);
    
    // d列のブロックは移動しないべき（c列に鋼鉄ブロックがあるため）
    expect(result[0][3]?.type).toBe(BlockType.NORMAL);
    expect(result[0][3]?.color).toBe('green');
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
});
