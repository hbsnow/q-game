/**
 * アイテム効果管理システム
 */

import { Block } from '../types/Block';
import { GameConfig } from '../config/GameConfig';

/**
 * アイテム効果の結果
 */
export interface ItemEffectResult {
  success: boolean;
  message?: string;
  modifiedBlocks?: Block[];
  newBlocks?: Block[][];
}

/**
 * アイテム効果管理クラス
 */
export class ItemEffectManager {
  
  /**
   * スワップ効果：2つのブロックを入れ替える
   */
  static applySwap(blocks: Block[][], pos1: {x: number, y: number}, pos2: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos1, blocks) || !this.isValidPosition(pos2, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block1 = blocks[pos1.y][pos1.x];
    const block2 = blocks[pos2.y][pos2.x];
    
    if (!block1 || !block2) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // 岩ブロックと鋼鉄ブロックは選択不可
    if (this.isUnswappableBlock(block1) || this.isUnswappableBlock(block2)) {
      return { success: false, message: '岩ブロックと鋼鉄ブロックは入れ替えできません' };
    }
    
    // ブロックを入れ替え
    const newBlocks = this.deepCopyBlocks(blocks);
    const tempBlock = { ...newBlocks[pos1.y][pos1.x]! };
    
    // 座標を更新して入れ替え
    newBlocks[pos1.y][pos1.x] = { ...newBlocks[pos2.y][pos2.x]!, x: pos1.x, y: pos1.y, sprite: null as any };
    newBlocks[pos2.y][pos2.x] = { ...tempBlock, x: pos2.x, y: pos2.y, sprite: null as any };
    
    return { 
      success: true, 
      message: 'ブロックを入れ替えました',
      newBlocks: newBlocks
    };
  }

  /**
   * チェンジワン効果：指定ブロック1個を指定色に変更
   */
  static applyChangeOne(blocks: Block[][], pos: {x: number, y: number}, newColor: string): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // 岩ブロックと鋼鉄ブロックは変更不可
    if (this.isUnchangeableBlock(block)) {
      return { success: false, message: '岩ブロックと鋼鉄ブロックは色変更できません' };
    }
    
    // 色を変更
    const newBlocks = this.deepCopyBlocks(blocks);
    newBlocks[pos.y][pos.x] = { ...newBlocks[pos.y][pos.x]!, color: newColor, sprite: null as any };
    
    return { 
      success: true, 
      message: 'ブロックの色を変更しました',
      newBlocks: newBlocks
    };
  }

  /**
   * ミニ爆弾効果：指定ブロック1個を消去
   */
  static applyMiniBomb(blocks: Block[][], pos: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // 通常ブロックのみ消去可能
    if (block.type !== 'normal') {
      return { success: false, message: '通常ブロックのみ消去できます' };
    }
    
    // ブロックを消去
    const newBlocks = this.deepCopyBlocks(blocks);
    newBlocks[pos.y][pos.x] = null;
    
    return { 
      success: true, 
      message: 'ブロックを消去しました',
      newBlocks: newBlocks,
      modifiedBlocks: [block]
    };
  }

  /**
   * シャッフル効果：通常ブロックのみを再配置
   */
  static applyShuffle(blocks: Block[][]): ItemEffectResult {
    const newBlocks = this.deepCopyBlocks(blocks);
    
    // 通常ブロックの色を収集
    const normalBlockColors: string[] = [];
    const normalBlockPositions: {x: number, y: number}[] = [];
    
    const boardHeight = newBlocks.length;
    const boardWidth = newBlocks[0]?.length || 0;
    
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const block = newBlocks[y][x];
        if (block && block.type === 'normal') {
          normalBlockColors.push(block.color);
          normalBlockPositions.push({x, y});
        }
      }
    }
    
    // 色をシャッフル
    const shuffledColors = this.shuffleArray([...normalBlockColors]);
    
    // シャッフルした色を再配置
    normalBlockPositions.forEach((pos, index) => {
      if (newBlocks[pos.y][pos.x] && newBlocks[pos.y][pos.x]!.type === 'normal') {
        newBlocks[pos.y][pos.x] = {
          ...newBlocks[pos.y][pos.x]!,
          color: shuffledColors[index],
          sprite: null as any
        };
      }
    });
    
    return { 
      success: true, 
      message: 'ブロックをシャッフルしました',
      newBlocks: newBlocks
    };
  }

  /**
   * 座標の有効性をチェック
   */
  private static isValidPosition(pos: {x: number, y: number}, blocks?: Block[][]): boolean {
    if (blocks) {
      const boardHeight = blocks.length;
      const boardWidth = blocks[0]?.length || 0;
      return pos.x >= 0 && pos.x < boardWidth && 
             pos.y >= 0 && pos.y < boardHeight;
    } else {
      return pos.x >= 0 && pos.x < GameConfig.BOARD_WIDTH && 
             pos.y >= 0 && pos.y < GameConfig.BOARD_HEIGHT;
    }
  }

  /**
   * 入れ替え不可能なブロックかチェック
   */
  private static isUnswappableBlock(block: Block): boolean {
    return block.type === 'rock' || block.type === 'steel';
  }

  /**
   * 色変更不可能なブロックかチェック
   */
  private static isUnchangeableBlock(block: Block): boolean {
    return block.type === 'rock' || block.type === 'steel';
  }

  /**
   * ブロック配列のディープコピー
   */
  private static deepCopyBlocks(blocks: Block[][]): Block[][] {
    return blocks.map(row => 
      row.map(block => 
        block ? { ...block, sprite: null as any } : null
      )
    );
  }

  /**
   * 配列をシャッフル（Fisher-Yates アルゴリズム）
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * チェンジエリア効果：指定ブロックと同じ色で隣接している全てのブロックを指定色に変更
   */
  static applyChangeArea(blocks: Block[][], pos: {x: number, y: number}, newColor: string): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // 岩ブロックと鋼鉄ブロックは変更不可
    if (this.isUnchangeableBlock(block)) {
      return { success: false, message: '岩ブロックと鋼鉄ブロックは色変更できません' };
    }
    
    // 隣接する同色ブロックを取得（さめがめルール）
    const connectedBlocks = this.getConnectedBlocks(blocks, pos.x, pos.y);
    
    if (connectedBlocks.length === 0) {
      return { success: false, message: '変更可能なブロックがありません' };
    }
    
    // 色を変更
    const newBlocks = this.deepCopyBlocks(blocks);
    connectedBlocks.forEach(blockPos => {
      if (newBlocks[blockPos.y][blockPos.x]) {
        newBlocks[blockPos.y][blockPos.x] = {
          ...newBlocks[blockPos.y][blockPos.x]!,
          color: newColor,
          sprite: null as any
        };
      }
    });
    
    return { 
      success: true, 
      message: `${connectedBlocks.length}個のブロックの色を変更しました`,
      newBlocks: newBlocks
    };
  }

  /**
   * ハンマー効果：指定した岩ブロック1個を破壊
   */
  static applyHammer(blocks: Block[][], pos: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // 岩ブロックのみ対象
    if (block.type !== 'rock') {
      return { success: false, message: 'このアイテムは岩ブロック専用です' };
    }
    
    // ブロックを消去
    const newBlocks = this.deepCopyBlocks(blocks);
    newBlocks[pos.y][pos.x] = null;
    
    return { 
      success: true, 
      message: '岩ブロックを破壊しました',
      newBlocks: newBlocks,
      modifiedBlocks: [block]
    };
  }

  /**
   * 鋼鉄ハンマー効果：指定した鋼鉄ブロック1個を破壊
   */
  static applySteelHammer(blocks: Block[][], pos: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // 鋼鉄ブロックのみ対象
    if (block.type !== 'steel') {
      return { success: false, message: 'このアイテムは鋼鉄ブロック専用です' };
    }
    
    // ブロックを消去
    const newBlocks = this.deepCopyBlocks(blocks);
    newBlocks[pos.y][pos.x] = null;
    
    return { 
      success: true, 
      message: '鋼鉄ブロックを破壊しました',
      newBlocks: newBlocks,
      modifiedBlocks: [block]
    };
  }

  /**
   * スペシャルハンマー効果：指定したブロック1個を破壊
   */
  static applySpecialHammer(blocks: Block[][], pos: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // すべてのブロックタイプに使用可能
    const newBlocks = this.deepCopyBlocks(blocks);
    newBlocks[pos.y][pos.x] = null;
    
    return { 
      success: true, 
      message: 'ブロックを破壊しました',
      newBlocks: newBlocks,
      modifiedBlocks: [block]
    };
  }

  /**
   * スコアブースター効果：使用後からそのステージの獲得スコアを1.5倍にする
   */
  static applyScoreBooster(): ItemEffectResult {
    // スコアブースターは盤面に直接影響しない
    return { 
      success: true, 
      message: 'スコアブースターが発動しました！獲得スコアが1.5倍になります'
    };
  }

  /**
   * 爆弾効果：指定した場所を中心に3×3の範囲のブロックを消去
   */
  static applyBomb(blocks: Block[][], pos: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック（範囲外でも使用可能）
    const boardHeight = blocks.length;
    const boardWidth = blocks[0]?.length || 0;
    
    const newBlocks = this.deepCopyBlocks(blocks);
    const destroyedBlocks: Block[] = [];
    
    // 3×3の範囲でブロックを消去
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const targetX = pos.x + dx;
        const targetY = pos.y + dy;
        
        // 範囲内かチェック
        if (targetX >= 0 && targetX < boardWidth && targetY >= 0 && targetY < boardHeight) {
          const targetBlock = newBlocks[targetY][targetX];
          
          if (targetBlock) {
            // 鋼鉄ブロック以外は消去可能（岩ブロックは消去可能）
            if (targetBlock.type !== 'steel') {
              destroyedBlocks.push(targetBlock);
              newBlocks[targetY][targetX] = null;
            }
          }
        }
      }
    }
    
    return { 
      success: true, 
      message: `${destroyedBlocks.length}個のブロックを消去しました`,
      newBlocks: newBlocks,
      modifiedBlocks: destroyedBlocks
    };
  }

  /**
   * アドプラス効果：カウンターブロックをカウンター+ブロックに変化させる
   */
  static applyAdPlus(blocks: Block[][], pos: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // カウンターブロック（counterMinus）のみ対象
    if (block.type !== 'counterMinus') {
      return { success: false, message: 'このアイテムはカウンターブロック専用です' };
    }
    
    // ブロックをカウンター+ブロックに変更
    const newBlocks = this.deepCopyBlocks(blocks);
    newBlocks[pos.y][pos.x] = { ...newBlocks[pos.y][pos.x]!, type: 'counterPlus', sprite: null as any };
    
    return { 
      success: true, 
      message: 'カウンターブロックをカウンター+ブロックに変更しました',
      newBlocks: newBlocks
    };
  }

  /**
   * カウンター+リセット効果：指定したカウンター+ブロックを通常ブロックにする
   */
  static applyCounterReset(blocks: Block[][], pos: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // カウンター+ブロックのみ対象
    if (block.type !== 'counterPlus') {
      return { success: false, message: 'このアイテムはカウンター+ブロック専用です' };
    }
    
    // ブロックを通常ブロックに変更
    const newBlocks = this.deepCopyBlocks(blocks);
    newBlocks[pos.y][pos.x] = { ...newBlocks[pos.y][pos.x]!, type: 'normal', sprite: null as any };
    
    return { 
      success: true, 
      message: 'カウンター+ブロックを通常ブロックに変更しました',
      newBlocks: newBlocks
    };
  }

  /**
   * 溶解剤効果：氷結ブロックの解除に必要な隣接消去回数を-1する
   */
  static applyMeltingAgent(blocks: Block[][], pos: {x: number, y: number}): ItemEffectResult {
    // 座標の有効性チェック
    if (!this.isValidPosition(pos, blocks)) {
      return { success: false, message: '無効な位置です' };
    }
    
    // ブロックの存在チェック
    const block = blocks[pos.y][pos.x];
    if (!block) {
      return { success: false, message: 'ブロックが存在しません' };
    }
    
    // 氷結ブロックのみ対象
    if (block.type !== 'iceLv1' && block.type !== 'iceLv2') {
      return { success: false, message: 'このアイテムは氷結ブロック専用です' };
    }
    
    // ブロックを変更
    const newBlocks = this.deepCopyBlocks(blocks);
    
    if (block.type === 'iceLv2') {
      // 氷結Lv2 → 氷結Lv1
      newBlocks[pos.y][pos.x] = { ...newBlocks[pos.y][pos.x]!, type: 'iceLv1', sprite: null as any };
      return { 
        success: true, 
        message: '氷結レベルが下がりました',
        newBlocks: newBlocks
      };
    } else if (block.type === 'iceLv1') {
      // 氷結Lv1 → 通常ブロック
      newBlocks[pos.y][pos.x] = { ...newBlocks[pos.y][pos.x]!, type: 'normal', sprite: null as any };
      return { 
        success: true, 
        message: '氷結が解除されました',
        newBlocks: newBlocks
      };
    }
    
    return { success: false, message: '処理に失敗しました' };
  }

  /**
   * 隣接する同色ブロックを取得（さめがめルール）
   */
  private static getConnectedBlocks(blocks: Block[][], startX: number, startY: number): {x: number, y: number}[] {
    const startBlock = blocks[startY][startX];
    if (!startBlock) return [];
    
    const visited = new Set<string>();
    const connected: {x: number, y: number}[] = [];
    const queue: {x: number, y: number}[] = [{x: startX, y: startY}];
    
    const boardHeight = blocks.length;
    const boardWidth = blocks[0]?.length || 0;
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      const currentBlock = blocks[current.y][current.x];
      if (!currentBlock || currentBlock.color !== startBlock.color) continue;
      
      connected.push(current);
      
      // 上下左右の隣接ブロックをチェック
      const directions = [
        {x: 0, y: -1}, // 上
        {x: 0, y: 1},  // 下
        {x: -1, y: 0}, // 左
        {x: 1, y: 0}   // 右
      ];
      
      directions.forEach(dir => {
        const nextX = current.x + dir.x;
        const nextY = current.y + dir.y;
        const nextKey = `${nextX},${nextY}`;
        
        if (nextX >= 0 && nextX < boardWidth && nextY >= 0 && nextY < boardHeight && !visited.has(nextKey)) {
          queue.push({x: nextX, y: nextY});
        }
      });
    }
    
    return connected;
  }

  /**
   * アイテム効果の詳細情報を取得
   */
  static getItemEffectInfo(itemId: string, blocks: Block[][], pos?: {x: number, y: number}): {
    canUse: boolean;
    affectedBlocks: {x: number, y: number}[];
    description: string;
  } {
    const result = {
      canUse: false,
      affectedBlocks: [] as {x: number, y: number}[],
      description: ''
    };

    if (!pos) {
      return result;
    }

    const block = blocks[pos.y]?.[pos.x];

    switch (itemId) {
      case 'bomb':
        // 爆弾は任意の場所に使用可能
        result.canUse = true;
        result.description = '3×3範囲のブロックを消去します';
        
        // 影響範囲を計算
        const boardHeight = blocks.length;
        const boardWidth = blocks[0]?.length || 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const targetX = pos.x + dx;
            const targetY = pos.y + dy;
            
            if (targetX >= 0 && targetX < boardWidth && targetY >= 0 && targetY < boardHeight) {
              const targetBlock = blocks[targetY][targetX];
              if (targetBlock && targetBlock.type !== 'steel') {
                result.affectedBlocks.push({x: targetX, y: targetY});
              }
            }
          }
        }
        break;

      case 'changeArea':
        if (block && !this.isUnchangeableBlock(block)) {
          result.canUse = true;
          result.description = '隣接する同色ブロック全体の色を変更します';
          result.affectedBlocks = this.getConnectedBlocks(blocks, pos.x, pos.y);
        } else {
          result.description = '岩ブロックと鋼鉄ブロックは色変更できません';
        }
        break;

      case 'hammer':
        if (block && block.type === 'rock') {
          result.canUse = true;
          result.description = '岩ブロックを破壊します';
          result.affectedBlocks = [{x: pos.x, y: pos.y}];
        } else {
          result.description = 'このアイテムは岩ブロック専用です';
        }
        break;

      case 'steelHammer':
        if (block && block.type === 'steel') {
          result.canUse = true;
          result.description = '鋼鉄ブロックを破壊します';
          result.affectedBlocks = [{x: pos.x, y: pos.y}];
        } else {
          result.description = 'このアイテムは鋼鉄ブロック専用です';
        }
        break;

      case 'specialHammer':
        if (block) {
          result.canUse = true;
          result.description = 'あらゆるブロックを破壊します';
          result.affectedBlocks = [{x: pos.x, y: pos.y}];
        } else {
          result.description = 'ブロックが存在しません';
        }
        break;

      case 'meltingAgent':
        if (block && (block.type === 'iceLv1' || block.type === 'iceLv2')) {
          result.canUse = true;
          result.description = block.type === 'iceLv2' ? '氷結レベルを下げます' : '氷結を解除します';
          result.affectedBlocks = [{x: pos.x, y: pos.y}];
        } else {
          result.description = 'このアイテムは氷結ブロック専用です';
        }
        break;

      case 'counterReset':
        if (block && block.type === 'counterPlus') {
          result.canUse = true;
          result.description = 'カウンター+ブロックを通常ブロックにします';
          result.affectedBlocks = [{x: pos.x, y: pos.y}];
        } else {
          result.description = 'このアイテムはカウンター+ブロック専用です';
        }
        break;

      case 'adPlus':
        if (block && block.type === 'counterMinus') {
          result.canUse = true;
          result.description = 'カウンターブロックをカウンター+ブロックに変更します';
          result.affectedBlocks = [{x: pos.x, y: pos.y}];
        } else {
          result.description = 'このアイテムはカウンターブロック専用です';
        }
        break;

      default:
        result.description = '不明なアイテムです';
    }

    return result;
  }

  /**
   * アイテム使用時のプレビュー情報を取得
   */
  static getItemPreview(itemId: string, blocks: Block[][], pos: {x: number, y: number}): {
    previewBlocks: Block[][];
    message: string;
  } {
    const result = {
      previewBlocks: this.deepCopyBlocks(blocks),
      message: ''
    };

    const effectInfo = this.getItemEffectInfo(itemId, blocks, pos);
    
    if (!effectInfo.canUse) {
      result.message = effectInfo.description;
      return result;
    }

    // プレビュー用にブロックをハイライト表示用に変更
    effectInfo.affectedBlocks.forEach(blockPos => {
      const block = result.previewBlocks[blockPos.y][blockPos.x];
      if (block) {
        // プレビュー用の特別な状態を設定（実際の描画では異なる色で表示）
        result.previewBlocks[blockPos.y][blockPos.x] = {
          ...block,
          // プレビュー状態を示すフラグを追加
          isPreview: true
        } as Block & { isPreview: boolean };
      }
    });

    result.message = effectInfo.description;
    return result;
  }
}
