import { describe, it, expect, beforeEach } from 'vitest';
import { Block } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';

describe('列スライド機能テスト', () => {
  let blockLogic: BlockLogic;
  let blocks: Block[][];
  
  // テスト用の色定数
  const RED = '#FF0000';
  const BLUE = '#0000FF';
  const GREEN = '#00FF00';
  const YELLOW = '#FFFF00';
  
  beforeEach(() => {
    blockLogic = new BlockLogic();
    
    // テスト用のブロック配列を初期化（3x3のグリッド）
    blocks = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
  });
  
  describe('列が完全に空になった場合の横スライド', () => {
    it('中央の列が空になった場合、右の列が左にスライドする', () => {
      // テスト用のブロック配置
      // R _ B
      // G _ Y
      // R _ G
      blocks[0][0] = { x: 0, y: 0, color: RED, type: 'normal' };
      blocks[0][2] = { x: 2, y: 0, color: BLUE, type: 'normal' };
      blocks[1][0] = { x: 0, y: 1, color: GREEN, type: 'normal' };
      blocks[1][2] = { x: 2, y: 1, color: YELLOW, type: 'normal' };
      blocks[2][0] = { x: 0, y: 2, color: RED, type: 'normal' };
      blocks[2][2] = { x: 2, y: 2, color: GREEN, type: 'normal' };
      
      // 中央の列は空
      blocks[0][1] = null;
      blocks[1][1] = null;
      blocks[2][1] = null;
      
      // 横スライド処理を適用
      const updatedBlocks = blockLogic.applyHorizontalSlide(blocks);
      
      // 期待される結果:
      // R B _
      // G Y _
      // R G _
      
      // 左列の確認
      expect(updatedBlocks[0][0].color).toBe(RED);
      expect(updatedBlocks[1][0].color).toBe(GREEN);
      expect(updatedBlocks[2][0].color).toBe(RED);
      
      // 中央列の確認（右列がスライドしてくる）
      expect(updatedBlocks[0][1].color).toBe(BLUE);
      expect(updatedBlocks[1][1].color).toBe(YELLOW);
      expect(updatedBlocks[2][1].color).toBe(GREEN);
      
      // 右列の確認（空になる）
      expect(updatedBlocks[0][2]).toBeNull();
      expect(updatedBlocks[1][2]).toBeNull();
      expect(updatedBlocks[2][2]).toBeNull();
      
      // 座標が正しく更新されていることを確認
      expect(updatedBlocks[0][1].x).toBe(1);
      expect(updatedBlocks[0][1].y).toBe(0);
      expect(updatedBlocks[1][1].x).toBe(1);
      expect(updatedBlocks[1][1].y).toBe(1);
    });
    
    it('左の列が空になった場合、中央と右の列が左にスライドする', () => {
      // テスト用のブロック配置
      // _ R B
      // _ G Y
      // _ R G
      blocks[0][1] = { x: 1, y: 0, color: RED, type: 'normal' };
      blocks[0][2] = { x: 2, y: 0, color: BLUE, type: 'normal' };
      blocks[1][1] = { x: 1, y: 1, color: GREEN, type: 'normal' };
      blocks[1][2] = { x: 2, y: 1, color: YELLOW, type: 'normal' };
      blocks[2][1] = { x: 1, y: 2, color: RED, type: 'normal' };
      blocks[2][2] = { x: 2, y: 2, color: GREEN, type: 'normal' };
      
      // 左の列は空
      blocks[0][0] = null;
      blocks[1][0] = null;
      blocks[2][0] = null;
      
      // 横スライド処理を適用
      const updatedBlocks = blockLogic.applyHorizontalSlide(blocks);
      
      // 期待される結果:
      // R B _
      // G Y _
      // R G _
      
      // 左列の確認（中央列がスライドしてくる）
      expect(updatedBlocks[0][0].color).toBe(RED);
      expect(updatedBlocks[1][0].color).toBe(GREEN);
      expect(updatedBlocks[2][0].color).toBe(RED);
      
      // 中央列の確認（右列がスライドしてくる）
      expect(updatedBlocks[0][1].color).toBe(BLUE);
      expect(updatedBlocks[1][1].color).toBe(YELLOW);
      expect(updatedBlocks[2][1].color).toBe(GREEN);
      
      // 右列の確認（空になる）
      expect(updatedBlocks[0][2]).toBeNull();
      expect(updatedBlocks[1][2]).toBeNull();
      expect(updatedBlocks[2][2]).toBeNull();
      
      // 座標が正しく更新されていることを確認
      expect(updatedBlocks[0][0].x).toBe(0);
      expect(updatedBlocks[0][0].y).toBe(0);
      expect(updatedBlocks[0][1].x).toBe(1);
      expect(updatedBlocks[0][1].y).toBe(0);
    });
    
    it('複数の列が空になった場合も正しくスライドする', () => {
      // テスト用のブロック配置（5列）
      // _ _ R _ B
      // _ _ G _ Y
      // _ _ R _ G
      const wideBlocks: Block[][] = [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null]
      ];
      
      wideBlocks[0][2] = { x: 2, y: 0, color: RED, type: 'normal' };
      wideBlocks[0][4] = { x: 4, y: 0, color: BLUE, type: 'normal' };
      wideBlocks[1][2] = { x: 2, y: 1, color: GREEN, type: 'normal' };
      wideBlocks[1][4] = { x: 4, y: 1, color: YELLOW, type: 'normal' };
      wideBlocks[2][2] = { x: 2, y: 2, color: RED, type: 'normal' };
      wideBlocks[2][4] = { x: 4, y: 2, color: GREEN, type: 'normal' };
      
      // 横スライド処理を適用
      const updatedBlocks = blockLogic.applyHorizontalSlide(wideBlocks);
      
      // 期待される結果:
      // R B _ _ _
      // G Y _ _ _
      // R G _ _ _
      
      // 左列の確認
      expect(updatedBlocks[0][0].color).toBe(RED);
      expect(updatedBlocks[1][0].color).toBe(GREEN);
      expect(updatedBlocks[2][0].color).toBe(RED);
      
      // 2列目の確認
      expect(updatedBlocks[0][1].color).toBe(BLUE);
      expect(updatedBlocks[1][1].color).toBe(YELLOW);
      expect(updatedBlocks[2][1].color).toBe(GREEN);
      
      // 残りの列は空
      for (let y = 0; y < 3; y++) {
        for (let x = 2; x < 5; x++) {
          expect(updatedBlocks[y][x]).toBeNull();
        }
      }
      
      // 座標が正しく更新されていることを確認
      expect(updatedBlocks[0][0].x).toBe(0);
      expect(updatedBlocks[0][1].x).toBe(1);
    });
    
    it('空の列がない場合は何も変更しない', () => {
      // テスト用のブロック配置
      // R G B
      // G Y R
      // R G B
      blocks[0][0] = { x: 0, y: 0, color: RED, type: 'normal' };
      blocks[0][1] = { x: 1, y: 0, color: GREEN, type: 'normal' };
      blocks[0][2] = { x: 2, y: 0, color: BLUE, type: 'normal' };
      blocks[1][0] = { x: 0, y: 1, color: GREEN, type: 'normal' };
      blocks[1][1] = { x: 1, y: 1, color: YELLOW, type: 'normal' };
      blocks[1][2] = { x: 2, y: 1, color: RED, type: 'normal' };
      blocks[2][0] = { x: 0, y: 2, color: RED, type: 'normal' };
      blocks[2][1] = { x: 1, y: 2, color: GREEN, type: 'normal' };
      blocks[2][2] = { x: 2, y: 2, color: BLUE, type: 'normal' };
      
      // 横スライド処理を適用
      const updatedBlocks = blockLogic.applyHorizontalSlide(blocks);
      
      // 変更がないことを確認
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          expect(updatedBlocks[y][x].color).toBe(blocks[y][x].color);
          expect(updatedBlocks[y][x].x).toBe(x);
          expect(updatedBlocks[y][x].y).toBe(y);
        }
      }
    });
    
    it('スプライト参照がnullに設定されることを確認', () => {
      // スプライト参照を持つブロック配置
      // R _ B
      // G _ Y
      blocks[0][0] = { x: 0, y: 0, color: RED, type: 'normal', sprite: {} as Phaser.GameObjects.Sprite };
      blocks[0][2] = { x: 2, y: 0, color: BLUE, type: 'normal', sprite: {} as Phaser.GameObjects.Sprite };
      blocks[1][0] = { x: 0, y: 1, color: GREEN, type: 'normal', sprite: {} as Phaser.GameObjects.Sprite };
      blocks[1][2] = { x: 2, y: 1, color: YELLOW, type: 'normal', sprite: {} as Phaser.GameObjects.Sprite };
      
      // 横スライド処理を適用
      const updatedBlocks = blockLogic.applyHorizontalSlide(blocks);
      
      // スプライト参照がnullになっていることを確認
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 3; x++) {
          if (updatedBlocks[y][x]) {
            expect(updatedBlocks[y][x].sprite).toBeNull();
          }
        }
      }
    });
  });
});
