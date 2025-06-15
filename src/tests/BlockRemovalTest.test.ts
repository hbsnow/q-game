import { describe, it, expect } from 'vitest';
import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';

describe('ブロック消去ロジックのテスト', () => {
  const blockLogic = new BlockLogic();
  const RED = '#FF6347'; // 珊瑚赤
  const BLUE = '#1E5799'; // 深い青

  // テスト用のブロック配列を作成する関数
  function createTestBlocks(): Block[][] {
    // 5x5のブロック配列を作成
    const blocks: Block[][] = [];
    for (let y = 0; y < 5; y++) {
      blocks[y] = [];
      for (let x = 0; x < 5; x++) {
        blocks[y][x] = null;
      }
    }
    return blocks;
  }

  // 通常ブロックの消去テスト
  it('通常ブロックは消去される', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 2, 2);
    expect(connectedBlocks.length).toBe(2);
    
    // 消去対象のブロックを特定（実際のゲームシーンのロジックを模倣）
    const blocksToRemove = connectedBlocks.filter(block => {
      return blocks[block.y][block.x].type === BlockType.NORMAL;
    });
    
    expect(blocksToRemove.length).toBe(2);
  });

  // カウンター+ブロックのテスト
  it('条件を満たすカウンター+ブロックは消去される', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置（カウンター+ブロックの条件値は3）
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.COUNTER_PLUS, counterValue: 3, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][2] = { x: 2, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][3] = { x: 3, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 2, 2);
    expect(connectedBlocks.length).toBe(4); // 4つのブロックが連結している
    
    // カウンターブロックの条件をチェック
    const counterBlock = blocks[2][2];
    const isCounterConditionMet = blockLogic.checkCounterCondition(blocks, counterBlock);
    expect(isCounterConditionMet).toBe(true); // 条件を満たしている（4 >= 3）
    
    // 条件を満たさないカウンターブロックを特定
    const nonRemovableCounterBlocks = connectedBlocks.filter(block => {
      if (block.type === BlockType.COUNTER_PLUS || block.type === BlockType.COUNTER_MINUS) {
        return !blockLogic.checkCounterCondition(blocks, block);
      }
      return false;
    });
    
    expect(nonRemovableCounterBlocks.length).toBe(0); // 条件を満たさないカウンターブロックはない
    
    // 消去対象のブロックを特定
    const blocksToRemove = connectedBlocks.filter(block => {
      // 条件を満たさないカウンターブロックは消去しない
      if (nonRemovableCounterBlocks.includes(block)) {
        return false;
      }
      
      // 元々通常ブロックだったもの、または条件を満たすカウンターブロックを消去対象とする
      return block.type === BlockType.NORMAL || 
             block.type === BlockType.COUNTER_PLUS || 
             block.type === BlockType.COUNTER_MINUS;
    });
    
    expect(blocksToRemove.length).toBe(4); // 全てのブロックが消去対象
  });

  // 条件を満たさないカウンター+ブロックのテスト
  it('条件を満たさないカウンター+ブロックは消去されない', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置（カウンター+ブロックの条件値は5）
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.COUNTER_PLUS, counterValue: 5, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][2] = { x: 2, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 2, 2);
    expect(connectedBlocks.length).toBe(3); // 3つのブロックが連結している
    
    // カウンターブロックの条件をチェック
    const counterBlock = blocks[2][2];
    const isCounterConditionMet = blockLogic.checkCounterCondition(blocks, counterBlock);
    expect(isCounterConditionMet).toBe(false); // 条件を満たしていない（3 < 5）
    
    // 条件を満たさないカウンターブロックを特定
    const nonRemovableCounterBlocks = connectedBlocks.filter(block => {
      if (block.type === BlockType.COUNTER_PLUS || block.type === BlockType.COUNTER_MINUS) {
        return !blockLogic.checkCounterCondition(blocks, block);
      }
      return false;
    });
    
    expect(nonRemovableCounterBlocks.length).toBe(1); // 条件を満たさないカウンターブロックが1つある
    
    // 消去対象のブロックを特定
    const blocksToRemove = connectedBlocks.filter(block => {
      // 条件を満たさないカウンターブロックは消去しない
      if (nonRemovableCounterBlocks.includes(block)) {
        return false;
      }
      
      // 元々通常ブロックだったもの、または条件を満たすカウンターブロックを消去対象とする
      return block.type === BlockType.NORMAL || 
             block.type === BlockType.COUNTER_PLUS || 
             block.type === BlockType.COUNTER_MINUS;
    });
    
    expect(blocksToRemove.length).toBe(2); // 通常ブロックのみが消去対象
  });

  // 氷結ブロックの消去テスト
  it('氷結ブロックは消去されない', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.ICE_LV1, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 2, 2);
    expect(connectedBlocks.length).toBe(2);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックが通常ブロックに変化していることを確認
    expect(updatedBlocks[2][2].type).toBe(BlockType.NORMAL);
    
    // 消去対象のブロックを特定（実際のゲームシーンのロジックを模倣）
    // 元々氷結ブロックだったものは消去対象から除外
    const beforeIceUpdate = JSON.parse(JSON.stringify(blocks));
    const blocksToRemove = connectedBlocks.filter(block => {
      // 元々氷結ブロックだったものは消去しない
      if (beforeIceUpdate[block.y][block.x].type === BlockType.ICE_LV1 ||
          beforeIceUpdate[block.y][block.x].type === BlockType.ICE_LV2 ||
          beforeIceUpdate[block.y][block.x].type === BlockType.ICE_COUNTER_PLUS ||
          beforeIceUpdate[block.y][block.x].type === BlockType.ICE_COUNTER_MINUS) {
        return false;
      }
      
      // 元々通常ブロックだったものを消去対象とする
      return beforeIceUpdate[block.y][block.x].type === BlockType.NORMAL;
    });
    
    expect(blocksToRemove.length).toBe(1); // 通常ブロックのみが消去対象
  });

  // 氷結カウンターブロックのテスト
  it('氷結カウンターブロックは消去されない', () => {
    const blocks = createTestBlocks();
    
    // 赤色のブロックを配置
    blocks[2][2] = { x: 2, y: 2, color: RED, type: BlockType.ICE_COUNTER_PLUS, counterValue: 3, sprite: null };
    blocks[2][3] = { x: 3, y: 2, color: RED, type: BlockType.NORMAL, sprite: null };
    blocks[3][2] = { x: 2, y: 3, color: RED, type: BlockType.NORMAL, sprite: null };
    
    // 連結ブロックを取得
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 3, 2);
    expect(connectedBlocks.length).toBe(3);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結カウンターブロックが通常カウンターブロックに変化していることを確認
    expect(updatedBlocks[2][2].type).toBe(BlockType.COUNTER_PLUS);
    
    // 消去対象のブロックを特定（実際のゲームシーンのロジックを模倣）
    const beforeIceUpdate = JSON.parse(JSON.stringify(blocks));
    const blocksToRemove = connectedBlocks.filter(block => {
      // 現在の状態で氷結ブロックかどうかをチェック
      const currentBlock = updatedBlocks[block.y][block.x];
      if (!currentBlock) return false;
      
      // 氷結ブロックは消去しない
      if (currentBlock.type === BlockType.ICE_LV1 ||
          currentBlock.type === BlockType.ICE_LV2 ||
          currentBlock.type === BlockType.ICE_COUNTER_PLUS ||
          currentBlock.type === BlockType.ICE_COUNTER_MINUS) {
        return false;
      }
      
      // 元々通常ブロックだったもの、または条件を満たすカウンターブロックを消去対象とする
      if (beforeIceUpdate[block.y][block.x].type === BlockType.NORMAL ||
          beforeIceUpdate[block.y][block.x].type === BlockType.COUNTER_PLUS ||
          beforeIceUpdate[block.y][block.x].type === BlockType.COUNTER_MINUS) {
        return true;
      }
      
      return false;
    });
    
    expect(blocksToRemove.length).toBe(2); // 通常ブロックのみが消去対象
  });
});
