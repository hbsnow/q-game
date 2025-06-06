import { Block, BlockColor, StageConfig, ObstacleConfig } from '@/types';
import { GAME_CONFIG } from '@/config/gameConfig';
import { generateId, randomChoice, shuffleArray, hasRemovableBlocks } from './index';

/**
 * ブロック生成クラス
 */
export class BlockGenerator {
  /**
   * ステージ用のブロック配置を生成
   */
  static generateStageBlocks(stageConfig: StageConfig): Block[] {
    const maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const blocks = this.createInitialBlocks(stageConfig);
      
      // 消去可能性をチェック
      if (this.isValidLayout(blocks)) {
        return blocks;
      }
      
      attempts++;
    }
    
    // 最大試行回数に達した場合は強制的に有効な配置を作成
    return this.createForcedValidLayout(stageConfig);
  }
  
  /**
   * 初期ブロック配置を作成
   */
  private static createInitialBlocks(stageConfig: StageConfig): Block[] {
    const blocks: Block[] = [];
    const { boardWidth, boardHeight } = GAME_CONFIG;
    const availableColors = GAME_CONFIG.colors.slice(0, stageConfig.colors);
    
    // 妨害ブロックを先に配置
    const obstaclePositions = new Set<string>();
    for (const obstacle of stageConfig.obstacles) {
      for (const pos of obstacle.positions) {
        obstaclePositions.add(`${pos.x},${pos.y}`);
        blocks.push(this.createObstacleBlock(obstacle, pos.x, pos.y));
      }
    }
    
    // 通常ブロックを配置
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const posKey = `${x},${y}`;
        
        if (!obstaclePositions.has(posKey)) {
          blocks.push({
            id: generateId(),
            type: 'normal',
            color: randomChoice(availableColors),
            x,
            y,
          });
        }
      }
    }
    
    return blocks;
  }
  
  /**
   * 妨害ブロックを作成
   */
  private static createObstacleBlock(
    obstacle: ObstacleConfig, 
    x: number, 
    y: number
  ): Block {
    const baseBlock: Block = {
      id: generateId(),
      type: obstacle.type,
      color: randomChoice(GAME_CONFIG.colors), // 妨害ブロックも色を持つ
      x,
      y,
    };
    
    // 妨害ブロック固有のプロパティを設定
    if (obstacle.iceLevel) {
      baseBlock.iceLevel = obstacle.iceLevel;
    }
    
    if (obstacle.counterValue) {
      baseBlock.counterValue = obstacle.counterValue;
    }
    
    if (obstacle.isCounterPlus) {
      baseBlock.isCounterPlus = obstacle.isCounterPlus;
    }
    
    return baseBlock;
  }
  
  /**
   * 配置が有効かチェック（消去可能なブロックが存在するか）
   */
  private static isValidLayout(blocks: Block[]): boolean {
    const normalBlocks = blocks.filter(b => b.type === 'normal');
    
    // 最低1箇所は消去可能である必要がある
    if (!hasRemovableBlocks(normalBlocks)) {
      return false;
    }
    
    // 消去可能箇所が多すぎる場合もNG（30%超）
    const removableCount = this.countRemovableGroups(normalBlocks);
    const totalGroups = this.countTotalGroups(normalBlocks);
    
    if (totalGroups > 0 && removableCount / totalGroups > 0.3) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 消去可能なグループ数をカウント
   */
  private static countRemovableGroups(blocks: Block[]): number {
    const visited = new Set<string>();
    let removableGroups = 0;
    
    for (const block of blocks) {
      if (visited.has(block.id)) continue;
      
      const group = this.getConnectedGroup(block, blocks, visited);
      if (group.length >= 2) {
        removableGroups++;
      }
    }
    
    return removableGroups;
  }
  
  /**
   * 総グループ数をカウント
   */
  private static countTotalGroups(blocks: Block[]): number {
    const visited = new Set<string>();
    let totalGroups = 0;
    
    for (const block of blocks) {
      if (visited.has(block.id)) continue;
      
      this.getConnectedGroup(block, blocks, visited);
      totalGroups++;
    }
    
    return totalGroups;
  }
  
  /**
   * 連結グループを取得（visited更新あり）
   */
  private static getConnectedGroup(
    startBlock: Block, 
    allBlocks: Block[], 
    visited: Set<string>
  ): Block[] {
    const group: Block[] = [];
    const queue: Block[] = [startBlock];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      group.push(current);
      
      // 隣接する同色ブロックを探す
      const adjacent = allBlocks.filter(b => 
        !visited.has(b.id) &&
        b.color === startBlock.color &&
        this.isAdjacent(current, b)
      );
      
      queue.push(...adjacent);
    }
    
    return group;
  }
  
  /**
   * 隣接判定
   */
  private static isAdjacent(block1: Block, block2: Block): boolean {
    const dx = Math.abs(block1.x - block2.x);
    const dy = Math.abs(block1.y - block2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }
  
  /**
   * 強制的に有効な配置を作成
   */
  private static createForcedValidLayout(stageConfig: StageConfig): Block[] {
    const blocks = this.createInitialBlocks(stageConfig);
    const normalBlocks = blocks.filter(b => b.type === 'normal');
    
    // 最低限の消去可能グループを作成
    if (normalBlocks.length >= 2) {
      const firstBlock = normalBlocks[0];
      const secondBlock = normalBlocks.find(b => 
        this.isAdjacent(firstBlock, b)
      );
      
      if (secondBlock) {
        secondBlock.color = firstBlock.color;
      }
    }
    
    return blocks;
  }
  
  /**
   * 新しいブロックを生成（重力処理後の補充用）
   */
  static generateNewBlocks(
    positions: { x: number; y: number }[], 
    availableColors: BlockColor[]
  ): Block[] {
    return positions.map(pos => ({
      id: generateId(),
      type: 'normal',
      color: randomChoice(availableColors),
      x: pos.x,
      y: pos.y,
    }));
  }
}
