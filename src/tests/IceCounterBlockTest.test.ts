import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockAsciiRenderer } from '../utils/BlockAsciiRenderer';
import { GameScene } from '../utils/GameScene';

describe('氷結カウンターブロックのテスト', () => {
  let blockLogic: BlockLogic;
  let gameScene: GameScene;
  
  beforeEach(() => {
    blockLogic = new BlockLogic();
    gameScene = new GameScene();
  });
  
  test('氷結カウンター+ブロックは隣接消去で氷結が解除されカウンター+ブロックになる', () => {
    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y *+R __R __Y  (氷結カウンター+ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 1, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 2, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 0, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 1, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 1, y: 1, color: '#FF6347', type: BlockType.ICE_COUNTER_PLUS, counterValue: 3 },
        { x: 2, y: 1, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 1, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 2, color: '#1E5799', type: BlockType.NORMAL },
        { x: 1, y: 2, color: '#FF6347', type: BlockType.NORMAL },
        { x: 2, y: 2, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 3, y: 2, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 3, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 1, y: 3, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 2, y: 3, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 3, color: '#FF6347', type: BlockType.NORMAL }
      ]
    ];
    
    // デバッグ用に盤面を表示
    BlockAsciiRenderer.logBlocks(blocks, '氷結カウンター+ブロックテスト初期状態');
    
    // GameSceneにブロックをセット
    gameScene.blocks = blocks;
    
    // 隣接する同色ブロックをクリック
    gameScene.clickBlock(0, 0);
    
    // 氷結カウンター+ブロックが通常のカウンター+ブロックに変化しているか確認
    expect(gameScene.blocks[1][1]?.type).toBe(BlockType.COUNTER_PLUS);
    expect(gameScene.blocks[1][1]?.counterValue).toBe(3);
    
    // デバッグ用に更新後の盤面を表示
    BlockAsciiRenderer.logBlocks(gameScene.blocks, '氷結カウンター+ブロック解除後');
  });
  
  test('氷結カウンター-ブロックは隣接消去で氷結が解除されカウンター-ブロックになる', () => {
    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y *-R __R __Y  (氷結カウンター-ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 1, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 2, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 0, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 1, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 1, y: 1, color: '#FF6347', type: BlockType.ICE_COUNTER_MINUS, counterValue: 3 },
        { x: 2, y: 1, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 1, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 2, color: '#1E5799', type: BlockType.NORMAL },
        { x: 1, y: 2, color: '#FF6347', type: BlockType.NORMAL },
        { x: 2, y: 2, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 3, y: 2, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 3, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 1, y: 3, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 2, y: 3, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 3, color: '#FF6347', type: BlockType.NORMAL }
      ]
    ];
    
    // デバッグ用に盤面を表示
    BlockAsciiRenderer.logBlocks(blocks, '氷結カウンター-ブロックテスト初期状態');
    
    // GameSceneにブロックをセット
    gameScene.blocks = blocks;
    
    // 隣接する同色ブロックをクリック
    gameScene.clickBlock(0, 0);
    
    // 氷結カウンター-ブロックが通常のカウンター-ブロックに変化しているか確認
    expect(gameScene.blocks[1][1]?.type).toBe(BlockType.COUNTER_MINUS);
    expect(gameScene.blocks[1][1]?.counterValue).toBe(3);
    
    // デバッグ用に更新後の盤面を表示
    BlockAsciiRenderer.logBlocks(gameScene.blocks, '氷結カウンター-ブロック解除後');
  });
  
  test('氷結カウンター+ブロックは条件を満たすとカウンター+ブロックになり、その後消去される', () => {
    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y *+R __R __Y  (氷結カウンター+ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 1, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 2, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 0, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 1, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 1, y: 1, color: '#FF6347', type: BlockType.ICE_COUNTER_PLUS, counterValue: 3 },
        { x: 2, y: 1, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 1, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 2, color: '#1E5799', type: BlockType.NORMAL },
        { x: 1, y: 2, color: '#FF6347', type: BlockType.NORMAL },
        { x: 2, y: 2, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 3, y: 2, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 3, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 1, y: 3, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 2, y: 3, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 3, color: '#FF6347', type: BlockType.NORMAL }
      ]
    ];
    
    // デバッグ用に盤面を表示
    BlockAsciiRenderer.logBlocks(blocks, '氷結カウンター+ブロック消去テスト初期状態');
    
    // GameSceneにブロックをセット
    gameScene.blocks = blocks;
    
    // 隣接する同色ブロックをクリック（氷結解除）
    gameScene.clickBlock(0, 0);
    
    // 氷結カウンター+ブロックが通常のカウンター+ブロックに変化しているか確認
    expect(gameScene.blocks[1][1]?.type).toBe(BlockType.COUNTER_PLUS);
    
    // デバッグ用に更新後の盤面を表示
    BlockAsciiRenderer.logBlocks(gameScene.blocks, '氷結カウンター+ブロック解除後');
    
    // 再度隣接する同色ブロックをクリック（カウンター+ブロックの条件を満たして消去）
    gameScene.clickBlock(2, 1);
    
    // カウンター+ブロックが消去されているか確認
    expect(gameScene.blocks[1][1]).toBeNull();
    
    // デバッグ用に更新後の盤面を表示
    BlockAsciiRenderer.logBlocks(gameScene.blocks, 'カウンター+ブロック消去後');
  });
  
  test('氷結カウンター-ブロックは条件を満たすとカウンター-ブロックになり、その後消去される', () => {
    // テスト用の盤面を作成
    // __R __B __R __Y
    // __Y *-R __B __Y  (氷結カウンター-ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 1, y: 0, color: '#1E5799', type: BlockType.NORMAL },
        { x: 2, y: 0, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 0, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 1, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 1, y: 1, color: '#FF6347', type: BlockType.ICE_COUNTER_MINUS, counterValue: 3 },
        { x: 2, y: 1, color: '#1E5799', type: BlockType.NORMAL },
        { x: 3, y: 1, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 2, color: '#1E5799', type: BlockType.NORMAL },
        { x: 1, y: 2, color: '#FF6347', type: BlockType.NORMAL },
        { x: 2, y: 2, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 3, y: 2, color: '#F4D03F', type: BlockType.NORMAL }
      ],
      [
        { x: 0, y: 3, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 1, y: 3, color: '#F4D03F', type: BlockType.NORMAL },
        { x: 2, y: 3, color: '#FF6347', type: BlockType.NORMAL },
        { x: 3, y: 3, color: '#FF6347', type: BlockType.NORMAL }
      ]
    ];
    
    // デバッグ用に盤面を表示
    BlockAsciiRenderer.logBlocks(blocks, '氷結カウンター-ブロック消去テスト初期状態');
    
    // GameSceneにブロックをセット
    gameScene.blocks = blocks;
    
    // 隣接する同色ブロックをクリック（氷結解除）
    gameScene.clickBlock(0, 0);
    
    // 氷結カウンター-ブロックが通常のカウンター-ブロックに変化しているか確認
    expect(gameScene.blocks[1][1]?.type).toBe(BlockType.COUNTER_MINUS);
    
    // デバッグ用に更新後の盤面を表示
    BlockAsciiRenderer.logBlocks(gameScene.blocks, '氷結カウンター-ブロック解除後');
    
    // 再度隣接する同色ブロックをクリック（カウンター-ブロックの条件を満たして消去）
    gameScene.clickBlock(2, 0);
    
    // カウンター-ブロックが消去されているか確認
    expect(gameScene.blocks[1][1]).toBeNull();
    
    // デバッグ用に更新後の盤面を表示
    BlockAsciiRenderer.logBlocks(gameScene.blocks, 'カウンター-ブロック消去後');
  });
});
