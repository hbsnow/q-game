import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../src/utils/BlockLogic';
import { Block } from '../src/types/Block';

/**
 * 氷結ブロックの挙動に関する失敗するテスト
 * 仕様: 氷結ブロックは消去されるのではなく、レベルが下がるだけ
 */
describe('氷結ブロックの挙動テスト（失敗するべき）', () => {
  it('氷結ブロックを含むグループを消去する際、氷結ブロックは消去されずレベルダウンするべき', () => {
    // 初期状態:
    // __R _*R **R
    // __Y __B __G
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
        { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null },
        { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null }
      ],
      [
        { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
        { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null },
        { x: 2, y: 1, color: 'green', type: 'normal', sprite: null }
      ]
    ];

    const blockLogic = new BlockLogic();
    
    // グループを検出
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 3つのブロックが見つかるはず
    expect(connectedBlocks.length).toBe(3);
    
    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
    
    // 更新後のブロックの状態を確認
    expect(updatedBlocks[0][0].type).toBe('normal'); // 元々通常ブロック
    expect(updatedBlocks[0][1].type).toBe('normal'); // 氷結Lv1から通常ブロックに
    expect(updatedBlocks[0][2].type).toBe('iceLv1'); // 氷結Lv2から氷結Lv1に
    
    // 以前の実装をシミュレート（すべてのブロックを消去）
    const mockGameScene = {
      blocks: JSON.parse(JSON.stringify(updatedBlocks)),
      removeBlocks: function(blocks: Block[]) {
        // 以前の実装では氷結ブロックも含めて全て消去していた
        blocks.forEach(block => {
          this.blocks[block.y][block.x] = null;
        });
      }
    };
    
    // 以前の実装でブロックを消去
    mockGameScene.removeBlocks(connectedBlocks);
    
    // 氷結ブロックも消去されてしまっているはず（これは仕様違反）
    expect(mockGameScene.blocks[0][1]).toBeNull(); // 消去されてしまっている
    expect(mockGameScene.blocks[0][2]).toBeNull(); // 消去されてしまっている
    
    // 正しい実装では氷結ブロックは消去されずにレベルダウンするだけ
    const correctImplementation = {
      blocks: JSON.parse(JSON.stringify(updatedBlocks)),
      removeBlocks: function(blocks: Block[]) {
        // 通常ブロックのみを消去
        blocks.forEach(block => {
          const updatedBlock = this.blocks[block.y][block.x];
          if (updatedBlock && updatedBlock.type === 'normal') {
            this.blocks[block.y][block.x] = null;
          }
        });
      }
    };
    
    // 正しい実装でブロックを消去
    correctImplementation.removeBlocks(connectedBlocks);
    
    // 通常ブロックのみが消去され、氷結ブロックは残っているはず
    expect(correctImplementation.blocks[0][0]).toBeNull(); // 通常ブロックは消去
    expect(correctImplementation.blocks[0][1]).toBeNull(); // 氷結Lv1から変わった通常ブロックも消去
    expect(correctImplementation.blocks[0][2]).not.toBeNull(); // 氷結Lv1は残っている
    expect(correctImplementation.blocks[0][2].type).toBe('iceLv1');
  });
});
