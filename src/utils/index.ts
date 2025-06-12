import { Block, BlockGroup, Position, BlockColor } from '@/types';
import { GAME_CONFIG } from '@/config/gameConfig';

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * 2つの位置が隣接しているかチェック（上下左右のみ）
 */
export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/**
 * 指定位置の隣接位置を取得
 */
export function getAdjacentPositions(pos: Position): Position[] {
  return [
    { x: pos.x, y: pos.y - 1 }, // 上
    { x: pos.x, y: pos.y + 1 }, // 下
    { x: pos.x - 1, y: pos.y }, // 左
    { x: pos.x + 1, y: pos.y }, // 右
  ].filter(p => 
    p.x >= 0 && p.x < GAME_CONFIG.boardWidth && 
    p.y >= 0 && p.y < GAME_CONFIG.boardHeight
  );
}

/**
 * 同色で隣接するブロックグループを取得
 */
export function getConnectedBlocks(
  startBlock: Block, 
  allBlocks: Block[]
): BlockGroup {
  const visited = new Set<string>();
  const group: Block[] = [];
  const queue: Block[] = [startBlock];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    
    // 通常ブロックのみをグループに含める
    if (current.type === 'normal') {
      group.push(current);
    }
    
    // 隣接する同色ブロックを探す
    const adjacentPositions = getAdjacentPositions({ x: current.x, y: current.y });
    
    for (const pos of adjacentPositions) {
      const adjacentBlock = allBlocks.find(b => b.x === pos.x && b.y === pos.y);
      
      if (adjacentBlock && 
          !visited.has(adjacentBlock.id) && 
          adjacentBlock.color === startBlock.color) {
        // 氷結ブロックは通過できるが、グループには含めない
        if (adjacentBlock.type === 'normal' || 
            canPassThrough(adjacentBlock) || 
            canParticipateInGroup(adjacentBlock)) {
          queue.push(adjacentBlock);
        }
      }
    }
  }
  
  return {
    blocks: group,
    count: group.length,
    color: startBlock.color
  };
}

/**
 * ブロックがグループ形成に参加できるかチェック
 */
function canParticipateInGroup(block: Block): boolean {
  switch (block.type) {
    case 'normal':
      return true;
    case 'counter':
    case 'counterPlus':
      return true; // カウンターブロックは隣接判定に参加
    case 'ice1':
    case 'ice2':
    case 'iceCounter':
    case 'iceCounterPlus':
      return false; // 氷結ブロックは参加しない（ただし通過は可能）
    case 'rock':
    case 'steel':
      return false; // 岩・鋼鉄ブロックは参加しない
    default:
      return false;
  }
}

/**
 * ブロックを通過できるかチェック（グループには含めないが連結判定は通過）
 */
function canPassThrough(block: Block): boolean {
  switch (block.type) {
    case 'ice1':
    case 'ice2':
    case 'iceCounter':
    case 'iceCounterPlus':
      return true; // 氷結ブロックは通過可能
    default:
      return false;
  }
}

/**
 * スコア計算（ブロック数の二乗）
 */
export function calculateScore(blockCount: number): number {
  return blockCount * blockCount;
}

/**
 * 配列をシャッフル
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 指定範囲の乱数を生成
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 配列からランダムに要素を選択
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 盤面に消去可能なブロックがあるかチェック
 */
export function hasRemovableBlocks(blocks: Block[]): boolean {
  for (const block of blocks) {
    if (block.type !== 'normal') continue;
    
    const group = getConnectedBlocks(block, blocks);
    if (group.count >= 2) {
      return true;
    }
  }
  return false;
}

/**
 * 全消し判定（消去可能な全ブロックが消去されているか）
 */
export function isAllClear(blocks: Block[]): boolean {
  return blocks.every(block => 
    block.type === 'rock' || 
    block.type === 'steel' ||
    block.type === 'normal' && !hasRemovableBlocks([block])
  );
}

/**
 * デバッグ用ログ出力
 */
export function debugLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}

// 新しいユーティリティクラスをエクスポート
export { BlockGenerator } from './blockGenerator';
export { BlockRemover } from './blockRemover';
export { GravityProcessor } from './gravityProcessor';
export { AssetGenerator } from './assetGenerator';
export { GameDebugger } from './debugger';
