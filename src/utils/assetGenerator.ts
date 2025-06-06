import { BlockColor, BlockType } from '@/types';
import { COLOR_CODES, RARITY_COLORS } from '@/config/gameConfig';

/**
 * プレースホルダー素材生成クラス
 */
export class AssetGenerator {
  /**
   * ブロック用のテクスチャを生成
   */
  static generateBlockTexture(
    scene: Phaser.Scene, 
    color: BlockColor, 
    type: BlockType = 'normal',
    size: number = 40
  ): string {
    const textureKey = `block-${type}-${color}`;
    
    if (scene.textures.exists(textureKey)) {
      return textureKey;
    }
    
    const graphics = scene.add.graphics();
    const baseColor = Phaser.Display.Color.HexStringToColor(COLOR_CODES[color]);
    
    // 基本形状を描画
    this.drawBlockShape(graphics, type, baseColor, size);
    
    // テクスチャとして保存
    graphics.generateTexture(textureKey, size, size);
    graphics.destroy();
    
    return textureKey;
  }
  
  /**
   * ブロック形状を描画
   */
  private static drawBlockShape(
    graphics: Phaser.GameObjects.Graphics,
    type: BlockType,
    color: Phaser.Display.Color,
    size: number
  ): void {
    const margin = 2;
    const innerSize = size - margin * 2;
    
    graphics.clear();
    
    switch (type) {
      case 'normal':
        this.drawNormalBlock(graphics, color, margin, innerSize);
        break;
        
      case 'ice1':
        this.drawIceBlock(graphics, color, margin, innerSize, 1);
        break;
        
      case 'ice2':
        this.drawIceBlock(graphics, color, margin, innerSize, 2);
        break;
        
      case 'counter':
        this.drawCounterBlock(graphics, color, margin, innerSize, false);
        break;
        
      case 'counterPlus':
        this.drawCounterBlock(graphics, color, margin, innerSize, true);
        break;
        
      case 'rock':
        this.drawRockBlock(graphics, margin, innerSize);
        break;
        
      case 'steel':
        this.drawSteelBlock(graphics, margin, innerSize);
        break;
        
      default:
        this.drawNormalBlock(graphics, color, margin, innerSize);
    }
  }
  
  /**
   * 通常ブロックを描画
   */
  private static drawNormalBlock(
    graphics: Phaser.GameObjects.Graphics,
    color: Phaser.Display.Color,
    margin: number,
    size: number
  ): void {
    // 基本色で塗りつぶし
    graphics.fillStyle(color.color);
    graphics.fillRoundedRect(margin, margin, size, size, 4);
    
    // ハイライト
    graphics.fillStyle(Phaser.Display.Color.GetColor(
      Math.min(255, color.red + 40),
      Math.min(255, color.green + 40),
      Math.min(255, color.blue + 40)
    ));
    graphics.fillRoundedRect(margin + 2, margin + 2, size - 4, size - 8, 2);
    
    // 枠線
    graphics.lineStyle(1, 0x000000, 0.3);
    graphics.strokeRoundedRect(margin, margin, size, size, 4);
  }
  
  /**
   * 氷結ブロックを描画
   */
  private static drawIceBlock(
    graphics: Phaser.GameObjects.Graphics,
    color: Phaser.Display.Color,
    margin: number,
    size: number,
    level: number
  ): void {
    // 基本ブロック
    this.drawNormalBlock(graphics, color, margin, size);
    
    // 氷のオーバーレイ
    const iceAlpha = level === 1 ? 0.6 : 0.8;
    graphics.fillStyle(0x87CEEB, iceAlpha);
    graphics.fillRoundedRect(margin, margin, size, size, 4);
    
    // 氷の結晶マーク
    graphics.lineStyle(2, 0xFFFFFF, 0.8);
    const centerX = margin + size / 2;
    const centerY = margin + size / 2;
    const crystalSize = 6;
    
    // 雪の結晶パターン
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x1 = centerX + Math.cos(angle) * crystalSize;
      const y1 = centerY + Math.sin(angle) * crystalSize;
      const x2 = centerX - Math.cos(angle) * crystalSize;
      const y2 = centerY - Math.sin(angle) * crystalSize;
      
      graphics.lineBetween(x1, y1, x2, y2);
    }
  }
  
  /**
   * カウンターブロックを描画
   */
  private static drawCounterBlock(
    graphics: Phaser.GameObjects.Graphics,
    color: Phaser.Display.Color,
    margin: number,
    size: number,
    isPlus: boolean
  ): void {
    // 基本ブロック
    this.drawNormalBlock(graphics, color, margin, size);
    
    // カウンター背景
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillCircle(margin + size / 2, margin + size / 2, size / 3);
    
    // 数字は実際のゲームで動的に描画
    // ここではプレースホルダーとして「?」を表示
    const centerX = margin + size / 2;
    const centerY = margin + size / 2;
    
    // プラス記号（カウンター+の場合）
    if (isPlus) {
      graphics.lineStyle(2, 0xFFFFFF);
      graphics.lineBetween(centerX - 4, centerY + 8, centerX + 4, centerY + 8);
      graphics.lineBetween(centerX, centerY + 4, centerX, centerY + 12);
    }
  }
  
  /**
   * 岩ブロックを描画
   */
  private static drawRockBlock(
    graphics: Phaser.GameObjects.Graphics,
    margin: number,
    size: number
  ): void {
    // 岩の基本色
    graphics.fillStyle(0x696969);
    graphics.fillRoundedRect(margin, margin, size, size, 2);
    
    // 岩のテクスチャ
    graphics.fillStyle(0x808080);
    graphics.fillCircle(margin + size * 0.3, margin + size * 0.3, 3);
    graphics.fillCircle(margin + size * 0.7, margin + size * 0.6, 2);
    graphics.fillCircle(margin + size * 0.5, margin + size * 0.8, 2);
    
    // 影
    graphics.fillStyle(0x2F2F2F);
    graphics.fillRoundedRect(margin + 2, margin + size - 6, size - 4, 4, 1);
    
    // 枠線
    graphics.lineStyle(1, 0x000000, 0.5);
    graphics.strokeRoundedRect(margin, margin, size, size, 2);
  }
  
  /**
   * 鋼鉄ブロックを描画
   */
  private static drawSteelBlock(
    graphics: Phaser.GameObjects.Graphics,
    margin: number,
    size: number
  ): void {
    // 鋼鉄の基本色
    graphics.fillStyle(0xC0C0C0);
    graphics.fillRoundedRect(margin, margin, size, size, 1);
    
    // メタリック効果
    graphics.fillStyle(0xE0E0E0);
    graphics.fillRoundedRect(margin + 2, margin + 2, size - 4, size / 2 - 2, 1);
    
    // リベット
    graphics.fillStyle(0x808080);
    graphics.fillCircle(margin + 6, margin + 6, 2);
    graphics.fillCircle(margin + size - 6, margin + 6, 2);
    graphics.fillCircle(margin + 6, margin + size - 6, 2);
    graphics.fillCircle(margin + size - 6, margin + size - 6, 2);
    
    // 枠線
    graphics.lineStyle(1, 0x000000, 0.3);
    graphics.strokeRoundedRect(margin, margin, size, size, 1);
  }
  
  /**
   * アイテムアイコンを生成
   */
  static generateItemIcon(
    scene: Phaser.Scene,
    itemType: string,
    rarity: string,
    size: number = 32
  ): string {
    const textureKey = `item-${itemType}`;
    
    if (scene.textures.exists(textureKey)) {
      return textureKey;
    }
    
    const graphics = scene.add.graphics();
    
    // レア度に応じた背景色
    const rarityColor = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#FFFFFF';
    const bgColor = Phaser.Display.Color.HexStringToColor(rarityColor);
    
    // 背景
    graphics.fillStyle(bgColor.color, 0.8);
    graphics.fillRoundedRect(0, 0, size, size, 4);
    
    // アイテム固有のアイコン（簡易版）
    graphics.fillStyle(0x000000);
    this.drawItemSymbol(graphics, itemType, size);
    
    // 枠線
    graphics.lineStyle(2, bgColor.color);
    graphics.strokeRoundedRect(0, 0, size, size, 4);
    
    graphics.generateTexture(textureKey, size, size);
    graphics.destroy();
    
    return textureKey;
  }
  
  /**
   * アイテムシンボルを描画
   */
  private static drawItemSymbol(
    graphics: Phaser.GameObjects.Graphics,
    itemType: string,
    size: number
  ): void {
    const center = size / 2;
    
    switch (itemType) {
      case 'bomb':
        // 爆弾アイコン
        graphics.fillCircle(center, center, size * 0.3);
        graphics.fillRect(center - 1, center - size * 0.4, 2, size * 0.2);
        break;
        
      case 'hammer':
        // ハンマーアイコン
        graphics.fillRect(center - 2, center - size * 0.3, 4, size * 0.6);
        graphics.fillRect(center - size * 0.2, center - size * 0.3, size * 0.4, size * 0.2);
        break;
        
      case 'swap':
        // スワップアイコン（矢印）
        graphics.fillTriangle(
          center - size * 0.2, center - size * 0.1,
          center - size * 0.2, center + size * 0.1,
          center - size * 0.3, center
        );
        graphics.fillTriangle(
          center + size * 0.2, center - size * 0.1,
          center + size * 0.2, center + size * 0.1,
          center + size * 0.3, center
        );
        break;
        
      default:
        // デフォルトアイコン（？マーク）
        graphics.fillCircle(center, center, size * 0.3);
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(center, center, size * 0.2);
    }
  }
}
