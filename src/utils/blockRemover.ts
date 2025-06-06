import { Block, BlockGroup, ScoreResult } from '@/types';
import { getConnectedBlocks, calculateScore } from './index';
import { SCORE_CONFIG } from '@/config/gameConfig';

/**
 * ブロック消去処理クラス
 */
export class BlockRemover {
  /**
   * 指定ブロックとその連結グループを消去
   */
  static removeBlockGroup(
    targetBlock: Block, 
    allBlocks: Block[], 
    isScoreBoosterActive: boolean = false
  ): {
    removedBlocks: Block[];
    remainingBlocks: Block[];
    scoreResult: ScoreResult;
  } {
    // 消去対象グループを取得
    const group = getConnectedBlocks(targetBlock, allBlocks);
    
    // 2個未満は消去不可
    if (group.count < 2) {
      return {
        removedBlocks: [],
        remainingBlocks: allBlocks,
        scoreResult: {
          baseScore: 0,
          allClearBonus: false,
          scoreBoosterActive: isScoreBoosterActive,
          finalScore: 0,
        },
      };
    }
    
    // 消去処理
    const removedBlockIds = new Set(group.blocks.map(b => b.id));
    const remainingBlocks = allBlocks.filter(b => !removedBlockIds.has(b.id));
    
    // スコア計算
    const baseScore = calculateScore(group.count);
    const allClearBonus = this.checkAllClear(remainingBlocks);
    const finalScore = this.calculateFinalScore(baseScore, allClearBonus, isScoreBoosterActive);
    
    return {
      removedBlocks: group.blocks,
      remainingBlocks,
      scoreResult: {
        baseScore,
        allClearBonus,
        scoreBoosterActive: isScoreBoosterActive,
        finalScore,
      },
    };
  }
  
  /**
   * カウンターブロックの消去判定
   */
  static canRemoveCounterBlock(
    counterBlock: Block, 
    allBlocks: Block[]
  ): boolean {
    if (!counterBlock.counterValue) return false;
    
    // カウンターブロックを含む同色の連結グループを取得
    const connectedBlocks = this.getCounterConnectedBlocks(counterBlock, allBlocks);
    const requiredCount = counterBlock.counterValue;
    
    if (counterBlock.isCounterPlus) {
      // カウンター+: 指定数以上
      return connectedBlocks.length >= requiredCount;
    } else {
      // カウンター: ちょうど指定数
      return connectedBlocks.length === requiredCount;
    }
  }
  
  /**
   * カウンターブロック用の連結ブロック取得
   */
  private static getCounterConnectedBlocks(
    startBlock: Block,
    allBlocks: Block[]
  ): Block[] {
    const visited = new Set<string>();
    const group: Block[] = [];
    const queue: Block[] = [startBlock];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      group.push(current);
      
      // 隣接する同色ブロックを探す（通常ブロックとカウンターブロック）
      const adjacentPositions = this.getAdjacentPositions(current);
      
      for (const pos of adjacentPositions) {
        const adjacentBlock = allBlocks.find(b => b.x === pos.x && b.y === pos.y);
        
        if (adjacentBlock && 
            !visited.has(adjacentBlock.id) && 
            adjacentBlock.color === startBlock.color &&
            (adjacentBlock.type === 'normal' || 
             adjacentBlock.type === 'counter' || 
             adjacentBlock.type === 'counterPlus')) {
          queue.push(adjacentBlock);
        }
      }
    }
    
    return group;
  }
  
  /**
   * 氷結ブロックの解除処理
   */
  static processIceBlocks(
    removedBlocks: Block[], 
    allBlocks: Block[]
  ): Block[] {
    const updatedBlocks = [...allBlocks];
    
    // 消去されたブロックの隣接位置にある氷結ブロックを処理
    for (const removedBlock of removedBlocks) {
      const adjacentPositions = this.getAdjacentPositions(removedBlock);
      
      for (const pos of adjacentPositions) {
        const iceBlock = updatedBlocks.find(b => 
          b.x === pos.x && 
          b.y === pos.y && 
          (b.type === 'ice1' || b.type === 'ice2' || 
           b.type === 'iceCounter' || b.type === 'iceCounterPlus') &&
          b.color === removedBlock.color
        );
        
        if (iceBlock) {
          this.processIceBlock(iceBlock, updatedBlocks);
        }
      }
    }
    
    return updatedBlocks;
  }
  
  /**
   * 個別氷結ブロックの処理
   */
  private static processIceBlock(iceBlock: Block, allBlocks: Block[]): void {
    switch (iceBlock.type) {
      case 'ice1':
        // 氷結Lv1 → 通常ブロック
        iceBlock.type = 'normal';
        break;
        
      case 'ice2':
        // 氷結Lv2 → 氷結Lv1
        iceBlock.type = 'ice1';
        iceBlock.iceLevel = 1;
        break;
        
      case 'iceCounter':
        // 氷結カウンター → カウンター
        iceBlock.type = 'counter';
        break;
        
      case 'iceCounterPlus':
        // 氷結カウンター+ → カウンター+
        iceBlock.type = 'counterPlus';
        break;
    }
  }
  
  /**
   * 隣接位置を取得
   */
  private static getAdjacentPositions(block: Block): { x: number; y: number }[] {
    return [
      { x: block.x, y: block.y - 1 }, // 上
      { x: block.x, y: block.y + 1 }, // 下
      { x: block.x - 1, y: block.y }, // 左
      { x: block.x + 1, y: block.y }, // 右
    ];
  }
  
  /**
   * 全消し判定
   */
  private static checkAllClear(blocks: Block[]): boolean {
    // 消去可能なブロックが残っていないかチェック
    const removableBlocks = blocks.filter(b => 
      b.type === 'normal' || 
      b.type === 'counter' || 
      b.type === 'counterPlus'
    );
    
    // 消去可能なブロックが全くない場合は全消し
    if (removableBlocks.length === 0) return true;
    
    // 消去可能なグループが存在するかチェック
    const visited = new Set<string>();
    for (const block of removableBlocks) {
      if (visited.has(block.id)) continue;
      
      if (block.type === 'normal') {
        const group = getConnectedBlocks(block, blocks);
        group.blocks.forEach(b => visited.add(b.id));
        if (group.count >= 2) return false; // 消去可能なグループがある
      } else if (block.type === 'counter' || block.type === 'counterPlus') {
        visited.add(block.id);
        if (this.canRemoveCounterBlock(block, blocks)) return false; // 消去可能なカウンター
      }
    }
    
    // 全ての消去可能ブロックをチェックしたが、消去可能なものがない
    // ただし、単独ブロックが残っている場合は全消しではない
    return removableBlocks.length === 0;
  }
  
  /**
   * 最終スコア計算
   */
  private static calculateFinalScore(
    baseScore: number, 
    allClearBonus: boolean, 
    scoreBoosterActive: boolean
  ): number {
    let finalScore = baseScore;
    
    // 全消しボーナス
    if (allClearBonus) {
      finalScore *= SCORE_CONFIG.ALL_CLEAR_MULTIPLIER;
    }
    
    // スコアブースター
    if (scoreBoosterActive) {
      finalScore *= SCORE_CONFIG.SCORE_BOOSTER_MULTIPLIER;
    }
    
    return Math.round(finalScore);
  }
  
  /**
   * アイテムによる直接消去（スコアなし）
   */
  static removeBlocksByItem(
    targetBlocks: Block[], 
    allBlocks: Block[]
  ): Block[] {
    const removedBlockIds = new Set(targetBlocks.map(b => b.id));
    return allBlocks.filter(b => !removedBlockIds.has(b.id));
  }
}
