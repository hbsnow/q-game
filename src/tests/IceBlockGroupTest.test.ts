import { describe, it, expect, beforeEach } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockFactory } from '../utils/BlockFactory';
import { Block } from '../types/Block';

describe('氷結ブロックのグループ処理', () => {
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
  
  it('同じ色の氷結ブロックが2つ隣接している場合、正しくグループとして検出されるべき', () => {
    // テスト用の盤面を設定
    // _*R _*R __B
    // __R __B __B
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックのグループを検索
    const connectedIceBlocks = blockLogic.findConnectedIceBlocks(blocks, 0, 0);
    
    // 2つの氷結ブロックが見つかるはず
    expect(connectedIceBlocks.length).toBe(2);
    
    // 見つかった氷結ブロックが正しいか確認
    const foundBlock1 = connectedIceBlocks.find(block => block.x === 0 && block.y === 0);
    const foundBlock2 = connectedIceBlocks.find(block => block.x === 1 && block.y === 0);
    
    expect(foundBlock1).toBeDefined();
    expect(foundBlock2).toBeDefined();
    expect(foundBlock1?.type).toBe('iceLv1');
    expect(foundBlock2?.type).toBe('iceLv1');
  });
  
  it('異なる色の氷結ブロックは同じグループとして検出されないべき', () => {
    // テスト用の盤面を設定
    // _*R _*B __B
    // __R __B __B
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#1E5799'); // 青の氷結Lv1
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 赤の氷結ブロックのグループを検索
    const connectedRedIceBlocks = blockLogic.findConnectedIceBlocks(blocks, 0, 0);
    
    // 1つの氷結ブロックのみが見つかるはず
    expect(connectedRedIceBlocks.length).toBe(1);
    expect(connectedRedIceBlocks[0].x).toBe(0);
    expect(connectedRedIceBlocks[0].y).toBe(0);
    expect(connectedRedIceBlocks[0].color).toBe('#FF6347');
    
    // 青の氷結ブロックのグループを検索
    const connectedBlueIceBlocks = blockLogic.findConnectedIceBlocks(blocks, 1, 0);
    
    // 1つの氷結ブロックのみが見つかるはず
    expect(connectedBlueIceBlocks.length).toBe(1);
    expect(connectedBlueIceBlocks[0].x).toBe(1);
    expect(connectedBlueIceBlocks[0].y).toBe(0);
    expect(connectedBlueIceBlocks[0].color).toBe('#1E5799');
  });
  
  it('氷結ブロックLv1とLv2が隣接している場合も正しくグループとして検出されるべき', () => {
    // テスト用の盤面を設定
    // _*R **R __B
    // __R __B __B
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createIceBlockLv2(1, 0, '#FF6347'); // 赤の氷結Lv2
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックのグループを検索
    const connectedIceBlocks = blockLogic.findConnectedIceBlocks(blocks, 0, 0);
    
    // 2つの氷結ブロックが見つかるはず
    expect(connectedIceBlocks.length).toBe(2);
    
    // 見つかった氷結ブロックが正しいか確認
    const foundLv1Block = connectedIceBlocks.find(block => block.type === 'iceLv1');
    const foundLv2Block = connectedIceBlocks.find(block => block.type === 'iceLv2');
    
    expect(foundLv1Block).toBeDefined();
    expect(foundLv2Block).toBeDefined();
    expect(foundLv1Block?.x).toBe(0);
    expect(foundLv1Block?.y).toBe(0);
    expect(foundLv2Block?.x).toBe(1);
    expect(foundLv2Block?.y).toBe(0);
  });
  
  it('3つ以上の氷結ブロックが連結している場合も全て検出されるべき', () => {
    // テスト用の盤面を設定
    // _*R _*R _*R
    // __R __B __B
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][2] = blockFactory.createIceBlockLv1(2, 0, '#FF6347'); // 赤の氷結Lv1
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックのグループを検索
    const connectedIceBlocks = blockLogic.findConnectedIceBlocks(blocks, 0, 0);
    
    // 3つの氷結ブロックが見つかるはず
    expect(connectedIceBlocks.length).toBe(3);
    
    // 見つかった氷結ブロックの座標を確認
    const positions = connectedIceBlocks.map(block => ({ x: block.x, y: block.y }));
    expect(positions).toContainEqual({ x: 0, y: 0 });
    expect(positions).toContainEqual({ x: 1, y: 0 });
    expect(positions).toContainEqual({ x: 2, y: 0 });
  });
  
  it('氷結ブロックが斜めに配置されている場合は同じグループとして検出されないべき', () => {
    // テスト用の盤面を設定
    // _*R __B __B
    // __B _*R __B
    // __B __B __B
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createNormalBlock(1, 0, '#1E5799'); // 青
    blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#1E5799'); // 青
    blocks[1][1] = blockFactory.createIceBlockLv1(1, 1, '#FF6347'); // 赤の氷結Lv1
    blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    blocks[2][0] = blockFactory.createNormalBlock(0, 2, '#1E5799'); // 青
    blocks[2][1] = blockFactory.createNormalBlock(1, 2, '#1E5799'); // 青
    blocks[2][2] = blockFactory.createNormalBlock(2, 2, '#1E5799'); // 青
    
    // 氷結ブロックのグループを検索
    const connectedIceBlocks = blockLogic.findConnectedIceBlocks(blocks, 0, 0);
    
    // 1つの氷結ブロックのみが見つかるはず（斜めは隣接と見なさない）
    expect(connectedIceBlocks.length).toBe(1);
    expect(connectedIceBlocks[0].x).toBe(0);
    expect(connectedIceBlocks[0].y).toBe(0);
  });
  
  it('氷結ブロックが消去可能かどうかの判定が正しく行われるべき', () => {
    // ケース1: 同色の氷結ブロックが2つ隣接
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    
    // 消去可能かチェック
    const canRemove1 = blockLogic.canRemoveBlocks(blocks, 0, 0);
    expect(canRemove1).toBe(true);
    
    // リセット
    blocks = Array(10).fill(0).map(() => Array(10).fill(null));
    
    // ケース2: 単独の氷結ブロックと隣接する同色の通常ブロック
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createNormalBlock(1, 0, '#FF6347'); // 赤の通常ブロック
    
    // 消去可能かチェック
    const canRemove2 = blockLogic.canRemoveBlocks(blocks, 0, 0);
    expect(canRemove2).toBe(true);
    
    // リセット
    blocks = Array(10).fill(0).map(() => Array(10).fill(null));
    
    // ケース3: 単独の氷結ブロックと異なる色の通常ブロック
    blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    blocks[0][1] = blockFactory.createNormalBlock(1, 0, '#1E5799'); // 青の通常ブロック
    
    // 消去可能かチェック
    const canRemove3 = blockLogic.canRemoveBlocks(blocks, 0, 0);
    expect(canRemove3).toBe(false);
  });
});
