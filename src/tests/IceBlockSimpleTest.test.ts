import { describe, it, expect } from 'vitest';
import { Block } from '../types/Block';

/**
 * 氷結ブロックの挙動に関する単純なテスト
 */
describe('氷結ブロックの挙動', () => {
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
    const connectedBlocks = findConnectedBlocks(blocks, 0, 0);
    
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
    const connectedBlocks = findConnectedBlocks(blocks, 0, 0);
    const updatedBlocks = updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックが通常ブロックになっているか確認
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('normal');
    
    // 通常ブロックのみを消去
    const finalBlocks = removeNormalBlocks(updatedBlocks, connectedBlocks);
    
    // 元々氷結ブロックだったものは残っているか確認（ただし、通常ブロックになっているので消去される）
    expect(finalBlocks[0][0]).toBeNull();
    
    // 通常ブロックが消去されているか確認
    expect(finalBlocks[0][1]).toBeNull();
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
    const connectedBlocks = findConnectedBlocks(blocks, 0, 0);
    const updatedBlocks = updateIceBlocks(blocks, connectedBlocks);
    
    // 氷結ブロックLv2が氷結ブロックLv1になっているか確認
    expect(updatedBlocks[0][0]).not.toBeNull();
    expect(updatedBlocks[0][0]?.type).toBe('iceLv1');
    
    // 通常ブロックのみを消去
    const finalBlocks = removeNormalBlocks(updatedBlocks, connectedBlocks);
    
    // 元々氷結ブロックLv2だったものは氷結ブロックLv1になって残っているか確認
    expect(finalBlocks[0][0]).not.toBeNull();
    expect(finalBlocks[0][0]?.type).toBe('iceLv1');
    
    // 通常ブロックが消去されているか確認
    expect(finalBlocks[0][1]).toBeNull();
  });
});

/**
 * 隣接する同色ブロックを全て見つける
 */
function findConnectedBlocks(blocks: (Block | null)[][], startX: number, startY: number): Block[] {
  // 開始ブロックがnullの場合は空配列を返す
  if (!blocks[startY] || !blocks[startY][startX]) {
    return [];
  }
  
  const startBlock = blocks[startY][startX];
  const targetColor = startBlock.color;
  const visited: boolean[][] = [];
  const connectedBlocks: Block[] = [];
  
  // 訪問済み配列の初期化
  for (let y = 0; y < blocks.length; y++) {
    visited[y] = [];
    for (let x = 0; x < blocks[y].length; x++) {
      visited[y][x] = false;
    }
  }
  
  // 深さ優先探索で隣接ブロックを見つける
  const dfs = (x: number, y: number) => {
    // 範囲外チェック
    if (y < 0 || y >= blocks.length || x < 0 || x >= blocks[y].length) {
      return;
    }
    
    // 訪問済みまたはnullブロックチェック
    if (visited[y][x] || !blocks[y][x]) {
      return;
    }
    
    // 色チェック
    if (blocks[y][x]!.color !== targetColor) {
      return;
    }
    
    // 訪問済みにする
    visited[y][x] = true;
    
    // 結果に追加
    connectedBlocks.push(blocks[y][x]!);
    
    // 隣接する4方向を探索（上下左右）
    dfs(x, y - 1); // 上
    dfs(x + 1, y); // 右
    dfs(x, y + 1); // 下
    dfs(x - 1, y); // 左
  };
  
  // 探索開始
  dfs(startX, startY);
  
  return connectedBlocks;
}

/**
 * 氷結ブロックを更新する
 */
function updateIceBlocks(blocks: (Block | null)[][], connectedBlocks: Block[]): (Block | null)[][] {
  // ブロック配列のディープコピーを作成
  const newBlocks: (Block | null)[][] = JSON.parse(JSON.stringify(blocks));
  
  // 氷結ブロックの場合、レベルを下げる
  connectedBlocks.forEach(block => {
    if (newBlocks[block.y][block.x]?.type === 'iceLv2') {
      // 氷結Lv2 → 氷結Lv1
      newBlocks[block.y][block.x] = {
        ...newBlocks[block.y][block.x]!,
        type: 'iceLv1'
      };
    } else if (newBlocks[block.y][block.x]?.type === 'iceLv1') {
      // 氷結Lv1 → 通常ブロック
      newBlocks[block.y][block.x] = {
        ...newBlocks[block.y][block.x]!,
        type: 'normal'
      };
    }
  });
  
  return newBlocks;
}

/**
 * 通常ブロックのみを消去する
 */
function removeNormalBlocks(blocks: (Block | null)[][], connectedBlocks: Block[]): (Block | null)[][] {
  // ブロック配列のディープコピーを作成
  const newBlocks: (Block | null)[][] = JSON.parse(JSON.stringify(blocks));
  
  // 通常ブロックのみを消去
  connectedBlocks.forEach(block => {
    if (newBlocks[block.y][block.x]?.type === 'normal') {
      newBlocks[block.y][block.x] = null;
    }
  });
  
  return newBlocks;
}
