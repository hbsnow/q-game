import { Block } from '../types';
import { ObstacleBlockManager } from './ObstacleBlockManager';

// テスト用のブロック配列を初期化
const blocks: Block[] = [
  {
    id: 'normal1',
    type: 'normal',
    color: 'blue',
    x: 0,
    y: 0
  },
  {
    id: 'ice1',
    type: 'ice1',
    color: 'red',
    x: 1,
    y: 0,
    iceLevel: 1
  },
  {
    id: 'normal2',
    type: 'normal',
    color: 'red',
    x: 2,
    y: 0
  }
];

// ObstacleBlockManagerを初期化
const obstacleBlockManager = new ObstacleBlockManager(blocks);

// 氷結ブロックの隣で同色ブロックを消去
const removedBlocks = [blocks[2]]; // 赤の通常ブロック
const updatedBlocks = obstacleBlockManager.updateObstacleBlocks(removedBlocks, [...blocks]);

// 氷結ブロックが通常ブロックに変わっているか確認
const formerIceBlock = updatedBlocks.find(b => b.id === 'ice1');
console.log('Former ice block:', formerIceBlock);
console.log('Is still obstacle block:', obstacleBlockManager.isObstacleBlock('ice1'));

// 更新されたブロック配列を表示
console.log('Updated blocks:', updatedBlocks);
