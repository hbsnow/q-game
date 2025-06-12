import { Scene } from 'phaser';
import { Block } from '../types';
import { ObstacleBlockManager } from './ObstacleBlockManager';

/**
 * 妨害ブロック描画クラス
 * 妨害ブロックの視覚的な表現を担当
 */
export class ObstacleBlockRenderer {
  private scene: Scene;
  private obstacleBlockManager: ObstacleBlockManager;
  private blockSize: number = 40;
  private boardOffsetY: number = 75;
  private obstacleSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  
  /**
   * コンストラクタ
   * @param scene Phaserのシーン
   * @param obstacleBlockManager 妨害ブロック管理クラス
   */
  constructor(scene: Scene, obstacleBlockManager: ObstacleBlockManager) {
    this.scene = scene;
    this.obstacleBlockManager = obstacleBlockManager;
  }
  
  /**
   * 妨害ブロックを描画
   * @param blocks 全ブロック配列
   * @param container 親コンテナ
   */
  public renderObstacleBlocks(blocks: Block[], container: Phaser.GameObjects.Container): void {
    console.log(`🎨 ObstacleBlockRenderer.renderObstacleBlocks: Rendering obstacle blocks`);
    
    // 既存のスプライトをクリア
    this.clearObstacleSprites();
    
    // 盤面の中央配置計算
    const boardPixelWidth = 10 * this.blockSize; // 10は盤面の幅
    const startX = (this.scene.scale.width - boardPixelWidth) / 2;
    const startY = this.boardOffsetY;
    
    // 妨害ブロックを描画
    blocks.forEach(block => {
      if (this.obstacleBlockManager.isObstacleBlock(block.id)) {
        const x = startX + block.x * this.blockSize + this.blockSize / 2;
        const y = startY + block.y * this.blockSize + this.blockSize / 2;
        
        console.log(`  - Rendering obstacle block: id=${block.id}, type=${block.type}, pos=(${block.x},${block.y}), screenPos=(${x},${y})`);
        
        // 描画情報を取得
        const renderInfo = this.obstacleBlockManager.getObstacleBlockRenderInfo(block.id);
        if (renderInfo) {
          // 妨害ブロックのコンテナを作成
          const obstacleContainer = this.scene.add.container(x, y);
          
          // 基本ブロック（背景）
          const baseBlock = this.scene.add.rectangle(0, 0, this.blockSize - 2, this.blockSize - 2, 0xFFFFFF);
          if (renderInfo.tint) {
            baseBlock.setFillStyle(renderInfo.tint);
          }
          
          // 妨害ブロックの種類に応じた装飾
          switch (block.type) {
            case 'ice1':
            case 'ice2':
              // 氷結エフェクト（半透明の青い層）
              const iceOverlay = this.scene.add.rectangle(0, 0, this.blockSize - 2, this.blockSize - 2, 0x00FFFF, 0.5);
              obstacleContainer.add(iceOverlay);
              
              // 氷の結晶パターン
              const icePattern = this.scene.add.text(0, 0, '❄', {
                fontSize: '20px',
                color: '#FFFFFF'
              }).setOrigin(0.5);
              obstacleContainer.add(icePattern);
              
              // 氷結レベル2の場合は追加の装飾
              if (block.type === 'ice2') {
                const iceLevel2 = this.scene.add.text(0, -10, '2', {
                  fontSize: '12px',
                  color: '#FFFFFF',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                obstacleContainer.add(iceLevel2);
              }
              break;
              
            case 'counter':
            case 'counterPlus':
              // カウンター値
              const counterValue = block.counterValue || 3;
              const counterText = this.scene.add.text(0, 0, 
                block.type === 'counterPlus' ? `${counterValue}+` : `${counterValue}`, 
                {
                  fontSize: '18px',
                  color: '#FFFFFF',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
              obstacleContainer.add(counterText);
              
              // カウンター背景円
              const counterCircle = this.scene.add.circle(0, 0, 15, 0x000000, 0.3);
              obstacleContainer.add(counterCircle);
              counterCircle.setDepth(-1); // テキストの下に配置
              break;
              
            case 'iceCounter':
            case 'iceCounterPlus':
              // 氷結エフェクト
              const iceCounterOverlay = this.scene.add.rectangle(0, 0, this.blockSize - 2, this.blockSize - 2, 0x00FFFF, 0.5);
              obstacleContainer.add(iceCounterOverlay);
              
              // 氷の結晶パターン
              const iceCounterPattern = this.scene.add.text(0, -10, '❄', {
                fontSize: '16px',
                color: '#FFFFFF'
              }).setOrigin(0.5);
              obstacleContainer.add(iceCounterPattern);
              
              // カウンター値
              const iceCounterValue = block.counterValue || 3;
              const iceCounterText = this.scene.add.text(0, 5, 
                block.type === 'iceCounterPlus' ? `${iceCounterValue}+` : `${iceCounterValue}`, 
                {
                  fontSize: '16px',
                  color: '#FFFFFF',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
              obstacleContainer.add(iceCounterText);
              break;
              
            case 'rock':
              // 岩ブロックのテクスチャ
              baseBlock.setFillStyle(0x888888);
              const rockPattern = this.scene.add.text(0, 0, '◆', {
                fontSize: '24px',
                color: '#666666'
              }).setOrigin(0.5);
              obstacleContainer.add(rockPattern);
              break;
              
            case 'steel':
              // 鋼鉄ブロックのテクスチャ
              baseBlock.setFillStyle(0xCCCCCC);
              const steelPattern = this.scene.add.text(0, 0, '■', {
                fontSize: '24px',
                color: '#999999'
              }).setOrigin(0.5);
              obstacleContainer.add(steelPattern);
              
              // 金属光沢
              const steelShine = this.scene.add.text(-8, -8, '✦', {
                fontSize: '12px',
                color: '#FFFFFF'
              }).setOrigin(0.5);
              obstacleContainer.add(steelShine);
              break;
          }
          
          // テキスト表示（カウンター値など）
          if (renderInfo.text) {
            const text = this.scene.add.text(0, 0, renderInfo.text, {
              fontSize: '18px',
              color: '#FFFFFF',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            obstacleContainer.add(text);
          }
          
          // コンテナに基本ブロックを追加（一番下のレイヤー）
          obstacleContainer.add(baseBlock);
          baseBlock.setDepth(-10);
          
          // コンテナを親コンテナに追加
          container.add(obstacleContainer);
          
          // スプライトを保存
          this.obstacleSprites.set(block.id, obstacleContainer);
          
          // ObstacleBlockManagerにも登録
          this.obstacleBlockManager.registerObstacleBlockSprite(block.id, obstacleContainer);
          
          console.log(`  - ✅ Obstacle block rendered: id=${block.id}, type=${block.type}`);
        } else {
          console.error(`  - ❌ Failed to get render info for obstacle block: id=${block.id}, type=${block.type}`);
        }
      }
    });
    
    console.log(`🎨 Rendered ${this.obstacleSprites.size} obstacle blocks`);
  }
  
  /**
   * 妨害ブロックの更新
   * @param blocks 全ブロック配列
   * @param container 親コンテナ
   */
  public updateObstacleBlocks(blocks: Block[], container: Phaser.GameObjects.Container): void {
    console.log(`🔄 ObstacleBlockRenderer.updateObstacleBlocks: Updating obstacle blocks`);
    
    // 全ての妨害ブロックを再描画
    this.renderObstacleBlocks(blocks, container);
  }
  
  /**
   * 既存の妨害ブロックスプライトをクリア
   */
  private clearObstacleSprites(): void {
    console.log(`🧹 Clearing ${this.obstacleSprites.size} obstacle sprites`);
    
    // 全てのスプライトを破棄
    this.obstacleSprites.forEach((sprite, id) => {
      try {
        if (sprite && sprite.destroy) {
          sprite.destroy();
          console.log(`  - Destroyed sprite for obstacle block: id=${id}`);
        }
      } catch (error) {
        console.error(`  - Error destroying sprite for obstacle block: id=${id}`, error);
      }
    });
    
    // マップをクリア
    this.obstacleSprites.clear();
  }
}
