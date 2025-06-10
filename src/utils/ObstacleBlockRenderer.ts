import * as Phaser from 'phaser';
import { Block, BlockColor } from '../types';
import { ObstacleBlockManager } from './ObstacleBlockManager';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * 妨害ブロック描画クラス
 * 妨害ブロックの視覚表現を担当
 */
export class ObstacleBlockRenderer {
  private scene: Phaser.Scene;
  private obstacleBlockManager: ObstacleBlockManager;
  private blockSize: number;
  private blockSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private textureCache: Map<string, Phaser.GameObjects.Graphics> = new Map();
  
  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param obstacleBlockManager 妨害ブロック管理クラス
   */
  constructor(scene: Phaser.Scene, obstacleBlockManager: ObstacleBlockManager) {
    this.scene = scene;
    this.obstacleBlockManager = obstacleBlockManager;
    this.blockSize = GAME_CONFIG.blockSize;
    
    // テクスチャを事前生成
    this.createTextures();
  }
  
  /**
   * 妨害ブロックのテクスチャを生成
   */
  private createTextures(): void {
    // 氷結Lv1テクスチャ
    this.createIceTexture('ice1Texture', 0.7);
    
    // 氷結Lv2テクスチャ
    this.createIceTexture('ice2Texture', 0.5);
    
    // カウンター+テクスチャ
    this.createCounterTexture('counterPlusTexture', true);
    
    // カウンターテクスチャ
    this.createCounterTexture('counterTexture', false);
    
    // 岩ブロックテクスチャ
    this.createRockTexture();
    
    // 鋼鉄ブロックテクスチャ
    this.createSteelTexture();
    
    // 氷結カウンター+テクスチャ
    this.createIceCounterTexture('iceCounterPlusTexture', true);
    
    // 氷結カウンターテクスチャ
    this.createIceCounterTexture('iceCounterTexture', false);
  }
  
  /**
   * 氷結テクスチャを生成
   */
  private createIceTexture(key: string, alpha: number): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 氷の結晶パターン
    graphics.lineStyle(2, 0xFFFFFF, alpha);
    graphics.beginPath();
    
    // 氷の結晶線（横）
    for (let y = 0; y < this.blockSize; y += 8) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.blockSize, y);
    }
    
    // 氷の結晶線（縦）
    for (let x = 0; x < this.blockSize; x += 8) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.blockSize);
    }
    
    graphics.strokePath();
    
    // 半透明の氷のオーバーレイ
    graphics.fillStyle(0xADD8E6, alpha);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture(key, this.blockSize, this.blockSize);
    this.textureCache.set(key, graphics);
  }
  
  /**
   * カウンターテクスチャを生成
   */
  private createCounterTexture(key: string, isPlus: boolean): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // カウンターの背景（円形）
    graphics.fillStyle(0xFFFFFF, 0.7);
    graphics.fillCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 2.5);
    
    // 枠線
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 2.5);
    
    // テクスチャとして保存
    graphics.generateTexture(key, this.blockSize, this.blockSize);
    this.textureCache.set(key, graphics);
  }
  
  /**
   * 岩ブロックテクスチャを生成
   */
  private createRockTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 岩の基本形状
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 岩の凹凸表現
    graphics.lineStyle(2, 0x606060, 1);
    
    // ランダムな線で岩の質感を表現
    for (let i = 0; i < 8; i++) {
      const x1 = Math.random() * this.blockSize;
      const y1 = Math.random() * this.blockSize;
      const x2 = Math.random() * this.blockSize;
      const y2 = Math.random() * this.blockSize;
      
      graphics.beginPath();
      graphics.moveTo(x1, y1);
      graphics.lineTo(x2, y2);
      graphics.strokePath();
    }
    
    // テクスチャとして保存
    graphics.generateTexture('rockTexture', this.blockSize, this.blockSize);
    this.textureCache.set('rockTexture', graphics);
  }
  
  /**
   * 鋼鉄ブロックテクスチャを生成
   */
  private createSteelTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 鋼鉄の基本形状
    graphics.fillStyle(0xC0C0C0, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 金属光沢の表現
    graphics.fillStyle(0xFFFFFF, 0.5);
    graphics.fillRect(this.blockSize * 0.1, this.blockSize * 0.1, this.blockSize * 0.8, this.blockSize * 0.2);
    
    // 鋼鉄の枠
    graphics.lineStyle(3, 0x808080, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // リベット（ネジ）の表現
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(this.blockSize * 0.2, this.blockSize * 0.2, this.blockSize * 0.1);
    graphics.fillCircle(this.blockSize * 0.8, this.blockSize * 0.2, this.blockSize * 0.1);
    graphics.fillCircle(this.blockSize * 0.2, this.blockSize * 0.8, this.blockSize * 0.1);
    graphics.fillCircle(this.blockSize * 0.8, this.blockSize * 0.8, this.blockSize * 0.1);
    
    // テクスチャとして保存
    graphics.generateTexture('steelTexture', this.blockSize, this.blockSize);
    this.textureCache.set('steelTexture', graphics);
  }
  
  /**
   * 氷結カウンターテクスチャを生成
   */
  private createIceCounterTexture(key: string, isPlus: boolean): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 氷の結晶パターン（氷結テクスチャと同様）
    graphics.lineStyle(2, 0xFFFFFF, 0.7);
    graphics.beginPath();
    
    // 氷の結晶線（横）
    for (let y = 0; y < this.blockSize; y += 8) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.blockSize, y);
    }
    
    // 氷の結晶線（縦）
    for (let x = 0; x < this.blockSize; x += 8) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.blockSize);
    }
    
    graphics.strokePath();
    
    // 半透明の氷のオーバーレイ
    graphics.fillStyle(0xADD8E6, 0.7);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // カウンターの背景（円形）
    graphics.fillStyle(0xFFFFFF, 0.5);
    graphics.fillCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 2.5);
    
    // 枠線
    graphics.lineStyle(2, 0x000000, 0.7);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 2.5);
    
    // テクスチャとして保存
    graphics.generateTexture(key, this.blockSize, this.blockSize);
    this.textureCache.set(key, graphics);
  }
  
  /**
   * 妨害ブロックを描画
   * @param blocks 全ブロック配列
   * @param blockContainer ブロックを配置するコンテナ
   */
  public renderObstacleBlocks(blocks: Block[], blockContainer: Phaser.GameObjects.Container): void {
    // 既存のスプライトをクリア
    this.clearSprites();
    
    // 妨害ブロックを描画
    blocks.forEach(block => {
      if (this.obstacleBlockManager.isObstacleBlock(block.id)) {
        const sprite = this.createObstacleBlockSprite(block);
        if (sprite) {
          blockContainer.add(sprite);
          this.blockSprites.set(block.id, sprite);
        }
      }
    });
  }
  
  /**
   * 妨害ブロックスプライトを作成
   */
  private createObstacleBlockSprite(block: Block): Phaser.GameObjects.Container | null {
    const renderInfo = this.obstacleBlockManager.getObstacleBlockRenderInfo(block.id);
    if (!renderInfo) return null;
    
    // ブロックの座標
    const x = block.x * this.blockSize + this.blockSize / 2;
    const y = block.y * this.blockSize + this.blockSize / 2;
    
    // コンテナを作成
    const container = this.scene.add.container(x, y);
    
    // 基本ブロック（色付き）
    const baseBlock = this.scene.add.rectangle(
      0, 0, this.blockSize - 2, this.blockSize - 2, 
      this.getColorValue(renderInfo.mainColor)
    );
    container.add(baseBlock);
    
    // 妨害ブロックのオーバーレイ
    let overlay: Phaser.GameObjects.Image | null = null;
    
    switch (renderInfo.overlayType) {
      case 'ice1':
        overlay = this.scene.add.image(0, 0, 'ice1Texture');
        break;
      case 'ice2':
        overlay = this.scene.add.image(0, 0, 'ice2Texture');
        break;
      case 'counterPlus':
        overlay = this.scene.add.image(0, 0, 'counterPlusTexture');
        break;
      case 'counter':
        overlay = this.scene.add.image(0, 0, 'counterTexture');
        break;
      case 'rock':
        overlay = this.scene.add.image(0, 0, 'rockTexture');
        break;
      case 'steel':
        overlay = this.scene.add.image(0, 0, 'steelTexture');
        break;
      case 'iceCounterPlus':
        overlay = this.scene.add.image(0, 0, 'iceCounterPlusTexture');
        break;
      case 'iceCounter':
        overlay = this.scene.add.image(0, 0, 'iceCounterTexture');
        break;
    }
    
    if (overlay) {
      if (renderInfo.alpha !== undefined) {
        overlay.setAlpha(renderInfo.alpha);
      }
      if (renderInfo.tint !== undefined) {
        overlay.setTint(renderInfo.tint);
      }
      container.add(overlay);
    }
    
    // カウンター値のテキスト
    if (renderInfo.text) {
      const text = this.scene.add.text(0, 0, renderInfo.text, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#000000',
        stroke: '#FFFFFF',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      container.add(text);
    }
    
    return container;
  }
  
  /**
   * 色名から色値を取得
   */
  private getColorValue(color: BlockColor): number {
    const colorMap: Record<BlockColor, number> = {
      'blue': 0x1E5799,
      'lightBlue': 0x7DB9E8,
      'seaGreen': 0x2E8B57,
      'coralRed': 0xFF6347,
      'sandGold': 0xF4D03F,
      'pearlWhite': 0xF5F5F5
    };
    
    return colorMap[color] || 0xFFFFFF;
  }
  
  /**
   * 既存のスプライトをクリア
   */
  private clearSprites(): void {
    this.blockSprites.forEach(sprite => {
      sprite.destroy();
    });
    this.blockSprites.clear();
  }
  
  /**
   * リソースを破棄
   */
  public destroy(): void {
    this.clearSprites();
    
    // テクスチャキャッシュを破棄
    this.textureCache.forEach(graphics => {
      graphics.destroy();
    });
    this.textureCache.clear();
  }
  
  /**
   * 妨害ブロックの更新
   * @param updatedBlocks 更新されたブロック配列
   * @param blockContainer ブロックを配置するコンテナ
   */
  public updateObstacleBlocks(updatedBlocks: Block[], blockContainer: Phaser.GameObjects.Container): void {
    // 更新が必要な妨害ブロックを再描画
    updatedBlocks.forEach(block => {
      // 既存のスプライトを削除
      const existingSprite = this.blockSprites.get(block.id);
      if (existingSprite) {
        existingSprite.destroy();
        this.blockSprites.delete(block.id);
      }
      
      // 妨害ブロックの場合は再描画
      if (this.obstacleBlockManager.isObstacleBlock(block.id)) {
        const sprite = this.createObstacleBlockSprite(block);
        if (sprite) {
          blockContainer.add(sprite);
          this.blockSprites.set(block.id, sprite);
        }
      }
    });
  }
}
