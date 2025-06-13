import { Block } from '../types/Block';

/**
 * ブロックの論理処理を担当するクラス
 */
export class BlockLogic {
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
   * 指定した座標の氷結ブロックと同じ色で隣接する氷結ブロックを全て見つける
   * @param blocks ブロック配列
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @returns 隣接する同色の氷結ブロックの配列（開始ブロックを含む）
   */
  findConnectedIceBlocks(blocks: Block[][], startX: number, startY: number): Block[] {
    // 開始ブロックがnullの場合は空配列を返す
    if (!blocks[startY] || !blocks[startY][startX]) {
      return [];
    }
    
    // 開始ブロックが氷結ブロックでない場合は空配列を返す
    const startBlock = blocks[startY][startX];
    if (startBlock.type !== 'iceLv1' && startBlock.type !== 'iceLv2') {
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
    
    // 深さ優先探索で隣接する氷結ブロックを見つける
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
      
      // 氷結ブロックのみを対象とする
      if (blocks[y][x].type !== 'iceLv1' && blocks[y][x].type !== 'iceLv2') {
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
   * 指定した座標のブロックに隣接する同色の通常ブロックを検索
   * @param blocks ブロック配列
   * @param x X座標
   * @param y Y座標
   * @returns 隣接する同色の通常ブロックの配列
   */
  findAdjacentNormalBlocks(blocks: Block[][], x: number, y: number): Block[] {
    // ブロックが存在しない場合は空配列を返す
    if (!blocks[y] || !blocks[y][x]) {
      return [];
    }
    
    const targetBlock = blocks[y][x];
    const targetColor = targetBlock.color;
    const adjacentBlocks: Block[] = [];
    const visited: boolean[][] = [];
    
    // 訪問済み配列の初期化
    for (let y = 0; y < blocks.length; y++) {
      visited[y] = [];
      for (let x = 0; x < blocks[y].length; x++) {
        visited[y][x] = false;
      }
    }
    
    // 隣接する4方向をチェック
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }  // 左
    ];
    
    // 最初の隣接ブロックを見つける
    const startingPoints: {x: number, y: number}[] = [];
    
    directions.forEach(dir => {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      // 範囲外チェック
      if (ny < 0 || ny >= blocks.length || nx < 0 || nx >= blocks[ny].length) {
        return;
      }
      
      // 通常ブロックかつ同じ色のブロックをチェック
      const adjacentBlock = blocks[ny][nx];
      if (adjacentBlock && 
          adjacentBlock.type === 'normal' && 
          adjacentBlock.color === targetColor) {
        startingPoints.push({x: nx, y: ny});
      }
    });
    
    // 各開始点から深さ優先探索で連結した同色ブロックを見つける
    startingPoints.forEach(point => {
      if (!visited[point.y][point.x]) {
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
          
          // 通常ブロックのみを対象とする
          if (blocks[y][x].type !== 'normal') {
            return;
          }
          
          // 訪問済みにする
          visited[y][x] = true;
          
          // 結果に追加
          adjacentBlocks.push(blocks[y][x]);
          
          // 隣接する4方向を探索（上下左右）
          dfs(x, y - 1); // 上
          dfs(x + 1, y); // 右
          dfs(x, y + 1); // 下
          dfs(x - 1, y); // 左
        };
        
        // 探索開始
        dfs(point.x, point.y);
      }
    });
    
    return adjacentBlocks;
  }
  
  /**
   * 氷結ブロックを更新する
   * @param blocks ブロック配列
   * @param connectedBlocks 消去対象のブロック配列
   * @returns 更新されたブロック配列
   */
  updateIceBlocks(blocks: Block[][], connectedBlocks: Block[]): Block[][] {
    // ブロック配列のディープコピーを作成
    const newBlocks: (Block | null)[][] = JSON.parse(JSON.stringify(blocks));
    
    // 氷結ブロックの場合、レベルを下げる
    connectedBlocks.forEach(block => {
      const currentBlock = newBlocks[block.y][block.x];
      if (currentBlock && currentBlock.type === 'iceLv2') {
        // 氷結Lv2 → 氷結Lv1
        newBlocks[block.y][block.x] = {
          ...currentBlock,
          type: 'iceLv1',
          sprite: null
        };
      } else if (currentBlock && currentBlock.type === 'iceLv1') {
        // 氷結Lv1 → 通常ブロック
        newBlocks[block.y][block.x] = {
          ...currentBlock,
          type: 'normal',
          sprite: null
        };
      }
    });
    
    return newBlocks as Block[][];
  }
  
  /**
   * スコアを計算する
   * @param blockCount 消去したブロック数
   * @returns スコア
   */
  calculateScore(blockCount: number): number {
    return blockCount * blockCount; // ブロック数の二乗
  }
  
  /**
   * 盤面に消去可能なブロックがあるかどうかを判定
   * @param blocks ブロック配列
   * @returns 消去可能なブロックがある場合はtrue
   */
  hasRemovableBlocks(blocks: Block[][]): boolean {
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
   * 重力を適用し、ブロックを落下させる
   * @param blocks ブロック配列
   * @returns 更新されたブロック配列
   */
  applyGravity(blocks: Block[][]): Block[][] {
    const width = blocks[0]?.length || 0;
    const height = blocks.length;
    
    // 新しい空のブロック配列を作成
    const newBlocks: (Block | null)[][] = [];
    for (let y = 0; y < height; y++) {
      newBlocks[y] = [];
      for (let x = 0; x < width; x++) {
        newBlocks[y][x] = null;
      }
    }
    
    // 各列ごとに処理
    for (let x = 0; x < width; x++) {
      // 列内のブロックを集める（nullでないものだけ）
      const columnBlocks: Block[] = [];
      for (let y = 0; y < height; y++) {
        if (blocks[y][x] !== null && blocks[y][x] !== undefined) {
          // ディープコピーを作成し、スプライト参照を明示的にnullに設定
          const blockCopy: Block = {
            ...blocks[y][x]!,
            sprite: null // スプライト参照を明示的にnullに設定
          };
          columnBlocks.push(blockCopy);
          
          // 元のブロックのスプライト参照もnullに設定（メモリリーク防止）
          if (blocks[y][x]?.sprite) {
            blocks[y][x]!.sprite = null;
          }
        }
      }
      
      // 集めたブロックを下から順に配置
      for (let i = 0; i < columnBlocks.length; i++) {
        const targetY = height - 1 - i; // 下から順に配置
        newBlocks[targetY][x] = columnBlocks[columnBlocks.length - 1 - i];
        
        // 座標を更新
        if (newBlocks[targetY][x]) {
          newBlocks[targetY][x]!.y = targetY;
          newBlocks[targetY][x]!.x = x;
        }
      }
    }
    
    return newBlocks as Block[][];
  }
  
  /**
   * 空の列を左にスライドさせる
   * @param blocks ブロック配列
   * @returns 更新されたブロック配列
   */
  slideColumnsLeft(blocks: Block[][]): Block[][] {
    const height = blocks.length;
    const width = blocks[0]?.length || 0;
    
    // 新しい空のブロック配列を作成
    const newBlocks: (Block | null)[][] = [];
    for (let y = 0; y < height; y++) {
      newBlocks[y] = [];
      for (let x = 0; x < width; x++) {
        newBlocks[y][x] = null;
      }
    }
    
    // 空でない列を特定
    const nonEmptyColumns: number[] = [];
    for (let x = 0; x < width; x++) {
      let isEmpty = true;
      for (let y = 0; y < height; y++) {
        if (blocks[y][x] !== null) {
          isEmpty = false;
          break;
        }
      }
      if (!isEmpty) {
        nonEmptyColumns.push(x);
      }
    }
    
    // 空でない列を左から順に配置
    for (let newX = 0; newX < nonEmptyColumns.length; newX++) {
      const oldX = nonEmptyColumns[newX];
      for (let y = 0; y < height; y++) {
        if (blocks[y][oldX] !== null && blocks[y][oldX] !== undefined) {
          // 元のブロックのスプライト参照をnullに設定（メモリリーク防止）
          if (blocks[y][oldX]?.sprite) {
            blocks[y][oldX]!.sprite = null;
          }
          
          // ディープコピーを作成し、スプライト参照を明示的にnullに設定
          newBlocks[y][newX] = {
            ...blocks[y][oldX]!,
            x: newX,
            y: y,
            sprite: null
          };
        }
      }
    }
    
    return newBlocks as Block[][];
  }
  
  /**
   * 全てのブロックが消去されたかどうかを判定
   * @param blocks ブロック配列
   * @returns 全てのブロックが消去された場合はtrue
   */
  isAllCleared(blocks: Block[][]): boolean {
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x] !== null) {
          return false;
        }
      }
    }
    return true;
  }
}
