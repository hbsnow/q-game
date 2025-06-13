import { describe, it, expect, beforeEach } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockFactory } from '../utils/BlockFactory';
import { Block } from '../types/Block';

describe('氷結ブロックの相互作用', () => {
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
  
  it('単独の氷結ブロックが隣接する同色の通常ブロックを検出できるべき', () => {
    // テスト用の盤面を設定
    // __R _*R __B
    // __R __R __B
    blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF6347'); // 赤
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#FF6347'); // 赤
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックに隣接する同色の通常ブロックを検索
    const adjacentNormalBlocks = blockLogic.findAdjacentNormalBlocks(blocks, 1, 0);
    
    // 隣接する同色の通常ブロックが見つかるはず
    expect(adjacentNormalBlocks.length).toBeGreaterThan(0);
    
    // 見つかった通常ブロックが正しいか確認（順序は保証されないので、存在確認のみ）
    const foundBlock = adjacentNormalBlocks.find(block => 
      block.x === 0 && block.y === 0 && block.type === 'normal' && block.color === '#FF6347'
    );
    expect(foundBlock).toBeDefined();
  });
  
  it('単独の氷結ブロックが消去可能と判定されるべき', () => {
    // テスト用の盤面を設定
    // __R _*R __B
    // __R __R __B
    blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF6347'); // 赤
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#FF6347'); // 赤
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックが消去可能かチェック
    const canRemove = blockLogic.canRemoveBlocks(blocks, 1, 0);
    
    // 隣接する同色の通常ブロックがあるので消去可能と判定されるはず
    expect(canRemove).toBe(true);
  });
  
  it('異なる色の通常ブロックに隣接する氷結ブロックは消去不可と判定されるべき', () => {
    // テスト用の盤面を設定
    // __B _*R __B
    // __B __B __B
    blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#1E5799'); // 青
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#1E5799'); // 青
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックに隣接する同色の通常ブロックを検索
    const adjacentNormalBlocks = blockLogic.findAdjacentNormalBlocks(blocks, 1, 0);
    
    // 隣接する同色の通常ブロックは見つからないはず
    expect(adjacentNormalBlocks.length).toBe(0);
    
    // 氷結ブロックが消去可能かチェック
    const canRemove = blockLogic.canRemoveBlocks(blocks, 1, 0);
    
    // 隣接する同色の通常ブロックがないので消去不可と判定されるはず
    expect(canRemove).toBe(false);
  });
  
  it('氷結ブロックが複数あり、かつ隣接する同色の通常ブロックもある場合は消去可能と判定されるべき', () => {
    // テスト用の盤面を設定
    // _*R _*R __B
    // __R __B __B
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックが消去可能かチェック（氷結ブロック同士のグループ）
    const canRemoveByGroup = blockLogic.canRemoveBlocks(blocks, 0, 0);
    expect(canRemoveByGroup).toBe(true);
    
    // 氷結ブロックに隣接する同色の通常ブロックを検索
    const adjacentNormalBlocks = blockLogic.findAdjacentNormalBlocks(blocks, 0, 0);
    expect(adjacentNormalBlocks.length).toBe(1);
    
    // 氷結ブロックが消去可能かチェック（隣接する同色の通常ブロックがある）
    const canRemoveByAdjacent = blockLogic.canRemoveBlocks(blocks, 0, 0);
    expect(canRemoveByAdjacent).toBe(true);
  });
});
