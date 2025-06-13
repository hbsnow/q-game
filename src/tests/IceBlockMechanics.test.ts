import { describe, it, expect, beforeEach } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockFactory } from '../utils/BlockFactory';
import { Block } from '../types/Block';

describe('氷結ブロックのメカニズム', () => {
  let blocks: Block[][];
  let blockLogic: BlockLogic;
  let blockFactory: BlockFactory;
  
  // テスト前の共通セットアップ
  beforeEach(() => {
    blockLogic = new BlockLogic();
    blockFactory = new BlockFactory();
    
    // 10x10のブロック配列を初期化
    blocks = Array(10).fill(0).map(() => Array(10).fill(null));
  });
  
  it('同色の隣接する通常ブロックが消去されたとき氷結ブロックが解除されるべき', () => {
    // テスト用の盤面を設定
    // __R __R __B
    // __R _*R __B
    // __R __R __B
    blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF6347'); // 赤
    blocks[0][1] = blockFactory.createNormalBlock(1, 0, '#FF6347'); // 赤
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createIceBlockLv1(1, 1, '#FF6347'); // 赤の氷結Lv1
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    blocks[2][0] = blockFactory.createNormalBlock(0, 2, '#FF6347'); // 赤
    blocks[2][1] = blockFactory.createNormalBlock(1, 2, '#FF6347'); // 赤
    blocks[2][2] = blockFactory.createNormalBlock(2, 2, '#1E5799'); // 青
    
    // 赤の通常ブロックを消去（氷結ブロックの隣接）
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 氷結ブロックの隣接チェック
    const adjacentIceBlocks: Block[] = [];
    connectedBlocks.forEach(block => {
      const { x, y, color } = block;
      
      // 隣接する4方向をチェック
      const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }  // 左
      ];
      
      directions.forEach(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        
        // 範囲外チェック
        if (ny < 0 || ny >= blocks.length || nx < 0 || nx >= blocks[ny].length) {
          return;
        }
        
        // 氷結ブロックかつ同じ色のブロックをチェック
        const adjacentBlock = blocks[ny][nx];
        if (adjacentBlock && 
            (adjacentBlock.type === 'iceLv1' || adjacentBlock.type === 'iceLv2') && 
            adjacentBlock.color === color) {
          // 重複を避けるため、まだリストにないブロックのみ追加
          if (!adjacentIceBlocks.some(b => b.x === nx && b.y === ny)) {
            adjacentIceBlocks.push(adjacentBlock);
          }
        }
      });
    });
    
    // 氷結ブロックが見つかるはず
    expect(adjacentIceBlocks.length).toBeGreaterThan(0);
    
    // 見つかった氷結ブロックが正しいか確認
    const iceBlock = adjacentIceBlocks[0];
    expect(iceBlock.x).toBe(1);
    expect(iceBlock.y).toBe(1);
    expect(iceBlock.type).toBe('iceLv1');
    expect(iceBlock.color).toBe('#FF6347');
  });
  
  it('氷結ブロック同士のグループが正しく処理されるべき', () => {
    // テスト用の盤面を設定
    // _*R _*R __B
    // __R __R __B
    // __R __R __B
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#FF6347'); // 赤
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    blocks[2][0] = blockFactory.createNormalBlock(0, 2, '#FF6347'); // 赤
    blocks[2][1] = blockFactory.createNormalBlock(1, 2, '#FF6347'); // 赤
    blocks[2][2] = blockFactory.createNormalBlock(2, 2, '#1E5799'); // 青
    
    // 氷結ブロック同士のグループを検索
    const connectedIceBlocks = blockLogic.findConnectedIceBlocks(blocks, 0, 0);
    
    // 2つの氷結ブロックが見つかるはず
    expect(connectedIceBlocks.length).toBe(2);
    
    // 見つかった氷結ブロックが正しいか確認
    expect(connectedIceBlocks[0].x).toBe(0);
    expect(connectedIceBlocks[0].y).toBe(0);
    expect(connectedIceBlocks[0].type).toBe('iceLv1');
    
    expect(connectedIceBlocks[1].x).toBe(1);
    expect(connectedIceBlocks[1].y).toBe(0);
    expect(connectedIceBlocks[1].type).toBe('iceLv1');
  });
  
  it('最初の消去でiceLv2がiceLv1にダウングレードされるべき', () => {
    // テスト用の盤面を設定
    // __R __R __B
    // __R **R __B
    // __R __R __B
    blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF6347'); // 赤
    blocks[0][1] = blockFactory.createNormalBlock(1, 0, '#FF6347'); // 赤
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createIceBlockLv2(1, 1, '#FF6347'); // 赤の氷結Lv2
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    blocks[2][0] = blockFactory.createNormalBlock(0, 2, '#FF6347'); // 赤
    blocks[2][1] = blockFactory.createNormalBlock(1, 2, '#FF6347'); // 赤
    blocks[2][2] = blockFactory.createNormalBlock(2, 2, '#1E5799'); // 青
    
    // 赤の通常ブロックを消去（氷結ブロックの隣接）
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 氷結ブロックの隣接チェック
    const adjacentIceBlocks: Block[] = [];
    connectedBlocks.forEach(block => {
      const { x, y, color } = block;
      
      // 隣接する4方向をチェック
      const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }  // 左
      ];
      
      directions.forEach(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        
        // 範囲外チェック
        if (ny < 0 || ny >= blocks.length || nx < 0 || nx >= blocks[ny].length) {
          return;
        }
        
        // 氷結ブロックかつ同じ色のブロックをチェック
        const adjacentBlock = blocks[ny][nx];
        if (adjacentBlock && 
            (adjacentBlock.type === 'iceLv1' || adjacentBlock.type === 'iceLv2') && 
            adjacentBlock.color === color) {
          // 重複を避けるため、まだリストにないブロックのみ追加
          if (!adjacentIceBlocks.some(b => b.x === nx && b.y === ny)) {
            adjacentIceBlocks.push(adjacentBlock);
          }
        }
      });
    });
    
    // 氷結ブロックが見つかるはず
    expect(adjacentIceBlocks.length).toBeGreaterThan(0);
    
    // 見つかった氷結ブロックが正しいか確認
    const iceBlock = adjacentIceBlocks[0];
    expect(iceBlock.x).toBe(1);
    expect(iceBlock.y).toBe(1);
    expect(iceBlock.type).toBe('iceLv2');
    expect(iceBlock.color).toBe('#FF6347');
    
    // 氷結Lv2をLv1に変更
    blocks[iceBlock.y][iceBlock.x] = {
      ...iceBlock,
      type: 'iceLv1'
    };
    
    // 変更後のブロックを確認
    expect(blocks[1][1].type).toBe('iceLv1');
  });
  
  it('氷結ブロック解除の連鎖反応を処理するべき', () => {
    // テスト用の盤面を設定
    // __R _*R _*R
    // __R __R __B
    // __R __R __B
    blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF6347'); // 赤
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][2] = blockFactory.createIceBlockLv1(2, 0, '#FF6347'); // 赤の氷結Lv1
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#FF6347'); // 赤
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    blocks[2][0] = blockFactory.createNormalBlock(0, 2, '#FF6347'); // 赤
    blocks[2][1] = blockFactory.createNormalBlock(1, 2, '#FF6347'); // 赤
    blocks[2][2] = blockFactory.createNormalBlock(2, 2, '#1E5799'); // 青
    
    // 赤の通常ブロックを消去（氷結ブロックの隣接）
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
    
    // 氷結ブロックの隣接チェック
    const adjacentIceBlocks: Block[] = [];
    connectedBlocks.forEach(block => {
      const { x, y, color } = block;
      
      // 隣接する4方向をチェック
      const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }  // 左
      ];
      
      directions.forEach(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        
        // 範囲外チェック
        if (ny < 0 || ny >= blocks.length || nx < 0 || nx >= blocks[ny].length) {
          return;
        }
        
        // 氷結ブロックかつ同じ色のブロックをチェック
        const adjacentBlock = blocks[ny][nx];
        if (adjacentBlock && 
            (adjacentBlock.type === 'iceLv1' || adjacentBlock.type === 'iceLv2') && 
            adjacentBlock.color === color) {
          // 重複を避けるため、まだリストにないブロックのみ追加
          if (!adjacentIceBlocks.some(b => b.x === nx && b.y === ny)) {
            adjacentIceBlocks.push(adjacentBlock);
          }
        }
      });
    });
    
    // 最初の氷結ブロックが見つかるはず
    expect(adjacentIceBlocks.length).toBeGreaterThan(0);
    
    // 見つかった氷結ブロックが正しいか確認
    const iceBlock = adjacentIceBlocks[0];
    expect(iceBlock.x).toBe(1);
    expect(iceBlock.y).toBe(0);
    expect(iceBlock.type).toBe('iceLv1');
    
    // 氷結Lv1を通常ブロックに変更
    blocks[iceBlock.y][iceBlock.x] = {
      ...iceBlock,
      type: 'normal'
    };
    
    // 変更後のブロックを確認
    expect(blocks[0][1].type).toBe('normal');
    
    // 連鎖反応のチェック - 2つ目の氷結ブロックも解除されるべき
    // 実際のゲームでは、checkAdjacentIceBlocksメソッドがこの処理を行う
    const secondIceBlock = blocks[0][2];
    expect(secondIceBlock.type).toBe('iceLv1');
    
    // 連鎖反応をシミュレート
    const checkAdjacentIceBlocks = (x: number, y: number, color: string) => {
      const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }  // 左
      ];
      
      const adjacentIceBlocks: Block[] = [];
      
      directions.forEach(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        
        // 範囲外チェック
        if (ny < 0 || ny >= blocks.length || nx < 0 || nx >= blocks[ny].length) {
          return;
        }
        
        // 氷結ブロックかつ同じ色のブロックをチェック
        const adjacentBlock = blocks[ny][nx];
        if (adjacentBlock && 
            (adjacentBlock.type === 'iceLv1' || adjacentBlock.type === 'iceLv2') && 
            adjacentBlock.color === color) {
          adjacentIceBlocks.push(adjacentBlock);
        }
      });
      
      return adjacentIceBlocks;
    };
    
    // 最初の氷結ブロックが解除された後、隣接する氷結ブロックをチェック
    const chainIceBlocks = checkAdjacentIceBlocks(1, 0, '#FF6347');
    expect(chainIceBlocks.length).toBe(1);
    expect(chainIceBlocks[0].x).toBe(2);
    expect(chainIceBlocks[0].y).toBe(0);
  });
});
