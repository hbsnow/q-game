import { describe, it, expect } from 'vitest';
import { GravityProcessor } from '../utils/gravityProcessor';
import { Block } from '../types/index';

describe('GravityProcessor - 正しいさめがめルール', () => {

  it('単純な落下：上のブロックが下の空きスペースに落ちる', () => {
    // 配置：
    // [ ][R][ ]
    // [ ][ ][ ]
    // [B][ ][G]
    const blocks: Block[] = [
      { id: '1', x: 1, y: 0, type: 'normal', color: 'coralRed' },
      { id: '2', x: 0, y: 2, type: 'normal', color: 'blue' },
      { id: '3', x: 2, y: 2, type: 'normal', color: 'seaGreen' }
    ];

    const result = GravityProcessor.applyGravity(blocks, 3, 3);

    // 期待結果：
    // [ ][ ][ ]
    // [ ][ ][ ]
    // [B][R][G]
    expect(result.blocks).toEqual([
      { id: '2', x: 0, y: 2, type: 'normal', color: 'blue' },
      { id: '1', x: 1, y: 2, type: 'normal', color: 'coralRed' },
      { id: '3', x: 2, y: 2, type: 'normal', color: 'seaGreen' }
    ]);
  });

  it('複数ブロックの落下：各列で独立して落下', () => {
    // 配置：
    // [R][G][ ]
    // [ ][B][ ]
    // [ ][ ][Y]
    const blocks: Block[] = [
      { id: '1', x: 0, y: 0, type: 'normal', color: 'coralRed' },
      { id: '2', x: 1, y: 0, type: 'normal', color: 'seaGreen' },
      { id: '3', x: 1, y: 1, type: 'normal', color: 'blue' },
      { id: '4', x: 2, y: 2, type: 'normal', color: 'sandGold' }
    ];

    const result = GravityProcessor.applyGravity(blocks, 3, 3);

    // 期待結果：
    // [ ][ ][ ]
    // [ ][G][ ]
    // [R][B][Y]
    expect(result.blocks).toEqual([
      { id: '1', x: 0, y: 2, type: 'normal', color: 'coralRed' },
      { id: '3', x: 1, y: 2, type: 'normal', color: 'blue' },
      { id: '2', x: 1, y: 1, type: 'normal', color: 'seaGreen' },
      { id: '4', x: 2, y: 2, type: 'normal', color: 'sandGold' }
    ]);
  });

  it('左詰め：空いた列を左に詰める', () => {
    // 配置：
    // [ ][ ][R]
    // [ ][ ][ ]
    // [ ][ ][B]
    const blocks: Block[] = [
      { id: '1', x: 2, y: 0, type: 'normal', color: 'coralRed' },
      { id: '2', x: 2, y: 2, type: 'normal', color: 'blue' }
    ];

    const result = GravityProcessor.applyGravity(blocks, 3, 3);

    // 期待結果：
    // [ ][ ][ ]
    // [R][ ][ ]
    // [B][ ][ ]
    expect(result.blocks).toEqual([
      { id: '2', x: 0, y: 2, type: 'normal', color: 'blue' },
      { id: '1', x: 0, y: 1, type: 'normal', color: 'coralRed' }
    ]);
  });

  it('落下と左詰めの組み合わせ', () => {
    // 配置：
    // [R][ ][G]
    // [ ][ ][B]
    // [ ][ ][ ]
    const blocks: Block[] = [
      { id: '1', x: 0, y: 0, type: 'normal', color: 'coralRed' },
      { id: '2', x: 2, y: 0, type: 'normal', color: 'seaGreen' },
      { id: '3', x: 2, y: 1, type: 'normal', color: 'blue' }
    ];

    const result = GravityProcessor.applyGravity(blocks, 3, 3);

    // 期待結果：
    // [ ][ ][ ]
    // [G][ ][ ]
    // [R][B][ ]
    expect(result.blocks).toEqual([
      { id: '1', x: 0, y: 2, type: 'normal', color: 'coralRed' },
      { id: '3', x: 1, y: 2, type: 'normal', color: 'blue' },
      { id: '2', x: 1, y: 1, type: 'normal', color: 'seaGreen' }
    ]);
  });

  it('複雑なケース：複数列の落下と左詰め', () => {
    // 配置：
    // [R][ ][G][ ][Y]
    // [B][ ][ ][ ][P]
    // [ ][ ][ ][ ][ ]
    const blocks: Block[] = [
      { id: '1', x: 0, y: 0, type: 'normal', color: 'coralRed' },
      { id: '2', x: 0, y: 1, type: 'normal', color: 'blue' },
      { id: '3', x: 2, y: 0, type: 'normal', color: 'seaGreen' },
      { id: '4', x: 4, y: 0, type: 'normal', color: 'sandGold' },
      { id: '5', x: 4, y: 1, type: 'normal', color: 'pearlWhite' }
    ];

    const result = GravityProcessor.applyGravity(blocks, 5, 3);

    // 期待結果：
    // [ ][ ][ ][ ][ ]
    // [R][G][Y][ ][ ]
    // [B][ ][P][ ][ ]
    expect(result.blocks).toEqual([
      { id: '2', x: 0, y: 2, type: 'normal', color: 'blue' },
      { id: '1', x: 0, y: 1, type: 'normal', color: 'coralRed' },
      { id: '3', x: 1, y: 2, type: 'normal', color: 'seaGreen' },
      { id: '5', x: 2, y: 2, type: 'normal', color: 'pearlWhite' },
      { id: '4', x: 2, y: 1, type: 'normal', color: 'sandGold' }
    ]);
  });

  it('妨害ブロックは位置を保持（鋼鉄ブロック）', () => {
    // 配置：
    // [R][ ][ ]
    // [S][ ][ ]  // S = 鋼鉄ブロック（固定）
    // [ ][ ][B]
    const blocks: Block[] = [
      { id: '1', x: 0, y: 0, type: 'normal', color: 'coralRed' },
      { id: '2', x: 0, y: 1, type: 'steel', color: 'blue' },
      { id: '3', x: 2, y: 2, type: 'normal', color: 'blue' }
    ];

    const result = GravityProcessor.applyGravity(blocks, 3, 3);

    // 期待結果：鋼鉄ブロックは動かず、通常ブロックのみ処理
    // [ ][ ][ ]
    // [S][ ][ ]
    // [R][B][ ]
    expect(result.blocks).toEqual([
      { id: '1', x: 0, y: 2, type: 'normal', color: 'coralRed' },
      { id: '2', x: 0, y: 1, type: 'steel', color: 'blue' },
      { id: '3', x: 1, y: 2, type: 'normal', color: 'blue' }
    ]);
  });
});
