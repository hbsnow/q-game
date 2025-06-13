import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameScene } from '../scenes/GameScene';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockFactory } from '../utils/BlockFactory';
import { Block } from '../types/Block';

// GameSceneのモック
class MockGameScene {
  blocks: Block[][] = [];
  blockSprites: any[][] = [];
  isProcessing: boolean = false;
  score: number = 0;
  
  // モックメソッド
  removeBlocks = vi.fn();
  updateIceBlocks = vi.fn();
  applyGravity = vi.fn();
  updateScoreDisplay = vi.fn();
  showAllClearedEffect = vi.fn();
  showNoMovesEffect = vi.fn();
  showClearButton = vi.fn();
  
  // 時間遅延のモック
  time = {
    delayedCall: (delay: number, callback: Function) => {
      // 即時実行（テスト用）
      callback();
    }
  };
  
  // スプライト関連のモック
  add = {
    circle: () => ({}),
    renderTexture: () => ({
      draw: () => {},
      texture: {}
    }),
    star: () => ({}),
    tween: () => ({})
  };
  
  tweens = {
    add: vi.fn()
  };
  
  // onBlockClickメソッドを取り出す
  onBlockClick(x: number, y: number) {
    // GameSceneのonBlockClickメソッドを実行するための準備
    const blockLogic = new BlockLogic();
    
    // クリックされたブロックが氷結ブロックかチェック
    const clickedBlock = this.blocks[y][x];
    if (clickedBlock && (clickedBlock.type === 'iceLv1' || clickedBlock.type === 'iceLv2')) {
      // 隣接する同色の氷結ブロックを検索
      const connectedIceBlocks = blockLogic.findConnectedIceBlocks(this.blocks, x, y);
      
      // 2つ以上の氷結ブロックが隣接している場合は処理
      if (connectedIceBlocks.length >= 2) {
        // 氷結ブロックを解除（テスト用に簡略化）
        connectedIceBlocks.forEach(block => {
          this.blocks[block.y][block.x] = null;
        });
        return;
      }
      
      // 隣接する同色の通常ブロックを検索
      const adjacentNormalBlocks = blockLogic.findAdjacentNormalBlocks(this.blocks, x, y);
      
      // 隣接する同色の通常ブロックがある場合
      if (adjacentNormalBlocks.length > 0) {
        // スコア計算（通常ブロックの数に基づく）
        const score = blockLogic.calculateScore(adjacentNormalBlocks.length);
        this.score += score;
        
        // 通常ブロックを消去（テスト用に簡略化）
        adjacentNormalBlocks.forEach(block => {
          this.blocks[block.y][block.x] = null;
        });
        
        // 氷結ブロックの状態を更新
        if (clickedBlock.type === 'iceLv1') {
          // 氷結Lv1は解除されて通常ブロックになる
          this.blocks[y][x] = {
            x: clickedBlock.x,
            y: clickedBlock.y,
            color: clickedBlock.color,
            type: 'normal',
            sprite: clickedBlock.sprite
          };
        } else if (clickedBlock.type === 'iceLv2') {
          // 氷結Lv2は氷結Lv1になる
          this.blocks[y][x] = {
            x: clickedBlock.x,
            y: clickedBlock.y,
            color: clickedBlock.color,
            type: 'iceLv1',
            sprite: clickedBlock.sprite
          };
        }
        
        return;
      }
    }
    
    // 通常ブロックの処理
    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(this.blocks, x, y);
    
    // 2つ以上のブロックが隣接している場合のみ消去
    if (connectedBlocks.length >= 2) {
      // スコア計算
      const score = blockLogic.calculateScore(connectedBlocks.length);
      this.score += score;
      
      // ブロックを消去（テスト用に簡略化）
      connectedBlocks.forEach(block => {
        this.blocks[block.y][block.x] = null;
      });
    }
  }
}

describe('氷結ブロッククリック時の挙動', () => {
  let gameScene: MockGameScene;
  let blockFactory: BlockFactory;
  
  beforeEach(() => {
    gameScene = new MockGameScene();
    blockFactory = new BlockFactory();
    
    // 10x10のブロック配列を初期化
    gameScene.blocks = Array(10).fill(0).map(() => Array(10).fill(null));
    gameScene.blockSprites = Array(10).fill(0).map(() => Array(10).fill(null));
  });
  
  it('氷結ブロックLv1をクリックすると隣接する同色の通常ブロックが消去され、氷結ブロック自体は通常ブロックになるべき', () => {
    // テスト用の盤面を設定
    // __R _*R __B
    // __R __R __B
    gameScene.blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF6347'); // 赤
    gameScene.blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    gameScene.blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    gameScene.blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    gameScene.blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#FF6347'); // 赤
    gameScene.blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックをクリック
    gameScene.onBlockClick(1, 0);
    
    // 隣接する同色の通常ブロックが消去されているか確認
    expect(gameScene.blocks[0][0]).toBeNull(); // 赤のブロック（上の行）
    expect(gameScene.blocks[1][0]).toBeNull(); // 赤のブロック（下の行）
    expect(gameScene.blocks[1][1]).toBeNull(); // 赤のブロック（下の行）
    
    // 氷結ブロック自体は通常ブロックになっているか確認
    expect(gameScene.blocks[0][1]).not.toBeNull();
    expect(gameScene.blocks[0][1].type).toBe('normal');
    expect(gameScene.blocks[0][1].color).toBe('#FF6347'); // 色は変わらない
    
    // 他のブロックは残っているか確認
    expect(gameScene.blocks[0][2]).not.toBeNull(); // 青のブロック
    expect(gameScene.blocks[1][2]).not.toBeNull(); // 青のブロック
  });
  
  it('氷結ブロックLv2をクリックすると隣接する同色の通常ブロックが消去され、氷結ブロック自体は氷結Lv1になるべき', () => {
    // テスト用の盤面を設定
    // __R **R __B
    // __R __R __B
    gameScene.blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF6347'); // 赤
    gameScene.blocks[0][1] = blockFactory.createIceBlockLv2(1, 0, '#FF6347'); // 赤の氷結Lv2
    gameScene.blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    gameScene.blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    gameScene.blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#FF6347'); // 赤
    gameScene.blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックをクリック
    gameScene.onBlockClick(1, 0);
    
    // 隣接する同色の通常ブロックが消去されているか確認
    expect(gameScene.blocks[0][0]).toBeNull(); // 赤のブロック（上の行）
    expect(gameScene.blocks[1][0]).toBeNull(); // 赤のブロック（下の行）
    expect(gameScene.blocks[1][1]).toBeNull(); // 赤のブロック（下の行）
    
    // 氷結ブロック自体は氷結Lv1になっているか確認
    expect(gameScene.blocks[0][1]).not.toBeNull();
    expect(gameScene.blocks[0][1].type).toBe('iceLv1');
    expect(gameScene.blocks[0][1].color).toBe('#FF6347'); // 色は変わらない
    
    // 他のブロックは残っているか確認
    expect(gameScene.blocks[0][2]).not.toBeNull(); // 青のブロック
    expect(gameScene.blocks[1][2]).not.toBeNull(); // 青のブロック
  });
  
  it('氷結ブロック同士のグループをクリックすると全て消去されるべき', () => {
    // テスト用の盤面を設定
    // _*R _*R __B
    // __R __B __B
    gameScene.blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    gameScene.blocks[0][1] = blockFactory.createIceBlockLv1(1, 0, '#FF6347'); // 赤の氷結Lv1
    gameScene.blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    gameScene.blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    gameScene.blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
    gameScene.blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックをクリック
    gameScene.onBlockClick(0, 0);
    
    // 両方の氷結ブロックが消去されているか確認
    expect(gameScene.blocks[0][0]).toBeNull();
    expect(gameScene.blocks[0][1]).toBeNull();
    
    // 他のブロックは残っているか確認
    expect(gameScene.blocks[0][2]).not.toBeNull();
    expect(gameScene.blocks[1][0]).not.toBeNull();
    expect(gameScene.blocks[1][1]).not.toBeNull();
    expect(gameScene.blocks[1][2]).not.toBeNull();
  });
  
  it('氷結ブロックLv1とLv2が隣接している場合、クリックすると両方とも消去されるべき', () => {
    // テスト用の盤面を設定
    // _*R **R __B
    // __R __B __B
    gameScene.blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
    gameScene.blocks[0][1] = blockFactory.createIceBlockLv2(1, 0, '#FF6347'); // 赤の氷結Lv2
    gameScene.blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
    
    gameScene.blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#FF6347'); // 赤
    gameScene.blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
    gameScene.blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
    
    // 氷結ブロックをクリック
    gameScene.onBlockClick(0, 0);
    
    // 両方の氷結ブロックが消去されているか確認
    expect(gameScene.blocks[0][0]).toBeNull();
    expect(gameScene.blocks[0][1]).toBeNull();
    
    // 他のブロックは残っているか確認
    expect(gameScene.blocks[0][2]).not.toBeNull();
    expect(gameScene.blocks[1][0]).not.toBeNull();
    expect(gameScene.blocks[1][1]).not.toBeNull();
    expect(gameScene.blocks[1][2]).not.toBeNull();
  });
});
