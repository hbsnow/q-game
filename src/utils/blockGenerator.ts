import { Block, BlockColor, StageConfig, ObstacleConfig, BlockType } from "@/types";
import { GAME_CONFIG } from "@/config/gameConfig";
import {
  generateId,
  randomChoice,
  shuffleArray,
  hasRemovableBlocks,
} from "./index";

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
        // 妨害ブロックがある位置はスキップ
        if (obstaclePositions.has(`${x},${y}`)) {
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
      }
    }

    return blocks;
  }

  /**
   * 妨害ブロックを作成
   */
  private static createObstacleBlock(obstacle: ObstacleConfig, x: number, y: number): Block {
    // 基本的な妨害ブロック
    const block: Block = {
      id: generateId(),
      type: obstacle.type,
      color: this.getObstacleColor(obstacle.type),
      x,
      y,
    };

    // 妨害ブロック固有のパラメータを設定
    switch (obstacle.type) {
      case 'ice1':
      case 'ice2':
      case 'iceCounter':
      case 'iceCounterPlus':
        block.iceLevel = obstacle.iceLevel || 1;
        break;
      case 'counter':
      case 'counterPlus':
      case 'iceCounter':
      case 'iceCounterPlus':
        block.counterValue = obstacle.counterValue || 3;
        block.isCounterPlus = obstacle.isCounterPlus || false;
        break;
    }

    return block;
  }

  /**
   * 妨害ブロックの色を取得
   */
  private static getObstacleColor(type: BlockType): BlockColor {
    // 岩ブロックと鋼鉄ブロックは固定色
    if (type === 'rock' || type === 'steel') {
      return 'pearlWhite';
    }

    // その他の妨害ブロックはランダムな色
    const availableColors = GAME_CONFIG.colors.slice(0, 3); // 基本3色から選択
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
  private static createForcedValidLayout(stageConfig: StageConfig): Block[] {
    const blocks = this.createInitialBlocks(stageConfig);
    
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
