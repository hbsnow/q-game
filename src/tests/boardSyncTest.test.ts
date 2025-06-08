import { describe, it, expect, beforeEach } from 'vitest';
import { Block, BlockColor } from '@/types';

/**
 * ボード同期テスト用のヘルパー関数
 */
class BoardSyncTester {
  private readonly BOARD_WIDTH = 10;
  private readonly BOARD_HEIGHT = 14;

  /**
   * Visual board state (スプライト配列) を文字列配列に変換
   */
  generateVisualBoardState(blockSprites: (any | null)[][]): string[][] {
    const board: string[][] = Array(this.BOARD_HEIGHT).fill(null).map(() => 
      Array(this.BOARD_WIDTH).fill('.')
    );
    
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        if (blockSprites[row] && blockSprites[row][col]) {
          const sprite = blockSprites[row][col];
          const block = sprite.getData('block') as Block;
          if (block) {
            board[row][col] = this.getColorSymbol(block.color);
          }
        }
      }
    }
    
    return board;
  }

  /**
   * Logical board state (ブロックデータ) を文字列配列に変換
   */
  generateLogicalBoardState(blocks: Block[]): string[][] {
    const board: string[][] = Array(this.BOARD_HEIGHT).fill(null).map(() => 
      Array(this.BOARD_WIDTH).fill('.')
    );
    
    blocks.forEach(block => {
      if (block.y >= 0 && block.y < this.BOARD_HEIGHT && 
          block.x >= 0 && block.x < this.BOARD_WIDTH) {
        board[block.y][block.x] = this.getColorSymbol(block.color);
      }
    });
    
    return board;
  }

  /**
   * 色を文字に変換
   */
  private getColorSymbol(color: BlockColor): string {
    switch (color) {
      case 'blue': return 'B';
      case 'lightBlue': return 'L';
      case 'seaGreen': return 'G';
      case 'coralRed': return 'C';
      case 'sandGold': return 'S';
      case 'pearlWhite': return 'W';
      default: return '?';
    }
  }

  /**
   * 2つのボード状態を比較
   */
  compareBoardStates(visualBoard: string[][], logicalBoard: string[][]): {
    isMatch: boolean;
    mismatches: Array<{
      position: { row: number; col: number };
      visual: string;
      logical: string;
    }>;
  } {
    const mismatches: Array<{
      position: { row: number; col: number };
      visual: string;
      logical: string;
    }> = [];

    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        const visualCell = visualBoard[row][col];
        const logicalCell = logicalBoard[row][col];
        
        if (visualCell !== logicalCell) {
          mismatches.push({
            position: { row, col },
            visual: visualCell,
            logical: logicalCell
          });
        }
      }
    }

    return {
      isMatch: mismatches.length === 0,
      mismatches
    };
  }

  /**
   * ボード状態を文字列として出力（デバッグ用）
   */
  boardToString(board: string[][], title: string): string {
    let result = `${title}:\n`;
    board.forEach((row, i) => {
      result += `  ${i.toString().padStart(2)}: ${row.join(' ')}\n`;
    });
    return result;
  }

  /**
   * 不整合の詳細を文字列として出力
   */
  mismatchesToString(mismatches: Array<{
    position: { row: number; col: number };
    visual: string;
    logical: string;
  }>): string {
    if (mismatches.length === 0) {
      return 'No mismatches found.';
    }

    let result = `Found ${mismatches.length} mismatches:\n`;
    mismatches.forEach(mismatch => {
      result += `  [${mismatch.position.row}][${mismatch.position.col}]: `;
      result += `Visual='${mismatch.visual}' vs Logical='${mismatch.logical}'\n`;
    });
    return result;
  }
}

describe('Board Synchronization Tests', () => {
  let tester: BoardSyncTester;

  beforeEach(() => {
    tester = new BoardSyncTester();
  });

  describe('BoardSyncTester Helper Functions', () => {
    it('should convert color to correct symbol', () => {
      const blocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        { id: '2', type: 'normal', color: 'lightBlue', x: 1, y: 0 },
        { id: '3', type: 'normal', color: 'coralRed', x: 2, y: 0 },
        { id: '4', type: 'normal', color: 'sandGold', x: 3, y: 0 },
      ];

      const logicalBoard = tester.generateLogicalBoardState(blocks);
      
      expect(logicalBoard[0][0]).toBe('B'); // blue
      expect(logicalBoard[0][1]).toBe('L'); // lightBlue
      expect(logicalBoard[0][2]).toBe('C'); // coralRed
      expect(logicalBoard[0][3]).toBe('S'); // sandGold
    });

    it('should detect perfect match between boards', () => {
      const blocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        { id: '2', type: 'normal', color: 'coralRed', x: 1, y: 0 },
      ];

      // モックスプライト配列を作成
      const mockSprites: any[][] = Array(14).fill(null).map(() => Array(10).fill(null));
      
      // スプライトにブロックデータを設定
      mockSprites[0][0] = {
        getData: (key: string) => key === 'block' ? blocks[0] : null
      };
      mockSprites[0][1] = {
        getData: (key: string) => key === 'block' ? blocks[1] : null
      };

      const visualBoard = tester.generateVisualBoardState(mockSprites);
      const logicalBoard = tester.generateLogicalBoardState(blocks);
      const comparison = tester.compareBoardStates(visualBoard, logicalBoard);

      expect(comparison.isMatch).toBe(true);
      expect(comparison.mismatches).toHaveLength(0);
    });

    it('should detect mismatches between boards', () => {
      const logicalBlocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        { id: '2', type: 'normal', color: 'coralRed', x: 1, y: 0 },
      ];

      const visualBlocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        { id: '2', type: 'normal', color: 'sandGold', x: 1, y: 0 }, // 異なる色
      ];

      // モックスプライト配列を作成
      const mockSprites: any[][] = Array(14).fill(null).map(() => Array(10).fill(null));
      
      mockSprites[0][0] = {
        getData: (key: string) => key === 'block' ? visualBlocks[0] : null
      };
      mockSprites[0][1] = {
        getData: (key: string) => key === 'block' ? visualBlocks[1] : null
      };

      const visualBoard = tester.generateVisualBoardState(mockSprites);
      const logicalBoard = tester.generateLogicalBoardState(logicalBlocks);
      const comparison = tester.compareBoardStates(visualBoard, logicalBoard);

      expect(comparison.isMatch).toBe(false);
      expect(comparison.mismatches).toHaveLength(1);
      expect(comparison.mismatches[0]).toEqual({
        position: { row: 0, col: 1 },
        visual: 'S', // sandGold
        logical: 'C'  // coralRed
      });
    });

    it('should handle empty positions correctly', () => {
      const blocks: Block[] = [
        { id: '1', type: 'normal', color: 'blue', x: 0, y: 0 },
        // 位置 (1,0) は空
      ];

      const mockSprites: any[][] = Array(14).fill(null).map(() => Array(10).fill(null));
      mockSprites[0][0] = {
        getData: (key: string) => key === 'block' ? blocks[0] : null
      };
      // mockSprites[0][1] は null のまま

      const visualBoard = tester.generateVisualBoardState(mockSprites);
      const logicalBoard = tester.generateLogicalBoardState(blocks);
      const comparison = tester.compareBoardStates(visualBoard, logicalBoard);

      expect(comparison.isMatch).toBe(true);
      expect(visualBoard[0][0]).toBe('B');
      expect(visualBoard[0][1]).toBe('.');
      expect(logicalBoard[0][0]).toBe('B');
      expect(logicalBoard[0][1]).toBe('.');
    });
  });

  describe('Board State Formatting', () => {
    it('should format board state as readable string', () => {
      const board = [
        ['B', 'C', '.'],
        ['.', 'S', 'L'],
      ];

      const result = tester.boardToString(board, 'Test Board');
      
      expect(result).toContain('Test Board:');
      expect(result).toContain(' 0: B C .');
      expect(result).toContain(' 1: . S L');
    });

    it('should format mismatches as readable string', () => {
      const mismatches = [
        { position: { row: 0, col: 1 }, visual: 'C', logical: 'S' },
        { position: { row: 1, col: 2 }, visual: '.', logical: 'B' },
      ];

      const result = tester.mismatchesToString(mismatches);
      
      expect(result).toContain('Found 2 mismatches:');
      expect(result).toContain('[0][1]: Visual=\'C\' vs Logical=\'S\'');
      expect(result).toContain('[1][2]: Visual=\'.\' vs Logical=\'B\'');
    });
  });
});

// エクスポートしてGameSceneで使用できるようにする
export { BoardSyncTester };
