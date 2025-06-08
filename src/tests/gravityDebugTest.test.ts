import { describe, it, expect } from 'vitest';
import { GravityProcessor } from '../utils/gravityProcessor';
import { Block } from '../types/index';

describe('GravityProcessor - デバッグ', () => {

  it('落下と左詰めの組み合わせテストの実際の結果を確認', () => {
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
    
    console.log('実際の結果:', result.blocks);
    console.log('可視化:');
    console.log(GravityProcessor.visualizeGravityResult(result, 3, 3));
  });

  it('複雑なケースの実際の結果を確認', () => {
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
    
    console.log('実際の結果:', result.blocks);
    console.log('可視化:');
    console.log(GravityProcessor.visualizeGravityResult(result, 5, 3));
  });

  it('鋼鉄ブロックテストの実際の結果を確認', () => {
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
    
    console.log('実際の結果:', result.blocks);
    console.log('可視化:');
    console.log(GravityProcessor.visualizeGravityResult(result, 3, 3));
  });
});
