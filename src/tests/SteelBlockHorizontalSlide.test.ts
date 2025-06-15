import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block, BlockType } from '../types/Block';

describe('Steel block horizontal slide behavior according to specifications', () => {
  const blockLogic = new BlockLogic();
  
  it('Steel blocks should remain fixed and prevent columns from sliding', () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __R __R __Y |
    // 1 | __Y __R <-> __Y |
    // 2 | __B __R __R __Y |
    // 3 | __Y __R __Y __R |
    //   +-----------------+
    // c1に鋼鉄ブロック<->がある
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null },
        { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }
      ]
    ];

    // ユーザーがc0をタップ:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __R     __Y |
    // 1 | __Y __R <-> __Y |
    // 2 | __B __R     __Y |
    // 3 | __Y __R __Y __R |
    //   +-----------------+
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[0][2] = null;
    blocksAfterRemoval[2][2] = null;
    
    // 重力適用後
    const afterGravity = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 横スライド適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __R __Y     |
    // 1 | __Y __R <-> __Y |
    // 2 | __B __R __Y     |
    // 3 | __Y __R __R     |
    //   +-----------------+
    // 鋼鉄ブロックは重力の影響を受けず、元の位置に留まる
    // 鋼鉄ブロックの右にブロックがある場合にはその列より右にあるブロックは左側にスライドされない
    // 鋼鉄ブロックより下にあるブロックはスライドする
    const result = blockLogic.applyHorizontalSlide(afterGravity);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][2]?.type).toBe(BlockType.STEEL);
    expect(result[1][2]?.x).toBe(2);
    expect(result[1][2]?.y).toBe(1);
    
    // d列のブロックはc列に移動するべき
    expect(result[0][3]).toBeNull();
    expect(result[1][3]).toBeNull();
    expect(result[2][3]).toBeNull();
    expect(result[3][3]).toBeNull();
  });

  it('Steel blocks should prevent columns from sliding when they are in the middle', () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __R __R __Y |
    // 1 | __Y <-> __R __Y |
    // 2 | __B __R __R __Y |
    // 3 | __Y __R __Y __R |
    //   +-----------------+
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null },
        { x: 2, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }
      ]
    ];

    // b0の赤ブロックをタップすると、b列の赤ブロックが全て消去される想定
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B     __R __Y |
    // 1 | __Y <-> __R __Y |
    // 2 | __B     __R __Y |
    // 3 | __Y     __Y __R |
    //   +-----------------+
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[0][1] = null;
    blocksAfterRemoval[2][1] = null;
    blocksAfterRemoval[3][1] = null;
    
    // 重力適用後
    const afterGravity = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 横スライド適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B     __Y     |
    // 1 | __Y <-> __Y     |
    // 2 | __B     __Y     |
    // 3 | __Y __Y __R     |
    //   +-----------------+
    // 鋼鉄ブロックは固定位置に留まる
    // 鋼鉄ブロックの右隣にブロックがないので、cとd列が左にスライドする
    const result = blockLogic.applyHorizontalSlide(afterGravity);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // c列とd列のブロックは左にスライドしない
    expect(result[0][2]?.color).toBe('red');
    expect(result[0][3]?.color).toBe('yellow');
  });

  it('Steel blocks should allow columns to slide when they are not in the way', () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G __R __Y |
    // 1 | __Y <-> __R __Y |
    // 2 | __B __R __R __Y |
    // 3 | __Y __R __Y __R |
    //   +-----------------+
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null },
        { x: 2, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }
      ]
    ];

    // c列のブロックをすべて消去した場合
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G     __Y |
    // 1 | __Y <->     __Y |
    // 2 | __B __R     __Y |
    // 3 | __Y __R     __R |
    //   +-----------------+
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[0][2] = null;
    blocksAfterRemoval[1][2] = null;
    blocksAfterRemoval[2][2] = null;
    blocksAfterRemoval[3][2] = null;
    
    // 重力適用後
    const afterGravity = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 横スライド適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G __Y     |
    // 1 | __Y <-> __Y     |
    // 2 | __B __R __Y     |
    // 3 | __Y __R __R     |
    //   +-----------------+
    // ポイント: d 列のブロックが c 列に移動しますが、鋼鉄ブロックがある b 列は移動しません。
    const result = blockLogic.applyHorizontalSlide(afterGravity);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // 鋼鉄ブロックの上の緑ブロックも元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('green');
    
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

  it('Multiple steel blocks should maintain their relative positions during horizontal slide', () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __R __R __Y |
    // 1 | <-> __R <-> __Y |
    // 2 | __B __R __R __Y |
    // 3 | __Y __R __Y __R |
    //   +-----------------+
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 0, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null },
        { x: 1, y: 1, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null },
        { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }
      ]
    ];

    // b列の赤ブロックをすべて消去した場合
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B     __R __Y |
    // 1 | <->     <-> __Y |
    // 2 | __B         __Y |
    // 3 | __Y     __Y __R |
    //   +-----------------+
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[0][1] = null;
    blocksAfterRemoval[1][1] = null;
    blocksAfterRemoval[2][1] = null;
    blocksAfterRemoval[3][1] = null;
    
    // 重力適用後
    const afterGravity = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 横スライド適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B     __R __Y |
    // 1 | <->     <-> __Y |
    // 2 | __B         __Y |
    // 3 | __Y __Y     __R |
    //   +-----------------+
    // ポイント: 複数の鋼鉄ブロックがあっても、それぞれが固定位置に留まります。
    const result = blockLogic.applyHorizontalSlide(afterGravity);
    
    // 両方の鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][0]?.type).toBe(BlockType.STEEL);
    expect(result[1][0]?.x).toBe(0);
    expect(result[1][0]?.y).toBe(1);
    
    expect(result[1][2]?.type).toBe(BlockType.STEEL);
    expect(result[1][2]?.x).toBe(2);
    expect(result[1][2]?.y).toBe(1);
    
    // d列のブロックはc列に移動するべき
    expect(result[0][3]).toBeNull();
    expect(result[1][3]).toBeNull();
    expect(result[2][3]).toBeNull();
    expect(result[3][3]).toBeNull();
  });
});
