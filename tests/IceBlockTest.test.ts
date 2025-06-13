import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../src/utils/BlockLogic';
import { Block } from '../src/types/Block';

/**
 * 氷結ブロックの挙動に関するテスト
 * 仕様: 氷結ブロックは消去されるのではなく、レベルが下がるだけ
 */
describe('氷結ブロックの挙動テスト', () => {
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
    
    // 元々通常ブロックだったもののみを消去するシミュレーション
    const normalBlocks = [];
    for (const block of connectedBlocks) {
      // 元々通常ブロックだったもののみを消去対象とする
      if (blocks[block.y][block.x].type === 'normal') {
        normalBlocks.push(block);
      }
    }
    
    // 通常ブロックは1つだけあるはず（元の通常ブロックのみ）
    expect(normalBlocks.length).toBe(1);
    
    // 通常ブロックのみを消去した結果の状態
    const finalBlocks = JSON.parse(JSON.stringify(updatedBlocks));
    normalBlocks.forEach(block => {
      finalBlocks[block.y][block.x] = null;
    });
    
    // 元々の通常ブロックは消去されているはず
    expect(finalBlocks[0][0]).toBeNull();
    
    // 氷結ブロックから変わったブロックは残っているはず
    expect(finalBlocks[0][1]).not.toBeNull();
    expect(finalBlocks[0][1].type).toBe('normal');
    
    // 氷結Lv2から変わった氷結Lv1ブロックも残っているはず
    expect(finalBlocks[0][2]).not.toBeNull();
    expect(finalBlocks[0][2].type).toBe('iceLv1');
  });
});
