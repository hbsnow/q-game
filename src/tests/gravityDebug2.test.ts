import { describe, it, expect } from 'vitest';
import { GravityProcessor } from '@/utils/GravityProcessor';
import { Block } from '@/types';

describe('Gravity Debug 2', () => {
  it('should debug movement calculation', () => {
    const blocks: Block[] = [
      { id: 'far', type: 'normal', color: 'lightBlue', x: 0, y: 0 },   // 13マス移動
      { id: 'near', type: 'normal', color: 'coralRed', x: 0, y: 12 },  // 1マス移動
    ];

    console.log('Input blocks:', blocks);
    
    const result = GravityProcessor.applyGravity(blocks);
    
    console.log('Output blocks:', result.blocks);
    console.log('Movements:', result.movements);
    
    // 実際の値を確認
    expect(result.movements.length).toBeGreaterThan(0);
  });
});
