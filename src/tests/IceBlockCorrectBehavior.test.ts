import { describe, it, expect } from 'vitest';
import { BlockLogic } from '../utils/BlockLogic';
import { Block } from '../types/Block';

/**
 * 仕様書に記載されている氷結ブロックの挙動を正確にテストする
 * 仕様書の例を直接テストケースとして実装
 */
describe('氷結ブロックの仕様書通りの挙動', () => {
  describe('氷結ブロックLv1の挙動', () => {
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

      const blockLogic = new BlockLogic();
      
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

      const blockLogic = new BlockLogic();
      
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
      expect(updatedBlocks[0][1]?.color).toBe('red');
      expect(updatedBlocks[0][2]?.color).toBe('red');
    });
  });

  describe('氷結ブロックLv2の挙動', () => {
    it('例1: 隣接する同色ブロックが消去されると氷結ブロックLv2が氷結ブロックLv1になる', () => {
      // 初期状態:
      // __B __R **R __Y
      // __Y __R __R __Y
      // __B __R __Y __Y
      // __Y __R __B __R
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'blue', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'normal', sprite: null },
          { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null },
          { x: 3, y: 0, color: 'yellow', type: 'normal', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'red', type: 'normal', sprite: null },
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

      const blockLogic = new BlockLogic();
      
      // b0（赤ブロック）をタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 赤ブロックのグループが見つかるはず
      expect(connectedBlocks.length).toBeGreaterThan(1);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 氷結ブロックLv2が氷結ブロックLv1になっているか確認
      expect(updatedBlocks[0][2]).not.toBeNull();
      expect(updatedBlocks[0][2]?.type).toBe('iceLv1');
      expect(updatedBlocks[0][2]?.color).toBe('red');
    });

    it('例2: 氷結ブロックLv2が2つ隣接している場合、両方とも氷結ブロックLv1になる', () => {
      // 初期状態:
      // __B **R **R
      // __Y __B __B
      const blocks: (Block | null)[][] = [
        [
          { x: 0, y: 0, color: 'blue', type: 'normal', sprite: null },
          { x: 1, y: 0, color: 'red', type: 'iceLv2', sprite: null },
          { x: 2, y: 0, color: 'red', type: 'iceLv2', sprite: null }
        ],
        [
          { x: 0, y: 1, color: 'yellow', type: 'normal', sprite: null },
          { x: 1, y: 1, color: 'blue', type: 'normal', sprite: null },
          { x: 2, y: 1, color: 'blue', type: 'normal', sprite: null }
        ]
      ];

      const blockLogic = new BlockLogic();
      
      // 氷結ブロックをタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 2つの氷結ブロックが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);
      
      // 両方の氷結ブロックが氷結ブロックLv1になっているか確認
      expect(updatedBlocks[0][1]).not.toBeNull();
      expect(updatedBlocks[0][2]).not.toBeNull();
      expect(updatedBlocks[0][1]?.type).toBe('iceLv1');
      expect(updatedBlocks[0][2]?.type).toBe('iceLv1');
      expect(updatedBlocks[0][1]?.color).toBe('red');
      expect(updatedBlocks[0][2]?.color).toBe('red');
    });
  });

  describe('氷結ブロックと通常ブロックの混合グループ', () => {
    it('例1: 通常ブロックと氷結ブロックLv1が隣接している場合、グループとして検出される', () => {
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

      const blockLogic = new BlockLogic();
      
      // 通常ブロックをタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 通常ブロックと氷結ブロックの2つが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
      
      // タイプが正しいか確認
      const types = connectedBlocks.map(block => block.type);
      expect(types).toContain('normal');
      expect(types).toContain('iceLv1');
    });

    it('例2: 通常ブロックと氷結ブロックLv2が隣接している場合、グループとして検出される', () => {
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

      const blockLogic = new BlockLogic();
      
      // 通常ブロックをタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 通常ブロックと氷結ブロックの2つが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
      
      // タイプが正しいか確認
      const types = connectedBlocks.map(block => block.type);
      expect(types).toContain('normal');
      expect(types).toContain('iceLv2');
    });
  });

  describe('異なるレベルの氷結ブロックのグループ形成', () => {
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

      const blockLogic = new BlockLogic();
      
      // 氷結ブロックをタップ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 0);
      
      // 2つの氷結ブロックが見つかるはず
      expect(connectedBlocks.length).toBe(2);
      
      // 両方のブロックが含まれているか確認
      const positions = connectedBlocks.map(block => ({ x: block.x, y: block.y }));
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
      
      // タイプが正しいか確認
      const types = connectedBlocks.map(block => block.type);
      expect(types).toContain('iceLv1');
      expect(types).toContain('iceLv2');
    });
  });
});
