/**
 * 氷結ブロックのチェーンリアクションをテストするためのスクリプト
 */
import { Block } from '../types';
import { ObstacleBlockManager } from './ObstacleBlockManager';

// テスト用のブロック配列を作成
const createTestBlocks = (): Block[] => {
  return [
    // 氷結ブロック（連続して3つ）
    {
      id: 'ice1',
      type: 'ice1',
      color: 'coralRed',
      x: 0,
      y: 0,
      iceLevel: 1
    },
    {
      id: 'ice2',
      type: 'ice1',
      color: 'coralRed',
      x: 1,
      y: 0,
      iceLevel: 1
    },
    {
      id: 'ice3',
      type: 'ice1',
      color: 'coralRed',
      x: 2,
      y: 0,
      iceLevel: 1
    },
    // 通常ブロック（氷結ブロックの隣）
    {
      id: 'normal1',
      type: 'normal',
      color: 'coralRed',
      x: 3,
      y: 0
    }
  ];
};

// テスト実行
export const runIceBlockTest = (): void => {
  console.log('=== 氷結ブロックチェーンリアクションテスト ===');
  
  // テスト用のブロック配列を作成
  const blocks = createTestBlocks();
  console.log('初期ブロック配置:');
  blocks.forEach(block => {
    console.log(`- ID: ${block.id}, タイプ: ${block.type}, 色: ${block.color}, 位置: (${block.x}, ${block.y})`);
  });
  
  // ObstacleBlockManagerを初期化
  const obstacleBlockManager = new ObstacleBlockManager(blocks);
  
  // 通常ブロックを消去（氷結ブロックの隣）
  const removedBlocks = [blocks[3]]; // 赤の通常ブロック
  console.log('\n通常ブロックを消去:');
  console.log(`- ID: ${removedBlocks[0].id}, タイプ: ${removedBlocks[0].type}, 色: ${removedBlocks[0].color}, 位置: (${removedBlocks[0].x}, ${removedBlocks[0].y})`);
  
  // 妨害ブロックの状態を更新
  console.log('\n妨害ブロックの状態を更新:');
  const updatedBlocks = obstacleBlockManager.updateObstacleBlocks(removedBlocks, [...blocks]);
  
  // 更新後のブロック状態を確認
  console.log('\n更新後のブロック状態:');
  updatedBlocks.forEach(block => {
    console.log(`- ID: ${block.id}, タイプ: ${block.type}, 色: ${block.color}, 位置: (${block.x}, ${block.y})`);
  });
  
  // 氷結ブロックが通常ブロックに変わっているか確認
  const formerIceBlocks = updatedBlocks.filter(block => 
    block.id === 'ice1' || block.id === 'ice2' || block.id === 'ice3'
  );
  
  console.log('\n元の氷結ブロックの状態:');
  formerIceBlocks.forEach(block => {
    console.log(`- ID: ${block.id}, タイプ: ${block.type}, 色: ${block.color}, 位置: (${block.x}, ${block.y})`);
    console.log(`  妨害ブロック管理に存在: ${obstacleBlockManager.isObstacleBlock(block.id)}`);
  });
  
  console.log('=== テスト終了 ===');
};

// テスト実行
runIceBlockTest();
