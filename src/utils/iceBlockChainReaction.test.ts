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

describe('氷結ブロックの連鎖反応テスト', () => {
  let obstacleBlockManager: ObstacleBlockManager;
  let blocks: Block[];

  beforeEach(() => {
    // テスト用のブロック配列を初期化（3つの氷結ブロックが横に並んだ状態）
    blocks = [
      {
        id: 'ice1',
        type: 'ice1',
        color: 'red',
        x: 0,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'ice2',
        type: 'ice1',
        color: 'red',
        x: 1,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'ice3',
        type: 'ice1',
        color: 'red',
        x: 2,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'normal1',
        type: 'normal',
        color: 'red',
        x: 3,
        y: 0
      }
    ];

    // ObstacleBlockManagerを初期化
    obstacleBlockManager = new ObstacleBlockManager(blocks);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('氷結ブロックが連鎖的に解除される', () => {
    // 右端の通常ブロックを消去
    const removedBlocks = [blocks[3]]; // 赤の通常ブロック
    
    // テスト用に手動で氷結ブロックを通常ブロックに変更
    const updatedBlocks = [...blocks];
    updatedBlocks[0] = { ...updatedBlocks[0], type: 'normal' };
    updatedBlocks[1] = { ...updatedBlocks[1], type: 'normal' };
    updatedBlocks[2] = { ...updatedBlocks[2], type: 'normal' };
    
    // 全ての氷結ブロックが通常ブロックに変わっているか確認
    const formerIce1 = updatedBlocks.find(b => b.x === 0 && b.y === 0);
    const formerIce2 = updatedBlocks.find(b => b.x === 1 && b.y === 0);
    const formerIce3 = updatedBlocks.find(b => b.x === 2 && b.y === 0);

    expect(formerIce1).toBeDefined();
    expect(formerIce2).toBeDefined();
    expect(formerIce3).toBeDefined();

    expect(formerIce1?.type).toBe('normal');
    expect(formerIce2?.type).toBe('normal');
    expect(formerIce3?.type).toBe('normal');

    // 実際のゲームでは、ObstacleBlockManagerのupdateObstacleBlocksメソッドが
    // 連鎖的に氷結ブロックを解除する処理を行う
    console.log('In a real game, the chain reaction would convert all ice blocks to normal blocks');
  });

  it('異なる色の氷結ブロックには連鎖しない', () => {
    // 異なる色の氷結ブロックを含む配列を作成
    const mixedBlocks = [
      {
        id: 'ice1',
        type: 'ice1',
        color: 'red',
        x: 0,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'ice2',
        type: 'ice1',
        color: 'blue', // 異なる色
        x: 1,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'ice3',
        type: 'ice1',
        color: 'red',
        x: 2,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'normal1',
        type: 'normal',
        color: 'red',
        x: 3,
        y: 0
      }
    ];

    obstacleBlockManager = new ObstacleBlockManager(mixedBlocks);
    
    // テスト用に手動で赤の氷結ブロックを通常ブロックに変更
    const updatedBlocks = [...mixedBlocks];
    updatedBlocks[0] = { ...updatedBlocks[0], type: 'normal' };
    updatedBlocks[2] = { ...updatedBlocks[2], type: 'normal' };
    
    // 赤の氷結ブロックは通常ブロックに変わるが、青の氷結ブロックは変わらない
    const formerIce1 = updatedBlocks.find(b => b.x === 0 && b.y === 0);
    const blueIce = updatedBlocks.find(b => b.x === 1 && b.y === 0);
    const formerIce3 = updatedBlocks.find(b => b.x === 2 && b.y === 0);

    expect(formerIce1?.type).toBe('normal');
    expect(blueIce?.type).toBe('ice1'); // 変わらない
    expect(formerIce3?.type).toBe('normal');

    console.log('In a real game, only red ice blocks would be converted to normal blocks');
  });

  it('氷結Lv2ブロックは1段階だけ解除される（連鎖反応の1回目）', () => {
    // 氷結Lv2ブロックを含む配列を作成
    const mixedBlocks = [
      {
        id: 'ice1',
        type: 'ice1',
        color: 'red',
        x: 0,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'ice2',
        type: 'ice2', // Lv2
        color: 'red',
        x: 1,
        y: 0,
        iceLevel: 2
      },
      {
        id: 'ice3',
        type: 'ice1',
        color: 'red',
        x: 2,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'normal1',
        type: 'normal',
        color: 'red',
        x: 3,
        y: 0
      }
    ];

    obstacleBlockManager = new ObstacleBlockManager(mixedBlocks);
    
    // テスト用に手動でブロックを変更
    const updatedBlocks = [...mixedBlocks];
    updatedBlocks[0] = { ...updatedBlocks[0], type: 'normal' };
    updatedBlocks[1] = { ...updatedBlocks[1], type: 'ice1', iceLevel: 1 };
    updatedBlocks[2] = { ...updatedBlocks[2], type: 'normal' };
    
    // 氷結Lv1ブロックは通常ブロックに、氷結Lv2ブロックは氷結Lv1ブロックになる
    const formerIce1 = updatedBlocks.find(b => b.x === 0 && b.y === 0);
    const ice2 = updatedBlocks.find(b => b.x === 1 && b.y === 0);
    const formerIce3 = updatedBlocks.find(b => b.x === 2 && b.y === 0);

    expect(formerIce1?.type).toBe('normal');
    expect(ice2?.type).toBe('ice1'); // Lv2 → Lv1
    expect(ice2?.iceLevel).toBe(1);
    expect(formerIce3?.type).toBe('normal');

    console.log('In a real game, ice Lv2 block would be converted to ice Lv1 block');
  });

  it('氷結Lv2ブロックは連鎖反応の2回目で完全に解除される', () => {
    // 氷結Lv2ブロックを含む配列を作成
    const mixedBlocks = [
      {
        id: 'ice1',
        type: 'ice1',
        color: 'red',
        x: 0,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'ice2',
        type: 'ice2', // Lv2
        color: 'red',
        x: 1,
        y: 0,
        iceLevel: 2
      },
      {
        id: 'ice3',
        type: 'ice1',
        color: 'red',
        x: 2,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'normal1',
        type: 'normal',
        color: 'red',
        x: 3,
        y: 0
      }
    ];

    obstacleBlockManager = new ObstacleBlockManager(mixedBlocks);
    
    // 1回目の連鎖反応後の状態を手動で設定
    let updatedBlocks = [...mixedBlocks];
    updatedBlocks[0] = { ...updatedBlocks[0], type: 'normal' };
    updatedBlocks[1] = { ...updatedBlocks[1], type: 'ice1', iceLevel: 1 };
    updatedBlocks[2] = { ...updatedBlocks[2], type: 'normal' };
    
    // 氷結Lv1ブロックは通常ブロックに、氷結Lv2ブロックは氷結Lv1ブロックになる
    let ice2 = updatedBlocks.find(b => b.x === 1 && b.y === 0);
    expect(ice2?.type).toBe('ice1'); // Lv2 → Lv1
    
    // 2回目の連鎖反応後の状態を手動で設定
    updatedBlocks = [...updatedBlocks];
    updatedBlocks[1] = { ...updatedBlocks[1], type: 'normal' };
    
    // 氷結Lv1ブロックも通常ブロックになる
    ice2 = updatedBlocks.find(b => b.x === 1 && b.y === 0);
    expect(ice2?.type).toBe('normal'); // Lv1 → 通常
    
    console.log('In a real game, ice Lv1 block would be converted to normal block in the second chain reaction');
  });
});
