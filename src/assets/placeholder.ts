/**
 * プレースホルダー用のアセット生成ユーティリティ
 * 実際の画像アセットが用意されるまでの仮実装
 */
export class PlaceholderAssets {
  /**
   * 単色のブロック画像を生成
   */
  static createBlockTexture(scene: Phaser.Scene, color: string): Phaser.Textures.Texture {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 塗りつぶし
    graphics.fillStyle(parseInt(color.replace('#', '0x')), 1);
    graphics.fillRoundedRect(0, 0, blockSize, blockSize, 8);
    
    // 枠線
    graphics.lineStyle(2, 0xFFFFFF, 0.5);
    graphics.strokeRoundedRect(0, 0, blockSize, blockSize, 8);
    
    // テクスチャとして保存
    const key = `block_${color.replace('#', '')}`;
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return rt.texture;
  }
  
  /**
   * 氷結ブロック用のテクスチャを生成
   */
  static createIceBlockTexture(scene: Phaser.Scene, color: string, level: number): Phaser.Textures.Texture {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 基本の色（氷の青色と元の色をブレンド）
    const baseColor = parseInt(color.replace('#', '0x'));
    
    // 塗りつぶし
    graphics.fillStyle(baseColor, 0.7);
    graphics.fillRoundedRect(0, 0, blockSize, blockSize, 8);
    
    // 氷のエフェクト
    graphics.lineStyle(1, 0xADDEFF, 0.8);
    
    // 氷のレベルに応じたエフェクト
    if (level === 1) {
      // Lv1は薄い氷
      for (let i = 0; i < 3; i++) {
        graphics.strokeRoundedRect(5 + i * 2, 5 + i * 2, blockSize - 10 - i * 4, blockSize - 10 - i * 4, 5);
      }
    } else {
      // Lv2は厚い氷
      for (let i = 0; i < 5; i++) {
        graphics.strokeRoundedRect(3 + i * 2, 3 + i * 2, blockSize - 6 - i * 4, blockSize - 6 - i * 4, 5);
      }
      
      // 雪の結晶マーク
      graphics.lineStyle(2, 0xFFFFFF, 0.9);
      const cx = blockSize / 2;
      const cy = blockSize / 2;
      const size = 8;
      
      // 十字
      graphics.beginPath();
      graphics.moveTo(cx - size, cy);
      graphics.lineTo(cx + size, cy);
      graphics.moveTo(cx, cy - size);
      graphics.lineTo(cx, cy + size);
      graphics.closePath();
      graphics.strokePath();
      
      // X字
      graphics.beginPath();
      graphics.moveTo(cx - size * 0.7, cy - size * 0.7);
      graphics.lineTo(cx + size * 0.7, cy + size * 0.7);
      graphics.moveTo(cx + size * 0.7, cy - size * 0.7);
      graphics.lineTo(cx - size * 0.7, cy + size * 0.7);
      graphics.closePath();
      graphics.strokePath();
    }
    
    // 枠線
    graphics.lineStyle(2, 0xADDEFF, 1);
    graphics.strokeRoundedRect(0, 0, blockSize, blockSize, 8);
    
    // テクスチャとして保存
    const key = `ice_${level}_${color.replace('#', '')}`;
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return rt.texture;
  }
}
