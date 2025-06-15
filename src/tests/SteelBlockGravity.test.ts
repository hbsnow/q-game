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
  
  it('Steel blocks should keep blocks above them fixed even when adjacent blocks are removed', () => {
    // 仕様例: 鋼鉄ブロックの上にあるブロックは固定位置に留まる
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 2, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }]
    ];
    
    // c0の赤ブロックをタップすると、隣接する赤ブロック全てが消去される想定
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[0][2] = null;
    blocksAfterRemoval[1][2] = null;
    blocksAfterRemoval[2][1] = null;
    blocksAfterRemoval[2][2] = null;
    blocksAfterRemoval[3][1] = null;
    blocksAfterRemoval[3][3] = null;
    
    const result = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // 鋼鉄ブロックの上のブロックも元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('green');
    expect(result[0][1]?.x).toBe(1);
    expect(result[0][1]?.y).toBe(0);
    
    // 他のブロックは落下するべき
    expect(result[2][3]?.type).toBe(BlockType.NORMAL);
    expect(result[2][3]?.color).toBe('yellow');
    expect(result[3][3]?.type).toBe(BlockType.NORMAL);
    expect(result[3][3]?.color).toBe('yellow');
  });
  
  it('Steel blocks with blocks above them should maintain their positions when adjacent blocks are removed', () => {
    // 仕様例: 鋼鉄ブロックの上にある緑ブロックは固定位置に留まる
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 2, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }]
    ];
    
    // c0の赤ブロックをタップすると、c0、c1、c2、b2、b3の赤ブロックが消去される想定
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[0][2] = null;
    blocksAfterRemoval[1][2] = null;
    blocksAfterRemoval[2][2] = null;
    
    const result = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // 鋼鉄ブロックの上の緑ブロックも元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('green');
    expect(result[0][1]?.x).toBe(1);
    expect(result[0][1]?.y).toBe(0);
    
    // 他のブロックは落下するべき
    expect(result[0][2]).toBeNull(); // c列は空になる
    expect(result[1][2]).toBeNull();
    expect(result[2][2]).toBeNull();
    
    // d列のブロックは落下するべき
    expect(result[1][3]?.color).toBe('yellow');
    expect(result[2][3]?.color).toBe('yellow');
    expect(result[3][3]?.color).toBe('red');
  });
  
  it('Multiple steel blocks should all maintain their positions when blocks are removed', () => {
    // 仕様例: 複数の鋼鉄ブロックがあっても、それぞれが固定位置に留まる
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [{ x: 0, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 1, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }]
    ];
    
    // b列の赤ブロックをすべて消去した場合を想定
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[1][1] = null;
    
    const result = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 両方の鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][0]?.type).toBe(BlockType.STEEL);
    expect(result[1][0]?.x).toBe(0);
    expect(result[1][0]?.y).toBe(1);
    
    expect(result[1][2]?.type).toBe(BlockType.STEEL);
    expect(result[1][2]?.x).toBe(2);
    expect(result[1][2]?.y).toBe(1);
    
    // b列のブロックは落下するべき
    // 消去されたブロックの位置は空になり、上のブロックが落下する
    expect(result[1][1]?.color).toBe('blue'); // 上のブロックが落下
    expect(result[2][1]?.color).toBe('blue');
    expect(result[3][1]?.color).toBe('yellow');
  });
  
  it('Steel blocks should never let blocks pass through them', () => {
    // 仕様例: 鋼鉄はいかなる場合でも上に乗っているブロックを貫通させることはない
    const blocks: (Block | null)[][] = [
      [null, { x: 1, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 1, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 2, y: 1, color: 'blue', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, { x: 1, y: 2, color: 'blue', type: BlockType.STEEL, sprite: null }, { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }],
      [null, null, { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null }, { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }]
    ];
    
    const result = blockLogic.applyGravity(blocks);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[2][1]?.type).toBe(BlockType.STEEL);
    expect(result[2][1]?.x).toBe(1);
    expect(result[2][1]?.y).toBe(2);
    
    // 鋼鉄ブロックの上のブロックも元の位置に留まるべき
    expect(result[0][1]?.color).toBe('green');
    expect(result[1][1]?.color).toBe('blue');
    
    // 他の列のブロックは落下するべき
    expect(result[1][2]?.color).toBe('blue');
    expect(result[2][2]?.color).toBe('red');
    expect(result[3][2]?.color).toBe('yellow');
  });
});
