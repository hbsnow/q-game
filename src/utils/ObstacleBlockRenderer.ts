import * as Phaser from 'phaser';
import { Block, BlockColor } from '../types';
import { ObstacleBlockManager } from './ObstacleBlockManager';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * 妨害ブロック描画クラス
 * 
 * 重要な原則:
 * - 単一エンティティの原則: 妨害ブロックは「オーバーレイ」ではなく「単一のエンティティ」
 * - マス占有の原則: 1つのマスには1種類のブロックのみ存在する
 * - 視覚的一貫性: 妨害ブロックは見た目でも単一のブロックとして表現
 */
export class ObstacleBlockRenderer {
  private scene: Phaser.Scene;
  private obstacleBlockManager: ObstacleBlockManager;
  private blockSize: number;
  private blockSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private textures: Map<string, Phaser.Textures.Texture> = new Map();
  
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
    this.createIce1Texture();
    this.createIce2Texture();
    this.createCounterTexture();
    this.createCounterPlusTexture();
    this.createRockTexture();
    this.createSteelTexture();
    this.createIceCounterTexture();
    this.createIceCounterPlusTexture();
  }
  
  /**
   * 氷結Lv1テクスチャを生成
   */
  private createIce1Texture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 基本形状
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 氷の結晶パターン
    graphics.lineStyle(2, 0x87CEFA, 0.8);
    
    // 横線
    for (let i = 1; i <= 2; i++) {
      const y = i * (this.blockSize / 3);
      graphics.moveTo(0, y);
      graphics.lineTo(this.blockSize, y);
    }
    
    // 縦線
    for (let i = 1; i <= 2; i++) {
      const x = i * (this.blockSize / 3);
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.blockSize);
    }
    
    graphics.strokePath();
    
    // 輪郭
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture('ice1Texture', this.blockSize, this.blockSize);
    graphics.destroy();
  }
  
  /**
   * 氷結Lv2テクスチャを生成
   */
  private createIce2Texture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 基本形状
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 氷の結晶パターン（より密集）
    graphics.lineStyle(3, 0x87CEFA, 0.9);
    
    // 横線
    for (let i = 1; i <= 3; i++) {
      const y = i * (this.blockSize / 4);
      graphics.moveTo(0, y);
      graphics.lineTo(this.blockSize, y);
    }
    
    // 縦線
    for (let i = 1; i <= 3; i++) {
      const x = i * (this.blockSize / 4);
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.blockSize);
    }
    
    graphics.strokePath();
    
    // 二重の輪郭
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    graphics.lineStyle(1, 0x87CEFA, 1);
    graphics.strokeRect(3, 3, this.blockSize - 6, this.blockSize - 6);
    
    // テクスチャとして保存
    graphics.generateTexture('ice2Texture', this.blockSize, this.blockSize);
    graphics.destroy();
  }
  
  /**
   * カウンターテクスチャを生成
   */
  private createCounterTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 基本形状
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // カウンターの円形部分
    const circleRadius = this.blockSize * 0.35;
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, circleRadius);
    
    // 輪郭
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture('counterTexture', this.blockSize, this.blockSize);
    graphics.destroy();
  }
  
  /**
   * カウンター+テクスチャを生成
   */
  private createCounterPlusTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 基本形状
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // カウンターの円形部分
    const circleRadius = this.blockSize * 0.35;
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, circleRadius);
    
    // プラス記号
    const lineLength = circleRadius * 0.7;
    
    // 横線
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(
      this.blockSize / 2 - lineLength / 2,
      this.blockSize / 2 - 2,
      lineLength,
      4
    );
    
    // 縦線
    graphics.fillRect(
      this.blockSize / 2 - 2,
      this.blockSize / 2 - lineLength / 2,
      4,
      lineLength
    );
    
    // 輪郭
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture('counterPlusTexture', this.blockSize, this.blockSize);
    graphics.destroy();
  }
  
  /**
   * 岩ブロックテクスチャを生成
   */
  private createRockTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 基本形状
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 岩の質感（亀裂）
    graphics.lineStyle(2, 0x606060, 1);
    
    // 中央から放射状の亀裂
    const centerX = this.blockSize / 2;
    const centerY = this.blockSize / 2;
    const cracks = 5;
    
    for (let i = 0; i < cracks; i++) {
      const angle = (Math.PI * 2 * i) / cracks;
      const length = this.blockSize * 0.4;
      const endX = centerX + Math.cos(angle) * length;
      const endY = centerY + Math.sin(angle) * length;
      
      graphics.moveTo(centerX, centerY);
      graphics.lineTo(endX, endY);
    }
    
    graphics.strokePath();
    
    // 岩の凹凸表現
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * this.blockSize;
      const y = Math.random() * this.blockSize;
      const radius = Math.random() * 3 + 2;
      
      graphics.fillStyle(0x606060, 0.8);
      graphics.fillCircle(x, y, radius);
    }
    
    // 輪郭
    graphics.lineStyle(3, 0x606060, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture('rockTexture', this.blockSize, this.blockSize);
    graphics.destroy();
  }
  
  /**
   * 鋼鉄ブロックテクスチャを生成
   */
  private createSteelTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 基本形状
    graphics.fillStyle(0xC0C0C0, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 金属光沢
    graphics.fillStyle(0xFFFFFF, 0.5);
    graphics.fillRect(
      this.blockSize * 0.1,
      this.blockSize * 0.1,
      this.blockSize * 0.8,
      this.blockSize * 0.2
    );
    
    // リベット（ネジ）
    const rivetSize = this.blockSize * 0.12;
    const rivetPositions = [
      { x: this.blockSize * 0.2, y: this.blockSize * 0.2 },
      { x: this.blockSize * 0.8, y: this.blockSize * 0.2 },
      { x: this.blockSize * 0.2, y: this.blockSize * 0.8 },
      { x: this.blockSize * 0.8, y: this.blockSize * 0.8 }
    ];
    
    rivetPositions.forEach(pos => {
      graphics.fillStyle(0x606060, 1);
      graphics.fillCircle(pos.x, pos.y, rivetSize);
      
      graphics.fillStyle(0xFFFFFF, 0.7);
      graphics.fillCircle(pos.x - 1, pos.y - 1, rivetSize * 0.4);
    });
    
    // 輪郭
    graphics.lineStyle(3, 0x808080, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture('steelTexture', this.blockSize, this.blockSize);
    graphics.destroy();
  }
  
  /**
   * 氷結カウンターテクスチャを生成
   */
  private createIceCounterTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 基本形状
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 氷の結晶パターン
    graphics.lineStyle(2, 0x87CEFA, 0.8);
    
    // 横線
    for (let i = 1; i <= 2; i++) {
      const y = i * (this.blockSize / 3);
      graphics.moveTo(0, y);
      graphics.lineTo(this.blockSize, y);
    }
    
    // 縦線
    for (let i = 1; i <= 2; i++) {
      const x = i * (this.blockSize / 3);
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.blockSize);
    }
    
    graphics.strokePath();
    
    // カウンターの円形部分
    const circleRadius = this.blockSize * 0.3;
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, circleRadius);
    
    // 輪郭
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture('iceCounterTexture', this.blockSize, this.blockSize);
    graphics.destroy();
  }
  
  /**
   * 氷結カウンター+テクスチャを生成
   */
  private createIceCounterPlusTexture(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // 基本形状
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRect(0, 0, this.blockSize, this.blockSize);
    
    // 氷の結晶パターン
    graphics.lineStyle(2, 0x87CEFA, 0.8);
    
    // 横線
    for (let i = 1; i <= 2; i++) {
      const y = i * (this.blockSize / 3);
      graphics.moveTo(0, y);
      graphics.lineTo(this.blockSize, y);
    }
    
    // 縦線
    for (let i = 1; i <= 2; i++) {
      const x = i * (this.blockSize / 3);
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.blockSize);
    }
    
    graphics.strokePath();
    
    // カウンターの円形部分
    const circleRadius = this.blockSize * 0.3;
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(this.blockSize / 2, this.blockSize / 2, circleRadius);
    
    // プラス記号
    const lineLength = circleRadius * 0.7;
    
    // 横線
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(
      this.blockSize / 2 - lineLength / 2,
      this.blockSize / 2 - 2,
      lineLength,
      4
    );
    
    // 縦線
    graphics.fillRect(
      this.blockSize / 2 - 2,
      this.blockSize / 2 - lineLength / 2,
      4,
      lineLength
    );
    
    // 輪郭
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, this.blockSize, this.blockSize);
    
    // テクスチャとして保存
    graphics.generateTexture('iceCounterPlusTexture', this.blockSize, this.blockSize);
    graphics.destroy();
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
      
      // アスキーアートでブロック位置を出力（デバッグ用）
      this.printBlockPositionsAsAsciiArt(blocks);
      
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
   * アスキーアートでブロック位置を出力（デバッグ用）
   * @param blocks 全ブロック配列
   */
  private printBlockPositionsAsAsciiArt(blocks: Block[]): void {
    // ボードのサイズを取得（最大のx, y座標 + 1）
    const maxX = Math.max(...blocks.map(b => b.x)) + 1;
    const maxY = Math.max(...blocks.map(b => b.y)) + 1;
    
    // 出力用の文字列を構築
    let output = '=== BLOCK POSITIONS (ASCII ART) ===\n';
    output += `Board size: ${maxX}x${maxY}\n`;
    
    // ブロックタイプを表す文字を定義
    const typeChars: Record<string, string> = {
      'normal': '□',
      'ice1': '❄',
      'ice2': '❅',
      'counter': 'cR',
      'counterPlus': 'c+R',
      'rock': '◆',
      'steel': '■',
      'iceCounter': '❄cR',
      'iceCounterPlus': '❄c+R'
    };
    
    // 色を表す文字を定義
    const colorChars: Record<string, string> = {
      'blue': 'B',
      'lightBlue': 'L',
      'seaGreen': 'G',
      'coralRed': 'R',
      'sandGold': 'Y',
      'pearlWhite': 'W'
    };
    
    // 2次元配列を作成して初期化
    const grid: string[][] = Array(maxY).fill(null).map(() => Array(maxX).fill('  '));
    
    // ブロックを配置
    blocks.forEach(block => {
      const typeChar = typeChars[block.type] || '?';
      const colorChar = colorChars[block.color] || '?';
      grid[block.y][block.x] = `${typeChar}${colorChar}`;
    });
    
    // ヘッダー行（列番号）を出力
    let header = '   ';
    for (let x = 0; x < maxX; x++) {
      header += ` ${String.fromCharCode(97 + x)} `;
    }
    output += header + '\n';
    
    // 区切り線
    output += '   ' + '---'.repeat(maxX) + '\n';
    
    // グリッドを出力
    for (let y = 0; y < maxY; y++) {
      let row = `${y.toString().padStart(2)}|`;
      for (let x = 0; x < maxX; x++) {
        row += ` ${grid[y][x]} `;
      }
      output += row + '\n';
    }
    
    output += '=== END OF BLOCK POSITIONS ===';
    
    // 1回のconsole.logで出力
    console.log(output);
  }
  
  /**
   * 妨害ブロックスプライトを作成
   * 各妨害ブロックは単一のエンティティとして描画
   */
  private createObstacleBlockSprite(block: Block): Phaser.GameObjects.Container | null {
    const renderInfo = this.obstacleBlockManager.getObstacleBlockRenderInfo(block.id);
    if (!renderInfo) return null;
    
    console.log(`Creating obstacle block sprite: ${block.id}, type: ${block.type}, renderInfo:`, renderInfo);
    
    // ブロックの座標（GameSceneと同じ計算方法を使用）
    const boardPixelWidth = 10 * this.blockSize; // BOARD_WIDTH * BLOCK_SIZE
    const startX = (this.scene.scale.width - boardPixelWidth) / 2;
    const startY = 75; // BOARD_OFFSET_Y
    
    const x = startX + block.x * this.blockSize + this.blockSize / 2;
    const y = startY + block.y * this.blockSize + this.blockSize / 2;
    
    // コンテナを作成
    const container = this.scene.add.container(x, y);
    
    // テクスチャを使用してスプライトを作成
    const sprite = this.scene.add.sprite(0, 0, renderInfo.textureKey);
    
    // 色を適用（ティント）
    if (renderInfo.tint) {
      sprite.setTint(renderInfo.tint);
    }
    
    container.add(sprite);
    
    // カウンター値のテキスト
    if (renderInfo.text) {
      console.log(`Adding counter text: ${renderInfo.text}`);
      const text = this.scene.add.text(0, 0, renderInfo.text, {
        fontFamily: 'Arial',
        fontSize: '24px',
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
    
    // テクスチャを破棄
    this.textures.forEach(texture => {
      if (texture && this.scene.textures.exists(texture.key)) {
        this.scene.textures.remove(texture.key);
      }
    });
    this.textures.clear();
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
