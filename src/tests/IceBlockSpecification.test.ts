import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block } from '../types/Block';

/**
 * 仕様書に記載されている氷結ブロックの挙動を網羅的にテストする
 */
describe('氷結ブロック仕様テスト', () => {
  // 仕様1: 氷結ブロックLv1は隣接する同色ブロックが1回消去されると解除されてノーマルブロックに戻る
  describe('氷結ブロックLv1の解除', () => {
    it('通常ブロックが消去されると隣接する同色の氷結ブロックLv1が通常ブロックになる', () => {
      // 初期状態:
      // __R _*R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // 通常ブロックを消去
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックLv1が通常ブロックになっているか確認
      expect(updatedBlocks[0][1]).not.toBeNull();
      expect(updatedBlocks[0][1]?.type).toBe('normal');
      expect(updatedBlocks[0][1]?.color).toBe('red');
    });

    it('氷結ブロックLv1が2つ隣接している場合、両方とも通常ブロックになる', () => {
      // 初期状態:
      // _*R _*R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // 氷結ブロックを消去
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 両方の氷結ブロックが通常ブロックになっているか確認
      expect(updatedBlocks[0][0]).not.toBeNull();
      expect(updatedBlocks[0][1]).not.toBeNull();
      expect(updatedBlocks[0][0]?.type).toBe('normal');
      expect(updatedBlocks[0][1]?.type).toBe('normal');
      expect(updatedBlocks[0][0]?.color).toBe('red');
      expect(updatedBlocks[0][1]?.color).toBe('red');
    });
  });

  // 仕様2: 氷結ブロックLv2は隣接する同色ブロックが1回消去されると氷結ブロックLv1に変化する
  describe('氷結ブロックLv2の解除', () => {
    it('通常ブロックが消去されると隣接する同色の氷結ブロックLv2が氷結ブロックLv1になる', () => {
      // 初期状態:
      // __R **R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // 通常ブロックを消去
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックLv2が氷結ブロックLv1になっているか確認
      expect(updatedBlocks[0][1]).not.toBeNull();
      expect(updatedBlocks[0][1]?.type).toBe('iceLv1');
      expect(updatedBlocks[0][1]?.color).toBe('red');
    });

    it('氷結ブロックLv2が2つ隣接している場合、両方とも氷結ブロックLv1になる', () => {
      // 初期状態:
      // **R **R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv2', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // 氷結ブロックを消去
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 両方の氷結ブロックが氷結ブロックLv1になっているか確認
      expect(updatedBlocks[0][0]).not.toBeNull();
      expect(updatedBlocks[0][1]).not.toBeNull();
      expect(updatedBlocks[0][0]?.type).toBe('iceLv1');
      expect(updatedBlocks[0][1]?.type).toBe('iceLv1');
      expect(updatedBlocks[0][0]?.color).toBe('red');
      expect(updatedBlocks[0][1]?.color).toBe('red');
    });
  });

  // 仕様3: 氷結ブロックと通常ブロックが隣接している場合のグループ形成
  describe('氷結ブロックと通常ブロックのグループ形成', () => {
    it('通常ブロックと氷結ブロックLv1が隣接している場合、グループとして検出される', () => {
      // 初期状態:
      // __R _*R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // グループを検出
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 通常ブロックと氷結ブロックの2つが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
      
      // タイプが正しいか確認
      const types = connectedBlocks.map(block => block.type);
      expect(types).toContain('normal');
      expect(types).toContain('iceLv1');
    });

    it('通常ブロックと氷結ブロックLv2が隣接している場合、グループとして検出される', () => {
      // 初期状態:
      // __R **R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // グループを検出
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 通常ブロックと氷結ブロックの2つが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
      
      // タイプが正しいか確認
      const types = connectedBlocks.map(block => block.type);
      expect(types).toContain('normal');
      expect(types).toContain('iceLv2');
    });
  });

  // 仕様4: 異なるレベルの氷結ブロックが隣接している場合のグループ形成
  describe('異なるレベルの氷結ブロックのグループ形成', () => {
    it('氷結ブロックLv1と氷結ブロックLv2が隣接している場合、グループとして検出される', () => {
      // 初期状態:
      // _*R **R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // グループを検出
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックLv1と氷結ブロックLv2の2つが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
      
      // タイプが正しいか確認
      const types = connectedBlocks.map(block => block.type);
      expect(types).toContain('iceLv1');
      expect(types).toContain('iceLv2');
    });
  });

  // 仕様5: 複雑なパターン - 通常ブロックと氷結ブロックの混合グループ
  describe('複雑なパターン', () => {
    it('通常ブロック、氷結ブロックLv1、氷結ブロックLv2が混在するグループが正しく検出される', () => {
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
      
      // 全てのブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
      
      // タイプが正しいか確認
      const types = connectedBlocks.map(block => block.type);
      expect(types).toContain('normal');
      expect(types).toContain('iceLv1');
      expect(types).toContain('iceLv2');
    });

    it('L字型の氷結ブロックと通常ブロックの混合グループが正しく検出される', () => {
      // 初期状態:
      // __R _*R
      // __R **R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'red', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'red', type: 'iceLv2', sprite: null }
        ],
        [
          { x: 0, y: 2, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 2, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // グループを検出
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 4つのブロックが見つかるはず
      expect(connectedBlocks.length).toBe(4);
      
      // 全てのブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 0, y: 1 });
      expect(positions).toContainEqual({ x: 1, y: 1 });
    });
  });

  // 仕様6: 氷結ブロックの消去後の状態
  describe('氷結ブロックの消去後の状態', () => {
    it('氷結ブロックLv1が通常ブロックになった後、下に空白があれば落下する', () => {
      // 初期状態:
      // __R _*R
      // null null
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [null, null]
      ];

      const blockLogic = new BlockLogic();
      
      // 通常ブロックを消去
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックLv1が通常ブロックになっているか確認
      expect(updatedBlocks[0][1]).not.toBeNull();
      expect(updatedBlocks[0][1]?.type).toBe('normal');
      
      // 通常ブロックを消去
      updatedBlocks[0][0] = null;
      
      // 重力を適用
      const fallenBlocks = blockLogic.applyGravity(updatedBlocks);
      
      // 元氷結ブロックが落下しているか確認
      expect(fallenBlocks[0][1]).toBeNull();
      expect(fallenBlocks[1][1]).not.toBeNull();
      expect(fallenBlocks[1][1]?.type).toBe('normal');
      expect(fallenBlocks[1][1]?.color).toBe('red');
    });
  });

  // 仕様7: 氷結ブロックの消去可能性判定
  describe('氷結ブロックの消去可能性判定', () => {
    it('氷結ブロックが2つ以上隣接している場合、消去可能と判定される', () => {
      // 初期状態:
      // _*R _*R
      // __Y __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv1', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // 消去可能かどうか判定
      const canRemove = blockLogic.canRemoveBlocks(blocks, 0, 0);
      
      // 消去可能と判定されるはず
      expect(canRemove).toBe(true);
    });

    it('単独の氷結ブロックは消去不可と判定される', () => {
      // 初期状態:
      // _*R __B
      // __Y __G
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'red', type: 'iceLv1', sprite: null },
          { x: 1, y: 0, color: 'blue', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'green', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // 消去可能かどうか判定
      const canRemove = blockLogic.canRemoveBlocks(blocks, 0, 0);
      
      // 消去不可と判定されるはず
      expect(canRemove).toBe(false);
    });
  });
});
