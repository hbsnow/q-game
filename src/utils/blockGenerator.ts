import { Block, BlockColor, StageConfig, ObstacleConfig, BlockType } from "@/types";
import { GAME_CONFIG } from "@/config/gameConfig";
import {
  generateId,
  randomChoice,
  shuffleArray,
  hasRemovableBlocks,
} from "./index";
import { ObstacleBlockManager } from "./ObstacleBlockManager";

/**
 * ブロック生成クラス
 */
export class BlockGenerator {
  /**
   * ステージ用のブロック配置を生成
   */
  static generateStageBlocks(stageConfig: StageConfig, obstacleBlockManager?: ObstacleBlockManager): Block[] {
    const maxAttempts = 10;
    let attempts = 0;

    // ObstacleBlockManagerがない場合は新しく作成
    const manager = obstacleBlockManager || new ObstacleBlockManager();

    while (attempts < maxAttempts) {
      const blocks = this.createInitialBlocks(stageConfig, manager);

      // 消去可能性をチェック
      if (this.isValidLayout(blocks)) {
        return blocks;
      }

      attempts++;
    }

    // 最大試行回数に達した場合は強制的に有効な配置を作成
    return this.createForcedValidLayout(stageConfig, manager);
  }

  /**
   * 初期ブロック配置を作成
   * 重要: 妨害ブロックを先に配置し、残りの空きマスにのみ通常ブロックを配置する
   */
  private static createInitialBlocks(stageConfig: StageConfig, obstacleBlockManager: ObstacleBlockManager): Block[] {
    const blocks: Block[] = [];
    const { boardWidth, boardHeight } = GAME_CONFIG;
    const availableColors = GAME_CONFIG.colors.slice(0, stageConfig.colors);

    // 妨害ブロックを先に配置
    const occupiedPositions = new Set<string>();
    
    for (const obstacle of stageConfig.obstacles) {
      for (const pos of obstacle.positions) {
        const posKey = `${pos.x},${pos.y}`;
        
        // 既に配置済みの位置はスキップ（重複配置防止）
        if (occupiedPositions.has(posKey)) {
          console.warn(`Duplicate obstacle position at (${pos.x}, ${pos.y}), skipping`);
          continue;
        }
        
        // 妨害ブロックを生成
        const color = this.getObstacleColor(obstacle.type, availableColors);
        const obstacleBlock = obstacleBlockManager.createObstacleBlock(
          obstacle.type,
          color,
          pos.x,
          pos.y,
          {
            counterValue: obstacle.counterValue
          }
        );
        
        // 生成された妨害ブロックをブロック配列に追加
        blocks.push(obstacleBlock.getBlock());
        occupiedPositions.add(posKey);
      }
    }

    // 通常ブロックを配置（妨害ブロックがない位置のみ）
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const posKey = `${x},${y}`;
        
        // 妨害ブロックがある位置はスキップ
        if (occupiedPositions.has(posKey)) {
          continue;
        }

        // ランダムな色を選択
        const color = randomChoice(availableColors);
        
        // 通常ブロックを作成
        blocks.push({
          id: generateId(),
          type: 'normal',
          color: color as BlockColor,
          x,
          y,
        });
        
        // 位置を記録
        occupiedPositions.add(posKey);
      }
    }

    return blocks;
  }

  /**
   * 妨害ブロックの色を取得
   */
  private static getObstacleColor(type: BlockType, availableColors: string[]): BlockColor {
    // 岩ブロックと鋼鉄ブロックは固定色
    if (type === 'rock' || type === 'steel') {
      return 'pearlWhite';
    }

    // その他の妨害ブロックはランダムな色（ステージで使用可能な色から選択）
    return randomChoice(availableColors) as BlockColor;
  }

  /**
   * 配置が有効かどうかをチェック
   */
  private static isValidLayout(blocks: Block[]): boolean {
    // 消去可能なブロックがあるかチェック
    return hasRemovableBlocks(blocks);
  }

  /**
   * 強制的に有効な配置を作成
   */
  private static createForcedValidLayout(stageConfig: StageConfig, obstacleBlockManager: ObstacleBlockManager): Block[] {
    const blocks = this.createInitialBlocks(stageConfig, obstacleBlockManager);
    
    // 消去可能なブロックがない場合は強制的に作成
    if (!this.isValidLayout(blocks)) {
      this.forceRemovableBlocks(blocks);
    }
    
    return blocks;
  }

  /**
   * 強制的に消去可能なブロックを作成
   */
  private static forceRemovableBlocks(blocks: Block[]): void {
    const normalBlocks = blocks.filter(block => block.type === 'normal');
    
    if (normalBlocks.length < 2) {
      return; // 通常ブロックが2つ未満の場合は何もしない
    }
    
    // 隣接する2つの通常ブロックを探す
    for (let i = 0; i < normalBlocks.length - 1; i++) {
      const block1 = normalBlocks[i];
      
      for (let j = i + 1; j < normalBlocks.length; j++) {
        const block2 = normalBlocks[j];
        
        // 隣接しているかチェック
        if (
          (Math.abs(block1.x - block2.x) === 1 && block1.y === block2.y) ||
          (Math.abs(block1.y - block2.y) === 1 && block1.x === block2.x)
        ) {
          // 同じ色にする
          const targetColor = block1.color;
          
          // block2の色を変更
          const block2Index = blocks.findIndex(b => b.id === block2.id);
          if (block2Index !== -1) {
            blocks[block2Index].color = targetColor;
          }
          
          return; // 1組作成したら終了
        }
      }
    }
    
    // 隣接するブロックが見つからない場合は、最初の2つのブロックを同じ色にする
    if (normalBlocks.length >= 2) {
      const targetColor = normalBlocks[0].color;
      
      const block2Index = blocks.findIndex(b => b.id === normalBlocks[1].id);
      if (block2Index !== -1) {
        blocks[block2Index].color = targetColor;
      }
    }
  }

  /**
   * 指定した位置に新しいブロックを生成（テスト用）
   */
  static generateNewBlocks(positions: { x: number; y: number }[], colors: BlockColor[]): Block[] {
    return positions.map(pos => ({
      id: generateId(),
      type: 'normal',
      color: randomChoice(colors),
      x: pos.x,
      y: pos.y,
    }));
  }
}
