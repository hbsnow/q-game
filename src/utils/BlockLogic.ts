import { Block, BlockType } from '../types/Block';
import { BlockDebugger } from './BlockDebugger';

/**
 * ブロックの論理処理を担当するクラス
 */
export class BlockLogic {
  // デバッグモード
  private debug: boolean = false;

  /**
   * コンストラクタ
   * @param debug デバッグモードを有効にするかどうか
   */
  constructor(debug: boolean = false) {
    this.debug = debug;
  }
  
  /**
   * ブロックを消去する
   * @param blocks 元のブロック配列
   * @param blocksToRemove 消去するブロックの配列
   * @returns 更新されたブロック配列
   */
  removeBlocks(blocks: Block[][], blocksToRemove: Block[]): Block[][] {
    // ディープコピーを作成
    const newBlocks = JSON.parse(JSON.stringify(blocks));
    
    // 指定されたブロックを消去
    for (const block of blocksToRemove) {
      if (block && block.y >= 0 && block.y < newBlocks.length &&
          block.x >= 0 && block.x < newBlocks[block.y].length) {
        newBlocks[block.y][block.x] = null;
      }
    }
    
    return newBlocks;
  }
  
  /**
   * 隣接する同色ブロックを全て見つける
   * @param blocks ブロック配列
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @returns 隣接する同色ブロックの配列（開始ブロックを含む）
   */
  findConnectedBlocks(blocks: Block[][], startX: number, startY: number): Block[] {
    // 開始ブロックがnullの場合は空配列を返す
    if (!blocks[startY] || !blocks[startY][startX]) {
      return [];
    }
    
    const startBlock = blocks[startY][startX];
    const targetColor = startBlock.color;
    const visited: boolean[][] = [];
    const connectedBlocks: Block[] = [];
    
    // 訪問済み配列の初期化
    for (let y = 0; y < blocks.length; y++) {
      visited[y] = [];
      for (let x = 0; x < blocks[y].length; x++) {
        visited[y][x] = false;
      }
    }
    
    // 深さ優先探索で隣接ブロックを見つける
    const dfs = (x: number, y: number) => {
      // 範囲外チェック
      if (y < 0 || y >= blocks.length || x < 0 || x >= blocks[y].length) {
        return;
      }
      
      // 訪問済みまたはnullブロックチェック
      if (visited[y][x] || !blocks[y][x]) {
        return;
      }
      
      // 色チェック
      if (blocks[y][x].color !== targetColor) {
        return;
      }
      
      // 訪問済みにする
      visited[y][x] = true;
      
      // 結果に追加
      connectedBlocks.push(blocks[y][x]);
      
      // 隣接する4方向を探索（上下左右）
      dfs(x, y - 1); // 上
      dfs(x + 1, y); // 右
      dfs(x, y + 1); // 下
      dfs(x - 1, y); // 左
    };
    
    // 探索開始
    dfs(startX, startY);
    
    return connectedBlocks;
  }
  
  /**
   * 指定した座標のブロックが消去可能かどうかを判定
   * @param blocks ブロック配列
   * @param x X座標
   * @param y Y座標
   * @returns 消去可能な場合はtrue
   */
  canRemoveBlocks(blocks: Block[][], x: number, y: number): boolean {
    // ブロックが存在しない場合は消去不可
    if (!blocks[y] || !blocks[y][x]) {
      return false;
    }
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = this.findConnectedBlocks(blocks, x, y);
    
    // 2つ以上のブロックが隣接している場合は消去可能
    return connectedBlocks.length >= 2;
  }
  
  /**
   * カウンターブロックの条件を満たしているかチェック
   * @param blocks ブロック配列
   * @param block チェック対象のブロック
   * @returns 条件を満たしている場合はtrue
   */
  checkCounterCondition(blocks: Block[][], block: Block): boolean {
    // カウンターブロックでない場合は常にtrue
    if (block.type !== BlockType.COUNTER_PLUS && 
        block.type !== BlockType.COUNTER_MINUS &&
        block.type !== BlockType.ICE_COUNTER_PLUS &&
        block.type !== BlockType.ICE_COUNTER_MINUS) {
      return true;
    }
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = this.findConnectedBlocks(blocks, block.x, block.y);
    const count = connectedBlocks.length;
    
    // カウンター+の場合は指定数以上で消去可能
    if (block.type === BlockType.COUNTER_PLUS || block.type === BlockType.ICE_COUNTER_PLUS) {
      return count >= block.counterValue;
    }
    
    // カウンター-の場合は指定数以下で消去可能
    if (block.type === BlockType.COUNTER_MINUS || block.type === BlockType.ICE_COUNTER_MINUS) {
      return count <= block.counterValue;
    }
    
    return false;
  }
  
  /**
   * 氷結ブロックの状態を更新する
   * @param blocks 元のブロック配列
   * @param connectedBlocks 隣接する同色ブロックの配列
   * @returns 更新されたブロック配列
   */
  updateIceBlocks(blocks: Block[][], connectedBlocks: Block[]): Block[][] {
    // ディープコピーを作成
    const newBlocks = JSON.parse(JSON.stringify(blocks));
    
    // 氷結ブロックの周囲にある同色ブロックが消去される場合、氷結レベルを下げる
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        const block = blocks[y][x];
        
        // 氷結ブロックでない場合はスキップ
        if (!block || 
            (block.type !== BlockType.ICE_LV1 && 
             block.type !== BlockType.ICE_LV2 &&
             block.type !== BlockType.ICE_COUNTER_PLUS &&
             block.type !== BlockType.ICE_COUNTER_MINUS)) {
          continue;
        }
        
        // 隣接する同色ブロックが消去されるかチェック
        let hasAdjacentRemoval = false;
        
        // 上下左右の隣接ブロックをチェック
        const directions = [
          { dx: 0, dy: -1 }, // 上
          { dx: 1, dy: 0 },  // 右
          { dx: 0, dy: 1 },  // 下
          { dx: -1, dy: 0 }  // 左
        ];
        
        for (const dir of directions) {
          const nx = x + dir.dx;
          const ny = y + dir.dy;
          
          // 範囲外チェック
          if (ny < 0 || ny >= blocks.length || nx < 0 || nx >= blocks[ny].length) {
            continue;
          }
          
          // 隣接ブロックが存在し、同じ色で、connectedBlocksに含まれているかチェック
          const adjacentBlock = blocks[ny][nx];
          if (adjacentBlock && adjacentBlock.color === block.color) {
            const isInConnected = connectedBlocks.some(cb => cb.x === nx && cb.y === ny);
            if (isInConnected) {
              hasAdjacentRemoval = true;
              break;
            }
          }
        }
        
        // 隣接する同色ブロックが消去される場合、氷結レベルを下げる
        if (hasAdjacentRemoval) {
          if (block.type === BlockType.ICE_LV2) {
            // 氷結Lv2 → 氷結Lv1
            newBlocks[y][x].type = BlockType.ICE_LV1;
          } else if (block.type === BlockType.ICE_LV1) {
            // 氷結Lv1 → 通常ブロック
            newBlocks[y][x].type = BlockType.NORMAL;
          } else if (block.type === BlockType.ICE_COUNTER_PLUS) {
            // 氷結カウンター+ → 通常ブロック
            newBlocks[y][x].type = BlockType.NORMAL;
          } else if (block.type === BlockType.ICE_COUNTER_MINUS) {
            // 氷結カウンター- → 通常ブロック
            newBlocks[y][x].type = BlockType.NORMAL;
          }
        }
      }
    }
    
    return newBlocks;
  }
  
  /**
   * スコアを計算する
   * @param blockCount 消去するブロック数
   * @returns スコア
   */
  calculateScore(blockCount: number): number {
    // スコア = ブロック数の二乗
    return blockCount * blockCount;
  }
  
  /**
   * 重力を適用する（ブロックを落下させる）
   * @param blocks 元のブロック配列
   * @returns 更新されたブロック配列
   */
  applyGravity(blocks: Block[][]): Block[][] {
    const height = blocks.length;
    const width = blocks[0]?.length || 0;
    
    // 元のブロックのスプライト参照をnullに設定（メモリリーク防止）
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x] && blocks[y][x].sprite) {
          blocks[y][x].sprite = null;
        }
      }
    }
    
    // 新しいブロック配列を作成（nullで初期化）
    const newBlocks: Block[][] = Array(height).fill(null).map(() => Array(width).fill(null));
    
    // 各列ごとに処理
    for (let x = 0; x < width; x++) {
      // 各列の非nullブロックを収集
      const columnBlocks: Block[] = [];
      for (let y = 0; y < height; y++) {
        if (blocks[y][x]) {
          // スプライト参照をnullに設定（メモリリーク防止）
          const blockCopy = { ...blocks[y][x], sprite: null as any };
          columnBlocks.push(blockCopy);
        }
      }
      
      // 収集したブロックを下から順に配置
      for (let i = 0; i < columnBlocks.length; i++) {
        const destY = height - 1 - i;
        const block = columnBlocks[columnBlocks.length - 1 - i];
        
        // 座標を更新
        newBlocks[destY][x] = {
          ...block,
          x: x,
          y: destY
        };
      }
    }
    
    return newBlocks;
  }
  
  /**
   * 空の列を左にスライドさせる
   * @param blocks 元のブロック配列
   * @returns 更新されたブロック配列
   */
  applyHorizontalSlide(blocks: Block[][]): Block[][] {
    const height = blocks.length;
    const width = blocks[0]?.length || 0;
    
    // 新しいブロック配列を作成（nullで初期化）
    const newBlocks: Block[][] = Array(height).fill(null).map(() => Array(width).fill(null));
    
    // 列が空かどうかをチェック
    const isEmptyColumn: boolean[] = [];
    for (let x = 0; x < width; x++) {
      isEmptyColumn[x] = true;
      for (let y = 0; y < height; y++) {
        if (blocks[y][x]) {
          isEmptyColumn[x] = false;
          break;
        }
      }
    }
    
    // 鋼鉄ブロックがある列は特別処理
    const hasSteel: boolean[] = [];
    for (let x = 0; x < width; x++) {
      hasSteel[x] = false;
      for (let y = 0; y < height; y++) {
        if (blocks[y][x] && blocks[y][x].type === BlockType.STEEL) {
          hasSteel[x] = true;
          break;
        }
      }
    }
    
    // 鋼鉄ブロックがある列は移動しない
    for (let x = 0; x < width; x++) {
      if (hasSteel[x]) {
        for (let y = 0; y < height; y++) {
          if (blocks[y][x]) {
            newBlocks[y][x] = {
              ...blocks[y][x],
              sprite: null
            };
          }
        }
      }
    }
    
    // 空でない列を左から詰める
    let destX = 0;
    for (let x = 0; x < width; x++) {
      // 鋼鉄ブロックがある列はスキップ（すでに配置済み）
      if (hasSteel[x]) {
        destX = x + 1;
        continue;
      }
      
      // 空の列はスキップ
      if (isEmptyColumn[x]) {
        continue;
      }
      
      // 次の鋼鉄ブロックがある列を探す
      let nextSteelX = width;
      for (let sx = destX; sx < width; sx++) {
        if (hasSteel[sx]) {
          nextSteelX = sx;
          break;
        }
      }
      
      // 鋼鉄ブロックの手前までしか移動できない
      if (destX < nextSteelX) {
        for (let y = 0; y < height; y++) {
          if (blocks[y][x]) {
            newBlocks[y][destX] = {
              ...blocks[y][x],
              x: destX,
              sprite: null
            };
          }
        }
        destX++;
      }
    }
    
    return newBlocks;
  }
  
  /**
   * 全てのブロックが消去されたかどうかを判定
   * @param blocks ブロック配列
   * @returns 全消しの場合はtrue
   */
  isAllCleared(blocks: Block[][]): boolean {
    // 消去可能なブロック（通常ブロック、カウンターブロック）が残っているかチェック
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        const block = blocks[y][x];
        if (block && 
            (block.type === BlockType.NORMAL || 
             block.type === BlockType.COUNTER_PLUS || 
             block.type === BlockType.COUNTER_MINUS)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * 消去可能なブロックがあるかどうかを判定
   * @param blocks ブロック配列
   * @returns 消去可能なブロックがある場合はtrue
   */
  hasRemovableBlocks(blocks: Block[][]): boolean {
    // 各ブロックについて消去可能かチェック
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x] && this.canRemoveBlocks(blocks, x, y)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * 氷結ブロックのグループを検索する
   * @param blocks ブロック配列
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @returns 隣接する同色の氷結ブロックの配列
   */
  findConnectedIceBlocks(blocks: Block[][], startX: number, startY: number): Block[] {
    // 開始ブロックがnullの場合は空配列を返す
    if (!blocks[startY] || !blocks[startY][startX]) {
      return [];
    }
    
    const startBlock = blocks[startY][startX];
    
    // 開始ブロックが氷結ブロックでない場合は空配列を返す
    if (startBlock.type !== BlockType.ICE_LV1 && 
        startBlock.type !== BlockType.ICE_LV2 && 
        startBlock.type !== BlockType.ICE_COUNTER_PLUS && 
        startBlock.type !== BlockType.ICE_COUNTER_MINUS) {
      return [];
    }
    
    const targetColor = startBlock.color;
    const visited: boolean[][] = [];
    const connectedIceBlocks: Block[] = [];
    
    // 訪問済み配列の初期化
    for (let y = 0; y < blocks.length; y++) {
      visited[y] = [];
      for (let x = 0; x < blocks[y].length; x++) {
        visited[y][x] = false;
      }
    }
    
    // 深さ優先探索で隣接氷結ブロックを見つける
    const dfs = (x: number, y: number) => {
      // 範囲外チェック
      if (y < 0 || y >= blocks.length || x < 0 || x >= blocks[y].length) {
        return;
      }
      
      // 訪問済みまたはnullブロックチェック
      if (visited[y][x] || !blocks[y][x]) {
        return;
      }
      
      // 色チェック
      if (blocks[y][x].color !== targetColor) {
        return;
      }
      
      // 氷結ブロックチェック
      if (blocks[y][x].type !== BlockType.ICE_LV1 && 
          blocks[y][x].type !== BlockType.ICE_LV2 && 
          blocks[y][x].type !== BlockType.ICE_COUNTER_PLUS && 
          blocks[y][x].type !== BlockType.ICE_COUNTER_MINUS) {
        return;
      }
      
      // 訪問済みにする
      visited[y][x] = true;
      
      // 結果に追加
      connectedIceBlocks.push(blocks[y][x]);
      
      // 隣接する4方向を探索（上下左右）
      dfs(x, y - 1); // 上
      dfs(x + 1, y); // 右
      dfs(x, y + 1); // 下
      dfs(x - 1, y); // 左
    };
    
    // 探索開始
    dfs(startX, startY);
    
    return connectedIceBlocks;
  }
  
  /**
   * 氷結ブロックに隣接する同色の通常ブロックを検索する
   * @param blocks ブロック配列
   * @param iceBlockX 氷結ブロックのX座標
   * @param iceBlockY 氷結ブロックのY座標
   * @returns 隣接する同色の通常ブロックの配列
   */
  findAdjacentNormalBlocks(blocks: Block[][], iceBlockX: number, iceBlockY: number): Block[] {
    const adjacentNormalBlocks: Block[] = [];
    
    // 氷結ブロックがnullの場合は空配列を返す
    if (!blocks[iceBlockY] || !blocks[iceBlockY][iceBlockX]) {
      return [];
    }
    
    const iceBlock = blocks[iceBlockY][iceBlockX];
    
    // 氷結ブロックでない場合は空配列を返す
    if (iceBlock.type !== BlockType.ICE_LV1 && 
        iceBlock.type !== BlockType.ICE_LV2 && 
        iceBlock.type !== BlockType.ICE_COUNTER_PLUS && 
        iceBlock.type !== BlockType.ICE_COUNTER_MINUS) {
      return [];
    }
    
    const targetColor = iceBlock.color;
    
    // 上下左右の隣接ブロックをチェック
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }  // 左
    ];
    
    for (const dir of directions) {
      const nx = iceBlockX + dir.dx;
      const ny = iceBlockY + dir.dy;
      
      // 範囲外チェック
      if (ny < 0 || ny >= blocks.length || nx < 0 || nx >= blocks[ny].length) {
        continue;
      }
      
      // 隣接ブロックが存在し、同じ色で、通常ブロックかチェック
      const adjacentBlock = blocks[ny][nx];
      if (adjacentBlock && 
          adjacentBlock.color === targetColor && 
          adjacentBlock.type === BlockType.NORMAL) {
        adjacentNormalBlocks.push(adjacentBlock);
      }
    }
    
    return adjacentNormalBlocks;
  }
}
