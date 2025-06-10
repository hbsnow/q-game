import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ObstacleBlock, 
  IceBlock1, 
  IceBlock2, 
  CounterPlusBlock, 
  CounterBlock,
  RockBlock,
  SteelBlock,
  IceCounterPlusBlock,
  IceCounterBlock,
  ObstacleBlockFactory
} from './ObstacleBlock';
import { Block, BlockColor } from '../types';

describe('ObstacleBlock', () => {
  describe('IceBlock1', () => {
    let iceBlock: IceBlock1;
    const color: BlockColor = 'blue';
    
    beforeEach(() => {
      iceBlock = new IceBlock1(color, 1, 2);
    });
    
    it('should create with correct properties', () => {
      const block = iceBlock.getBlock();
      expect(block.type).toBe('ice1');
      expect(block.color).toBe(color);
      expect(block.x).toBe(1);
      expect(block.y).toBe(2);
      expect(block.iceLevel).toBe(1);
    });
    
    it('should not be removable', () => {
      expect(iceBlock.isRemovable([])).toBe(false);
    });
    
    it('should update state when adjacent same color block is removed', () => {
      const adjacentBlock: Block = {
        id: '123',
        type: 'normal',
        color,
        x: 1,
        y: 3
      };
      
      const stateChanged = iceBlock.updateState([adjacentBlock]);
      expect(stateChanged).toBe(true);
      
      const updatedBlock = iceBlock.getBlock();
      expect(updatedBlock.type).toBe('normal');
      expect(updatedBlock.iceLevel).toBeUndefined();
    });
    
    it('should not update state when adjacent different color block is removed', () => {
      const adjacentBlock: Block = {
        id: '123',
        type: 'normal',
        color: 'coralRed',
        x: 1,
        y: 3
      };
      
      const stateChanged = iceBlock.updateState([adjacentBlock]);
      expect(stateChanged).toBe(false);
      
      const updatedBlock = iceBlock.getBlock();
      expect(updatedBlock.type).toBe('ice1');
      expect(updatedBlock.iceLevel).toBe(1);
    });
    
    it('should return correct render info', () => {
      const renderInfo = iceBlock.getRenderInfo();
      expect(renderInfo.mainColor).toBe(color);
      expect(renderInfo.overlayType).toBe('ice1');
      expect(renderInfo.alpha).toBe(0.7);
      expect(renderInfo.tint).toBe(0xADD8E6);
    });
  });
  
  describe('IceBlock2', () => {
    let iceBlock: IceBlock2;
    const color: BlockColor = 'lightBlue';
    
    beforeEach(() => {
      iceBlock = new IceBlock2(color, 1, 2);
    });
    
    it('should create with correct properties', () => {
      const block = iceBlock.getBlock();
      expect(block.type).toBe('ice2');
      expect(block.color).toBe(color);
      expect(block.x).toBe(1);
      expect(block.y).toBe(2);
      expect(block.iceLevel).toBe(2);
    });
    
    it('should not be removable', () => {
      expect(iceBlock.isRemovable([])).toBe(false);
    });
    
    it('should update to ice1 when adjacent same color block is removed once', () => {
      const adjacentBlock: Block = {
        id: '123',
        type: 'normal',
        color,
        x: 1,
        y: 3
      };
      
      const stateChanged = iceBlock.updateState([adjacentBlock]);
      expect(stateChanged).toBe(true);
      
      const updatedBlock = iceBlock.getBlock();
      expect(updatedBlock.type).toBe('ice1');
      expect(updatedBlock.iceLevel).toBe(1);
    });
    
    it('should update to normal when adjacent same color block is removed twice', () => {
      const adjacentBlock: Block = {
        id: '123',
        type: 'normal',
        color,
        x: 1,
        y: 3
      };
      
      // First update
      iceBlock.updateState([adjacentBlock]);
      
      // Second update
      const stateChanged = iceBlock.updateState([adjacentBlock]);
      expect(stateChanged).toBe(true);
      
      const updatedBlock = iceBlock.getBlock();
      expect(updatedBlock.type).toBe('normal');
      expect(updatedBlock.iceLevel).toBeUndefined();
    });
  });
  
  describe('CounterPlusBlock', () => {
    let counterBlock: CounterPlusBlock;
    const color: BlockColor = 'seaGreen';
    const counterValue = 3;
    
    beforeEach(() => {
      counterBlock = new CounterPlusBlock(color, 1, 2, counterValue);
    });
    
    it('should create with correct properties', () => {
      const block = counterBlock.getBlock();
      expect(block.type).toBe('counterPlus');
      expect(block.color).toBe(color);
      expect(block.x).toBe(1);
      expect(block.y).toBe(2);
      expect(block.counterValue).toBe(counterValue);
      expect(block.isCounterPlus).toBe(true);
    });
    
    it('should be removable when adjacent same color blocks count >= counter value', () => {
      const adjacentBlocks: Block[] = [
        { id: '1', type: 'normal', color, x: 1, y: 3 },
        { id: '2', type: 'normal', color, x: 1, y: 4 },
      ];
      
      // 2 adjacent blocks + self = 3, which equals counter value
      expect(counterBlock.isRemovable(adjacentBlocks)).toBe(true);
      
      // Add one more block
      adjacentBlocks.push({ id: '3', type: 'normal', color, x: 2, y: 2 });
      
      // 3 adjacent blocks + self = 4, which is > counter value
      expect(counterBlock.isRemovable(adjacentBlocks)).toBe(true);
    });
    
    it('should not be removable when adjacent same color blocks count < counter value', () => {
      const adjacentBlocks: Block[] = [
        { id: '1', type: 'normal', color, x: 1, y: 3 },
      ];
      
      // 1 adjacent block + self = 2, which is < counter value (3)
      expect(counterBlock.isRemovable(adjacentBlocks)).toBe(false);
    });
    
    it('should not update state', () => {
      const adjacentBlocks: Block[] = [
        { id: '1', type: 'normal', color, x: 1, y: 3 },
      ];
      
      const stateChanged = counterBlock.updateState(adjacentBlocks);
      expect(stateChanged).toBe(false);
    });
  });
  
  describe('CounterBlock', () => {
    let counterBlock: CounterBlock;
    const color: BlockColor = 'coralRed';
    const counterValue = 3;
    
    beforeEach(() => {
      counterBlock = new CounterBlock(color, 1, 2, counterValue);
    });
    
    it('should create with correct properties', () => {
      const block = counterBlock.getBlock();
      expect(block.type).toBe('counter');
      expect(block.color).toBe(color);
      expect(block.x).toBe(1);
      expect(block.y).toBe(2);
      expect(block.counterValue).toBe(counterValue);
      expect(block.isCounterPlus).toBe(false);
    });
    
    it('should be removable when adjacent same color blocks count = counter value', () => {
      const adjacentBlocks: Block[] = [
        { id: '1', type: 'normal', color, x: 1, y: 3 },
        { id: '2', type: 'normal', color, x: 1, y: 4 },
      ];
      
      // 2 adjacent blocks + self = 3, which equals counter value
      expect(counterBlock.isRemovable(adjacentBlocks)).toBe(true);
    });
    
    it('should not be removable when adjacent same color blocks count != counter value', () => {
      // Less than counter value
      const fewerBlocks: Block[] = [
        { id: '1', type: 'normal', color, x: 1, y: 3 },
      ];
      
      // 1 adjacent block + self = 2, which is < counter value (3)
      expect(counterBlock.isRemovable(fewerBlocks)).toBe(false);
      
      // More than counter value
      const moreBlocks: Block[] = [
        { id: '1', type: 'normal', color, x: 1, y: 3 },
        { id: '2', type: 'normal', color, x: 1, y: 4 },
        { id: '3', type: 'normal', color, x: 2, y: 2 },
      ];
      
      // 3 adjacent blocks + self = 4, which is > counter value (3)
      expect(counterBlock.isRemovable(moreBlocks)).toBe(false);
    });
  });
  
  describe('RockBlock', () => {
    let rockBlock: RockBlock;
    
    beforeEach(() => {
      rockBlock = new RockBlock(1, 2);
    });
    
    it('should create with correct properties', () => {
      const block = rockBlock.getBlock();
      expect(block.type).toBe('rock');
      expect(block.color).toBe('pearlWhite');
      expect(block.x).toBe(1);
      expect(block.y).toBe(2);
    });
    
    it('should not be removable', () => {
      expect(rockBlock.isRemovable([])).toBe(false);
    });
    
    it('should not update state', () => {
      const stateChanged = rockBlock.updateState([]);
      expect(stateChanged).toBe(false);
    });
  });
  
  describe('SteelBlock', () => {
    let steelBlock: SteelBlock;
    
    beforeEach(() => {
      steelBlock = new SteelBlock(1, 2);
    });
    
    it('should create with correct properties', () => {
      const block = steelBlock.getBlock();
      expect(block.type).toBe('steel');
      expect(block.color).toBe('pearlWhite');
      expect(block.x).toBe(1);
      expect(block.y).toBe(2);
    });
    
    it('should not be removable', () => {
      expect(steelBlock.isRemovable([])).toBe(false);
    });
    
    it('should not update state', () => {
      const stateChanged = steelBlock.updateState([]);
      expect(stateChanged).toBe(false);
    });
  });
  
  describe('ObstacleBlockFactory', () => {
    it('should create IceBlock1', () => {
      const block = ObstacleBlockFactory.createObstacleBlock('ice1', 'blue', 1, 2);
      expect(block).toBeInstanceOf(IceBlock1);
      expect(block.getBlock().type).toBe('ice1');
    });
    
    it('should create IceBlock2', () => {
      const block = ObstacleBlockFactory.createObstacleBlock('ice2', 'blue', 1, 2);
      expect(block).toBeInstanceOf(IceBlock2);
      expect(block.getBlock().type).toBe('ice2');
    });
    
    it('should create CounterPlusBlock', () => {
      const block = ObstacleBlockFactory.createObstacleBlock('counterPlus', 'blue', 1, 2, { counterValue: 4 });
      expect(block).toBeInstanceOf(CounterPlusBlock);
      expect(block.getBlock().type).toBe('counterPlus');
      expect(block.getBlock().counterValue).toBe(4);
    });
    
    it('should create CounterBlock', () => {
      const block = ObstacleBlockFactory.createObstacleBlock('counter', 'blue', 1, 2, { counterValue: 4 });
      expect(block).toBeInstanceOf(CounterBlock);
      expect(block.getBlock().type).toBe('counter');
      expect(block.getBlock().counterValue).toBe(4);
    });
    
    it('should create RockBlock', () => {
      const block = ObstacleBlockFactory.createObstacleBlock('rock', 'blue', 1, 2);
      expect(block).toBeInstanceOf(RockBlock);
      expect(block.getBlock().type).toBe('rock');
      expect(block.getBlock().color).toBe('pearlWhite'); // Rock blocks always use pearlWhite
    });
    
    it('should create SteelBlock', () => {
      const block = ObstacleBlockFactory.createObstacleBlock('steel', 'blue', 1, 2);
      expect(block).toBeInstanceOf(SteelBlock);
      expect(block.getBlock().type).toBe('steel');
      expect(block.getBlock().color).toBe('pearlWhite'); // Steel blocks always use pearlWhite
    });
    
    it('should create from existing block data', () => {
      const blockData: Block = {
        id: '123',
        type: 'ice1',
        color: 'blue',
        x: 1,
        y: 2,
        iceLevel: 1
      };
      
      const block = ObstacleBlockFactory.createFromBlock(blockData);
      expect(block).toBeInstanceOf(IceBlock1);
      expect(block.getBlock().type).toBe('ice1');
      expect(block.getBlock().color).toBe('blue');
    });
    
    it('should throw error for unknown block type', () => {
      expect(() => {
        // @ts-ignore - Testing invalid type
        ObstacleBlockFactory.createObstacleBlock('unknown', 'blue', 1, 2);
      }).toThrow('Unknown obstacle block type: unknown');
    });
  });
});
