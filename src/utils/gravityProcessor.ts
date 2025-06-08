import { Block, Position } from '@/types';

/**
 * 重力処理結果
 */
export interface GravityResult {
  blocks: Block[];
  movements: BlockMovement[];
  emptyPositions: Position[];
}

/**
 * ブロック移動情報
 */
export interface BlockMovement {
  blockId: string;
  from: Position;
  to: Position;
  distance: number;
}

/**
 * 重力処理クラス - 正しいさめがめルール実装
 */
export class GravityProcessor {
  /**
   * 重力を適用してブロックを落下させ、左詰めする
   * さめがめルール：
   * 1. 各列でブロックを下に落下させる
   * 2. 空いた列を左に詰める
   */
  static applyGravity(blocks: Block[], boardWidth: number = 10, boardHeight: number = 14): GravityResult {
    const movements: BlockMovement[] = [];
    let processedBlocks: Block[] = [];
    
    // ステップ1: 各列でブロックを下に落下させる
    const columnsWithBlocks: Block[][] = [];
    
    for (let x = 0; x < boardWidth; x++) {
      const columnBlocks = blocks
        .filter(b => b.x === x)
        .sort((a, b) => b.y - a.y); // 下から上の順
      
      if (columnBlocks.length > 0) {
        const { movedBlocks, columnMovements } = 
          this.processColumnGravity(columnBlocks, x, boardHeight);
        
        columnsWithBlocks.push(movedBlocks);
        movements.push(...columnMovements);
      }
    }
    
    // ステップ2: 空いた列を左に詰める
    let targetX = 0;
    for (const columnBlocks of columnsWithBlocks) {
      const leftPackedBlocks = columnBlocks.map(block => {
        const originalX = block.x;
        const newBlock = { ...block, x: targetX };
        
        // 横移動があった場合は記録
        if (originalX !== targetX) {
          movements.push({
            blockId: block.id,
            from: { x: originalX, y: block.y },
            to: { x: targetX, y: block.y },
            distance: Math.abs(originalX - targetX),
          });
        }
        
        return newBlock;
      });
      
      processedBlocks.push(...leftPackedBlocks);
      targetX++;
    }
    
    // 空の位置を計算
    const emptyPositions: Position[] = [];
    const occupiedPositions = new Set(
      processedBlocks.map(b => `${b.x},${b.y}`)
    );
    
    for (let x = 0; x < boardWidth; x++) {
      for (let y = 0; y < boardHeight; y++) {
        if (!occupiedPositions.has(`${x},${y}`)) {
          emptyPositions.push({ x, y });
        }
      }
    }
    
    return {
      blocks: processedBlocks,
      movements,
      emptyPositions,
    };
  }
  
  /**
   * 1列の重力処理（下に落下）
   */
  private static processColumnGravity(
    columnBlocks: Block[], 
    x: number, 
    boardHeight: number
  ): {
    movedBlocks: Block[];
    columnMovements: BlockMovement[];
  } {
    const movements: BlockMovement[] = [];
    const movedBlocks: Block[] = [];
    
    // 固定ブロック（鋼鉄ブロック）の位置を記録
    const fixedPositions = new Set<number>();
    const steelBlocks = columnBlocks.filter(b => b.type === 'steel');
    steelBlocks.forEach(block => {
      fixedPositions.add(block.y);
    });
    
    // 落下可能ブロックを取得（鋼鉄以外）、上から下の順でソート
    const fallableBlocks = columnBlocks
      .filter(b => b.type !== 'steel')
      .sort((a, b) => a.y - b.y); // 上から下の順
    
    // 下から順に配置していく
    let targetY = boardHeight - 1;
    
    // 落下可能ブロックを下から配置（配列の後ろから処理）
    for (let i = fallableBlocks.length - 1; i >= 0; i--) {
      const block = fallableBlocks[i];
      
      // 鋼鉄ブロックの位置をスキップ
      while (fixedPositions.has(targetY) && targetY >= 0) {
        targetY--;
      }
      
      if (targetY >= 0) {
        const originalY = block.y;
        const newBlock = { ...block, y: targetY };
        
        movedBlocks.push(newBlock);
        
        // 移動があった場合は記録
        if (originalY !== targetY) {
          movements.push({
            blockId: block.id,
            from: { x, y: originalY },
            to: { x, y: targetY },
            distance: Math.abs(originalY - targetY),
          });
        }
        
        targetY--;
      }
    }
    
    // 鋼鉄ブロックはそのまま追加
    movedBlocks.push(...steelBlocks);
    
    return {
      movedBlocks,
      columnMovements: movements,
    };
  }
  
  /**
   * 落下アニメーション用の段階的移動を計算
   */
  static calculateSteppedMovements(movements: BlockMovement[]): BlockMovement[][] {
    if (movements.length === 0) return [];
    
    const maxDistance = Math.max(...movements.map(m => m.distance));
    const steps: BlockMovement[][] = [];
    
    for (let step = 1; step <= maxDistance; step++) {
      const stepMovements = movements
        .filter(m => m.distance >= step)
        .map(m => ({
          ...m,
          from: { x: m.from.x, y: m.from.y - (step - 1) },
          to: { x: m.to.x, y: m.from.y - step },
          distance: 1,
        }));
      
      if (stepMovements.length > 0) {
        steps.push(stepMovements);
      }
    }
    
    return steps;
  }
  
  /**
   * 重力処理が必要かチェック
   */
  static needsGravity(blocks: Block[], boardWidth: number = 10, boardHeight: number = 14): boolean {
    // 各列で空きがあるかチェック
    for (let x = 0; x < boardWidth; x++) {
      const columnBlocks = blocks.filter(b => b.x === x);
      
      if (columnBlocks.length === 0) continue;
      
      // 列に空きがあるかチェック
      const occupiedPositions = new Set(columnBlocks.map(b => b.y));
      
      for (let y = boardHeight - 1; y >= 0; y--) {
        if (!occupiedPositions.has(y)) {
          // この位置より上にブロックがあるかチェック
          const hasBlocksAbove = columnBlocks.some(b => b.y < y);
          if (hasBlocksAbove) {
            return true;
          }
        }
      }
    }
    
    // 左詰めが必要かチェック
    const nonEmptyColumns = [];
    for (let x = 0; x < boardWidth; x++) {
      const columnBlocks = blocks.filter(b => b.x === x);
      if (columnBlocks.length > 0) {
        nonEmptyColumns.push(x);
      }
    }
    
    // 連続していない列があれば左詰めが必要
    for (let i = 0; i < nonEmptyColumns.length; i++) {
      if (nonEmptyColumns[i] !== i) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * デバッグ用: 重力処理結果を可視化
   */
  static visualizeGravityResult(result: GravityResult, boardWidth: number = 10, boardHeight: number = 14): string {
    const grid: string[][] = Array(boardHeight).fill(null).map(() => 
      Array(boardWidth).fill('.')
    );
    
    // ブロックを配置
    result.blocks.forEach(block => {
      const symbol = block.type === 'steel' ? 'S' : 
                    block.type === 'rock' ? 'R' : 
                    block.color.charAt(0).toUpperCase();
      grid[block.y][block.x] = symbol;
    });
    
    return grid.map(row => row.join(' ')).join('\n');
  }
}
