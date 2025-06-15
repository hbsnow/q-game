import { Block, BlockType } from '../types/Block';

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
   * カウンターブロックの条件を満たしているかチェック
   * @param blocks ブロック配列
   * @param counterBlock カウンターブロック
   * @returns 条件を満たしている場合はtrue
   */
  checkCounterCondition(blocks: Block[][], counterBlock: Block): boolean {
    // カウンターブロックでない場合は常にtrue
    if (counterBlock.type !== BlockType.COUNTER_PLUS && 
        counterBlock.type !== BlockType.COUNTER_MINUS &&
        counterBlock.type !== BlockType.ICE_COUNTER_PLUS &&
        counterBlock.type !== BlockType.ICE_COUNTER_MINUS) {
      return true;
    }
    
    // 隣接する同色ブロックを検索
    const connectedBlocks = this.findConnectedBlocks(blocks, counterBlock.x, counterBlock.y);
    
    if (counterBlock.type === BlockType.COUNTER_PLUS || counterBlock.type === BlockType.ICE_COUNTER_PLUS) {
      // カウンター+ブロック: グループサイズがカウンター値以上である必要がある
      return connectedBlocks.length >= (counterBlock.counterValue || 0);
    } else if (counterBlock.type === BlockType.COUNTER_MINUS || counterBlock.type === BlockType.ICE_COUNTER_MINUS) {
      // カウンター-ブロック: グループサイズがカウンター値以下である必要がある
      return connectedBlocks.length <= (counterBlock.counterValue || 0);
    }
    
    return false;
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
    
    // 開始ブロックが氷結系ブロックでない場合は空配列を返す
    const startBlock = blocks[startY][startX];
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
      
      // 氷結系ブロックのみを対象とする
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
          adjacentBlock.type === BlockType.NORMAL && 
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
          if (blocks[y][x].type !== BlockType.NORMAL) {
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
      if (currentBlock && currentBlock.type === BlockType.ICE_LV2) {
        // 氷結Lv2 → 氷結Lv1
        newBlocks[block.y][block.x] = {
          ...currentBlock,
          type: BlockType.ICE_LV1,
          sprite: null
        };
      } else if (currentBlock && currentBlock.type === BlockType.ICE_LV1) {
        // 氷結Lv1 → 通常ブロック
        newBlocks[block.y][block.x] = {
          ...currentBlock,
          type: BlockType.NORMAL,
          sprite: null
        };
      } else if (currentBlock && currentBlock.type === BlockType.ICE_COUNTER_PLUS) {
        // 氷結カウンター+ → 通常ブロック
        newBlocks[block.y][block.x] = {
          ...currentBlock,
          type: BlockType.NORMAL,
          sprite: null
        };
      } else if (currentBlock && currentBlock.type === BlockType.ICE_COUNTER_MINUS) {
        // 氷結カウンター- → 通常ブロック
        newBlocks[block.y][block.x] = {
          ...currentBlock,
          type: BlockType.NORMAL,
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
    
    // 元のブロック配列のコピーを作成（参照を切るため）
    const workingBlocks: (Block | null)[][] = [];
    for (let y = 0; y < height; y++) {
      workingBlocks[y] = [];
      for (let x = 0; x < width; x++) {
        if (blocks[y][x]) {
          // ディープコピーを作成し、スプライト参照を明示的にnullに設定
          workingBlocks[y][x] = {
            ...blocks[y][x]!,
            sprite: null
          };
          
          // 元のブロックのスプライト参照もnullに設定（メモリリーク防止）
          if (blocks[y][x]?.sprite) {
            blocks[y][x]!.sprite = null;
          }
        } else {
          workingBlocks[y][x] = null;
        }
      }
    }
    
    // 新しい空のブロック配列を作成
    const newBlocks: (Block | null)[][] = [];
    for (let y = 0; y < height; y++) {
      newBlocks[y] = [];
      for (let x = 0; x < width; x++) {
        newBlocks[y][x] = null;
      }
    }
    
    // ステップ1: 鋼鉄ブロックを先に配置（固定位置）
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (workingBlocks[y][x]?.type === BlockType.STEEL) {
          // 鋼鉄ブロックは元の位置にコピー
          newBlocks[y][x] = {
            ...workingBlocks[y][x]!,
            sprite: null
          };
          
          // 処理済みの鋼鉄ブロックをnullに設定
          workingBlocks[y][x] = null;
        }
      }
    }
    
    // ステップ2: 鋼鉄ブロックの上にあるブロックを固定する
    for (let x = 0; x < width; x++) {
      for (let y = height - 1; y >= 0; y--) {
        // 鋼鉄ブロックを見つける
        if (newBlocks[y][x]?.type === BlockType.STEEL) {
          // 鋼鉄ブロックの上にあるブロックを探す
          let checkY = y - 1;
          while (checkY >= 0) {
            if (workingBlocks[checkY][x]) {
              // 鋼鉄ブロックの上のブロックを元の位置に固定
              newBlocks[checkY][x] = {
                ...workingBlocks[checkY][x]!,
                sprite: null
              };
              workingBlocks[checkY][x] = null;
            } else {
              // 空白があれば、それより上のブロックは固定されない
              break;
            }
            checkY--;
          }
        }
      }
    }
    
    // ステップ3: 残りの通常ブロックに重力を適用
    for (let x = 0; x < width; x++) {
      // 列内の残りのブロックを集める（nullでないものだけ）
      const columnBlocks: Block[] = [];
      for (let y = 0; y < height; y++) {
        if (workingBlocks[y][x] !== null && workingBlocks[y][x] !== undefined) {
          columnBlocks.push({
            ...workingBlocks[y][x]!,
            sprite: null
          });
        }
      }
      
      // 下から順に空きマスを探して配置
      if (columnBlocks.length > 0) {
        let targetY = height - 1;
        let blockIndex = columnBlocks.length - 1;
        
        while (blockIndex >= 0 && targetY >= 0) {
          // 現在のマスが空いているか確認
          if (newBlocks[targetY][x] === null) {
            // ブロックを配置
            newBlocks[targetY][x] = columnBlocks[blockIndex];
            
            // 座標を更新
            if (newBlocks[targetY][x]) {
              newBlocks[targetY][x]!.y = targetY;
              newBlocks[targetY][x]!.x = x;
            }
            
            blockIndex--;
          }
          
          targetY--;
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
  applyHorizontalSlide(blocks: Block[][]): Block[][] {
    const height = blocks.length;
    const width = blocks[0]?.length || 0;
    
    // 元のブロック配列のコピーを作成（参照を切るため）
    const workingBlocks: (Block | null)[][] = [];
    for (let y = 0; y < height; y++) {
      workingBlocks[y] = [];
      for (let x = 0; x < width; x++) {
        if (blocks[y][x]) {
          // ディープコピーを作成し、スプライト参照を明示的にnullに設定
          workingBlocks[y][x] = {
            ...blocks[y][x]!,
            sprite: null
          };
          
          // 元のブロックのスプライト参照もnullに設定（メモリリーク防止）
          if (blocks[y][x]?.sprite) {
            blocks[y][x]!.sprite = null;
          }
        } else {
          workingBlocks[y][x] = null;
        }
      }
    }
    
    // 各列が空かどうかチェック（鋼鉄ブロックがある列は空とみなさない）
    const isEmpty: boolean[] = [];
    const hasSteelBlock: boolean[] = [];
    
    for (let x = 0; x < width; x++) {
      isEmpty[x] = true;
      hasSteelBlock[x] = false;
      
      for (let y = 0; y < height; y++) {
        if (workingBlocks[y][x] !== null) {
          isEmpty[x] = false;
          
          if (workingBlocks[y][x]?.type === BlockType.STEEL) {
            hasSteelBlock[x] = true;
          }
        }
      }
    }
    
    // 空の列がない場合は変更なし
    if (!isEmpty.some(empty => empty)) {
      return workingBlocks;
    }
    
    // 新しい空のブロック配列を作成
    const newBlocks: (Block | null)[][] = [];
    for (let y = 0; y < height; y++) {
      newBlocks[y] = [];
      for (let x = 0; x < width; x++) {
        newBlocks[y][x] = null;
      }
    }
    
    // 鋼鉄ブロックを先に配置（固定位置）
    for (let x = 0; x < width; x++) {
      if (hasSteelBlock[x]) {
        // 鋼鉄ブロックがある列は全体をコピー
        for (let y = 0; y < height; y++) {
          if (workingBlocks[y][x]) {
            newBlocks[y][x] = {
              ...workingBlocks[y][x]!,
              sprite: null
            };
            // 処理済みのブロックをnullに設定
            workingBlocks[y][x] = null;
          }
        }
      }
    }
    
    // 残りの列を左詰めで配置
    // 仕様によると、鋼鉄ブロックがある場合は列の移動が制限される
    // 鋼鉄ブロックがある列の右側にあるブロックは、鋼鉄ブロックの右側の空列にのみ移動可能
    
    // 最も左の鋼鉄ブロックの位置を見つける
    let leftmostSteelColumn = width;
    for (let x = 0; x < width; x++) {
      if (hasSteelBlock[x]) {
        leftmostSteelColumn = x;
        break;
      }
    }
    
    // 鋼鉄ブロックの左側の列を処理
    let targetX = 0;
    for (let x = 0; x < leftmostSteelColumn; x++) {
      // 空の列はスキップ
      if (isEmpty[x]) {
        continue;
      }
      
      // 列全体を移動
      for (let y = 0; y < height; y++) {
        if (workingBlocks[y][x]) {
          newBlocks[y][targetX] = {
            ...workingBlocks[y][x]!,
            x: targetX,
            sprite: null
          };
          // 処理済みのブロックをnullに設定
          workingBlocks[y][x] = null;
        }
      }
      targetX++;
    }
    
    // 鋼鉄ブロックの右側の列を処理
    // 各鋼鉄ブロックの間の領域を個別に処理
    let steelColumns = [];
    for (let x = 0; x < width; x++) {
      if (hasSteelBlock[x]) {
        steelColumns.push(x);
      }
    }
    steelColumns.push(width); // 最後の境界として幅を追加
    
    for (let i = 0; i < steelColumns.length - 1; i++) {
      const startCol = steelColumns[i] + 1;
      const endCol = steelColumns[i + 1];
      
      // この区間の最初の空でない列を見つける
      let targetX = startCol;
      for (let x = startCol; x < endCol; x++) {
        // 空の列はスキップ
        if (isEmpty[x]) {
          continue;
        }
        
        // 列全体を移動
        for (let y = 0; y < height; y++) {
          if (workingBlocks[y][x]) {
            newBlocks[y][targetX] = {
              ...workingBlocks[y][x]!,
              x: targetX,
              sprite: null
            };
            // 処理済みのブロックをnullに設定
            workingBlocks[y][x] = null;
          }
        }
        targetX++;
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
