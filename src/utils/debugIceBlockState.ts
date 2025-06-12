/**
 * 氷結ブロックの状態をデバッグするためのユーティリティ関数
 */

import { Block } from '../types';
import { ObstacleBlockManager } from './ObstacleBlockManager';

/**
 * 氷結ブロックの状態をコンソールに出力
 * @param blocks 全ブロック配列
 * @param obstacleBlockManager 妨害ブロック管理クラス
 */
export function debugIceBlockState(blocks: Block[], obstacleBlockManager: ObstacleBlockManager): void {
  console.log('=== 氷結ブロック状態デバッグ ===');
  
  // 氷結ブロックを抽出
  const iceBlocks = blocks.filter(block => 
    block.type === 'ice1' || 
    block.type === 'ice2' || 
    block.type === 'iceCounter' || 
    block.type === 'iceCounterPlus'
  );
  
  console.log(`氷結ブロック数: ${iceBlocks.length}`);
  
  // 各氷結ブロックの詳細情報
  iceBlocks.forEach(block => {
    console.log(`- ID: ${block.id}`);
    console.log(`  タイプ: ${block.type}`);
    console.log(`  色: ${block.color}`);
    console.log(`  位置: (${block.x}, ${block.y})`);
    
    // 氷結レベル
    if (block.iceLevel) {
      console.log(`  氷結レベル: ${block.iceLevel}`);
    }
    
    // カウンター値
    if (block.counterValue) {
      console.log(`  カウンター値: ${block.counterValue}`);
      console.log(`  カウンタータイプ: ${block.isCounterPlus ? 'カウンター+' : 'カウンター'}`);
    }
    
    // 隣接ブロック情報
    const adjacentPositions = [
      { x: block.x, y: block.y - 1 }, // 上
      { x: block.x, y: block.y + 1 }, // 下
      { x: block.x - 1, y: block.y }, // 左
      { x: block.x + 1, y: block.y }, // 右
    ];
    
    const adjacentBlocks = adjacentPositions.map(pos => {
      return blocks.find(b => b.x === pos.x && b.y === pos.y);
    }).filter(Boolean) as Block[];
    
    console.log(`  隣接ブロック: ${adjacentBlocks.length}個`);
    adjacentBlocks.forEach((adjBlock, index) => {
      console.log(`    ${index + 1}. タイプ: ${adjBlock.type}, 色: ${adjBlock.color}, 位置: (${adjBlock.x}, ${adjBlock.y})`);
    });
    
    // 同色の隣接ブロック
    const sameColorAdjacent = adjacentBlocks.filter(adjBlock => adjBlock.color === block.color);
    console.log(`  同色の隣接ブロック: ${sameColorAdjacent.length}個`);
    
    // 解除条件の確認
    const obstacleBlock = obstacleBlockManager.getObstacleBlock(block.id);
    if (obstacleBlock) {
      const normalSameColorAdjacent = adjacentBlocks.filter(adjBlock => 
        adjBlock.color === block.color && adjBlock.type === 'normal'
      );
      
      console.log(`  同色の通常ブロック隣接: ${normalSameColorAdjacent.length}個`);
      console.log(`  解除条件: ${getUnlockCondition(block)}`);
    }
    
    console.log('');
  });
  
  console.log('=== デバッグ終了 ===');
}

/**
 * 氷結ブロックの解除条件を文字列で返す
 */
function getUnlockCondition(block: Block): string {
  switch (block.type) {
    case 'ice1':
      return '隣接する同色の通常ブロックが消去されると解除';
    case 'ice2':
      return `隣接する同色の通常ブロックが${block.iceLevel}回消去されると解除`;
    case 'iceCounter':
      return '隣接する同色の通常ブロックが消去されるとカウンターブロックに変化';
    case 'iceCounterPlus':
      return '隣接する同色の通常ブロックが消去されるとカウンター+ブロックに変化';
    default:
      return '不明';
  }
}

/**
 * 盤面の状態をアスキーアートで表示
 */
export function printBoardState(blocks: Block[], width: number, height: number): void {
  console.log('=== 盤面状態 ===');
  
  // 盤面の初期化
  const board: string[][] = [];
  for (let y = 0; y < height; y++) {
    board[y] = [];
    for (let x = 0; x < width; x++) {
      board[y][x] = '  ';
    }
  }
  
  // ブロックの配置
  blocks.forEach(block => {
    if (block.x >= 0 && block.x < width && block.y >= 0 && block.y < height) {
      board[block.y][block.x] = getBlockSymbol(block);
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
  console.log('IB = 青の氷結ブロック');
  console.log('I2R = 赤の氷結Lv2ブロック');
  console.log('CR = 赤のカウンターブロック');
  console.log('C+R = 赤のカウンター+ブロック');
  console.log('ICR = 赤の氷結カウンターブロック');
  console.log('IC+R = 赤の氷結カウンター+ブロック');
  console.log('## = 岩ブロック');
  console.log('SS = 鋼鉄ブロック');
  
  console.log('=== 表示終了 ===');
}

/**
 * ブロックの種類と色に応じたシンボルを返す
 */
function getBlockSymbol(block: Block): string {
  const colorSymbol = getColorSymbol(block.color);
  
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
function getColorSymbol(color: string): string {
  switch (color) {
    case 'red':
    case 'coralRed':
      return 'R';
    case 'blue':
      return 'B';
    case 'seaGreen':
      return 'G';
    case 'sandGold':
    case 'yellow':
      return 'Y';
    case 'lightBlue':
      return 'C';
    case 'pearlWhite':
    case 'white':
      return 'W';
    default:
      return '?';
  }
}
