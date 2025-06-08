import { describe, it, expect } from 'vitest';
import { GravityProcessor } from '@/utils/GravityProcessor';
import { Block } from '@/types';

describe('Gravity Debug 3', () => {
  it('should debug near movement', () => {
    const blocks: Block[] = [
      { id: 'far', type: 'normal', color: 'lightBlue', x: 0, y: 0 },   
      { id: 'near', type: 'normal', color: 'coralRed', x: 0, y: 11 },  
    ];

    console.log('Input blocks:', blocks);
    
    const result = GravityProcessor.applyGravity(blocks);
    
    console.log('Output blocks:', result.blocks);
    console.log('Movements:', result.movements);
    
    const nearMovement = result.movements.find(m => m.blockId === 'near');
    console.log('Near movement:', nearMovement);
  });
});
