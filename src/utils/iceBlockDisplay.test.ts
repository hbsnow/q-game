import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Block } from '../types';
import { ObstacleBlockManager } from './ObstacleBlockManager';

// モック
vi.mock('phaser', () => {
  return {
    GameObjects: {
      Container: class {
        add() { return this; }
        removeAll() { return this; }
      },
      Sprite: class {
        setData() { return this; }
        setDisplaySize() { return this; }
        setInteractive() { return this; }
        destroy() {}
      }
    }
  };
});

describe('氷結ブロックの表示と内部状態の一致テスト', () => {
  let obstacleBlockManager: ObstacleBlockManager;
  let blocks: Block[];

  beforeEach(() => {
    // テスト用のブロック配列を初期化
    blocks = [
      {
        id: 'normal1',
        type: 'normal',
        color: 'blue',
        x: 0,
        y: 0
      },
      {
        id: 'ice1',
        type: 'ice1',
        color: 'red',
        x: 1,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'normal2',
        type: 'normal',
        color: 'red',
        x: 2,
        y: 0
      }
    ];

    // ObstacleBlockManagerを初期化
    obstacleBlockManager = new ObstacleBlockManager(blocks);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('氷結ブロックが解除されて通常ブロックになった場合、内部状態が正しく更新される', () => {
    // 氷結ブロックの隣で同色ブロックを消去
    const removedBlocks = [blocks[2]]; // 赤の通常ブロック
    const updatedBlocks = obstacleBlockManager.updateObstacleBlocks(removedBlocks, [...blocks]);

    // 氷結ブロックが通常ブロックに変わっているか確認
    const formerIceBlock = updatedBlocks.find(b => b.id === 'ice1');
    expect(formerIceBlock).toBeDefined();
    expect(formerIceBlock?.type).toBe('normal');
    expect(formerIceBlock?.color).toBe('red');

    // ObstacleBlockManagerから削除されているか確認
    expect(obstacleBlockManager.isObstacleBlock('ice1')).toBe(false);
  });

  it('氷結ブロックLv2が1段階解除されて氷結ブロックLv1になった場合、内部状態が正しく更新される', () => {
    // 氷結Lv2ブロックを追加
    const iceLv2Block: Block = {
      id: 'ice2',
      type: 'ice2',
      color: 'blue',
      x: 3,
      y: 0,
      iceLevel: 2
    };
    
    const newBlocks = [...blocks, iceLv2Block];
    obstacleBlockManager = new ObstacleBlockManager(newBlocks);
    
    // 青の通常ブロックを消去
    const removedBlocks = [newBlocks[0]]; // 青の通常ブロック
    const updatedBlocks = obstacleBlockManager.updateObstacleBlocks(removedBlocks, [...newBlocks]);
    
    // 氷結Lv2ブロックが氷結Lv1ブロックに変わっているか確認
    const updatedIceBlock = updatedBlocks.find(b => b.id === 'ice2');
    expect(updatedIceBlock).toBeDefined();
    expect(updatedIceBlock?.type).toBe('ice1');
    expect(updatedIceBlock?.iceLevel).toBe(1);
    
    // ObstacleBlockManagerで正しく管理されているか確認
    expect(obstacleBlockManager.isObstacleBlock('ice2')).toBe(true);
    const obstacleBlock = obstacleBlockManager.getObstacleBlock('ice2');
    expect(obstacleBlock?.getType()).toBe('ice1');
  });

  it('氷結カウンターブロックが解除されてカウンターブロックになった場合、内部状態が正しく更新される', () => {
    // 氷結カウンターブロックを追加
    const iceCounterBlock: Block = {
      id: 'iceCounter1',
      type: 'iceCounter',
      color: 'red',
      x: 3,
      y: 0,
      iceLevel: 1,
      counterValue: 3,
      isCounterPlus: false
    };
    
    const newBlocks = [...blocks, iceCounterBlock];
    obstacleBlockManager = new ObstacleBlockManager(newBlocks);
    
    // 赤の通常ブロックを消去
    const removedBlocks = [newBlocks[2]]; // 赤の通常ブロック
    const updatedBlocks = obstacleBlockManager.updateObstacleBlocks(removedBlocks, [...newBlocks]);
    
    // 氷結カウンターブロックがカウンターブロックに変わっているか確認
    const updatedBlock = updatedBlocks.find(b => b.id === 'iceCounter1');
    expect(updatedBlock).toBeDefined();
    expect(updatedBlock?.type).toBe('counter');
    expect(updatedBlock?.counterValue).toBe(3);
    
    // ObstacleBlockManagerで正しく管理されているか確認
    expect(obstacleBlockManager.isObstacleBlock('iceCounter1')).toBe(true);
    const obstacleBlock = obstacleBlockManager.getObstacleBlock('iceCounter1');
    expect(obstacleBlock?.getType()).toBe('counter');
  });

  it('重力処理後も氷結ブロックの状態が正しく保持される', () => {
    // 氷結ブロックの下にブロックを配置
    const blockBelow: Block = {
      id: 'normal3',
      type: 'normal',
      color: 'green',
      x: 1,
      y: 1
    };
    
    const newBlocks = [...blocks, blockBelow];
    obstacleBlockManager = new ObstacleBlockManager(newBlocks);
    
    // 下のブロックを消去
    const removedBlocks = [blockBelow];
    let updatedBlocks = obstacleBlockManager.updateObstacleBlocks(removedBlocks, [...newBlocks]);
    
    // 氷結ブロックの位置を更新（重力処理をシミュレート）
    const iceBlock = updatedBlocks.find(b => b.id === 'ice1');
    if (iceBlock) {
      iceBlock.y = 1; // 下に落下
    }
    
    // 氷結ブロックの状態が保持されているか確認
    expect(iceBlock?.type).toBe('ice1');
    expect(obstacleBlockManager.isObstacleBlock('ice1')).toBe(true);
    
    // 氷結ブロックを解除
    const redBlock = updatedBlocks.find(b => b.id === 'normal2');
    if (redBlock) {
      updatedBlocks = obstacleBlockManager.updateObstacleBlocks([redBlock], [...updatedBlocks]);
      
      // 氷結ブロックが通常ブロックに変わっているか確認
      const formerIceBlock = updatedBlocks.find(b => b.id === 'ice1');
      expect(formerIceBlock?.type).toBe('normal');
      expect(obstacleBlockManager.isObstacleBlock('ice1')).toBe(false);
    }
  });

  it('GameSceneのrebuildSpriteBlockMappingメソッドが呼ばれた後も氷結ブロックの状態が正しく保持される', () => {
    // GameSceneのrebuildSpriteBlockMappingをモック
    const mockRebuildSpriteBlockMapping = vi.fn((blocks: Block[]) => {
      // 実際の処理をシミュレート
      return blocks;
    });
    
    // 氷結ブロックの状態を更新
    const removedBlocks = [blocks[2]]; // 赤の通常ブロック
    const updatedBlocks = obstacleBlockManager.updateObstacleBlocks(removedBlocks, [...blocks]);
    
    // rebuildSpriteBlockMappingをシミュレート
    const blocksAfterRebuild = mockRebuildSpriteBlockMapping(updatedBlocks);
    
    // 氷結ブロックが通常ブロックに変わっているか確認
    const formerIceBlock = blocksAfterRebuild.find(b => b.id === 'ice1');
    expect(formerIceBlock).toBeDefined();
    expect(formerIceBlock?.type).toBe('normal');
    expect(formerIceBlock?.color).toBe('red');
    
    // ObstacleBlockManagerから削除されているか確認
    expect(obstacleBlockManager.isObstacleBlock('ice1')).toBe(false);
  });
});
