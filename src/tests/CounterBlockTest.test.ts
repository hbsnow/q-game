import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockAsciiRenderer } from '../utils/BlockAsciiRenderer';

describe('カウンターブロックのテスト', () => {
  let blockLogic: BlockLogic;
  
  beforeEach(() => {
    blockLogic = new BlockLogic();
  });
  
  test('カウンター+ブロックは指定数以上のブロックグループで消去可能', () => {
    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y _+R __R __Y  (カウンター+ブロックの値が3)
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
        { x: 1, y: 1, color: '#FF6347', type: BlockType.COUNTER_PLUS, counterValue: 3 },
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
    BlockAsciiRenderer.logBlocks(blocks, 'カウンター+ブロックテスト初期状態');
    
    // カウンター+ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);
    
    // 条件を満たしているはず（グループサイズ5 >= カウンター値3）
    expect(result).toBe(true);
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(5); // カウンター+ブロックを含む5つのブロック
  });
  
  test('カウンター+ブロックは指定数未満のブロックグループでは消去不可', () => {
    // テスト用の盤面を作成
    // __R __B __R __Y
    // __Y _+R __B __Y  (カウンター+ブロックの値が5)
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
        { x: 1, y: 1, color: '#FF6347', type: BlockType.COUNTER_PLUS, counterValue: 5 },
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
    BlockAsciiRenderer.logBlocks(blocks, 'カウンター+ブロック条件未達テスト初期状態');
    
    // カウンター+ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);
    
    // 条件を満たしていないはず（グループサイズ3 < カウンター値5）
    expect(result).toBe(false);
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(3); // カウンター+ブロックを含む3つのブロック
  });
  
  test('カウンター-ブロックは指定数以下のブロックグループで消去可能', () => {
    // テスト用の盤面を作成
    // __R __B __R __Y
    // __Y _-R __B __Y  (カウンター-ブロックの値が5)
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
        { x: 1, y: 1, color: '#FF6347', type: BlockType.COUNTER_MINUS, counterValue: 5 },
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
    BlockAsciiRenderer.logBlocks(blocks, 'カウンター-ブロックテスト初期状態');
    
    // カウンター-ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);
    
    // 条件を満たしているはず（グループサイズ3 <= カウンター値5）
    expect(result).toBe(true);
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(3); // カウンター-ブロックを含む3つのブロック
  });
  
  test('カウンター-ブロックは指定数より大きいブロックグループでは消去不可', () => {
    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y _-R __R __Y  (カウンター-ブロックの値が3)
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
        { x: 1, y: 1, color: '#FF6347', type: BlockType.COUNTER_MINUS, counterValue: 3 },
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
    BlockAsciiRenderer.logBlocks(blocks, 'カウンター-ブロック条件超過テスト初期状態');
    
    // カウンター-ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);
    
    // 条件を満たしていないはず（グループサイズ5 > カウンター値3）
    expect(result).toBe(false);
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(5); // カウンター-ブロックを含む5つのブロック
  });
});
