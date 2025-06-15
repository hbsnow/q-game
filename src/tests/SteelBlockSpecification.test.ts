import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block, BlockType } from '../types/Block';

describe('Steel block behavior according to specifications', () => {
  const blockLogic = new BlockLogic();
  
  it('Steel blocks should remain fixed and blocks above them should not fall', () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __B __R __Y |
    // 1 | __Y <-> __R __Y |
    // 2 | __B __R __R __Y |
    // 3 | __Y __B __B __R |
    //   +-----------------+
    // b1に鋼鉄ブロック<->がある
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
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
        { x: 1, y: 3, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 3, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }
      ]
    ];

    // ユーザーがc0をタップ:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __B     __Y |
    // 1 | __Y <->     __Y |
    // 2 | __B         __Y |
    // 3 | __Y __B __B __R |
    //   +-----------------+
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[0][2] = null;
    blocksAfterRemoval[1][2] = null;
    blocksAfterRemoval[2][2] = null;
    
    const result = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // 鋼鉄ブロックの上のブロックも元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('blue');
    expect(result[0][1]?.x).toBe(1);
    expect(result[0][1]?.y).toBe(0);
  });

  it('Steel blocks should not move when blocks below are removed', () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G __B __Y |
    // 1 | __Y <-> __B __Y |
    // 2 | __B __R __B __Y |
    // 3 | __Y __R __Y __R |
    //   +-----------------+
    // b1に鋼鉄ブロック<->がある
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 1, color: 'blue', type: BlockType.STEEL, sprite: null },
        { x: 2, y: 1, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }
      ]
    ];

    // b2とb3の赤ブロックを消去した場合
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G __B __Y |
    // 1 | __Y <-> __B __Y |
    // 2 | __B     __B __Y |
    // 3 | __Y     __Y __R |
    //   +-----------------+
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[2][1] = null;
    blocksAfterRemoval[3][1] = null;
    
    const result = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 重力適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G __B __Y |
    // 1 | __Y <-> __B __Y |
    // 2 | __B     __B __Y |
    // 3 | __Y     __Y __R |
    //   +-----------------+
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // 鋼鉄ブロックの上のブロックも元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('green');
    
    // 消去されたブロックの位置は空のままであるべき
    expect(result[2][1]).toBeNull();
    expect(result[3][1]).toBeNull();
  });

  it('Steel blocks should keep blocks above them fixed even when adjacent blocks are removed', () => {
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

    // ユーザーがc0の赤ブロックをタップすると、c0、c1、c2、b2、b3の赤ブロックが消去される
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G     __Y |
    // 1 | __Y <->     __Y |
    // 2 | __B         __Y |
    // 3 | __Y     __Y __R |
    //   +-----------------+
    const blocksAfterRemoval = JSON.parse(JSON.stringify(blocks));
    blocksAfterRemoval[0][2] = null;
    blocksAfterRemoval[1][2] = null;
    blocksAfterRemoval[2][2] = null;
    blocksAfterRemoval[2][1] = null;
    blocksAfterRemoval[3][1] = null;
    
    const result = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 重力適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G __Y     |
    // 1 | __Y <-> __Y     |
    // 2 | __B     __Y     |
    // 3 | __Y __Y __R     |
    //   +-----------------+
    
    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][1]?.type).toBe(BlockType.STEEL);
    expect(result[1][1]?.x).toBe(1);
    expect(result[1][1]?.y).toBe(1);
    
    // 鋼鉄ブロックの上の緑ブロックも元の位置に留まるべき
    expect(result[0][1]?.type).toBe(BlockType.NORMAL);
    expect(result[0][1]?.color).toBe('green');
    expect(result[0][1]?.x).toBe(1);
    expect(result[0][1]?.y).toBe(0);
    
    // c列は空になるべき
    expect(result[0][2]).toBeNull();
    expect(result[1][2]).toBeNull();
    expect(result[2][2]).toBeNull();
  });

  it('Multiple steel blocks should all maintain their positions', () => {
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
    
    const result = blockLogic.applyGravity(blocksAfterRemoval);
    
    // 重力適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B     __R __Y |
    // 1 | <->     <-> __Y |
    // 2 | __B         __Y |
    // 3 | __Y __Y     __R |
    //   +-----------------+
    
    // 両方の鋼鉄ブロックは元の位置に留まるべき
    expect(result[1][0]?.type).toBe(BlockType.STEEL);
    expect(result[1][0]?.x).toBe(0);
    expect(result[1][0]?.y).toBe(1);
    
    expect(result[1][2]?.type).toBe(BlockType.STEEL);
    expect(result[1][2]?.x).toBe(2);
    expect(result[1][2]?.y).toBe(1);
    
    // b列は空になるべき
    expect(result[0][1]).toBeNull();
    expect(result[1][1]).toBeNull();
    expect(result[2][1]).toBeNull();
    expect(result[3][1]).toBeNull();
  });

  it('Steel blocks should never let blocks pass through them', () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G __B __Y |
    // 1 | __Y __B __B __Y |
    // 2 | __B <-> __R __Y |
    // 3 | __Y     __Y __R |
    //   +-----------------+
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: 'green', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 0, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 0, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 1, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 1, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 1, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 2, color: 'blue', type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: 'blue', type: BlockType.STEEL, sprite: null },
        { x: 2, y: 2, color: 'red', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 2, color: 'yellow', type: BlockType.NORMAL, sprite: null }
      ],
      [
        { x: 0, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        null,
        { x: 2, y: 3, color: 'yellow', type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: 'red', type: BlockType.NORMAL, sprite: null }
      ]
    ];
    
    const result = blockLogic.applyGravity(blocks);
    
    // 重力適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B         __Y |
    // 1 | __Y __G     __Y |
    // 2 | __B <-> __R __Y |
    // 3 | __Y __B __Y __R |
    //   +-----------------+
    // 鋼鉄はいかなる場合でも上に乗っているブロックを貫通させることはない
    
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
