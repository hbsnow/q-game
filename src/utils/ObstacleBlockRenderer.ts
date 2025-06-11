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
   * 氷結テクスチャを生成（改良版）
   */
  private createIceTexture(key: string, alpha: number): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 氷の基本形状（半透明の青色）
    graphics.fillStyle(0x87CEFA, alpha);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 氷の結晶パターン（より明確な白線）
    graphics.lineStyle(3, 0xFFFFFF, 0.9);
    
    // 氷の結晶線（横）- より少なく、より目立つ
    for (let y = this.blockSize * 0.25; y <= this.blockSize * 0.75; y += this.blockSize * 0.25) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.blockSize, y);
    }
    
    // 氷の結晶線（縦）- より少なく、より目立つ
    for (let x = this.blockSize * 0.25; x <= this.blockSize * 0.75; x += this.blockSize * 0.25) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.blockSize);
    }
    
    graphics.strokePath();
    
    // 氷の輪郭を強調
    graphics.lineStyle(4, 0xADD8E6, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // 光沢効果（右上から左下への白いグラデーション）
    graphics.fillStyle(0xFFFFFF, 0.3);
    graphics.fillTriangle(
      0, 0,
      this.blockSize * 0.5, 0,
      0, this.blockSize * 0.5
    );
    
    // テクスチャとして保存
    graphics.generateTexture(key, this.blockSize, this.blockSize);
    this.textureCache.set(key, graphics);
  }
  
  /**
   * カウンターテクスチャを生成（改良版）
   */
  private createCounterTexture(key: string, isPlus: boolean): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // カウンターの背景（円形）- より明確に
    graphics.fillStyle(0xFFFFFF, 0.9);
    graphics.fillCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 2.2);
    
    // 枠線 - より太く
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 2.2);
    
    // カウンターの装飾（内側の円）
    graphics.lineStyle(2, 0x000000, 0.5);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 3);
    
    // プラス記号の装飾（カウンター+の場合）
    if (isPlus) {
      graphics.fillStyle(0x000000, 0.7);
      // プラス記号の横線
      graphics.fillRect(
        this.blockSize * 0.35, 
        this.blockSize * 0.48, 
        this.blockSize * 0.3, 
        this.blockSize * 0.04
      );
      // プラス記号の縦線
      graphics.fillRect(
        this.blockSize * 0.48, 
        this.blockSize * 0.35, 
        this.blockSize * 0.04, 
        this.blockSize * 0.3
      );
    }
    
    // テクスチャとして保存
    graphics.generateTexture(key, this.blockSize, this.blockSize);
    this.textureCache.set(key, graphics);
  }
  
  /**
   * 岩ブロックテクスチャを生成（改良版）
   */
  private createRockTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 岩の基本形状
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 岩の凹凸表現 - より明確に
    graphics.lineStyle(3, 0x606060, 1);
    
    // 岩の亀裂パターン（ランダムではなく、より明確なパターン）
    // 中央から放射状に亀裂を入れる
    const centerX = this.blockSize / 2;
    const centerY = this.blockSize / 2;
    const cracks = 6; // 亀裂の数
    
    for (let i = 0; i < cracks; i++) {
      const angle = (Math.PI * 2 * i) / cracks;
      const endX = centerX + Math.cos(angle) * (this.blockSize / 2);
      const endY = centerY + Math.sin(angle) * (this.blockSize / 2);
      
      graphics.beginPath();
      graphics.moveTo(centerX, centerY);
      graphics.lineTo(endX, endY);
      graphics.strokePath();
    }
    
    // 岩の質感を表現する小さな円
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * this.blockSize;
      const y = Math.random() * this.blockSize;
      const radius = Math.random() * 3 + 1;
      
      graphics.fillStyle(0x606060, 0.8);
      graphics.fillCircle(x, y, radius);
    }
    
    // 岩の輪郭を強調
    graphics.lineStyle(4, 0x606060, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture('rockTexture', this.blockSize, this.blockSize);
    this.textureCache.set('rockTexture', graphics);
  }
  
  /**
   * 鋼鉄ブロックテクスチャを生成（改良版）
   */
  private createSteelTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 鋼鉄の基本形状 - より明るく
    graphics.fillStyle(0xD0D0D0, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 金属光沢の表現 - より明確に
    graphics.fillStyle(0xFFFFFF, 0.7);
    graphics.fillRect(this.blockSize * 0.1, this.blockSize * 0.1, this.blockSize * 0.8, this.blockSize * 0.2);
    
    // 鋼鉄の枠 - より太く
    graphics.lineStyle(4, 0x808080, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // リベット（ネジ）の表現 - より大きく
    graphics.fillStyle(0x606060, 1);
    const rivetSize = this.blockSize * 0.15;
    
    // 四隅にリベットを配置
    graphics.fillCircle(this.blockSize * 0.2, this.blockSize * 0.2, rivetSize);
    graphics.fillCircle(this.blockSize * 0.8, this.blockSize * 0.2, rivetSize);
    graphics.fillCircle(this.blockSize * 0.2, this.blockSize * 0.8, rivetSize);
    graphics.fillCircle(this.blockSize * 0.8, this.blockSize * 0.8, rivetSize);
    
    // リベットの中心に光沢
    graphics.fillStyle(0xFFFFFF, 0.7);
    const highlightSize = rivetSize * 0.4;
    graphics.fillCircle(this.blockSize * 0.2 - 1, this.blockSize * 0.2 - 1, highlightSize);
    graphics.fillCircle(this.blockSize * 0.8 - 1, this.blockSize * 0.2 - 1, highlightSize);
    graphics.fillCircle(this.blockSize * 0.2 - 1, this.blockSize * 0.8 - 1, highlightSize);
    graphics.fillCircle(this.blockSize * 0.8 - 1, this.blockSize * 0.8 - 1, highlightSize);
    
    // テクスチャとして保存
    graphics.generateTexture('steelTexture', this.blockSize, this.blockSize);
    this.textureCache.set('steelTexture', graphics);
  }
  
  /**
   * 氷結カウンターテクスチャを生成（改良版）
   */
  private createIceCounterTexture(key: string, isPlus: boolean): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 氷の基本形状（半透明の青色）
    graphics.fillStyle(0x87CEFA, 0.7);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 氷の結晶パターン（より明確な白線）
    graphics.lineStyle(2, 0xFFFFFF, 0.9);
    
    // 氷の結晶線（横）- より少なく、より目立つ
    for (let y = this.blockSize * 0.25; y <= this.blockSize * 0.75; y += this.blockSize * 0.25) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.blockSize, y);
    }
    
    // 氷の結晶線（縦）- より少なく、より目立つ
    for (let x = this.blockSize * 0.25; x <= this.blockSize * 0.75; x += this.blockSize * 0.25) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.blockSize);
    }
    
    graphics.strokePath();
    
    // カウンターの背景（円形）- より明確に
    graphics.fillStyle(0xFFFFFF, 0.8);
    graphics.fillCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 2.5);
    
    // 枠線 - より太く
    graphics.lineStyle(3, 0x000000, 0.8);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, this.blockSize / 2.5);
    
    // プラス記号の装飾（カウンター+の場合）
    if (isPlus) {
      graphics.fillStyle(0x000000, 0.7);
      // プラス記号の横線
      graphics.fillRect(
        this.blockSize * 0.35, 
        this.blockSize * 0.48, 
        this.blockSize * 0.3, 
        this.blockSize * 0.04
      );
      // プラス記号の縦線
      graphics.fillRect(
        this.blockSize * 0.48, 
        this.blockSize * 0.35, 
        this.blockSize * 0.04, 
        this.blockSize * 0.3
      );
    }
    
    // 氷の輪郭を強調
    graphics.lineStyle(4, 0xADD8E6, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
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
    try {
      // 引数チェック
      if (!blockContainer || !blockContainer.scene || !blockContainer.scene.sys) {
        console.error('Invalid blockContainer provided to renderObstacleBlocks');
        return;
      }
      
      console.log(`Rendering obstacle blocks. Total blocks: ${blocks.length}`);
      
      // 既存のスプライトをクリア
      this.clearSprites();
      
      // 妨害ブロックを描画
      const obstacleBlocks = blocks.filter(block => this.obstacleBlockManager.isObstacleBlock(block.id));
      console.log(`Found ${obstacleBlocks.length} obstacle blocks to render`);
      
      obstacleBlocks.forEach(block => {
        try {
          console.log(`Rendering obstacle block: ${block.id}, type: ${block.type}, color: ${block.color}, position: (${block.x}, ${block.y})`);
          const sprite = this.createObstacleBlockSprite(block);
          if (sprite) {
            blockContainer.add(sprite);
            this.blockSprites.set(block.id, sprite);
          }
        } catch (error) {
          console.error(`Error creating obstacle block sprite for block ${block.id}:`, error);
        }
      });
    } catch (error) {
      console.error('Error in renderObstacleBlocks:', error);
    }
  }
  
  /**
   * 妨害ブロックスプライトを作成
   * 各妨害ブロックはブロック自体がその特性を持つ単一のエンティティとして描画
   */
  private createObstacleBlockSprite(block: Block): Phaser.GameObjects.Container | null {
    const renderInfo = this.obstacleBlockManager.getObstacleBlockRenderInfo(block.id);
    if (!renderInfo) return null;
    
    console.log(`Creating obstacle block: ${block.id}, type: ${block.type}, color: ${block.color}, renderInfo:`, renderInfo);
    
    // ブロックの座標
    const x = block.x * this.blockSize + this.blockSize / 2;
    const y = block.y * this.blockSize + this.blockSize / 2;
    
    // コンテナを作成
    const container = this.scene.add.container(x, y);
    
    // ブロックタイプに応じて描画方法を変更
    switch (renderInfo.overlayType) {
      case 'ice1':
      case 'ice2':
        // 氷結ブロック - ブロック自体が氷結している状態
        this.createIceBlockSprite(container, renderInfo);
        break;
        
      case 'iceCounterPlus':
      case 'iceCounter':
        // 氷結カウンターブロック - ブロック自体が氷結カウンター状態
        this.createIceCounterBlockSprite(container, renderInfo);
        break;
        
      case 'counterPlus':
      case 'counter':
        // カウンターブロック - ブロック自体がカウンター機能を持つ
        this.createCounterBlockSprite(container, renderInfo);
        break;
        
      case 'rock':
        // 岩ブロック - ブロック自体が岩である
        this.createRockBlockSprite(container);
        break;
        
      case 'steel':
        // 鋼鉄ブロック - ブロック自体が鋼鉄である
        this.createSteelBlockSprite(container);
        break;
        
      default:
        // 未知のタイプの場合はデフォルトブロック
        console.log(`Unknown obstacle block type: ${renderInfo.overlayType}`);
        const baseBlock = this.scene.add.rectangle(
          0, 0, this.blockSize - 4, this.blockSize - 4, 
          this.getColorValue(renderInfo.mainColor)
        );
        baseBlock.setStrokeStyle(2, 0x000000, 0.5);
        container.add(baseBlock);
        break;
    }
    
    // カウンター値のテキスト - より大きく、より目立つ
    if (renderInfo.text) {
      console.log(`Adding counter text: ${renderInfo.text}`);
      const text = this.scene.add.text(0, 0, renderInfo.text, {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#000000',
        stroke: '#FFFFFF',
        strokeThickness: 3,
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      container.add(text);
    }
    
    return container;
  }
  
  /**
   * 氷結ブロックスプライトを作成
   * ブロック自体が氷結している状態を表現
   */
  private createIceBlockSprite(container: Phaser.GameObjects.Container, renderInfo: any): void {
    // 氷結ブロックの色（ブロック自体の色）
    const colorValue = this.getColorValue(renderInfo.mainColor);
    const isIce2 = renderInfo.overlayType === 'ice2';
    
    console.log(`Creating ice block with color: ${renderInfo.mainColor}, colorValue: ${colorValue}, isIce2: ${isIce2}`);
    
    // 氷結ブロック - 完全に単一のブロックとして描画
    // 色付きのブロックをベースに、氷の質感を表現
    const iceBlock = this.scene.add.rectangle(
      0, 0, this.blockSize - 4, this.blockSize - 4, 
      colorValue
    );
    
    // 氷の質感を表現（半透明の青色オーバーレイではなく、色自体を青みがかった色に）
    const blendedColor = Phaser.Display.Color.ValueToColor(colorValue);
    const iceColor = Phaser.Display.Color.ValueToColor(0xADD8E6);
    const finalColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      blendedColor, 
      iceColor,
      100, 
      isIce2 ? 60 : 40 // 氷結Lv2はより青みが強い
    );
    
    console.log(`Ice block color blend - original: ${colorValue.toString(16)}, ice: 0xADD8E6, final: ${finalColor.color.toString(16)}`);
    
    iceBlock.setFillStyle(finalColor.color, 1); // 完全不透明
    iceBlock.setStrokeStyle(3, 0x87CEFA, 1);
    
    // 氷の結晶パターン
    const icePattern = this.scene.add.graphics();
    icePattern.clear();
    icePattern.lineStyle(2, 0xFFFFFF, 0.9);
    
    // 横線
    const lineCount = isIce2 ? 4 : 2; // 氷結Lv2はより多くの線
    const lineSpacing = (this.blockSize - 8) / (lineCount + 1);
    
    for (let i = 1; i <= lineCount; i++) {
      const y = -this.blockSize/2 + 4 + i * lineSpacing;
      icePattern.moveTo(-this.blockSize/2 + 4, y);
      icePattern.lineTo(this.blockSize/2 - 4, y);
    }
    
    // 縦線
    for (let i = 1; i <= lineCount; i++) {
      const x = -this.blockSize/2 + 4 + i * lineSpacing;
      icePattern.moveTo(x, -this.blockSize/2 + 4);
      icePattern.lineTo(x, this.blockSize/2 - 4);
    }
    
    icePattern.strokePath();
    
    // 氷結Lv2の場合は二重の輪郭
    if (isIce2) {
      const outerBorder = this.scene.add.rectangle(
        0, 0, this.blockSize, this.blockSize,
        0x000000, 0
      );
      outerBorder.setStrokeStyle(2, 0x87CEFA, 1);
      container.add(outerBorder);
    }
    
    console.log(`Adding ice block components to container: iceBlock, icePattern`);
    
    // コンテナに追加（色を示す小さな円は不要 - ブロック自体が色を持つ）
    container.add([iceBlock, icePattern]);
  }
  
  /**
   * カウンターブロックスプライトを作成
   * ブロック自体がカウンター機能を持つ状態を表現
   */
  private createCounterBlockSprite(container: Phaser.GameObjects.Container, renderInfo: any): void {
    // カウンターブロックの色（ブロック自体の色）
    const colorValue = this.getColorValue(renderInfo.mainColor);
    
    // カウンターブロック - 単一のブロックとして描画
    // 色付きのブロックをベースに
    const counterBlock = this.scene.add.rectangle(
      0, 0, this.blockSize - 4, this.blockSize - 4, 
      colorValue
    );
    counterBlock.setStrokeStyle(2, 0x000000, 0.5);
    
    // カウンターの円形部分 - ブロックの一部として描画
    const counterCircle = this.scene.add.circle(
      0, 0, this.blockSize / 3,
      0xFFFFFF, 0.9
    );
    counterCircle.setStrokeStyle(2, 0x000000, 1);
    
    // カウンター+の場合はプラス記号を追加
    const isPlus = renderInfo.overlayType === 'counterPlus';
    if (isPlus) {
      // プラス記号の横線
      const horizontalLine = this.scene.add.rectangle(
        0, 0, this.blockSize * 0.2, this.blockSize * 0.05,
        0x000000
      );
      
      // プラス記号の縦線
      const verticalLine = this.scene.add.rectangle(
        0, 0, this.blockSize * 0.05, this.blockSize * 0.2,
        0x000000
      );
      
      container.add([counterBlock, counterCircle, horizontalLine, verticalLine]);
    } else {
      container.add([counterBlock, counterCircle]);
    }
  }
  
  /**
   * 氷結カウンターブロックスプライトを作成
   * ブロック自体が氷結カウンター状態を表現
   */
  private createIceCounterBlockSprite(container: Phaser.GameObjects.Container, renderInfo: any): void {
    // 氷結カウンターブロックの色（ブロック自体の色）
    const colorValue = this.getColorValue(renderInfo.mainColor);
    
    console.log(`Creating ice counter block with color: ${renderInfo.mainColor}, colorValue: ${colorValue}`);
    
    // 氷結カウンターブロック - 完全に単一のブロックとして描画
    // 色付きのブロックをベースに、氷の質感を表現
    const iceCounterBlock = this.scene.add.rectangle(
      0, 0, this.blockSize - 4, this.blockSize - 4, 
      colorValue
    );
    
    // 氷の質感を表現（半透明の青色オーバーレイではなく、色自体を青みがかった色に）
    const blendedColor = Phaser.Display.Color.ValueToColor(colorValue);
    const iceColor = Phaser.Display.Color.ValueToColor(0xADD8E6);
    const finalColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      blendedColor, 
      iceColor,
      100, 
      50 // 50%の青みを加える
    );
    
    console.log(`Ice counter block color blend - original: ${colorValue.toString(16)}, ice: 0xADD8E6, final: ${finalColor.color.toString(16)}`);
    
    iceCounterBlock.setFillStyle(finalColor.color, 1); // 完全不透明
    iceCounterBlock.setStrokeStyle(3, 0x87CEFA, 1);
    
    // 氷の結晶パターン
    const icePattern = this.scene.add.graphics();
    icePattern.clear();
    icePattern.lineStyle(2, 0xFFFFFF, 0.9);
    
    // 横線
    for (let i = 1; i <= 2; i++) {
      const y = -this.blockSize/2 + 4 + i * (this.blockSize - 8) / 3;
      icePattern.moveTo(-this.blockSize/2 + 4, y);
      icePattern.lineTo(this.blockSize/2 - 4, y);
    }
    
    // 縦線
    for (let i = 1; i <= 2; i++) {
      const x = -this.blockSize/2 + 4 + i * (this.blockSize - 8) / 3;
      icePattern.moveTo(x, -this.blockSize/2 + 4);
      icePattern.lineTo(x, this.blockSize/2 - 4);
    }
    
    icePattern.strokePath();
    
    // カウンターの円形部分 - ブロックの一部として描画
    const counterCircle = this.scene.add.circle(
      0, 0, this.blockSize / 3.5,
      0xFFFFFF, 0.8
    );
    counterCircle.setStrokeStyle(2, 0x000000, 0.8);
    
    // カウンター+の場合はプラス記号を追加
    const isPlus = renderInfo.overlayType === 'iceCounterPlus';
    console.log(`Ice counter is plus type: ${isPlus}`);
    
    if (isPlus) {
      // プラス記号の横線
      const horizontalLine = this.scene.add.rectangle(
        0, 0, this.blockSize * 0.15, this.blockSize * 0.04,
        0x000000
      );
      
      // プラス記号の縦線
      const verticalLine = this.scene.add.rectangle(
        0, 0, this.blockSize * 0.04, this.blockSize * 0.15,
        0x000000
      );
      
      console.log(`Adding ice counter block components to container: iceCounterBlock, icePattern, counterCircle, horizontalLine, verticalLine`);
      container.add([iceCounterBlock, icePattern, counterCircle, horizontalLine, verticalLine]);
    } else {
      console.log(`Adding ice counter block components to container: iceCounterBlock, icePattern, counterCircle`);
      container.add([iceCounterBlock, icePattern, counterCircle]);
    }
  }
  
  /**
   * 岩ブロックスプライトを作成
   * ブロック自体が岩である状態を表現
   */
  private createRockBlockSprite(container: Phaser.GameObjects.Container): void {
    // 岩ブロックの基本形状
    const rockBlock = this.scene.add.rectangle(
      0, 0, this.blockSize - 4, this.blockSize - 4, 
      0x808080
    );
    rockBlock.setStrokeStyle(3, 0x606060, 1);
    
    // 岩の質感を表現するグラフィックス
    const rockTexture = this.scene.add.graphics();
    rockTexture.clear();
    
    // 亀裂パターン
    rockTexture.lineStyle(2, 0x606060, 1);
    
    // 中央から放射状の亀裂
    const centerX = 0;
    const centerY = 0;
    const cracks = 5;
    
    for (let i = 0; i < cracks; i++) {
      const angle = (Math.PI * 2 * i) / cracks;
      const length = this.blockSize / 2 - 6;
      const endX = centerX + Math.cos(angle) * length;
      const endY = centerY + Math.sin(angle) * length;
      
      rockTexture.moveTo(centerX, centerY);
      rockTexture.lineTo(endX, endY);
    }
    
    rockTexture.strokePath();
    
    // 岩の凹凸を表現する円
    const bumpCount = 8;
    for (let i = 0; i < bumpCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (this.blockSize / 3);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const radius = Math.random() * 3 + 2;
      
      const bump = this.scene.add.circle(x, y, radius, 0x606060);
      container.add(bump);
    }
    
    container.add([rockBlock, rockTexture]);
  }
  
  /**
   * 鋼鉄ブロックスプライトを作成
   * ブロック自体が鋼鉄である状態を表現
   */
  private createSteelBlockSprite(container: Phaser.GameObjects.Container): void {
    // 鋼鉄ブロックの基本形状
    const steelBlock = this.scene.add.rectangle(
      0, 0, this.blockSize - 4, this.blockSize - 4, 
      0xD0D0D0
    );
    steelBlock.setStrokeStyle(4, 0x808080, 1);
    
    // 金属光沢の表現
    const highlight = this.scene.add.rectangle(
      0, -this.blockSize/5, this.blockSize - 8, this.blockSize/4,
      0xFFFFFF, 0.5
    );
    
    // リベット（ネジ）
    const rivetSize = this.blockSize * 0.12;
    const rivetPositions = [
      { x: -this.blockSize/3, y: -this.blockSize/3 },
      { x: this.blockSize/3, y: -this.blockSize/3 },
      { x: -this.blockSize/3, y: this.blockSize/3 },
      { x: this.blockSize/3, y: this.blockSize/3 }
    ];
    
    // リベットを追加
    rivetPositions.forEach(pos => {
      const rivet = this.scene.add.circle(pos.x, pos.y, rivetSize, 0x606060);
      const rivetHighlight = this.scene.add.circle(
        pos.x - 1, pos.y - 1, rivetSize/2, 0xFFFFFF, 0.7
      );
      container.add([rivet, rivetHighlight]);
    });
    
    container.add([steelBlock, highlight]);
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
    try {
      this.blockSprites.forEach(sprite => {
        if (sprite && !sprite.destroyed) {
          sprite.destroy();
        }
      });
      this.blockSprites.clear();
    } catch (error) {
      console.error('Error clearing obstacle block sprites:', error);
    }
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
