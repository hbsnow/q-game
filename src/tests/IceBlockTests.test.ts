import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { BlockFactory } from '../utils/BlockFactory';
import { Block, BlockType } from '../types/Block';

/**
 * 氷結ブロックの機能テスト
 * 複数のテストファイルを統合したもの
 */
describe('氷結ブロックの機能', () => {
  // 共通セットアップ
  let blockLogic: BlockLogic;
  let blockFactory: BlockFactory;
  
  beforeEach(() => {
    blockLogic = new BlockLogic();
    blockFactory = new BlockFactory();
  });

  describe('基本的な氷結ブロックの挙動', () => {
    it('氷結ブロックは通常ブロックと同様にグループ形成に参加する', () => {
      // 初期状態:
      // _*R __R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];
      
      // 氷結ブロックと通常ブロックが同じ色で隣接している場合、グループとして検出される
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 2つのブロックが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
    });
    
    it('氷結ブロックLv1は通常ブロックになるべきで、消去されるべきではない', () => {
      // 初期状態:
      // _*R __R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];
      
      // 氷結ブロックを更新
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックが通常ブロックになっているか確認
      expect(updatedBlocks[0][0]).not.toBeNull();
      expect(updatedBlocks[0][0]?.type).toBe('normal');
    });
    
    it('氷結ブロックLv2は氷結ブロックLv1になるべきで、消去されるべきではない', () => {
      // 初期状態:
      // **R __R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv2', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];
      
      // 氷結ブロックを更新
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックLv2が氷結ブロックLv1になっているか確認
      expect(updatedBlocks[0][0]).not.toBeNull();
      expect(updatedBlocks[0][0]?.type).toBe('iceLv1');
    });
  });

  describe('氷結ブロックのレベルダウン', () => {
    it('氷結ブロックLv2が正しくLv1にダウングレードされる', () => {
      // 初期状態:
      // **R __R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv2', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];
      
      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックLv2が氷結ブロックLv1になっているか確認
      expect(updatedBlocks[0][0]).not.toBeNull();
      expect(updatedBlocks[0][0]?.type).toBe('iceLv1');
      expect(updatedBlocks[0][0]?.color).toBe('red');
    });
    
    it('氷結ブロックLv1が正しく通常ブロックにダウングレードされる', () => {
      // 初期状態:
      // _*R __R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];
      
      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックLv1が通常ブロックになっているか確認
      expect(updatedBlocks[0][0]).not.toBeNull();
      expect(updatedBlocks[0][0]?.type).toBe('normal');
      expect(updatedBlocks[0][0]?.color).toBe('red');
    });
  });

  describe('氷結ブロックの隣接ルール', () => {
    it('氷結ブロックLv1と通常ブロックが隣接している場合、グループとして検出される', () => {
      // 初期状態:
      // __B __R _*R
      // __Y __B __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'blue', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 2, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null },
          { x: 2, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      // 通常ブロックをタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 通常ブロックと氷結ブロックの2つが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
    });

    it('氷結ブロックLv2と通常ブロックが隣接している場合、グループとして検出される', () => {
      // 初期状態:
      // __B __R **R
      // __Y __B __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'blue', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null },
          { x: 2, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      // 通常ブロックをタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 通常ブロックと氷結ブロックの2つが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
    });

    it('氷結ブロックLv1と氷結ブロックLv2が隣接している場合、グループとして検出される', () => {
      // 初期状態:
      // __B _*R **R
      // __Y __B __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'blue', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null },
          { x: 2, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      // 氷結ブロックをタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 2つの氷結ブロックが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
    });
  });

  describe('氷結ブロックのクリック操作', () => {
    // 簡易的なGameSceneのモック
    class MockGameScene {
      blocks: Block[][] = [];
      score: number = 0;
      
      constructor() {
        // 10x10のブロック配列を初期化
        this.blocks = Array(10).fill(0).map(() => Array(10).fill(null));
      }
      
      // ブロックをクリックした時の処理をシミュレート
      onBlockClick(x: number, y: number): boolean {
        const clickedBlock = this.blocks[y][x];
        
        // クリックされたブロックがない場合は何もしない
        if (!clickedBlock) {
          return false;
        }
        
        // 隣接する同色ブロックを検索
        const connectedBlocks = blockLogic.findConnectedBlocks(this.blocks, x, y);
        
        // 2つ以上のブロックが隣接している場合のみ消去
        if (connectedBlocks.length >= 2) {
          // スコア計算
          const score = blockLogic.calculateScore(connectedBlocks.length);
          this.score += score;
          
          // 隣接する氷結ブロックを更新（ブロックを消去する前に実行）
          this.updateAdjacentIceBlocks(connectedBlocks);
          
          // ブロックを消去
          connectedBlocks.forEach(block => {
            this.blocks[block.y][block.x] = null;
          });
          
          return true;
        }
        
        return false;
      }
      
      // 隣接する氷結ブロックを更新
      updateAdjacentIceBlocks(removedBlocks: Block[]): void {
        const checkedPositions: {[key: string]: boolean} = {};
        
        // 消去されたブロックに隣接する氷結ブロックを検索
        removedBlocks.forEach(block => {
          const directions = [
            { dx: 0, dy: -1 }, // 上
            { dx: 1, dy: 0 },  // 右
            { dx: 0, dy: 1 },  // 下
            { dx: -1, dy: 0 }  // 左
          ];
          
          directions.forEach(dir => {
            const nx = block.x + dir.dx;
            const ny = block.y + dir.dy;
            const posKey = `${nx},${ny}`;
            
            // 既にチェック済みの位置はスキップ
            if (checkedPositions[posKey]) {
              return;
            }
            checkedPositions[posKey] = true;
            
            // 範囲外チェック
            if (ny < 0 || ny >= this.blocks.length || nx < 0 || nx >= this.blocks[ny].length) {
              return;
            }
            
            // 氷結ブロックかつ同じ色のブロックをチェック
            const adjacentBlock = this.blocks[ny][nx];
            if (adjacentBlock && 
                (adjacentBlock.type === 'iceLv1' || adjacentBlock.type === 'iceLv2') && 
                adjacentBlock.color === block.color) {
              
              // 氷結ブロックの状態を更新
              if (adjacentBlock.type === 'iceLv1') {
                // 氷結Lv1は解除されて通常ブロックになる
                this.blocks[ny][nx] = {
                  x: adjacentBlock.x,
                  y: adjacentBlock.y,
                  color: adjacentBlock.color,
                  type: 'normal'
                };
              } else if (adjacentBlock.type === 'iceLv2') {
                // 氷結Lv2は氷結Lv1になる
                this.blocks[ny][nx] = {
                  x: adjacentBlock.x,
                  y: adjacentBlock.y,
                  color: adjacentBlock.color,
                  type: 'iceLv1'
                };
              }
            }
          });
        });
      }
    }

    let gameScene: MockGameScene;
    
    beforeEach(() => {
      gameScene = new MockGameScene();
    });
    
    it('通常ブロックをクリックすると隣接する同色ブロックが消去されるべき', () => {
      // テスト用の盤面を設定
      // __R __R __B
      // __Y __B __B
      gameScene.blocks[0][0] = blockFactory.createNormalBlock(0, 0, '#FF6347'); // 赤
      gameScene.blocks[0][1] = blockFactory.createNormalBlock(1, 0, '#FF6347'); // 赤
      gameScene.blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
      
      gameScene.blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#F4D03F'); // 黄
      gameScene.blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
      gameScene.blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
      
      // 通常ブロックをクリック
      const result = gameScene.onBlockClick(0, 0);
      
      // 処理が成功したことを確認
      expect(result).toBe(true);
      
      // 隣接する同色の通常ブロックが消去されているか確認
      expect(gameScene.blocks[0][0]).toBeNull();
      expect(gameScene.blocks[0][1]).toBeNull();
      
      // 他のブロックは残っているか確認
      expect(gameScene.blocks[0][2]).not.toBeNull();
      expect(gameScene.blocks[1][0]).not.toBeNull();
      expect(gameScene.blocks[1][1]).not.toBeNull();
      expect(gameScene.blocks[1][2]).not.toBeNull();
      
      // スコアが正しく加算されているか確認
      expect(gameScene.score).toBe(4); // 2^2 = 4
    });
    
    it('氷結ブロックLv1をクリックすると隣接する同色の通常ブロックが消去され、氷結ブロック自体も消去されるべき', () => {
      // テスト用の盤面を設定
      // _*R __R __B
      // __Y __B __B
      gameScene.blocks[0][0] = blockFactory.createIceBlockLv1(0, 0, '#FF6347'); // 赤の氷結Lv1
      gameScene.blocks[0][1] = blockFactory.createNormalBlock(1, 0, '#FF6347'); // 赤
      gameScene.blocks[0][2] = blockFactory.createNormalBlock(2, 0, '#1E5799'); // 青
      
      gameScene.blocks[1][0] = blockFactory.createNormalBlock(0, 1, '#F4D03F'); // 黄
      gameScene.blocks[1][1] = blockFactory.createNormalBlock(1, 1, '#1E5799'); // 青
      gameScene.blocks[1][2] = blockFactory.createNormalBlock(2, 1, '#1E5799'); // 青
      
      // 氷結ブロックをクリック
      const result = gameScene.onBlockClick(0, 0);
      
      // 処理が成功したことを確認
      expect(result).toBe(true);
      
      // 氷結ブロックと隣接する同色の通常ブロックが消去されているか確認
      expect(gameScene.blocks[0][0]).toBeNull();
      expect(gameScene.blocks[0][1]).toBeNull();
    });
  });

  describe('仕様書通りの氷結ブロックの挙動', () => {
    it('例1: 隣接する同色ブロックが消去されると氷結ブロックLv1が通常ブロックになる', () => {
      // 初期状態:
      // __B __R __R __Y
      // __Y _*R __R __Y
      // __B __R __Y __Y
      // __Y __R __B __R
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'blue', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 2, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 3, y: 0, color: 'yellow', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'red', type: 'iceLv1', sprite: null },
          { x: 2, y: 1, color: 'red', type: 'normal', sprite: null },
          { x: 3, y: 1, color: 'yellow', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 2, color: 'blue', type: 'normal', sprite: null },
          { x: 1, y: 2, color: 'red', type: 'normal', sprite: null },
          { x: 2, y: 2, color: 'yellow', type: 'normal', sprite: null },
          { x: 3, y: 2, color: 'yellow', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 3, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 3, color: 'red', type: 'normal', sprite: null },
          { x: 2, y: 3, color: 'blue', type: 'normal', sprite: null },
          { x: 3, y: 3, color: 'red', type: 'normal', sprite: null }
        ]
      ];
      
      // b0（赤ブロック）をタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 赤ブロックのグループが見つかるはず
      expect(connectedBlocks.length).toBeGreaterThan(1);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックLv1が通常ブロックになっているか確認
      expect(updatedBlocks[1][1]).not.toBeNull();
      expect(updatedBlocks[1][1]?.type).toBe('normal');
      expect(updatedBlocks[1][1]?.color).toBe('red');
    });

    it('例2: 氷結ブロックLv1が2つ隣接している場合、両方とも通常ブロックになる', () => {
      // 初期状態:
      // __B _*R _*R
      // __Y __B __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'blue', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 2, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null },
          { x: 2, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];
      
      // 氷結ブロックをタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 2つの氷結ブロックが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 両方の氷結ブロックが通常ブロックになっているか確認
      expect(updatedBlocks[0][1]).not.toBeNull();
      expect(updatedBlocks[0][2]).not.toBeNull();
      expect(updatedBlocks[0][1]?.type).toBe('normal');
      expect(updatedBlocks[0][2]?.type).toBe('normal');
    });
  });

  describe('氷結ブロックの消去と重力処理', () => {
    it('氷結ブロックが解除されて通常ブロックになった後、重力で落下する', () => {
      // 初期状態:
      // __R _*R
      // __Y __B
      // ---- ----
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ],
        [
          null,
          null
        ]
      ];
      
      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 通常ブロックを消去
      const afterRemoval = blockLogic.removeBlocks(updatedBlocks, connectedBlocks.filter(b => b.type === 'normal'));
      
      // 重力を適用
      const afterGravity = blockLogic.applyGravity(afterRemoval);
      
      // 氷結ブロックが通常ブロックになって落下しているか確認
      expect(afterGravity[0][1]).toBeNull();
      expect(afterGravity[1][1]).not.toBeNull();
      expect(afterGravity[1][1]?.type).toBe('normal');
      expect(afterGravity[1][1]?.color).toBe('red');
    });
  });
});
