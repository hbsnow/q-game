/**
 * 海をテーマにした妨害ブロック画像アセット生成
 */
export class ObstacleAssets {
  /**
   * カウンター+ブロック（海洋テーマ）
   */
  static createCounterPlusTexture(scene: Phaser.Scene, color: string, count: number): Phaser.Textures.Texture {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 基本色（少し暗めに）
    const baseColor = parseInt(color.replace('#', '0x'));
    const darkerColor = this.darkenColor(baseColor, 0.3);
    
    // グラデーション背景
    graphics.fillStyle(darkerColor, 1);
    graphics.fillRoundedRect(0, 0, blockSize, blockSize, 8);
    
    graphics.fillStyle(baseColor, 0.8);
    graphics.fillRoundedRect(2, 2, blockSize - 4, blockSize - 4, 6);
    
    // 海洋テーマの装飾（鎖のような模様）
    this.drawChainPattern(graphics, blockSize);
    
    // カウンター数字の背景（宝箱風）
    const centerX = blockSize / 2;
    const centerY = blockSize / 2;
    
    graphics.fillStyle(0x8B4513, 0.9); // 茶色（宝箱）
    graphics.fillRoundedRect(centerX - 8, centerY - 6, 16, 12, 3);
    
    graphics.lineStyle(1, 0xFFD700, 1); // 金色の縁
    graphics.strokeRoundedRect(centerX - 8, centerY - 6, 16, 12, 3);
    
    // 数字を描画
    const textStyle = {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    };
    
    const text = scene.add.text(centerX, centerY, count.toString(), textStyle);
    text.setOrigin(0.5, 0.5);
    
    // 枠線
    graphics.lineStyle(2, 0x4682B4, 0.8);
    graphics.strokeRoundedRect(0, 0, blockSize, blockSize, 8);
    
    const key = `counter_plus_${color.replace('#', '')}_${count}`;
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    rt.draw(text, 0, 0);
    
    graphics.destroy();
    text.destroy();
    
    return rt.texture;
  }
  
  /**
   * カウンター-ブロック（海洋テーマ）
   */
  static createCounterMinusTexture(scene: Phaser.Scene, color: string, count: number): Phaser.Textures.Texture {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 基本色（少し明るめに）
    const baseColor = parseInt(color.replace('#', '0x'));
    const lighterColor = this.lightenColor(baseColor, 0.3);
    
    // グラデーション背景
    graphics.fillStyle(lighterColor, 1);
    graphics.fillRoundedRect(0, 0, blockSize, blockSize, 8);
    
    graphics.fillStyle(baseColor, 0.8);
    graphics.fillRoundedRect(2, 2, blockSize - 4, blockSize - 4, 6);
    
    // 海洋テーマの装飾（波紋のような模様）
    this.drawRipplePattern(graphics, blockSize);
    
    // カウンター数字の背景（貝殻風）
    const centerX = blockSize / 2;
    const centerY = blockSize / 2;
    
    graphics.fillStyle(0xF5DEB3, 0.9); // ベージュ（貝殻）
    graphics.fillEllipse(centerX, centerY, 16, 12);
    
    graphics.lineStyle(1, 0xDEB887, 1); // 薄茶色の縁
    graphics.strokeEllipse(centerX, centerY, 16, 12);
    
    // 数字を描画
    const textStyle = {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#8B4513',
      fontStyle: 'bold'
    };
    
    const text = scene.add.text(centerX, centerY, count.toString(), textStyle);
    text.setOrigin(0.5, 0.5);
    
    // 枠線
    graphics.lineStyle(2, 0x20B2AA, 0.8); // ライトシーグリーン
    graphics.strokeRoundedRect(0, 0, blockSize, blockSize, 8);
    
    const key = `counter_minus_${color.replace('#', '')}_${count}`;
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    rt.draw(text, 0, 0);
    
    graphics.destroy();
    text.destroy();
    
    return rt.texture;
  }
  
  /**
   * 岩ブロック（海洋テーマ：海底の岩）
   */
  static createRockTexture(scene: Phaser.Scene): Phaser.Textures.Texture {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 岩の基本色（グレー系のグラデーション）
    const rockColors = [0x696969, 0x808080, 0x696969];
    
    // 不規則な岩の形を作成
    const points: { x: number; y: number }[] = [];
    const segments = 8;
    const centerX = blockSize / 2;
    const centerY = blockSize / 2;
    const baseRadius = blockSize * 0.4;
    
    for (let i = 0; i < segments; i++) {
      const angle = (Math.PI * 2 / segments) * i;
      const radiusVariation = 0.7 + Math.random() * 0.6; // ランダムな変化
      const radius = baseRadius * radiusVariation;
      
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    
    // 岩の形を描画
    graphics.fillStyle(rockColors[1], 1);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 岩の質感（ひび割れ模様）
    this.drawRockCracks(graphics, points, blockSize);
    
    // 海藻や貝殻の装飾
    this.drawSeaDecorations(graphics, blockSize);
    
    // 影とハイライト
    graphics.fillStyle(0x2F2F2F, 0.3);
    graphics.fillEllipse(centerX + 2, centerY + 2, blockSize * 0.6, blockSize * 0.4);
    
    graphics.fillStyle(0xD3D3D3, 0.4);
    graphics.fillEllipse(centerX - 3, centerY - 3, blockSize * 0.3, blockSize * 0.2);
    
    const key = 'rock_block';
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return rt.texture;
  }
  
  /**
   * 鋼鉄ブロック（海洋テーマ：沈没船の鉄片）
   */
  static createSteelTexture(scene: Phaser.Scene): Phaser.Textures.Texture {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 錆びた鉄の色
    const steelColors = [0x2F4F4F, 0x708090, 0x2F4F4F];
    
    // 基本の四角形
    graphics.fillStyle(steelColors[1], 1);
    graphics.fillRoundedRect(0, 0, blockSize, blockSize, 4);
    
    // 錆の模様
    this.drawRustPattern(graphics, blockSize);
    
    // リベット（鋲）の装飾
    this.drawRivets(graphics, blockSize);
    
    // 金属の光沢
    graphics.fillStyle(0xC0C0C0, 0.3);
    graphics.fillRoundedRect(2, 2, blockSize - 4, 8, 2);
    
    // 枠線（金属感）
    graphics.lineStyle(2, 0x2F4F4F, 1);
    graphics.strokeRoundedRect(0, 0, blockSize, blockSize, 4);
    
    const key = 'steel_block';
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return rt.texture;
  }
  
  /**
   * 鎖のパターンを描画
   */
  private static drawChainPattern(graphics: Phaser.GameObjects.Graphics, size: number): void {
    graphics.lineStyle(1, 0x4682B4, 0.6);
    
    const chainLinks = 3;
    const linkSize = size / (chainLinks + 1);
    
    for (let i = 0; i < chainLinks; i++) {
      const x = linkSize * (i + 1);
      const y = size / 2;
      
      // 鎖の輪
      graphics.strokeEllipse(x, y, linkSize * 0.3, linkSize * 0.2);
      
      if (i < chainLinks - 1) {
        // 鎖の連結部
        graphics.beginPath();
        graphics.moveTo(x + linkSize * 0.15, y);
        graphics.lineTo(x + linkSize * 0.85, y);
        graphics.strokePath();
      }
    }
  }
  
  /**
   * 波紋のパターンを描画
   */
  private static drawRipplePattern(graphics: Phaser.GameObjects.Graphics, size: number): void {
    const centerX = size / 2;
    const centerY = size / 2;
    const ripples = 3;
    
    for (let i = 0; i < ripples; i++) {
      const radius = (size / 2) * (0.3 + (i / ripples) * 0.4);
      const opacity = 0.4 - (i / ripples) * 0.2;
      
      graphics.lineStyle(1, 0x20B2AA, opacity);
      graphics.strokeCircle(centerX, centerY, radius);
    }
  }
  
  /**
   * 岩のひび割れを描画
   */
  private static drawRockCracks(graphics: Phaser.GameObjects.Graphics, points: { x: number; y: number }[], size: number): void {
    graphics.lineStyle(1, 0x2F2F2F, 0.8);
    
    // ランダムなひび割れ
    const cracks = 4;
    for (let i = 0; i < cracks; i++) {
      const startPoint = points[Math.floor(Math.random() * points.length)];
      const endX = startPoint.x + (Math.random() - 0.5) * size * 0.3;
      const endY = startPoint.y + (Math.random() - 0.5) * size * 0.3;
      
      graphics.beginPath();
      graphics.moveTo(startPoint.x, startPoint.y);
      graphics.lineTo(endX, endY);
      graphics.strokePath();
    }
  }
  
  /**
   * 海の装飾を描画
   */
  private static drawSeaDecorations(graphics: Phaser.GameObjects.Graphics, size: number): void {
    // 小さな貝殻
    graphics.fillStyle(0xF5DEB3, 0.7);
    graphics.fillEllipse(size * 0.2, size * 0.8, 4, 3);
    
    // 海藻の一部
    graphics.lineStyle(1, 0x228B22, 0.6);
    graphics.beginPath();
    graphics.moveTo(size * 0.8, size);
    
    // 曲線を複数の直線で近似
    const segments = 8;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const startX = size * 0.8;
      const startY = size;
      const controlX = size * 0.85;
      const controlY = size * 0.7;
      const endX = size * 0.9;
      const endY = size * 0.5;
      
      // ベジェ曲線の計算
      const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
      const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
      
      graphics.lineTo(x, y);
    }
    graphics.strokePath();
  }
  
  /**
   * 錆のパターンを描画
   */
  private static drawRustPattern(graphics: Phaser.GameObjects.Graphics, size: number): void {
    // 錆の斑点
    const rustSpots = 8;
    
    for (let i = 0; i < rustSpots; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const spotSize = 1 + Math.random() * 2;
      
      graphics.fillStyle(0xB22222, 0.4 + Math.random() * 0.3);
      graphics.fillCircle(x, y, spotSize);
    }
  }
  
  /**
   * リベット（鋲）を描画
   */
  private static drawRivets(graphics: Phaser.GameObjects.Graphics, size: number): void {
    const rivetPositions = [
      { x: size * 0.2, y: size * 0.2 },
      { x: size * 0.8, y: size * 0.2 },
      { x: size * 0.2, y: size * 0.8 },
      { x: size * 0.8, y: size * 0.8 }
    ];
    
    rivetPositions.forEach(pos => {
      // リベットの本体
      graphics.fillStyle(0x696969, 1);
      graphics.fillCircle(pos.x, pos.y, 2);
      
      // ハイライト
      graphics.fillStyle(0xC0C0C0, 0.8);
      graphics.fillCircle(pos.x - 0.5, pos.y - 0.5, 1);
    });
  }
  
  /**
   * 色を暗くする
   */
  private static darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xFF) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xFF) * (1 - factor));
    const b = Math.floor((color & 0xFF) * (1 - factor));
    
    return (r << 16) | (g << 8) | b;
  }
  
  /**
   * 色を明るくする
   */
  private static lightenColor(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xFF) * (1 + factor)));
    const g = Math.min(255, Math.floor(((color >> 8) & 0xFF) * (1 + factor)));
    const b = Math.min(255, Math.floor((color & 0xFF) * (1 + factor)));
    
    return (r << 16) | (g << 8) | b;
  }
}
