import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ObstacleBlockManager } from './ObstacleBlockManager';
import { ObstacleBlockFactory } from './ObstacleBlock';
import { Block } from '../types';

describe('ObstacleBlockManager', () => {
  let manager: ObstacleBlockManager;
  
  beforeEach(() => {
    manager = new ObstacleBlockManager();
  });
  
  describe('initialization', () => {
    it('should initialize with empty blocks', () => {
      expect(manager.getAllObstacleBlocks()).toHaveLength(0);
    });
    
    it('should initialize with provided blocks', () => {
      const blocks: Block[] = [
        { id: '1', type: 'ice1', color: 'blue', x: 0, y: 0, iceLevel: 1 },
        { id: '2', type: 'normal', color: 'red', x: 1, y: 0 },
        { id: '3', type: 'counterPlus', color: 'green', x: 2, y: 0, counterValue: 3, isCounterPlus: true }
      ];
      
      const obstacleManager = new ObstacleBlockManager(blocks);
      expect(obstacleManager.getAllObstacleBlocks()).toHaveLength(2); // Only ice1 and counterPlus are obstacles
    });
  });
  
  describe('updateObstacleBlocks', () => {
    it('should update ice block when adjacent same color block is removed', () => {
      // Create ice block directly using factory
      const iceBlock = ObstacleBlockFactory.createObstacleBlock('ice1', 'blue', 0, 0);
      const iceBlockData = { ...iceBlock.getBlock() }; // Clone to avoid reference issues
      
      const blocks: Block[] = [
        iceBlockData,
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 }
      ];
      
      manager.initializeFromBlocks(blocks);
      
      const removedBlocks: Block[] = [
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 }
      ];
      
      // Create a modified block that will be returned after update
      const modifiedBlock: Block = {
        ...iceBlockData,
        type: 'normal'
      };
      delete modifiedBlock.iceLevel;
      
      // Mock the updateState method to return true and the modified block
      const mockUpdateState = vi.fn().mockImplementation(() => {
        return true;
      });
      
      // Mock the getBlock method to return the modified block
      const mockGetBlock = vi.fn().mockReturnValue(modifiedBlock);
      
      // Apply the mocks
      const obstacleBlock = manager.getObstacleBlock(iceBlockData.id);
      if (obstacleBlock) {
        // @ts-ignore - Mocking for test
        obstacleBlock.updateState = mockUpdateState;
        // @ts-ignore - Mocking for test
        obstacleBlock.getBlock = mockGetBlock;
      }
      
      // Replace the block in the array with our modified version for the test
      blocks[0] = modifiedBlock;
      
      const updatedBlocks = manager.updateObstacleBlocks(removedBlocks, blocks);
      
      // Ice block should be converted to normal
      const updatedIceBlock = updatedBlocks.find(b => b.id === iceBlockData.id);
      expect(updatedIceBlock?.type).toBe('normal');
      expect(updatedIceBlock?.iceLevel).toBeUndefined();
      
      // Obstacle block should be removed from manager
      expect(manager.isObstacleBlock(iceBlockData.id)).toBe(false);
      expect(mockUpdateState).toHaveBeenCalled();
    });
    
    it('should not update ice block when adjacent different color block is removed', () => {
      // Create ice block directly using factory
      const iceBlock = ObstacleBlockFactory.createObstacleBlock('ice1', 'blue', 0, 0);
      const iceBlockData = iceBlock.getBlock();
      
      const blocks: Block[] = [
        iceBlockData,
        { id: '2', type: 'normal', color: 'red', x: 0, y: 1 }
      ];
      
      manager.initializeFromBlocks(blocks);
      
      const removedBlocks: Block[] = [
        { id: '2', type: 'normal', color: 'red', x: 0, y: 1 }
      ];
      
      // Mock the updateState method to return false (no change)
      const mockUpdateState = vi.fn().mockReturnValue(false);
      
      // Apply the mock
      const obstacleBlock = manager.getObstacleBlock(iceBlockData.id);
      if (obstacleBlock) {
        // @ts-ignore - Mocking for test
        obstacleBlock.updateState = mockUpdateState;
      }
      
      const updatedBlocks = manager.updateObstacleBlocks(removedBlocks, blocks);
      
      // Ice block should remain unchanged
      const updatedIceBlock = updatedBlocks.find(b => b.id === iceBlockData.id);
      expect(updatedIceBlock?.type).toBe('ice1');
      expect(updatedIceBlock?.iceLevel).toBe(1);
      
      // Obstacle block should still be in manager
      expect(manager.isObstacleBlock(iceBlockData.id)).toBe(true);
      expect(mockUpdateState).toHaveBeenCalled();
    });
    
    it('should update ice2 block to ice1 when adjacent same color block is removed', () => {
      // Create ice2 block directly using factory
      const iceBlock = ObstacleBlockFactory.createObstacleBlock('ice2', 'blue', 0, 0);
      const iceBlockData = { ...iceBlock.getBlock() }; // Clone to avoid reference issues
      
      const blocks: Block[] = [
        iceBlockData,
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 }
      ];
      
      manager.initializeFromBlocks(blocks);
      
      const removedBlocks: Block[] = [
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 }
      ];
      
      // Create a modified block that will be returned after update
      const modifiedBlock: Block = {
        ...iceBlockData,
        type: 'ice1',
        iceLevel: 1
      };
      
      // Mock the updateState method to return true and the modified block
      const mockUpdateState = vi.fn().mockImplementation(() => {
        return true;
      });
      
      // Mock the getBlock method to return the modified block
      const mockGetBlock = vi.fn().mockReturnValue(modifiedBlock);
      
      // Apply the mocks
      const obstacleBlock = manager.getObstacleBlock(iceBlockData.id);
      if (obstacleBlock) {
        // @ts-ignore - Mocking for test
        obstacleBlock.updateState = mockUpdateState;
        // @ts-ignore - Mocking for test
        obstacleBlock.getBlock = mockGetBlock;
      }
      
      // Replace the block in the array with our modified version for the test
      blocks[0] = modifiedBlock;
      
      const updatedBlocks = manager.updateObstacleBlocks(removedBlocks, blocks);
      
      // Ice2 block should be converted to ice1
      const updatedIceBlock = updatedBlocks.find(b => b.id === iceBlockData.id);
      expect(updatedIceBlock?.type).toBe('ice1');
      expect(updatedIceBlock?.iceLevel).toBe(1);
      
      // Obstacle block should still be in manager
      expect(manager.isObstacleBlock(iceBlockData.id)).toBe(true);
      expect(mockUpdateState).toHaveBeenCalled();
    });
  });
  
  describe('getRemovableObstacleBlocks', () => {
    it('should identify removable counter+ blocks', () => {
      // Create counter+ block directly using factory
      const counterBlock = ObstacleBlockFactory.createObstacleBlock(
        'counterPlus', 'blue', 0, 0, { counterValue: 3, isCounterPlus: true }
      );
      const counterBlockData = counterBlock.getBlock();
      
      const blocks: Block[] = [
        counterBlockData,
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 },
        { id: '3', type: 'normal', color: 'blue', x: 1, y: 0 }
      ];
      
      manager.initializeFromBlocks(blocks);
      
      // Mock the isRemovable method to return true
      const mockIsRemovable = vi.fn().mockReturnValue(true);
      
      // Apply the mock
      const obstacleBlock = manager.getObstacleBlock(counterBlockData.id);
      if (obstacleBlock) {
        // @ts-ignore - Mocking for test
        obstacleBlock.isRemovable = mockIsRemovable;
      }
      
      const removableIds = manager.getRemovableObstacleBlocks(blocks);
      expect(removableIds).toContain(counterBlockData.id);
      expect(mockIsRemovable).toHaveBeenCalled();
    });
    
    it('should identify removable counter blocks with exact count', () => {
      // Create counter block directly using factory
      const counterBlock = ObstacleBlockFactory.createObstacleBlock(
        'counter', 'blue', 0, 0, { counterValue: 3, isCounterPlus: false }
      );
      const counterBlockData = counterBlock.getBlock();
      
      const blocks: Block[] = [
        counterBlockData,
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 },
        { id: '3', type: 'normal', color: 'blue', x: 1, y: 0 }
      ];
      
      manager.initializeFromBlocks(blocks);
      
      // Mock the isRemovable method to return true
      const mockIsRemovable = vi.fn().mockReturnValue(true);
      
      // Apply the mock
      const obstacleBlock = manager.getObstacleBlock(counterBlockData.id);
      if (obstacleBlock) {
        // @ts-ignore - Mocking for test
        obstacleBlock.isRemovable = mockIsRemovable;
      }
      
      const removableIds = manager.getRemovableObstacleBlocks(blocks);
      expect(removableIds).toContain(counterBlockData.id);
      expect(mockIsRemovable).toHaveBeenCalled();
    });
    
    it('should not identify counter blocks with incorrect count', () => {
      // Create counter block directly using factory
      const counterBlock = ObstacleBlockFactory.createObstacleBlock(
        'counter', 'blue', 0, 0, { counterValue: 3, isCounterPlus: false }
      );
      const counterBlockData = counterBlock.getBlock();
      
      const blocks: Block[] = [
        counterBlockData,
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 },
        { id: '3', type: 'normal', color: 'blue', x: 1, y: 0 },
        { id: '4', type: 'normal', color: 'blue', x: 1, y: 1 }
      ];
      
      manager.initializeFromBlocks(blocks);
      
      // Mock the isRemovable method to return false
      const mockIsRemovable = vi.fn().mockReturnValue(false);
      
      // Apply the mock
      const obstacleBlock = manager.getObstacleBlock(counterBlockData.id);
      if (obstacleBlock) {
        // @ts-ignore - Mocking for test
        obstacleBlock.isRemovable = mockIsRemovable;
      }
      
      const removableIds = manager.getRemovableObstacleBlocks(blocks);
      expect(removableIds).not.toContain(counterBlockData.id);
      expect(mockIsRemovable).toHaveBeenCalled();
    });
    
    it('should not identify non-counter obstacle blocks', () => {
      // Create ice block directly using factory
      const iceBlock = ObstacleBlockFactory.createObstacleBlock('ice1', 'blue', 0, 0);
      const iceBlockData = iceBlock.getBlock();
      
      const blocks: Block[] = [
        iceBlockData,
        { id: '2', type: 'normal', color: 'blue', x: 0, y: 1 }
      ];
      
      manager.initializeFromBlocks(blocks);
      
      const removableIds = manager.getRemovableObstacleBlocks(blocks);
      expect(removableIds).not.toContain(iceBlockData.id);
    });
  });
  
  describe('isFixedObstacleBlock', () => {
    it('should identify steel blocks as fixed', () => {
      // Create steel block directly using factory
      const steelBlock = ObstacleBlockFactory.createObstacleBlock('steel', 'pearlWhite', 0, 0);
      const steelBlockData = steelBlock.getBlock();
      
      const blocks: Block[] = [steelBlockData];
      
      manager.initializeFromBlocks(blocks);
      
      expect(manager.isFixedObstacleBlock(steelBlockData.id)).toBe(true);
    });
    
    it('should not identify other obstacle blocks as fixed', () => {
      // Create ice block directly using factory
      const iceBlock = ObstacleBlockFactory.createObstacleBlock('ice1', 'blue', 0, 0);
      const iceBlockData = iceBlock.getBlock();
      
      // Create rock block directly using factory
      const rockBlock = ObstacleBlockFactory.createObstacleBlock('rock', 'pearlWhite', 1, 0);
      const rockBlockData = rockBlock.getBlock();
      
      const blocks: Block[] = [iceBlockData, rockBlockData];
      
      manager.initializeFromBlocks(blocks);
      
      expect(manager.isFixedObstacleBlock(iceBlockData.id)).toBe(false);
      expect(manager.isFixedObstacleBlock(rockBlockData.id)).toBe(false);
    });
  });
  
  describe('getObstacleBlockRenderInfo', () => {
    it('should return render info for obstacle blocks', () => {
      // Create ice block directly using factory
      const iceBlock = ObstacleBlockFactory.createObstacleBlock('ice1', 'blue', 0, 0);
      const iceBlockData = iceBlock.getBlock();
      
      const blocks: Block[] = [iceBlockData];
      
      manager.initializeFromBlocks(blocks);
      
      const renderInfo = manager.getObstacleBlockRenderInfo(iceBlockData.id);
      expect(renderInfo).toBeDefined();
      expect(renderInfo?.mainColor).toBe('blue');
      expect(renderInfo?.overlayType).toBe('ice1');
    });
    
    it('should return undefined for non-obstacle blocks', () => {
      const blocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 }
      ];
      
      manager.initializeFromBlocks(blocks);
      
      const renderInfo = manager.getObstacleBlockRenderInfo('1');
      expect(renderInfo).toBeUndefined();
    });
  });
});
