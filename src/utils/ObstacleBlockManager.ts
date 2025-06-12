import { Block, BlockType, BlockColor } from '../types';
import { ObstacleBlock, ObstacleBlockFactory } from './ObstacleBlock';

/**
 * 妨害ブロック管理クラス
 * 
 * 重要な原則:
 * - 単一エンティティの原則: 妨害ブロックは「オーバーレイ」ではなく「単一のエンティティ」
 * - マス占有の原則: 1つのマスには1種類のブロックのみ存在する
 * - 視覚的一貫性: 妨害ブロックは見た目でも単一のブロックとして表現
 */
export class ObstacleBlockManager {
  private obstacleBlocks: Map<string, ObstacleBlock> = new Map();
  // 妨害ブロックのスプライト管理
  private obstacleBlockSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  
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
        try {
          const obstacleBlock = ObstacleBlockFactory.createFromBlock(block);
          this.obstacleBlocks.set(block.id, obstacleBlock);
        } catch (error) {
          console.error(`Failed to create obstacle block from block ${block.id}:`, error);
        }
      });
    
    console.log(`Initialized ${this.obstacleBlocks.size} obstacle blocks`);
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
    // 入力の配列を変更しないよう、コピーを作成
    const updatedBlocks = [...allBlocks];
    const updatedBlockIds = new Set<string>();
    
    // 通常ブロックに変わった氷結ブロックを追跡するための配列
    const newlyNormalBlocks: Block[] = [];
    
    // 無限ループ防止のために処理済みブロックを追跡
    const processedBlockIds = new Set<string>();
    removedBlocks.forEach(block => processedBlockIds.add(block.id));
    
    // 消去されたブロックの隣接位置にある妨害ブロックを処理
    for (const removedBlock of removedBlocks) {
      const adjacentPositions = this.getAdjacentPositions(removedBlock);
      
      for (const pos of adjacentPositions) {
        // 隣接位置のブロックを取得
        const blockIndex = updatedBlocks.findIndex(b => b.x === pos.x && b.y === pos.y);
        if (blockIndex === -1) continue;
        
        const blockAtPos = updatedBlocks[blockIndex];
        
        // 既に処理済みのブロックはスキップ
        if (processedBlockIds.has(blockAtPos.id)) continue;
        processedBlockIds.add(blockAtPos.id);
        
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
            
            // タイプが変わった場合、妨害ブロック管理も更新
            if (updatedBlock.type === 'normal') {
              // 通常ブロックになった場合は妨害ブロック管理から削除
              this.obstacleBlocks.delete(updatedBlock.id);
              console.log(`Block ${updatedBlock.id} changed to normal type and removed from obstacle management`);
              
              // 通常ブロックになったブロックを追跡
              newlyNormalBlocks.push(updatedBlock);
            } else if (updatedBlock.type !== obstacleBlock.getType()) {
              // タイプが変わった場合は新しいObstacleBlockインスタンスを作成
              const newObstacleBlock = ObstacleBlockFactory.createFromBlock(updatedBlock);
              this.obstacleBlocks.set(updatedBlock.id, newObstacleBlock);
              console.log(`Block ${updatedBlock.id} changed type from ${obstacleBlock.getType()} to ${updatedBlock.type}`);
            }
          }
        }
      }
    }
    
    // 更新されたブロックのログ出力
    if (updatedBlockIds.size > 0) {
      console.log(`Updated ${updatedBlockIds.size} obstacle blocks:`, Array.from(updatedBlockIds));
    }
    
    // 通常ブロックに変わったブロックがある場合、連鎖的に解除処理を行う
    if (newlyNormalBlocks.length > 0) {
      console.log(`Processing chain reaction for ${newlyNormalBlocks.length} newly normal blocks`);
      
      // 再帰的に処理（通常ブロックに変わったブロックを消去されたブロックとして扱う）
      return this.updateObstacleBlocks(newlyNormalBlocks, updatedBlocks);
    }
    
    // 更新されたブロックを返す
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
    textureKey: string;
    text?: string;
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
    return result;
  }
  
  /**
   * 重力の影響を受けない妨害ブロックかどうかをチェック
   */
  public isFixedObstacleBlock(blockId: string): boolean {
    const obstacleBlock = this.obstacleBlocks.get(blockId);
    if (obstacleBlock) {
      return !obstacleBlock.isAffectedByGravity();
    }
    return false;
  }
  
  /**
   * 妨害ブロックを生成
   */
  public createObstacleBlock(
    type: BlockType,
    color: BlockColor,
    x: number,
    y: number,
    params: {
      counterValue?: number;
    } = {}
  ): ObstacleBlock {
    const obstacleBlock = ObstacleBlockFactory.createObstacleBlock(
      type, color, x, y, params
    );
    this.obstacleBlocks.set(obstacleBlock.getId(), obstacleBlock);
    return obstacleBlock;
  }
  
  /**
   * 妨害ブロックのスプライトを取得
   * @param blockId ブロックID
   * @returns スプライトコンテナ（存在しない場合はnull）
   */
  public getObstacleBlockSprite(blockId: string): Phaser.GameObjects.Container | null {
    return this.obstacleBlockSprites.get(blockId) || null;
  }
  
  /**
   * 妨害ブロックのスプライトを登録
   * @param blockId ブロックID
   * @param sprite スプライトコンテナ
   */
  public registerObstacleBlockSprite(blockId: string, sprite: Phaser.GameObjects.Container): void {
    this.obstacleBlockSprites.set(blockId, sprite);
  }
}
