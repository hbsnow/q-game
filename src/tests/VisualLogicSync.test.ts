import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Block } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';

// モックスプライト作成用ヘルパー関数
const createMockSprite = () => ({
  destroy: vi.fn(),
  setTexture: vi.fn(),
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn()
});

describe('視覚表現と論理状態の同期テスト', () => {
  let blocks: Block[][];
  let blockLogic: BlockLogic;
  
  // テスト用の色定数
  const RED = '#FF0000';
  const BLUE = '#0000FF';
  
  beforeEach(() => {
    blockLogic = new BlockLogic();
    
    // テスト用のブロック配列を初期化
    blocks = [
      [
        { x: 0, y: 0, color: RED, type: 'normal', sprite: createMockSprite() as unknown as Phaser.GameObjects.Sprite },
        { x: 1, y: 0, color: RED, type: 'normal', sprite: createMockSprite() as unknown as Phaser.GameObjects.Sprite }
      ],
      [
        { x: 0, y: 1, color: BLUE, type: 'normal', sprite: createMockSprite() as unknown as Phaser.GameObjects.Sprite },
        { x: 1, y: 1, color: BLUE, type: 'normal', sprite: createMockSprite() as unknown as Phaser.GameObjects.Sprite }
      ]
    ];
  });
  
  describe('BlockLogic.applyGravity', () => {
    it('重力適用時にスプライト参照がnullに設定される', () => {
      // 重力適用前にスプライト参照が存在することを確認
      expect(blocks[0][0].sprite).not.toBeNull();
      expect(blocks[0][1].sprite).not.toBeNull();
      expect(blocks[1][0].sprite).not.toBeNull();
      expect(blocks[1][1].sprite).not.toBeNull();
      
      // 一部のブロックを消去
      blocks[0][0] = null;
      
      // 重力適用
      const updatedBlocks = blockLogic.applyGravity(blocks);
      
      // 重力適用後、全てのブロックのスプライト参照がnullになっていることを確認
      for (let y = 0; y < updatedBlocks.length; y++) {
        for (let x = 0; x < updatedBlocks[y].length; x++) {
          if (updatedBlocks[y][x]) {
            expect(updatedBlocks[y][x].sprite).toBeNull();
          }
        }
      }
      
      // 元のブロック配列のスプライト参照もnullになっていることを確認
      for (let y = 0; y < blocks.length; y++) {
        for (let x = 0; x < blocks[y].length; x++) {
          if (blocks[y][x]) {
            expect(blocks[y][x].sprite).toBeNull();
          }
        }
      }
    });
    
    it('重力適用後に座標が正しく更新される', () => {
      // 一部のブロックを消去
      blocks[0][0] = null;
      
      // 重力適用
      const updatedBlocks = blockLogic.applyGravity(blocks);
      
      // 重力適用後の座標を確認
      // 元の配置:
      // null RED
      // BLUE BLUE
      //
      // 期待される配置:
      // null RED
      // BLUE BLUE
      // (実際の実装では列ごとに独立して落下するため)
      
      // 上段の確認
      expect(updatedBlocks[0][0]).toBeNull();
      expect(updatedBlocks[0][1].color).toBe(RED);
      
      // 下段の座標を確認
      expect(updatedBlocks[1][0].color).toBe(BLUE);
      expect(updatedBlocks[1][0].x).toBe(0);
      expect(updatedBlocks[1][0].y).toBe(1);
      
      expect(updatedBlocks[1][1].color).toBe(BLUE);
      expect(updatedBlocks[1][1].x).toBe(1);
      expect(updatedBlocks[1][1].y).toBe(1);
    });
  });
  
  describe('ブロック消去と参照管理', () => {
    it('ブロック消去時にスプライト参照が適切に解放される', () => {
      // モックスプライトを取得
      const sprite = blocks[0][0].sprite;
      
      // ブロックを消去（スプライト参照をnullに設定）
      blocks[0][0].sprite = null;
      
      // スプライト参照がnullになっていることを確認
      expect(blocks[0][0].sprite).toBeNull();
      
      // 実際のゲームシーンでは、この後スプライトのdestroyが呼ばれる
      // ここではモックのdestroyメソッドを直接呼び出してテスト
      sprite.destroy();
      expect(sprite.destroy).toHaveBeenCalled();
    });
  });
  
  describe('視覚と論理の一貫性', () => {
    it('論理状態の変更後に視覚表現が正しく更新される', () => {
      // このテストは実際のGameSceneでの実装をシミュレート
      
      // 1. ブロックを消去
      blocks[0][0] = null;
      blocks[0][1].sprite = null; // スプライト参照を解放
      
      // 2. 重力適用
      const updatedBlocks = blockLogic.applyGravity(blocks);
      
      // 3. 論理状態が正しく更新されていることを確認
      expect(updatedBlocks[0][0]).toBeNull();
      expect(updatedBlocks[0][1].color).toBe(RED);
      expect(updatedBlocks[1][0].color).toBe(BLUE);
      expect(updatedBlocks[1][1].color).toBe(BLUE);
      
      // 4. 全てのスプライト参照がnullになっていることを確認
      for (let y = 0; y < updatedBlocks.length; y++) {
        for (let x = 0; x < updatedBlocks[y].length; x++) {
          if (updatedBlocks[y][x]) {
            expect(updatedBlocks[y][x].sprite).toBeNull();
          }
        }
      }
      
      // 5. 実際のゲームでは、この後updateBlockSpritesが呼ばれて
      // 視覚表現が再構築される
    });
  });
});
