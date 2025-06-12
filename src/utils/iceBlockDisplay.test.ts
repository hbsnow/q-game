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

describe('氷結ブロックの表示テスト', () => {
  let obstacleBlockManager: ObstacleBlockManager;
  let blocks: Block[];

  beforeEach(() => {
    // テスト用のブロック配列を初期化
    blocks = [
      {
        id: 'ice1',
        type: 'ice1',
        color: 'coralRed',
        x: 0,
        y: 0,
        iceLevel: 1
      },
      {
        id: 'normal1',
        type: 'normal',
        color: 'coralRed',
        x: 1,
        y: 0
      }
    ];

    // ObstacleBlockManagerを初期化
    obstacleBlockManager = new ObstacleBlockManager(blocks);
    
    // コンソール出力をスパイ
    vi.spyOn(console, 'log');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('氷結ブロックの描画情報が正しく取得できる', () => {
    // 氷結ブロックの描画情報を取得
    const renderInfo = obstacleBlockManager.getObstacleBlockRenderInfo('ice1');
    
    // 描画情報が存在することを確認
    expect(renderInfo).toBeDefined();
    
    // テクスチャキーが正しいことを確認
    expect(renderInfo?.textureKey).toBe('ice1Texture');
    
    // 色情報が存在することを確認
    expect(renderInfo?.tint).toBeDefined();
  });

  it('氷結ブロックが通常ブロックに変わると描画情報が更新される', () => {
    // 氷結ブロックの隣の通常ブロックを消去
    const removedBlocks = [blocks[1]]; // 赤の通常ブロック
    
    // 妨害ブロックの状態を更新
    const updatedBlocks = obstacleBlockManager.updateObstacleBlocks(removedBlocks, [...blocks]);
    
    // 更新後のブロックをログ出力
    console.log('Updated blocks:', updatedBlocks);
    
    // 氷結ブロックが通常ブロックに変わっていることを確認
    // 注: IDが変わっている可能性があるため、位置で検索
    const formerIceBlock = updatedBlocks.find(b => b.x === 0 && b.y === 0);
    expect(formerIceBlock).toBeDefined();
    expect(formerIceBlock?.type).toBe('normal');
    
    // 妨害ブロック管理から削除されていることを確認
    // 注: IDが変わっているため、元のIDではなく新しいIDを使用
    const newId = formerIceBlock?.id || '';
    expect(obstacleBlockManager.isObstacleBlock(newId)).toBe(false);
    
    // 描画情報が取得できないことを確認
    const renderInfo = obstacleBlockManager.getObstacleBlockRenderInfo(newId);
    expect(renderInfo).toBeUndefined();
    
    // 詳細なログが出力されていることを確認
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('changed to normal type'));
  });
});
