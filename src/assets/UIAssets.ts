/**
 * 海をテーマにしたUI要素アセット生成
 */
export class UIAssets {
  /**
   * 海洋テーマのボタンを生成
   */
  static createOceanButton(
    scene: Phaser.Scene, 
    width: number, 
    height: number, 
    type: 'primary' | 'secondary' | 'danger' | 'success' = 'primary'
  ): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    // ボタンタイプ別の色設定
    const buttonThemes = {
      primary: {
        gradient: [0x1E88E5, 0x42A5F5, 0x1E88E5],
        border: 0x0D47A1,
        highlight: 0x64B5F6
      },
      secondary: {
        gradient: [0x26A69A, 0x4DB6AC, 0x26A69A],
        border: 0x00695C,
        highlight: 0x80CBC4
      },
      danger: {
        gradient: [0xE53935, 0xEF5350, 0xE53935],
        border: 0xB71C1C,
        highlight: 0xEF9A9A
      },
      success: {
        gradient: [0x43A047, 0x66BB6A, 0x43A047],
        border: 0x1B5E20,
        highlight: 0xA5D6A7
      }
    };
    
    const theme = buttonThemes[type];
    
    // グラデーション背景
    this.createButtonGradient(graphics, width, height, theme.gradient);
    
    // 海洋装飾
    this.addOceanButtonDecorations(graphics, width, height, type);
    
    // ボタンの枠線
    graphics.lineStyle(2, theme.border, 1);
    graphics.strokeRoundedRect(1, 1, width - 2, height - 2, 8);
    
    // ハイライト効果
    graphics.lineStyle(1, theme.highlight, 0.6);
    graphics.strokeRoundedRect(3, 3, width - 6, height * 0.3, 6);
    
    const key = `ocean_button_${type}_${width}x${height}`;
    const rt = scene.add.renderTexture(0, 0, width, height);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return rt.texture;
  }
  
  /**
   * 海洋テーマの背景を生成
   */
  static createOceanBackground(scene: Phaser.Scene, width: number, height: number): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    // 深海のグラデーション
    const oceanDepths = [
      { color: 0x001122, position: 0 },      // 深海
      { color: 0x003366, position: 0.3 },    // 中層
      { color: 0x0066AA, position: 0.7 },    // 浅海
      { color: 0x87CEEB, position: 1 }       // 水面近く
    ];
    
    // 縦方向のグラデーション
    const steps = 20;
    const stepHeight = height / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const color = this.interpolateOceanColor(oceanDepths, ratio);
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, i * stepHeight, width, stepHeight + 1);
    }
    
    // 海洋エフェクトを追加
    this.addOceanEffects(graphics, width, height);
    
    const key = `ocean_background_${width}x${height}`;
    const rt = scene.add.renderTexture(0, 0, width, height);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return rt.texture;
  }
  
  /**
   * アイテム枠（装備枠）を生成
   */
  static createItemFrame(
    scene: Phaser.Scene, 
    size: number, 
    frameType: 'special' | 'normal' | 'empty' = 'normal'
  ): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    const frameThemes = {
      special: {
        background: 0xFFD700,  // 金色
        border: 0xB8860B,      // ダークゴールド
        decoration: 0xFFFACD,  // レモンシフォン
        glow: 0xFFFF00         // 黄色
      },
      normal: {
        background: 0x4682B4,  // スチールブルー
        border: 0x2F4F4F,      // ダークスレートグレー
        decoration: 0x87CEEB,  // スカイブルー
        glow: 0x00BFFF         // ディープスカイブルー
      },
      empty: {
        background: 0x696969,  // グレー
        border: 0x2F2F2F,      // ダークグレー
        decoration: 0xA9A9A9,  // ダークグレー
        glow: 0xD3D3D3         // ライトグレー
      }
    };
    
    const theme = frameThemes[frameType];
    
    // 背景
    graphics.fillStyle(theme.background, 0.3);
    graphics.fillRoundedRect(0, 0, size, size, 8);
    
    // 装飾的な枠
    if (frameType === 'special') {
      this.drawSpecialFrameDecorations(graphics, size, theme);
    } else {
      this.drawNormalFrameDecorations(graphics, size, theme);
    }
    
    // メインの枠線
    graphics.lineStyle(3, theme.border, 1);
    graphics.strokeRoundedRect(1.5, 1.5, size - 3, size - 3, 6);
    
    // 内側のハイライト
    graphics.lineStyle(1, theme.decoration, 0.8);
    graphics.strokeRoundedRect(4, 4, size - 8, size - 8, 4);
    
    // 空の枠の場合は点線を追加
    if (frameType === 'empty') {
      this.drawDashedBorder(graphics, size);
    }
    
    const key = `item_frame_${frameType}_${size}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return rt.texture;
  }
  
  /**
   * ガチャ宝箱を生成
   */
  static createTreasureChest(scene: Phaser.Scene, size: number, isOpen: boolean = false): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    const chestWidth = size * 0.8;
    const chestHeight = size * 0.6;
    const x = (size - chestWidth) / 2;
    const y = (size - chestHeight) / 2;
    
    if (isOpen) {
      this.drawOpenChest(graphics, x, y, chestWidth, chestHeight);
    } else {
      this.drawClosedChest(graphics, x, y, chestWidth, chestHeight);
    }
    
    // 宝箱の装飾
    this.addChestDecorations(graphics, x, y, chestWidth, chestHeight);
    
    const key = `treasure_chest_${size}_${isOpen ? 'open' : 'closed'}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return rt.texture;
  }
  
  /**
   * ボタンのグラデーションを作成
   */
  private static createButtonGradient(graphics: Phaser.GameObjects.Graphics, width: number, height: number, colors: number[]): void {
    const steps = 10;
    const stepHeight = height / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      let color: number;
      
      if (ratio <= 0.5) {
        const localRatio = ratio * 2;
        color = this.interpolateColor(colors[0], colors[1], localRatio);
      } else {
        const localRatio = (ratio - 0.5) * 2;
        color = this.interpolateColor(colors[1], colors[2], localRatio);
      }
      
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(0, i * stepHeight, width, stepHeight + 1, i === 0 ? 8 : 0);
    }
  }
  
  /**
   * ボタンの海洋装飾を追加
   */
  private static addOceanButtonDecorations(graphics: Phaser.GameObjects.Graphics, width: number, height: number, type: string): void {
    // 小さな泡のエフェクト
    const bubbles = Math.floor(width / 20);
    
    for (let i = 0; i < bubbles; i++) {
      const x = (width / (bubbles + 1)) * (i + 1);
      const y = height * 0.3;
      const radius = 1 + Math.random() * 1.5;
      
      graphics.fillStyle(0xFFFFFF, 0.3);
      graphics.fillCircle(x, y, radius);
      
      graphics.lineStyle(0.5, 0xFFFFFF, 0.6);
      graphics.strokeCircle(x, y, radius);
    }
  }
  
  /**
   * 海洋背景エフェクトを追加
   */
  private static addOceanEffects(graphics: Phaser.GameObjects.Graphics, width: number, height: number): void {
    // 光の筋（太陽光が水中に差し込む効果）
    const lightRays = 5;
    
    for (let i = 0; i < lightRays; i++) {
      const x = (width / lightRays) * i + Math.random() * (width / lightRays);
      const rayWidth = 20 + Math.random() * 30;
      
      graphics.fillStyle(0xFFFFFF, 0.05 + Math.random() * 0.05);
      graphics.fillTriangle(
        x, 0,
        x - rayWidth / 2, height,
        x + rayWidth / 2, height
      );
    }
    
    // 浮遊する粒子（プランクトンや小さな泡）
    const particles = 30;
    
    for (let i = 0; i < particles; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 0.5 + Math.random() * 1.5;
      const opacity = 0.1 + Math.random() * 0.2;
      
      graphics.fillStyle(0xFFFFFF, opacity);
      graphics.fillCircle(x, y, size);
    }
  }
  
  /**
   * 特殊枠の装飾
   */
  private static drawSpecialFrameDecorations(graphics: Phaser.GameObjects.Graphics, size: number, theme: any): void {
    // 角の装飾（星型）
    const corners = [
      { x: 8, y: 8 },
      { x: size - 8, y: 8 },
      { x: 8, y: size - 8 },
      { x: size - 8, y: size - 8 }
    ];
    
    corners.forEach(corner => {
      this.drawStar(graphics, corner.x, corner.y, 4, theme.decoration);
    });
    
    // 光るエフェクト
    graphics.fillStyle(theme.glow, 0.2);
    graphics.fillRoundedRect(2, 2, size - 4, size - 4, 6);
  }
  
  /**
   * 通常枠の装飾
   */
  private static drawNormalFrameDecorations(graphics: Phaser.GameObjects.Graphics, size: number, theme: any): void {
    // シンプルな角の装飾
    const cornerSize = 6;
    const corners = [
      { x: cornerSize, y: cornerSize },
      { x: size - cornerSize, y: cornerSize },
      { x: cornerSize, y: size - cornerSize },
      { x: size - cornerSize, y: size - cornerSize }
    ];
    
    graphics.fillStyle(theme.decoration, 0.6);
    corners.forEach(corner => {
      graphics.fillCircle(corner.x, corner.y, 2);
    });
  }
  
  /**
   * 点線の枠を描画
   */
  private static drawDashedBorder(graphics: Phaser.GameObjects.Graphics, size: number): void {
    graphics.lineStyle(2, 0xA9A9A9, 0.8);
    
    const dashLength = 8;
    const gapLength = 4;
    const perimeter = (size - 6) * 4;
    const totalDashGap = dashLength + gapLength;
    const dashCount = Math.floor(perimeter / totalDashGap);
    
    // 上辺
    for (let i = 0; i < dashCount / 4; i++) {
      const x = 3 + i * totalDashGap;
      if (x + dashLength <= size - 3) {
        graphics.beginPath();
        graphics.moveTo(x, 3);
        graphics.lineTo(x + dashLength, 3);
        graphics.strokePath();
      }
    }
  }
  
  /**
   * 閉じた宝箱を描画
   */
  private static drawClosedChest(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
    // 宝箱の本体
    graphics.fillStyle(0x8B4513, 1); // 茶色
    graphics.fillRoundedRect(x, y + height * 0.3, width, height * 0.7, 4);
    
    // 宝箱の蓋
    graphics.fillStyle(0xA0522D, 1); // より明るい茶色
    graphics.fillRoundedRect(x, y, width, height * 0.5, 4);
    
    // 金具
    graphics.fillStyle(0xFFD700, 1); // 金色
    graphics.fillRoundedRect(x + width * 0.4, y + height * 0.2, width * 0.2, height * 0.3, 2);
    
    // 鍵穴
    graphics.fillStyle(0x2F2F2F, 1);
    graphics.fillCircle(x + width * 0.5, y + height * 0.35, 3);
  }
  
  /**
   * 開いた宝箱を描画
   */
  private static drawOpenChest(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
    // 宝箱の本体
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRoundedRect(x, y + height * 0.4, width, height * 0.6, 4);
    
    // 開いた蓋（後ろに倒れた状態）
    graphics.fillStyle(0xA0522D, 1);
    graphics.fillRoundedRect(x, y, width, height * 0.3, 4);
    
    // 宝物の光
    graphics.fillStyle(0xFFD700, 0.6);
    graphics.fillEllipse(x + width * 0.5, y + height * 0.6, width * 0.6, height * 0.3);
    
    // キラキラエフェクト
    const sparkles = 5;
    for (let i = 0; i < sparkles; i++) {
      const sparkleX = x + width * 0.3 + Math.random() * width * 0.4;
      const sparkleY = y + height * 0.4 + Math.random() * height * 0.3;
      
      this.drawSparkle(graphics, sparkleX, sparkleY, 2);
    }
  }
  
  /**
   * 宝箱の装飾を追加
   */
  private static addChestDecorations(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
    // 金属の帯
    graphics.fillStyle(0xB8860B, 1);
    graphics.fillRect(x, y + height * 0.6, width, 3);
    graphics.fillRect(x, y + height * 0.8, width, 3);
    
    // 角の金具
    const cornerSize = 4;
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(x + cornerSize, y + height * 0.4 + cornerSize, cornerSize / 2);
    graphics.fillCircle(x + width - cornerSize, y + height * 0.4 + cornerSize, cornerSize / 2);
  }
  
  /**
   * 星を描画
   */
  private static drawStar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number, color: number): void {
    const points = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    graphics.fillStyle(color, 0.8);
    graphics.beginPath();
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const pointX = x + Math.cos(angle - Math.PI / 2) * radius;
      const pointY = y + Math.sin(angle - Math.PI / 2) * radius;
      
      if (i === 0) {
        graphics.moveTo(pointX, pointY);
      } else {
        graphics.lineTo(pointX, pointY);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
  }
  
  /**
   * キラキラエフェクトを描画
   */
  private static drawSparkle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
    graphics.lineStyle(1, 0xFFFFFF, 0.8);
    
    // 十字
    graphics.beginPath();
    graphics.moveTo(x - size, y);
    graphics.lineTo(x + size, y);
    graphics.moveTo(x, y - size);
    graphics.lineTo(x, y + size);
    graphics.strokePath();
    
    // X字
    graphics.beginPath();
    graphics.moveTo(x - size * 0.7, y - size * 0.7);
    graphics.lineTo(x + size * 0.7, y + size * 0.7);
    graphics.moveTo(x + size * 0.7, y - size * 0.7);
    graphics.lineTo(x - size * 0.7, y + size * 0.7);
    graphics.strokePath();
  }
  
  /**
   * 海洋色の補間
   */
  private static interpolateOceanColor(depths: { color: number; position: number }[], ratio: number): number {
    // 適切な深度レンジを見つける
    for (let i = 0; i < depths.length - 1; i++) {
      if (ratio >= depths[i].position && ratio <= depths[i + 1].position) {
        const localRatio = (ratio - depths[i].position) / (depths[i + 1].position - depths[i].position);
        return this.interpolateColor(depths[i].color, depths[i + 1].color, localRatio);
      }
    }
    
    return depths[depths.length - 1].color;
  }
  
  /**
   * 色の補間
   */
  private static interpolateColor(color1: number, color2: number, ratio: number): number {
    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;
    
    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return (r << 16) | (g << 8) | b;
  }
}
