/**
 * 海をテーマにしたブロック画像アセット生成
 * プレースホルダーから本格的な海洋テーマ画像への進化
 */
export class BlockAssets {
  /**
   * 海洋テーマのブロック画像を生成
   */
  static createOceanBlockTexture(scene: Phaser.Scene, color: string, blockType: string = 'normal'): string {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 色別の海洋テーマ設定
    const oceanThemes: { [key: string]: { name: string; gradient: number[]; pattern: string; accent: number } } = {
      '#1E5799': { // 深い青
        name: 'deep_blue',
        gradient: [0x1E5799, 0x2989D8, 0x1E5799],
        pattern: 'waves',
        accent: 0x4FC3F7
      },
      '#7DB9E8': { // 水色
        name: 'light_blue', 
        gradient: [0x7DB9E8, 0xB3E5FC, 0x7DB9E8],
        pattern: 'bubbles',
        accent: 0xFFFFFF
      },
      '#2E8B57': { // 海緑
        name: 'sea_green',
        gradient: [0x2E8B57, 0x66BB6A, 0x2E8B57],
        pattern: 'seaweed',
        accent: 0x81C784
      },
      '#FF6347': { // 珊瑚赤
        name: 'coral_red',
        gradient: [0xFF6347, 0xFF8A65, 0xFF6347],
        pattern: 'coral',
        accent: 0xFFAB91
      },
      '#F4D03F': { // 砂金色
        name: 'sand_gold',
        gradient: [0xF4D03F, 0xFFF176, 0xF4D03F],
        pattern: 'sand',
        accent: 0xFFF59D
      },
      '#F5F5F5': { // 真珠白
        name: 'pearl_white',
        gradient: [0xF5F5F5, 0xFFFFFF, 0xF5F5F5],
        pattern: 'pearl',
        accent: 0xE8EAF6
      }
    };
    
    const theme = oceanThemes[color] || oceanThemes['#7DB9E8'];
    
    // グラデーション背景
    this.createGradientBackground(graphics, blockSize, theme.gradient);
    
    // パターン描画
    this.drawOceanPattern(graphics, blockSize, theme.pattern, theme.accent);
    
    // 光の反射効果
    this.addLightReflection(graphics, blockSize);
    
    // 枠線（水中感を演出）
    graphics.lineStyle(2, 0x4FC3F7, 0.6);
    graphics.strokeRoundedRect(1, 1, blockSize - 2, blockSize - 2, 6);
    
    // 内側のハイライト
    graphics.lineStyle(1, 0xFFFFFF, 0.3);
    graphics.strokeRoundedRect(3, 3, blockSize - 6, blockSize - 6, 4);
    
    // テクスチャとして保存
    const key = `ocean_block_${theme.name}`;
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return key;
  }
  
  /**
   * グラデーション背景を作成
   */
  private static createGradientBackground(graphics: Phaser.GameObjects.Graphics, size: number, colors: number[]): void {
    // 縦方向のグラデーション効果をシミュレート
    const steps = 8;
    const stepHeight = size / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      let color: number;
      
      if (ratio <= 0.5) {
        // 上半分: colors[0] → colors[1]
        const localRatio = ratio * 2;
        color = this.interpolateColor(colors[0], colors[1], localRatio);
      } else {
        // 下半分: colors[1] → colors[2]
        const localRatio = (ratio - 0.5) * 2;
        color = this.interpolateColor(colors[1], colors[2], localRatio);
      }
      
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(0, i * stepHeight, size, stepHeight + 1, i === 0 ? 8 : 0);
    }
  }
  
  /**
   * 海洋パターンを描画
   */
  private static drawOceanPattern(graphics: Phaser.GameObjects.Graphics, size: number, pattern: string, accentColor: number): void {
    graphics.lineStyle(1, accentColor, 0.4);
    
    switch (pattern) {
      case 'waves':
        this.drawWavePattern(graphics, size);
        break;
      case 'bubbles':
        this.drawBubblePattern(graphics, size, accentColor);
        break;
      case 'seaweed':
        this.drawSeaweedPattern(graphics, size, accentColor);
        break;
      case 'coral':
        this.drawCoralPattern(graphics, size, accentColor);
        break;
      case 'sand':
        this.drawSandPattern(graphics, size, accentColor);
        break;
      case 'pearl':
        this.drawPearlPattern(graphics, size, accentColor);
        break;
    }
  }
  
  /**
   * 波パターン
   */
  private static drawWavePattern(graphics: Phaser.GameObjects.Graphics, size: number): void {
    const waveCount = 3;
    const amplitude = 3;
    
    for (let w = 0; w < waveCount; w++) {
      const y = (size / (waveCount + 1)) * (w + 1);
      
      graphics.beginPath();
      for (let x = 0; x <= size; x += 2) {
        const waveY = y + Math.sin((x / size) * Math.PI * 2) * amplitude;
        if (x === 0) {
          graphics.moveTo(x, waveY);
        } else {
          graphics.lineTo(x, waveY);
        }
      }
      graphics.strokePath();
    }
  }
  
  /**
   * 泡パターン
   */
  private static drawBubblePattern(graphics: Phaser.GameObjects.Graphics, size: number, color: number): void {
    const bubbles = [
      { x: size * 0.2, y: size * 0.3, r: 2 },
      { x: size * 0.7, y: size * 0.2, r: 1.5 },
      { x: size * 0.5, y: size * 0.6, r: 1 },
      { x: size * 0.8, y: size * 0.7, r: 1.2 },
      { x: size * 0.3, y: size * 0.8, r: 0.8 }
    ];
    
    bubbles.forEach(bubble => {
      graphics.lineStyle(1, color, 0.6);
      graphics.strokeCircle(bubble.x, bubble.y, bubble.r);
      graphics.lineStyle(0.5, 0xFFFFFF, 0.8);
      graphics.strokeCircle(bubble.x - bubble.r * 0.3, bubble.y - bubble.r * 0.3, bubble.r * 0.3);
    });
  }
  
  /**
   * 海藻パターン
   */
  private static drawSeaweedPattern(graphics: Phaser.GameObjects.Graphics, size: number, color: number): void {
    graphics.lineStyle(1.5, color, 0.5);
    
    // 縦に伸びる海藻
    const seaweedCount = 2;
    for (let i = 0; i < seaweedCount; i++) {
      const x = (size / (seaweedCount + 1)) * (i + 1);
      const segments = 6;
      
      graphics.beginPath();
      graphics.moveTo(x, size);
      
      for (let j = 1; j <= segments; j++) {
        const y = size - (size / segments) * j;
        const offsetX = Math.sin(j * 0.8) * 2;
        graphics.lineTo(x + offsetX, y);
      }
      graphics.strokePath();
    }
  }
  
  /**
   * 珊瑚パターン
   */
  private static drawCoralPattern(graphics: Phaser.GameObjects.Graphics, size: number, color: number): void {
    graphics.lineStyle(1, color, 0.6);
    
    // 珊瑚の枝状パターン
    const centerX = size / 2;
    const centerY = size / 2;
    const branches = 6;
    
    for (let i = 0; i < branches; i++) {
      const angle = (Math.PI * 2 / branches) * i;
      const length = size * 0.25;
      
      graphics.beginPath();
      graphics.moveTo(centerX, centerY);
      graphics.lineTo(
        centerX + Math.cos(angle) * length,
        centerY + Math.sin(angle) * length
      );
      graphics.strokePath();
      
      // 小さな枝
      const subBranchX = centerX + Math.cos(angle) * length * 0.7;
      const subBranchY = centerY + Math.sin(angle) * length * 0.7;
      
      graphics.beginPath();
      graphics.moveTo(subBranchX, subBranchY);
      graphics.lineTo(
        subBranchX + Math.cos(angle + Math.PI / 4) * length * 0.3,
        subBranchY + Math.sin(angle + Math.PI / 4) * length * 0.3
      );
      graphics.strokePath();
    }
  }
  
  /**
   * 砂パターン
   */
  private static drawSandPattern(graphics: Phaser.GameObjects.Graphics, size: number, color: number): void {
    // 砂粒を表現する小さな点
    const grains = 15;
    
    for (let i = 0; i < grains; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const opacity = 0.3 + Math.random() * 0.4;
      
      graphics.fillStyle(color, opacity);
      graphics.fillCircle(x, y, 0.5 + Math.random() * 0.5);
    }
  }
  
  /**
   * 真珠パターン
   */
  private static drawPearlPattern(graphics: Phaser.GameObjects.Graphics, size: number, color: number): void {
    // 真珠の光沢を表現する同心円
    const centerX = size / 2;
    const centerY = size / 2;
    const rings = 4;
    
    for (let i = 0; i < rings; i++) {
      const radius = (size / 2) * (0.2 + (i / rings) * 0.6);
      const opacity = 0.1 + (1 - i / rings) * 0.2;
      
      graphics.lineStyle(0.5, color, opacity);
      graphics.strokeCircle(centerX, centerY, radius);
    }
  }
  
  /**
   * 光の反射効果
   */
  private static addLightReflection(graphics: Phaser.GameObjects.Graphics, size: number): void {
    // 左上からの光の反射
    const reflectionSize = size * 0.4;
    
    graphics.fillStyle(0xFFFFFF, 0.15);
    graphics.fillEllipse(size * 0.25, size * 0.25, reflectionSize, reflectionSize * 0.6);
    
    // 小さなハイライト
    graphics.fillStyle(0xFFFFFF, 0.3);
    graphics.fillCircle(size * 0.2, size * 0.2, 3);
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
  
  /**
   * 氷結ブロック（海洋テーマ版）
   */
  static createOceanIceBlockTexture(scene: Phaser.Scene, color: string, level: number): string {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 基本ブロックを描画
    const baseTexture = this.createOceanBlockTexture(scene, color);
    
    // 氷のオーバーレイ
    graphics.fillStyle(0x87CEEB, 0.6); // スカイブルー
    graphics.fillRoundedRect(0, 0, blockSize, blockSize, 8);
    
    // 氷の結晶パターン
    this.drawIceCrystals(graphics, blockSize, level);
    
    // 氷の枠線
    graphics.lineStyle(2, 0x4682B4, 0.8); // スチールブルー
    graphics.strokeRoundedRect(0, 0, blockSize, blockSize, 8);
    
    // 氷の光沢
    graphics.fillStyle(0xFFFFFF, 0.2);
    graphics.fillEllipse(blockSize * 0.3, blockSize * 0.3, blockSize * 0.4, blockSize * 0.2);
    
    const key = `ocean_ice_${level}_${color.replace('#', '')}`;
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return key;
  }
  
  /**
   * 氷の結晶パターンを描画
   */
  private static drawIceCrystals(graphics: Phaser.GameObjects.Graphics, size: number, level: number): void {
    const centerX = size / 2;
    const centerY = size / 2;
    
    graphics.lineStyle(1, 0xFFFFFF, 0.8);
    
    if (level === 1) {
      // Lv1: シンプルな雪の結晶
      const arms = 6;
      const length = size * 0.25;
      
      for (let i = 0; i < arms; i++) {
        const angle = (Math.PI * 2 / arms) * i;
        graphics.beginPath();
        graphics.moveTo(centerX, centerY);
        graphics.lineTo(
          centerX + Math.cos(angle) * length,
          centerY + Math.sin(angle) * length
        );
        graphics.strokePath();
      }
    } else {
      // Lv2: 複雑な氷の結晶
      const arms = 8;
      const length = size * 0.3;
      
      for (let i = 0; i < arms; i++) {
        const angle = (Math.PI * 2 / arms) * i;
        
        // メインの腕
        graphics.beginPath();
        graphics.moveTo(centerX, centerY);
        graphics.lineTo(
          centerX + Math.cos(angle) * length,
          centerY + Math.sin(angle) * length
        );
        graphics.strokePath();
        
        // 枝分かれ
        const branchX = centerX + Math.cos(angle) * length * 0.6;
        const branchY = centerY + Math.sin(angle) * length * 0.6;
        
        graphics.beginPath();
        graphics.moveTo(branchX, branchY);
        graphics.lineTo(
          branchX + Math.cos(angle + Math.PI / 3) * length * 0.3,
          branchY + Math.sin(angle + Math.PI / 3) * length * 0.3
        );
        graphics.moveTo(branchX, branchY);
        graphics.lineTo(
          branchX + Math.cos(angle - Math.PI / 3) * length * 0.3,
          branchY + Math.sin(angle - Math.PI / 3) * length * 0.3
        );
        graphics.strokePath();
      }
      
      // 中央の六角形
      graphics.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        const x = centerX + Math.cos(angle) * size * 0.1;
        const y = centerY + Math.sin(angle) * size * 0.1;
        
        if (i === 0) {
          graphics.moveTo(x, y);
        } else {
          graphics.lineTo(x, y);
        }
      }
      graphics.closePath();
      graphics.strokePath();
    }
  }
}
