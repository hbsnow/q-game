import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockAsciiRenderer } from '../utils/BlockAsciiRenderer';

describe('カウンターブロックの正しい動作テスト', () => {
  let blockLogic: BlockLogic;
  
  beforeEach(() => {
    blockLogic = new BlockLogic();
  });
  
  test('カウンター+ブロックは条件を満たさない場合、カウンターブロックだけが残る', () => {
    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y _+R __R __Y  (カウンター+ブロックの値が7 - 条件を満たさない)
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
        { x: 1, y: 1, color: '#FF6347', type: BlockType.COUNTER_PLUS, counterValue: 7 },
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
    BlockAsciiRenderer.logBlocks(blocks, 'カウンター+ブロック条件未達テスト初期状態');
    
    // カウンター+ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);
    
    // 条件を満たしていないはず（グループサイズ5 < カウンター値7）
    expect(result).toBe(false);
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(5); // カウンター+ブロックを含む5つのブロック
    
    // 消去可能なブロックと消去不可能なブロックを分ける
    const removableBlocks = connectedBlocks.filter(block => 
      block.type === BlockType.NORMAL || 
      (block.type === BlockType.COUNTER_PLUS && blockLogic.checkCounterCondition(blocks, block)) ||
      (block.type === BlockType.COUNTER_MINUS && blockLogic.checkCounterCondition(blocks, block))
    );
    
    // 通常ブロックのみが消去可能なはず
    expect(removableBlocks.length).toBe(4); // カウンターブロックを除く4つの通常ブロック
    
    // カウンターブロックは消去不可能なはず
    const nonRemovableBlocks = connectedBlocks.filter(block => !removableBlocks.includes(block));
    expect(nonRemovableBlocks.length).toBe(1); // カウンターブロック1つ
    expect(nonRemovableBlocks[0].type).toBe(BlockType.COUNTER_PLUS);
  });
  
  test('カウンター-ブロックは条件を満たさない場合、カウンターブロックだけが残る', () => {
    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y _-R __R __Y  (カウンター-ブロックの値が2 - 条件を満たさない)
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
        { x: 1, y: 1, color: '#FF6347', type: BlockType.COUNTER_MINUS, counterValue: 2 },
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
    BlockAsciiRenderer.logBlocks(blocks, 'カウンター-ブロック条件未達テスト初期状態');
    
    // カウンター-ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);
    
    // 条件を満たしていないはず（グループサイズ5 > カウンター値2）
    expect(result).toBe(false);
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(5); // カウンター-ブロックを含む5つのブロック
    
    // 消去可能なブロックと消去不可能なブロックを分ける
    const removableBlocks = connectedBlocks.filter(block => 
      block.type === BlockType.NORMAL || 
      (block.type === BlockType.COUNTER_PLUS && blockLogic.checkCounterCondition(blocks, block)) ||
      (block.type === BlockType.COUNTER_MINUS && blockLogic.checkCounterCondition(blocks, block))
    );
    
    // 通常ブロックのみが消去可能なはず
    expect(removableBlocks.length).toBe(4); // カウンターブロックを除く4つの通常ブロック
    
    // カウンターブロックは消去不可能なはず
    const nonRemovableBlocks = connectedBlocks.filter(block => !removableBlocks.includes(block));
    expect(nonRemovableBlocks.length).toBe(1); // カウンターブロック1つ
    expect(nonRemovableBlocks[0].type).toBe(BlockType.COUNTER_MINUS);
  });
});
