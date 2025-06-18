import { Block, BlockType } from "../types/Block";
import { BlockDebugger } from "./BlockDebugger";

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
      if (
        block &&
        block.y >= 0 &&
        block.y < newBlocks.length &&
        block.x >= 0 &&
        block.x < newBlocks[block.y].length
      ) {
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
  findConnectedBlocks(
    blocks: Block[][],
    startX: number,
    startY: number
  ): Block[] {
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
    if (
      block.type !== BlockType.COUNTER_PLUS &&
      block.type !== BlockType.COUNTER_MINUS &&
      block.type !== BlockType.ICE_COUNTER_PLUS &&
      block.type !== BlockType.ICE_COUNTER_MINUS
    ) {
      return true;
    }

    // 隣接する同色ブロックを検索
    const connectedBlocks = this.findConnectedBlocks(blocks, block.x, block.y);
    const count = connectedBlocks.length;

    // カウンター+の場合は指定数以上で消去可能
    if (
      block.type === BlockType.COUNTER_PLUS ||
      block.type === BlockType.ICE_COUNTER_PLUS
    ) {
      return count >= block.counterValue;
    }

    // カウンター-の場合は指定数以下で消去可能
    if (
      block.type === BlockType.COUNTER_MINUS ||
      block.type === BlockType.ICE_COUNTER_MINUS
    ) {
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
        if (
          !block ||
          (block.type !== BlockType.ICE_LV1 &&
            block.type !== BlockType.ICE_LV2 &&
            block.type !== BlockType.ICE_COUNTER_PLUS &&
            block.type !== BlockType.ICE_COUNTER_MINUS)
        ) {
          continue;
        }

        // 隣接する同色ブロックが消去されるかチェック
        let hasAdjacentRemoval = false;

        // 上下左右の隣接ブロックをチェック
        const directions = [
          { dx: 0, dy: -1 }, // 上
          { dx: 1, dy: 0 }, // 右
          { dx: 0, dy: 1 }, // 下
          { dx: -1, dy: 0 }, // 左
        ];

        for (const dir of directions) {
          const nx = x + dir.dx;
          const ny = y + dir.dy;

          // 範囲外チェック
          if (
            ny < 0 ||
            ny >= blocks.length ||
            nx < 0 ||
            nx >= blocks[ny].length
          ) {
            continue;
          }

          // 隣接ブロックが存在し、同じ色で、connectedBlocksに含まれているかチェック
          const adjacentBlock = blocks[ny][nx];
          if (adjacentBlock && adjacentBlock.color === block.color) {
            const isInConnected = connectedBlocks.some(
              (cb) => cb.x === nx && cb.y === ny
            );
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
            // 氷結カウンター+ブロックの場合、カウンター条件を満たす場合のみ通常ブロックに変更
            // カウンター条件を満たしているかチェック
            const connectedToBlock = this.findConnectedBlocks(blocks, x, y);
            if (connectedToBlock.length >= block.counterValue) {
              // 条件を満たす場合は通常ブロックに変更
              newBlocks[y][x].type = BlockType.NORMAL;
            }
            // 条件を満たさない場合は氷結カウンターブロックのまま
          } else if (block.type === BlockType.ICE_COUNTER_MINUS) {
            // 氷結カウンター-ブロックの場合、カウンター条件を満たす場合のみ通常ブロックに変更
            // カウンター条件を満たしているかチェック
            const connectedToBlock = this.findConnectedBlocks(blocks, x, y);
            if (connectedToBlock.length <= block.counterValue) {
              // 条件を満たす場合は通常ブロックに変更
              newBlocks[y][x].type = BlockType.NORMAL;
            }
            // 条件を満たさない場合は氷結カウンターブロックのまま
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
    const newBlocks: Block[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(null));

    // 各列ごとに処理
    for (let x = 0; x < width; x++) {
      // 鋼鉄ブロックの位置を特定
      const steelPositions: number[] = [];
      for (let y = 0; y < height; y++) {
        if (blocks[y][x] && blocks[y][x].type === BlockType.STEEL) {
          steelPositions.push(y);
        }
      }

      // 鋼鉄ブロックがない場合は通常の重力処理
      if (steelPositions.length === 0) {
        this.applyGravityToColumn(blocks, newBlocks, x, 0, height - 1);
        continue;
      }

      // 鋼鉄ブロックを配置
      for (const steelY of steelPositions) {
        newBlocks[steelY][x] = {
          ...blocks[steelY][x],
          sprite: null,
        };
      }

      // 鋼鉄ブロックの間の区間を処理
      let prevSteelY = -1;
      for (const steelY of steelPositions) {
        if (prevSteelY >= 0) {
          // 前の鋼鉄ブロックと現在の鋼鉄ブロックの間の区間を処理
          this.applyGravityToColumn(
            blocks,
            newBlocks,
            x,
            prevSteelY + 1,
            steelY - 1
          );
        }
        prevSteelY = steelY;
      }

      // 最初の鋼鉄ブロックより上の区間を処理
      if (steelPositions.length > 0) {
        const firstSteelY = steelPositions[0];

        // 鋼鉄ブロックより上の区間のブロックを収集
        const upperBlocks: Block[] = [];
        for (let y = 0; y < firstSteelY; y++) {
          if (blocks[y][x]) {
            upperBlocks.push({
              ...blocks[y][x],
              sprite: null,
            });
          }
        }

        // 上から順に配置（鋼鉄ブロックの上に積み上げる）
        for (let i = 0; i < upperBlocks.length; i++) {
          const destY = firstSteelY - upperBlocks.length + i;
          if (destY >= 0) {
            const block = upperBlocks[i];
            newBlocks[destY][x] = {
              ...block,
              x: x,
              y: destY,
            };
          }
        }
      }

      // 最後の鋼鉄ブロックより下の区間を処理
      const lastSteelY = steelPositions[steelPositions.length - 1];
      this.applyGravityToColumn(
        blocks,
        newBlocks,
        x,
        lastSteelY + 1,
        height - 1
      );
    }

    return newBlocks;
  }

  /**
   * 列の特定区間に重力を適用するヘルパーメソッド
   * @param blocks 元のブロック配列
   * @param newBlocks 新しいブロック配列
   * @param x 列のX座標
   * @param startY 開始Y座標
   * @param endY 終了Y座標
   */
  private applyGravityToColumn(
    blocks: Block[][],
    newBlocks: Block[][],
    x: number,
    startY: number,
    endY: number
  ): void {
    if (startY > endY) return;

    // 区間内の非nullブロックを収集
    const columnBlocks: Block[] = [];
    for (let y = startY; y <= endY; y++) {
      if (blocks[y][x]) {
        columnBlocks.push({
          ...blocks[y][x],
          sprite: null,
        });
      }
    }

    // 収集したブロックを下から順に配置
    for (let i = 0; i < columnBlocks.length; i++) {
      const destY = endY - i;
      const block = columnBlocks[columnBlocks.length - 1 - i];

      // 座標を更新
      newBlocks[destY][x] = {
        ...block,
        x: x,
        y: destY,
      };
    }
  }
  /**
   * 空の列を左にスライドさせる
   * @param blocks 元のブロック配列
   * @returns 更新されたブロック配列
   */
  applyHorizontalSlide(blocks: Block[][]): Block[][] {
    const height = blocks.length;
    const width = blocks[0]?.length || 0;
    
    // 鋼鉄ブロックの位置を特定
    const steelPositions: {x: number, y: number}[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (blocks[y][x] && blocks[y][x].type === BlockType.STEEL) {
          steelPositions.push({x, y});
        }
      }
    }
    
    // 鋼鉄ブロックがない場合は通常の水平スライド処理
    if (steelPositions.length === 0) {
      return this.applyNormalHorizontalSlide(blocks);
    }
    
    // 鋼鉄ブロックの列ごとに、右側にブロックがあるかをチェック
    const steelColumnsWithBlocksToRight = new Set<number>();
    for (const pos of steelPositions) {
      for (let x = pos.x + 1; x < width; x++) {
        if (blocks[pos.y][x]) {
          steelColumnsWithBlocksToRight.add(pos.x);
          break;
        }
      }
    }
    
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
    
    // 空の列がない場合は何も変更しない
    if (!isEmptyColumn.some(empty => empty)) {
      return JSON.parse(JSON.stringify(blocks));
    }
    
    // 結果の配列を作成（元の配列をディープコピー）
    const resultBlocks: (Block | null)[][] = JSON.parse(JSON.stringify(blocks));
    
    // スプライト参照をnullに設定
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (resultBlocks[y][x]) {
          resultBlocks[y][x]!.sprite = null;
        }
      }
    }
    
    // 鋼鉄ブロックの右側にブロックがある場合、その列より右側のブロックは左にスライドしない
    let minSteelWithBlocksToRightX = width;
    for (const pos of steelPositions) {
      if (steelColumnsWithBlocksToRight.has(pos.x) && pos.x < minSteelWithBlocksToRightX) {
        minSteelWithBlocksToRightX = pos.x;
      }
    }
    
    // 鋼鉄ブロックの列と、その上のブロックは固定
    const fixedColumns = new Set<number>();
    for (const pos of steelPositions) {
      fixedColumns.add(pos.x);
    }
    
    // 各行ごとに処理
    for (let y = 0; y < height; y++) {
      // 鋼鉄ブロックがある行かどうかをチェック
      const steelInRow = steelPositions.filter(pos => pos.y === y);
      
      if (steelInRow.length > 0) {
        // 鋼鉄ブロックがある行の場合、鋼鉄ブロックとその右側のブロックは固定
        for (const steelPos of steelInRow) {
          if (steelColumnsWithBlocksToRight.has(steelPos.x)) {
            // 鋼鉄ブロックの右側のブロックも固定
            for (let x = steelPos.x + 1; x < width; x++) {
              fixedColumns.add(x);
            }
          }
        }
      }
    }
    
    // 固定されていない列を左詰めで配置
    const emptyColumns: number[] = [];
    for (let x = 0; x < width; x++) {
      if (isEmptyColumn[x] && !fixedColumns.has(x)) {
        emptyColumns.push(x);
      }
    }
    
    // 各行ごとに処理
    for (let y = 0; y < height; y++) {
      // 鋼鉄ブロックがある行かどうかをチェック
      const steelInRow = steelPositions.filter(pos => pos.y === y);
      
      if (steelInRow.length > 0) {
        // 鋼鉄ブロックがある行の場合、鋼鉄ブロックとその右側のブロックは固定
        // 何もしない
      } else {
        // 鋼鉄ブロックがない行の場合、通常の水平スライド処理
        // ただし、固定列は移動しない
        
        // 空の列を特定
        const rowEmptyColumns: number[] = [];
        for (let x = 0; x < width; x++) {
          if (!resultBlocks[y][x] && !fixedColumns.has(x)) {
            rowEmptyColumns.push(x);
          }
        }
        
        // 空の列がない場合は何もしない
        if (rowEmptyColumns.length === 0) {
          continue;
        }
        
        // 左詰めで配置
        for (let x = 0; x < width; x++) {
          if (fixedColumns.has(x)) {
            // 固定列はスキップ
            continue;
          }
          
          if (resultBlocks[y][x]) {
            // ブロックがある場合、左詰めで配置
            let destX = x;
            while (destX > 0 && rowEmptyColumns.includes(destX - 1)) {
              destX--;
              rowEmptyColumns.splice(rowEmptyColumns.indexOf(destX), 1);
              rowEmptyColumns.push(x);
            }
            
            if (destX < x) {
              resultBlocks[y][destX] = {
                ...resultBlocks[y][x]!,
                x: destX,
                sprite: null
              };
              resultBlocks[y][x] = null;
            }
          }
        }
      }
    }
    
    return resultBlocks;
  }

  /**
   * 通常の水平スライド処理（鋼鉄ブロックがない場合）
   * @param blocks 元のブロック配列
   * @returns 更新されたブロック配列
   */
  applyNormalHorizontalSlide(blocks: Block[][]): Block[][] {
    const height = blocks.length;
    const width = blocks[0]?.length || 0;

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

    // 空の列がない場合は何も変更しない
    let hasEmptyColumn = false;
    for (let x = 0; x < width; x++) {
      if (isEmptyColumn[x]) {
        hasEmptyColumn = true;
        break;
      }
    }
    if (!hasEmptyColumn) {
      // ディープコピーを作成し、スプライト参照をnullに設定
      const result = JSON.parse(JSON.stringify(blocks));
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (result[y][x]) {
            result[y][x].sprite = null;
          }
        }
      }
      return result;
    }

    // 新しいブロック配列を作成（nullで初期化）
    const resultBlocks: Block[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(null));

    // 空でない列を左から詰める
    let destX = 0;
    for (let x = 0; x < width; x++) {
      // 空の列はスキップ
      if (isEmptyColumn[x]) {
        continue;
      }

      // 列をコピー
      this.copyColumn(blocks, resultBlocks, x, destX);
      destX++;
    }

    return resultBlocks;
  }

  /**
   * 列をコピーするヘルパーメソッド
   * @param source 元のブロック配列
   * @param dest コピー先のブロック配列
   * @param sourceX コピー元のX座標
   * @param destX コピー先のX座標
   */
  private copyColumn(
    source: Block[][],
    dest: Block[][],
    sourceX: number,
    destX: number
  ): void {
    for (let y = 0; y < source.length; y++) {
      if (source[y][sourceX]) {
        dest[y][destX] = {
          ...source[y][sourceX],
          x: destX,
          sprite: null,
        };
      }
    }
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
        if (
          block &&
          (block.type === BlockType.NORMAL ||
            block.type === BlockType.COUNTER_PLUS ||
            block.type === BlockType.COUNTER_MINUS)
        ) {
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
  findConnectedIceBlocks(
    blocks: Block[][],
    startX: number,
    startY: number
  ): Block[] {
    // 開始ブロックがnullの場合は空配列を返す
    if (!blocks[startY] || !blocks[startY][startX]) {
      return [];
    }

    const startBlock = blocks[startY][startX];

    // 開始ブロックが氷結ブロックでない場合は空配列を返す
    if (
      startBlock.type !== BlockType.ICE_LV1 &&
      startBlock.type !== BlockType.ICE_LV2 &&
      startBlock.type !== BlockType.ICE_COUNTER_PLUS &&
      startBlock.type !== BlockType.ICE_COUNTER_MINUS
    ) {
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
      if (
        blocks[y][x].type !== BlockType.ICE_LV1 &&
        blocks[y][x].type !== BlockType.ICE_LV2 &&
        blocks[y][x].type !== BlockType.ICE_COUNTER_PLUS &&
        blocks[y][x].type !== BlockType.ICE_COUNTER_MINUS
      ) {
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
  findAdjacentNormalBlocks(
    blocks: Block[][],
    iceBlockX: number,
    iceBlockY: number
  ): Block[] {
    const adjacentNormalBlocks: Block[] = [];

    // 氷結ブロックがnullの場合は空配列を返す
    if (!blocks[iceBlockY] || !blocks[iceBlockY][iceBlockX]) {
      return [];
    }

    const iceBlock = blocks[iceBlockY][iceBlockX];

    // 氷結ブロックでない場合は空配列を返す
    if (
      iceBlock.type !== BlockType.ICE_LV1 &&
      iceBlock.type !== BlockType.ICE_LV2 &&
      iceBlock.type !== BlockType.ICE_COUNTER_PLUS &&
      iceBlock.type !== BlockType.ICE_COUNTER_MINUS
    ) {
      return [];
    }

    const targetColor = iceBlock.color;

    // 上下左右の隣接ブロックをチェック
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 }, // 右
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 0 }, // 左
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
      if (
        adjacentBlock &&
        adjacentBlock.color === targetColor &&
        adjacentBlock.type === BlockType.NORMAL
      ) {
        adjacentNormalBlocks.push(adjacentBlock);
      }
    }

    return adjacentNormalBlocks;
  }
}
