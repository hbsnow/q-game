import { describe, it, expect, vi } from 'vitest';
import { BlockLogic } from '../src/utils/BlockLogic';
import { Block } from '../src/types/Block';

/**
 * 氷結ブロックのクリック挙動に関するテスト
 * 仕様: 氷結ブロックは直接クリックできない
 */
describe('氷結ブロックのクリック挙動テスト', () => {
  it('氷結ブロックを直接クリックしても何も起こらない', () => {
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
      isProcessing: false,
      debugHelper: { setLastClickPosition: vi.fn() },
      processingContinued: false,
      
      // ブロックをクリックしたときの処理
      onBlockClick: function(x: number, y: number) {
        // クリックされたブロックが氷結ブロックかチェック
        const clickedBlock = this.blocks[y][x];
        if (clickedBlock && (clickedBlock.type === 'iceLv1' || clickedBlock.type === 'iceLv2')) {
          // 氷結ブロックは直接クリックできない
          console.log('氷結ブロックは直接クリックできません');
          return;
        }
        
        this.isProcessing = true;
        
        // 処理が続行されたことを示すフラグ
        this.processingContinued = true;
      }
    };
    
    // 通常ブロックをクリック
    mockGameScene.onBlockClick(0, 0);
    
    // 処理が続行されたことを確認
    expect(mockGameScene.processingContinued).toBe(true);
    expect(mockGameScene.isProcessing).toBe(true);
    
    // 氷結Lv1ブロックをクリック
    mockGameScene.isProcessing = false;
    mockGameScene.processingContinued = false;
    mockGameScene.onBlockClick(1, 0);
    
    // 処理が中断されたことを確認
    expect(mockGameScene.processingContinued).toBe(false); // 値が変更されていないことを確認
    expect(mockGameScene.isProcessing).toBe(false);
    
    // 氷結Lv2ブロックをクリック
    mockGameScene.isProcessing = false;
    mockGameScene.processingContinued = false;
    mockGameScene.onBlockClick(2, 0);
    
    // 処理が中断されたことを確認
    expect(mockGameScene.processingContinued).toBe(false); // 値が変更されていないことを確認
    expect(mockGameScene.isProcessing).toBe(false);
  });
});
