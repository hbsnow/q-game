import { Block, BlockType, BlockColor } from '../types';
import { ObstacleBlock, ObstacleBlockFactory } from './ObstacleBlock';

/**
 * 妨害ブロック管理クラス
 * 妨害ブロックの状態管理と更新を担当
 * 
 * 重要: 妨害ブロックは「オーバーレイ」ではなく「単一のエンティティ」として扱う
 * 1つのマスには1種類のブロックのみ存在する
 */
export class ObstacleBlockManager {
  private obstacleBlocks: Map<string, ObstacleBlock> = new Map();
  
  /**
   * コンストラクタ
   * @param blocks 初期ブロック配列
   */
  constructor(blocks: Block[] = []) {
    this.initializeFromBlocks(blocks);
  }
  
  /**
   * 既存のブロック配列から妨害ブロックを初期化
   */
  public initializeFromBlocks(blocks: Block[]): void {
    // 既存の妨害ブロックをクリア
    this.obstacleBlocks.clear();
    
    // 妨害ブロックを抽出して登録
    blocks.filter(block => block.type !== 'normal')
      .forEach(block => {
        const obstacleBlock = ObstacleBlockFactory.createFromBlock(block);
        this.obstacleBlocks.set(block.id, obstacleBlock);
      });
  }
  
  /**
   * 妨害ブロックを追加
   */
  public addObstacleBlock(obstacleBlock: ObstacleBlock): void {
    this.obstacleBlocks.set(obstacleBlock.getId(), obstacleBlock);
  }
  
  /**
   * 妨害ブロックを削除
   */
  public removeObstacleBlock(blockId: string): void {
    this.obstacleBlocks.delete(blockId);
  }
  
  /**
   * 指定したIDの妨害ブロックを取得
   */
  public getObstacleBlock(blockId: string): ObstacleBlock | undefined {
    return this.obstacleBlocks.get(blockId);
  }
  
  /**
   * 全ての妨害ブロックを取得
   */
  public getAllObstacleBlocks(): ObstacleBlock[] {
    return Array.from(this.obstacleBlocks.values());
  }
  
  /**
   * 指定した座標の妨害ブロックを取得
   */
  public getObstacleBlockAt(x: number, y: number): ObstacleBlock | undefined {
    return Array.from(this.obstacleBlocks.values()).find(
      block => block.getX() === x && block.getY() === y
    );
  }
  
  /**
   * ブロック消去時の妨害ブロック状態更新
   * @param removedBlocks 消去されたブロック
   * @param allBlocks 全ブロック配列
   * @returns 更新されたブロック配列
   */
  public updateObstacleBlocks(removedBlocks: Block[], allBlocks: Block[]): Block[] {
    const updatedBlocks = [...allBlocks];
    const updatedBlockIds = new Set<string>();
    
    // 消去されたブロックの隣接位置にある妨害ブロックを処理
    for (const removedBlock of removedBlocks) {
      const adjacentPositions = this.getAdjacentPositions(removedBlock);
      
      for (const pos of adjacentPositions) {
        // 隣接位置のブロックを取得
        const blockIndex = updatedBlocks.findIndex(b => b.x === pos.x && b.y === pos.y);
        if (blockIndex === -1) continue;
        
        const blockAtPos = updatedBlocks[blockIndex];
        
        // 妨害ブロックの場合、状態を更新
        const obstacleBlock = this.obstacleBlocks.get(blockAtPos.id);
        if (obstacleBlock) {
          // 隣接する消去ブロックを渡して状態更新
          const stateChanged = obstacleBlock.updateState([removedBlock]);
          
          if (stateChanged) {
            // 状態が変化した場合、ブロック配列を更新
            const updatedBlock = obstacleBlock.getBlock();
            
            // 更新されたブロックで配列を更新
            updatedBlocks[blockIndex] = updatedBlock;
            updatedBlockIds.add(updatedBlock.id);
            
            // タイプが変わった場合、妨害ブロック管理からも削除
            if (updatedBlock.type === 'normal') {
              this.obstacleBlocks.delete(updatedBlock.id);
            } else if (updatedBlock.type === 'ice1' && obstacleBlock.getType() === 'ice2') {
              // ice2 → ice1 の場合は新しいObstacleBlockインスタンスを作成
              const newObstacleBlock = ObstacleBlockFactory.createFromBlock(updatedBlock);
              this.obstacleBlocks.set(updatedBlock.id, newObstacleBlock);
            }
          }
        }
      }
    }
    
    return updatedBlocks;
  }
  
  /**
   * 隣接位置を取得
   */
  private getAdjacentPositions(block: Block): { x: number; y: number }[] {
    return [
      { x: block.x, y: block.y - 1 }, // 上
      { x: block.x, y: block.y + 1 }, // 下
      { x: block.x - 1, y: block.y }, // 左
      { x: block.x + 1, y: block.y }, // 右
    ];
  }
  
  /**
   * 消去可能な妨害ブロックをチェック
   * @param blocks 全ブロック配列
   * @returns 消去可能な妨害ブロックのID配列
   */
  public getRemovableObstacleBlocks(blocks: Block[]): string[] {
    const removableIds: string[] = [];
    
    // 各妨害ブロックについて消去可能かチェック
    for (const [id, obstacleBlock] of this.obstacleBlocks.entries()) {
      // カウンター系ブロックのみチェック
      if (obstacleBlock.getType() === 'counter' || obstacleBlock.getType() === 'counterPlus') {
        // 隣接する同色ブロックを取得
        const adjacentBlocks = this.getAdjacentSameColorBlocks(obstacleBlock, blocks);
        
        // 消去可能かチェック
        if (obstacleBlock.isRemovable(adjacentBlocks)) {
          removableIds.push(id);
        }
      }
    }
    
    return removableIds;
  }
  
  /**
   * 隣接する同色ブロックを取得
   */
  private getAdjacentSameColorBlocks(obstacleBlock: ObstacleBlock, allBlocks: Block[]): Block[] {
    const visited = new Set<string>();
    const group: Block[] = [];
    const queue: Block[] = [obstacleBlock.getBlock()];
    const color = obstacleBlock.getColor();
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      
      // 自分自身は結果に含めない
      if (current.id !== obstacleBlock.getId()) {
        group.push(current);
      }
      
      // 隣接する同色ブロックを探す
      const adjacentPositions = this.getAdjacentPositions(current);
      
      for (const pos of adjacentPositions) {
        const adjacentBlock = allBlocks.find(b => b.x === pos.x && b.y === pos.y);
        
        if (adjacentBlock && 
            !visited.has(adjacentBlock.id) && 
            adjacentBlock.color === color &&
            (adjacentBlock.type === 'normal' || 
             adjacentBlock.type === 'counter' || 
             adjacentBlock.type === 'counterPlus')) {
          queue.push(adjacentBlock);
        }
      }
    }
    
    return group;
  }
  
  /**
   * 妨害ブロックの描画情報を取得
   */
  public getObstacleBlockRenderInfo(blockId: string): {
    mainColor: BlockColor;
    overlayType: string;
    text?: string;
    alpha?: number;
    tint?: number;
  } | undefined {
    const obstacleBlock = this.obstacleBlocks.get(blockId);
    if (obstacleBlock) {
      const renderInfo = obstacleBlock.getRenderInfo();
      console.log(`ObstacleBlockManager.getObstacleBlockRenderInfo for ${blockId}:`, renderInfo);
      return renderInfo;
    }
    return undefined;
  }
  
  /**
   * 妨害ブロックかどうかをチェック
   */
  public isObstacleBlock(blockId: string): boolean {
    const result = this.obstacleBlocks.has(blockId);
    console.log(`ObstacleBlockManager.isObstacleBlock ${blockId}: ${result}`);
    return result;
  }
  
  /**
   * 重力の影響を受けない妨害ブロックかどうかをチェック
   */
  public isFixedObstacleBlock(blockId: string): boolean {
    const obstacleBlock = this.obstacleBlocks.get(blockId);
    if (obstacleBlock) {
      return obstacleBlock.getType() === 'steel';
    }
    return false;
  }
}
