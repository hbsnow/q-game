import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../src/utils/BlockLogic';
import { Block } from '../src/types/Block';

/**
 * GameSceneの氷結ブロック処理をシミュレートするテスト
 */
describe('GameSceneの氷結ブロック処理テスト', () => {
  it('GameSceneのonBlockClickメソッドをシミュレートして氷結ブロックの挙動をテスト', () => {
    // 初期状態:
    //     a   b   c
    //  +-----------+
    // 0| __R _*R **R |
    // 1| __Y __B __G |
    //  +-----------+
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

    // GameSceneのonBlockClickメソッドをシミュレート
    const mockGameScene = {
      blocks: JSON.parse(JSON.stringify(blocks)),
      blockLogic: new BlockLogic(),
      
      // ブロックをクリックしたときの処理
      onBlockClick: function(x: number, y: number) {
        // 隣接する同色ブロックを検索
        const connectedBlocks = this.blockLogic.findConnectedBlocks(this.blocks, x, y);
        
        // 2つ以上のブロックが隣接している場合のみ処理
        if (connectedBlocks.length >= 2) {
          console.log('Connected blocks before update:', JSON.stringify(connectedBlocks));
          
          // 氷結ブロック更新前の状態を記録
          const beforeIceUpdate = JSON.parse(JSON.stringify(this.blocks));
          
          // 氷結ブロックの状態更新（レベルダウン）
          this.blocks = this.blockLogic.updateIceBlocks(this.blocks, connectedBlocks);
          
          console.log('Blocks after update:', JSON.stringify(this.blocks));
          
          // 通常ブロックのみを消去（氷結ブロックは消去しない）
          const normalBlocks = [];
          for (const block of connectedBlocks) {
            // 元々通常ブロックだったもののみを消去対象とする
            if (beforeIceUpdate[block.y][block.x].type === 'normal') {
              normalBlocks.push(block);
            }
          }
          
          console.log('Normal blocks to remove:', JSON.stringify(normalBlocks));
          
          // ブロックを消去
          normalBlocks.forEach(block => {
            this.blocks[block.y][block.x] = null;
          });
          
          console.log('Blocks after removal:', JSON.stringify(this.blocks));
          
          // 重力を適用
          this.blocks = this.blockLogic.applyGravity(this.blocks);
          
          console.log('Blocks after gravity:', JSON.stringify(this.blocks));
        }
      }
    };
    
    // 通常ブロックをクリック
    mockGameScene.onBlockClick(0, 0);
    
    // 期待される状態:
    //     a   b   c
    //  +-----------+
    // 0|     __R _*R |  <- 元々の通常ブロックのみ消去、氷結ブロックはレベルダウン
    // 1| __Y __B __G |
    //  +-----------+
    
    // 元々の通常ブロックが消去されているか確認
    expect(mockGameScene.blocks[0][0]).toBeNull();
    
    // 氷結ブロックがレベルダウンして残っているか確認
    expect(mockGameScene.blocks[0][1]).not.toBeNull();
    expect(mockGameScene.blocks[0][1].type).toBe('normal');
    expect(mockGameScene.blocks[0][1].color).toBe('red');
    
    expect(mockGameScene.blocks[0][2]).not.toBeNull();
    expect(mockGameScene.blocks[0][2].type).toBe('iceLv1');
    expect(mockGameScene.blocks[0][2].color).toBe('red');
  });
});
