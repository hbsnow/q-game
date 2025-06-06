import { Block, Position } from '@/types';
import { GAME_CONFIG } from '@/config/gameConfig';

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
 * 重力処理クラス
 */
export class GravityProcessor {
  /**
   * 重力を適用してブロックを落下させる
   */
  static applyGravity(blocks: Block[]): GravityResult {
    const { boardWidth, boardHeight } = GAME_CONFIG;
    const movements: BlockMovement[] = [];
    const processedBlocks: Block[] = [];
    const emptyPositions: Position[] = [];
    
    // 列ごとに処理
    for (let x = 0; x < boardWidth; x++) {
      const columnBlocks = blocks
        .filter(b => b.x === x)
        .sort((a, b) => b.y - a.y); // 下から上の順
      
      const { movedBlocks, columnMovements, columnEmptyPositions } = 
        this.processColumn(columnBlocks, x, boardHeight);
      
      processedBlocks.push(...movedBlocks);
      movements.push(...columnMovements);
      emptyPositions.push(...columnEmptyPositions);
    }
    
    return {
      blocks: processedBlocks,
      movements,
      emptyPositions,
    };
  }
  
  /**
   * 1列の重力処理
   */
  private static processColumn(
    columnBlocks: Block[], 
    x: number, 
    boardHeight: number
  ): {
    movedBlocks: Block[];
    columnMovements: BlockMovement[];
    columnEmptyPositions: Position[];
  } {
    const movements: BlockMovement[] = [];
    const movedBlocks: Block[] = [];
    const emptyPositions: Position[] = [];
    
    // 固定ブロック（鋼鉄ブロック）の位置を記録
    const fixedPositions = new Set<number>();
    const steelBlocks = columnBlocks.filter(b => b.type === 'steel');
    steelBlocks.forEach(block => {
      fixedPositions.add(block.y);
    });
    
    // 落下可能ブロックを取得（鋼鉄以外）
    const fallableBlocks = columnBlocks.filter(b => b.type !== 'steel');
    
    // 下から順に配置していく
    let targetY = boardHeight - 1;
    
    // 落下可能ブロックを下から配置
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
    
    // 空いた位置を記録（上部の空いた位置）
    for (let y = 0; y <= targetY; y++) {
      if (!fixedPositions.has(y)) {
        emptyPositions.push({ x, y });
      }
    }
    
    return {
      movedBlocks,
      columnMovements: movements,
      columnEmptyPositions: emptyPositions,
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
  static needsGravity(blocks: Block[]): boolean {
    const { boardWidth, boardHeight } = GAME_CONFIG;
    
    for (let x = 0; x < boardWidth; x++) {
      const columnBlocks = blocks.filter(b => b.x === x);
      
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
    
    return false;
  }
  
  /**
   * デバッグ用: 重力処理結果を可視化
   */
  static visualizeGravityResult(result: GravityResult): string {
    const { boardWidth, boardHeight } = GAME_CONFIG;
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
    
    // 空の位置をマーク
    result.emptyPositions.forEach(pos => {
      grid[pos.y][pos.x] = 'E';
    });
    
    return grid.map(row => row.join(' ')).join('\n');
  }
}
