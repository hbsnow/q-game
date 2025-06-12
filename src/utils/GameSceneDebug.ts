import { Block } from '../types';

/**
 * GameSceneのデバッグ機能を提供するユーティリティクラス
 */
export class GameSceneDebug {
  /**
   * 妨害ブロックの状態をデバッグ出力
   */
  static debugObstacleBlockState(currentBlocks: Block[]): void {
    console.log('=== 妨害ブロック状態デバッグ ===');
    console.log(`現在のブロック数: ${currentBlocks.length}`);
    
    // 妨害ブロックの数をカウント
    const obstacleBlocks = currentBlocks.filter(block => block.type !== 'normal');
    console.log(`妨害ブロック数: ${obstacleBlocks.length}`);
    
    // 妨害ブロックの種類ごとにカウント
    const blockTypeCount = obstacleBlocks.reduce((acc, block) => {
      acc[block.type] = (acc[block.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('妨害ブロックの種類別カウント:');
    Object.entries(blockTypeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}個`);
    });
    
    // 氷結ブロックの詳細情報
    const iceBlocks = obstacleBlocks.filter(block => 
      block.type === 'ice1' || 
      block.type === 'ice2' || 
      block.type === 'iceCounter' || 
      block.type === 'iceCounterPlus'
    );
    
    if (iceBlocks.length > 0) {
      console.log('\n氷結ブロックの詳細:');
      iceBlocks.forEach(block => {
        console.log(`  - ID: ${block.id}`);
        console.log(`    タイプ: ${block.type}`);
        console.log(`    色: ${block.color}`);
        console.log(`    位置: (${block.x}, ${block.y})`);
      });
    }
    
    console.log('=== デバッグ終了 ===');
  }

  /**
   * 盤面の状態をアスキーアートで表示
   */
  static printBoardState(currentBlocks: Block[], width: number, height: number): void {
    console.log('\n盤面状態:');
    
    // 盤面の初期化
    const board: string[][] = [];
    for (let y = 0; y < height; y++) {
      board[y] = [];
      for (let x = 0; x < width; x++) {
        board[y][x] = '  ';
      }
    }
    
    // ブロックの配置
    currentBlocks.forEach(block => {
      if (block.x >= 0 && block.x < width && block.y >= 0 && block.y < height) {
        board[block.y][block.x] = GameSceneDebug.getBlockSymbol(block);
      }
    });
    
    // 盤面の表示
    console.log('  ' + Array.from({ length: width }, (_, i) => ` ${i} `).join(''));
    console.log('  ' + '+--'.repeat(width) + '+');
    
    for (let y = 0; y < height; y++) {
      let row = `${y.toString().padStart(2)} |`;
      for (let x = 0; x < width; x++) {
        row += `${board[y][x]}|`;
      }
      console.log(row);
      console.log('  ' + '+--'.repeat(width) + '+');
    }
    
    // 凡例
    console.log('\n凡例:');
    console.log('R  = 赤の通常ブロック');
    console.log('B  = 青の通常ブロック');
    console.log('G  = 緑の通常ブロック');
    console.log('Y  = 黄の通常ブロック');
    console.log('C  = 水色の通常ブロック');
    console.log('W  = 白の通常ブロック');
    console.log('IR = 赤の氷結ブロック');
    console.log('I2R = 赤の氷結Lv2ブロック');
    console.log('CR = 赤のカウンターブロック');
    console.log('C+R = 赤のカウンター+ブロック');
  }

  /**
   * ブロックの種類と色に応じたシンボルを返す
   */
  private static getBlockSymbol(block: Block): string {
    const colorSymbol = GameSceneDebug.getColorSymbol(block.color);
    
    switch (block.type) {
      case 'normal':
        return ` ${colorSymbol}`;
      case 'ice1':
        return `I${colorSymbol}`;
      case 'ice2':
        return `I2${colorSymbol.substring(0, 1)}`;
      case 'counter':
        return `C${colorSymbol}`;
      case 'counterPlus':
        return `C+${colorSymbol.substring(0, 1)}`;
      case 'iceCounter':
        return `IC${colorSymbol.substring(0, 1)}`;
      case 'iceCounterPlus':
        return `I+${colorSymbol.substring(0, 1)}`;
      case 'rock':
        return '##';
      case 'steel':
        return 'SS';
      default:
        return '??';
    }
  }
  
  /**
   * 色に応じたシンボルを返す
   */
  private static getColorSymbol(color: string): string {
    switch (color) {
      case 'coralRed':
        return 'R';
      case 'blue':
        return 'B';
      case 'seaGreen':
        return 'G';
      case 'sandGold':
        return 'Y';
      case 'lightBlue':
        return 'C';
      case 'pearlWhite':
        return 'W';
      default:
        return '?';
    }
  }
}
