/**
 * 海をテーマにしたブロック画像アセット生成
 * プレースホルダーから本格的な海洋テーマ画像への進化
 */
export class BlockAssets {
  /**
   * 海洋テーマのブロック画像を生成（改良版）
   */
  static createOceanBlockTexture(scene: Phaser.Scene, color: string, blockType: string = 'normal'): string {
    const blockSize = 40;
    const graphics = scene.add.graphics();
    
    // 色別の海洋テーマ設定（より詳細で美しい設定）
    const oceanThemes: { [key: string]: { 
      name: string; 
      gradient: number[]; 
      pattern: string; 
      accent: number;
      shadow: number;
      highlight: number;
    } } = {
      '#1E5799': { // 深い青 - 深海のイメージ
        name: 'deep_blue',
        gradient: [0x0D47A1, 0x1E5799, 0x2196F3, 0x1E5799],
        pattern: 'deep_waves',
        accent: 0x64B5F6,
        shadow: 0x0D47A1,
        highlight: 0x90CAF9
      },
      '#7DB9E8': { // 水色 - 浅瀬の海
        name: 'light_blue', 
        gradient: [0x4FC3F7, 0x7DB9E8, 0xB3E5FC, 0x7DB9E8],
        pattern: 'bubbles',
        accent: 0xE1F5FE,
        shadow: 0x0288D1,
        highlight: 0xFFFFFF
      },
      '#2E8B57': { // 海緑 - 海藻のイメージ
        name: 'sea_green',
        gradient: [0x1B5E20, 0x2E8B57, 0x4CAF50, 0x2E8B57],
        pattern: 'seaweed',
        accent: 0x81C784,
        shadow: 0x1B5E20,
        highlight: 0xC8E6C9
      },
      '#FF6347': { // 珊瑚赤 - 珊瑚のイメージ
        name: 'coral_red',
        gradient: [0xD32F2F, 0xFF6347, 0xFF8A65, 0xFF6347],
        pattern: 'coral',
        accent: 0xFFAB91,
        shadow: 0xC62828,
        highlight: 0xFFCCBC
      },
      '#F4D03F': { // 砂金色 - 砂浜のイメージ
        name: 'sand_gold',
        gradient: [0xF57F17, 0xF4D03F, 0xFFF176, 0xF4D03F],
        pattern: 'sand_particles',
        accent: 0xFFF59D,
        shadow: 0xE65100,
        highlight: 0xFFFDE7
      },
      '#F5F5F5': { // 真珠白 - 真珠・貝殻のイメージ
        name: 'pearl_white',
        gradient: [0xE0E0E0, 0xF5F5F5, 0xFFFFFF, 0xF5F5F5],
        pattern: 'pearl_shimmer',
        accent: 0xE8EAF6,
        shadow: 0xBDBDBD,
        highlight: 0xFFFFFF
      }
    };
    
    const theme = oceanThemes[color] || oceanThemes['#7DB9E8'];
    
    // より美しいグラデーション背景
    this.createEnhancedGradientBackground(graphics, blockSize, theme);
    
    // 詳細なパターン描画
    this.drawDetailedOceanPattern(graphics, blockSize, theme);
    
    // 立体感のある光の反射効果
    this.addEnhancedLightReflection(graphics, blockSize, theme);
    
    // 美しい枠線（水中の光の屈折を表現）
    this.addWaterRefractionBorder(graphics, blockSize, theme);
    
    // テクスチャとして保存
    const key = `ocean_block_${theme.name}`;
    const rt = scene.add.renderTexture(0, 0, blockSize, blockSize);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return key;
  }
  
  /**
   * 改良されたグラデーション背景を作成
   */
  private static createEnhancedGradientBackground(graphics: Phaser.GameObjects.Graphics, size: number, theme: any): void {
    const colors = theme.gradient;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // 基本背景
    graphics.fillStyle(colors[0], 1.0);
    graphics.fillRoundedRect(0, 0, size, size, 8);
    
    // 放射状グラデーション効果（複数層）
    for (let layer = 0; layer < 3; layer++) {
      const radius = (size / 2) * (0.8 - layer * 0.2);
      const colorIndex = Math.min(layer + 1, colors.length - 1);
      const alpha = 0.6 - (layer * 0.15);
      
      graphics.fillStyle(colors[colorIndex], alpha);
      graphics.fillCircle(centerX, centerY, radius);
    }
    
    // 影の効果（下部）
    graphics.fillStyle(theme.shadow, 0.3);
    graphics.fillRoundedRect(0, size * 0.7, size, size * 0.3, 4);
    
    // ハイライト効果（上部）
    graphics.fillStyle(theme.highlight, 0.2);
    graphics.fillRoundedRect(0, 0, size, size * 0.3, 4);
  }
  
  /**
   * 詳細な海洋パターンを描画（改良版）
   */
  private static drawDetailedOceanPattern(graphics: Phaser.GameObjects.Graphics, size: number, theme: any): void {
    const pattern = theme.pattern;
    const accentColor = theme.accent;
    
    switch (pattern) {
      case 'deep_waves':
        this.drawDeepWavePattern(graphics, size, accentColor);
        break;
      case 'bubbles':
        this.drawEnhancedBubblePattern(graphics, size, accentColor);
        break;
      case 'seaweed':
        this.drawDetailedSeaweedPattern(graphics, size, accentColor);
        break;
      case 'coral':
        this.drawDetailedCoralPattern(graphics, size, accentColor);
        break;
      case 'sand_particles':
        this.drawSandParticlePattern(graphics, size, accentColor);
        break;
      case 'pearl_shimmer':
        this.drawPearlShimmerPattern(graphics, size, accentColor);
        break;
    }
  }
  
  /**
   * 深海波パターン（改良版）
   */
  private static drawDeepWavePattern(graphics: Phaser.GameObjects.Graphics, size: number, accentColor: number): void {
    graphics.lineStyle(1.5, accentColor, 0.7);
    
    // 複数の波を重ねて深海感を演出
    for (let layer = 0; layer < 2; layer++) {
      const yOffset = size * (0.3 + layer * 0.4);
      const amplitude = 4 - layer;
      const frequency = 2 + layer;
      
      graphics.beginPath();
      for (let x = 0; x <= size; x += 1) {
        const waveY = yOffset + Math.sin((x / size) * Math.PI * frequency) * amplitude;
        if (x === 0) {
          graphics.moveTo(x, waveY);
        } else {
          graphics.lineTo(x, waveY);
        }
      }
      graphics.strokePath();
    }
    
    // 水流の線
    graphics.lineStyle(0.8, accentColor, 0.4);
    for (let i = 0; i < 3; i++) {
      const x = size * (0.2 + i * 0.3);
      graphics.lineBetween(x, size * 0.1, x + size * 0.1, size * 0.9);
    }
  }

  /**
   * 強化された泡パターン
   */
  private static drawEnhancedBubblePattern(graphics: Phaser.GameObjects.Graphics, size: number, accentColor: number): void {
    const bubbles = [
      { x: size * 0.15, y: size * 0.25, r: 2.5, alpha: 0.8 },
      { x: size * 0.75, y: size * 0.15, r: 1.8, alpha: 0.9 },
      { x: size * 0.45, y: size * 0.55, r: 1.2, alpha: 0.7 },
      { x: size * 0.85, y: size * 0.65, r: 1.5, alpha: 0.6 },
      { x: size * 0.25, y: size * 0.75, r: 1.0, alpha: 0.8 },
      { x: size * 0.65, y: size * 0.85, r: 0.8, alpha: 0.9 }
    ];
    
    bubbles.forEach(bubble => {
      // 泡の外枠
      graphics.lineStyle(1, accentColor, bubble.alpha);
      graphics.strokeCircle(bubble.x, bubble.y, bubble.r);
      
      // 泡の内側のハイライト
      graphics.fillStyle(0xFFFFFF, bubble.alpha * 0.3);
      graphics.fillCircle(bubble.x - bubble.r * 0.3, bubble.y - bubble.r * 0.3, bubble.r * 0.4);
      
      // 小さな反射光
      graphics.fillStyle(0xFFFFFF, bubble.alpha * 0.8);
      graphics.fillCircle(bubble.x - bubble.r * 0.4, bubble.y - bubble.r * 0.4, bubble.r * 0.15);
    });
  }

  /**
   * 詳細な海藻パターン
   */
  private static drawDetailedSeaweedPattern(graphics: Phaser.GameObjects.Graphics, size: number, accentColor: number): void {
    graphics.lineStyle(1.2, accentColor, 0.6);
    
    // 海藻の茎を描画
    for (let i = 0; i < 2; i++) {
      const startX = size * (0.2 + i * 0.6);
      const segments = 8;
      
      graphics.beginPath();
      graphics.moveTo(startX, size);
      
      for (let j = 1; j <= segments; j++) {
        const y = size - (size / segments) * j;
        const sway = Math.sin(j * 0.5) * (3 + i);
        const x = startX + sway;
        graphics.lineTo(x, y);
      }
      graphics.strokePath();
      
      // 海藻の葉を追加
      for (let j = 2; j < segments; j += 2) {
        const y = size - (size / segments) * j;
        const sway = Math.sin(j * 0.5) * (3 + i);
        const x = startX + sway;
        
        // 左の葉
        graphics.lineStyle(0.8, accentColor, 0.5);
        graphics.lineBetween(x, y, x - 3, y - 2);
        // 右の葉
        graphics.lineBetween(x, y, x + 3, y - 2);
      }
    }
  }

  /**
   * 詳細な珊瑚パターン
   */
  private static drawDetailedCoralPattern(graphics: Phaser.GameObjects.Graphics, size: number, accentColor: number): void {
    graphics.lineStyle(1, accentColor, 0.7);
    
    // 珊瑚の枝を描画
    const branches = [
      { x: size * 0.3, y: size * 0.8, angle: -Math.PI/4, length: size * 0.3 },
      { x: size * 0.7, y: size * 0.7, angle: -Math.PI/6, length: size * 0.25 },
      { x: size * 0.5, y: size * 0.9, angle: -Math.PI/3, length: size * 0.2 }
    ];
    
    branches.forEach(branch => {
      this.drawCoralBranch(graphics, branch.x, branch.y, branch.angle, branch.length, 3, accentColor);
    });
    
    // 珊瑚のポリプ（小さな円）
    graphics.fillStyle(accentColor, 0.4);
    for (let i = 0; i < 5; i++) {
      const x = size * (0.2 + Math.random() * 0.6);
      const y = size * (0.6 + Math.random() * 0.3);
      graphics.fillCircle(x, y, 0.8);
    }
  }

  /**
   * 砂粒パターン
   */
  private static drawSandParticlePattern(graphics: Phaser.GameObjects.Graphics, size: number, accentColor: number): void {
    graphics.fillStyle(accentColor, 0.6);
    
    // ランダムな砂粒を描画
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const particleSize = 0.5 + Math.random() * 1;
      graphics.fillCircle(x, y, particleSize);
    }
    
    // 砂の波紋
    graphics.lineStyle(0.8, accentColor, 0.3);
    for (let i = 0; i < 3; i++) {
      const y = size * (0.3 + i * 0.2);
      graphics.beginPath();
      for (let x = 0; x <= size; x += 2) {
        const waveY = y + Math.sin((x / size) * Math.PI * 4) * 1;
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
   * 真珠の輝きパターン
   */
  private static drawPearlShimmerPattern(graphics: Phaser.GameObjects.Graphics, size: number, accentColor: number): void {
    // 真珠の光沢効果
    const shimmerPoints = [
      { x: size * 0.2, y: size * 0.3, intensity: 0.8 },
      { x: size * 0.7, y: size * 0.2, intensity: 0.6 },
      { x: size * 0.5, y: size * 0.6, intensity: 0.9 },
      { x: size * 0.8, y: size * 0.8, intensity: 0.5 }
    ];
    
    shimmerPoints.forEach(point => {
      // 輝きの中心
      graphics.fillStyle(0xFFFFFF, point.intensity);
      graphics.fillCircle(point.x, point.y, 1.5);
      
      // 輝きの放射
      graphics.lineStyle(0.5, 0xFFFFFF, point.intensity * 0.6);
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const endX = point.x + Math.cos(angle) * 3;
        const endY = point.y + Math.sin(angle) * 3;
        graphics.lineBetween(point.x, point.y, endX, endY);
      }
    });
    
    // 虹色の反射（真珠特有の効果）
    graphics.lineStyle(1, accentColor, 0.4);
    graphics.strokeCircle(size * 0.5, size * 0.5, size * 0.3);
  }
  
  /**
   * 立体感のある光の反射効果（改良版）
   */
  private static addEnhancedLightReflection(graphics: Phaser.GameObjects.Graphics, size: number, theme: any): void {
    // メインの光源（左上から）
    const lightX = size * 0.25;
    const lightY = size * 0.25;
    const lightRadius = size * 0.3;
    
    // 光の反射（グラデーション風）
    for (let i = 0; i < 5; i++) {
      const radius = lightRadius * (1 - i * 0.15);
      const alpha = 0.4 - (i * 0.06);
      graphics.fillStyle(0xFFFFFF, alpha);
      graphics.fillCircle(lightX, lightY, radius);
    }
    
    // 水面の反射効果（右下）
    const reflectionX = size * 0.75;
    const reflectionY = size * 0.75;
    graphics.fillStyle(theme.highlight, 0.2);
    graphics.fillCircle(reflectionX, reflectionY, size * 0.15);
    
    // 光の筋（水中の光線）
    graphics.lineStyle(1, 0xFFFFFF, 0.3);
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI / 6) + (i * Math.PI / 12);
      const startX = lightX;
      const startY = lightY;
      const endX = startX + Math.cos(angle) * size * 0.4;
      const endY = startY + Math.sin(angle) * size * 0.4;
      graphics.lineBetween(startX, startY, endX, endY);
    }
  }

  /**
   * 美しい枠線（水中の光の屈折を表現）
   */
  private static addWaterRefractionBorder(graphics: Phaser.GameObjects.Graphics, size: number, theme: any): void {
    // 外側の枠線（水の屈折効果）
    graphics.lineStyle(2, theme.accent, 0.8);
    graphics.strokeRoundedRect(1, 1, size - 2, size - 2, 8);
    
    // 内側のハイライト枠線
    graphics.lineStyle(1, theme.highlight, 0.6);
    graphics.strokeRoundedRect(3, 3, size - 6, size - 6, 6);
    
    // 影の枠線（下と右）
    graphics.lineStyle(1.5, theme.shadow, 0.4);
    graphics.lineBetween(2, size - 2, size - 2, size - 2); // 下
    graphics.lineBetween(size - 2, 2, size - 2, size - 2); // 右
    
    // 光の枠線（上と左）
    graphics.lineStyle(1, 0xFFFFFF, 0.5);
    graphics.lineBetween(2, 2, size - 2, 2); // 上
    graphics.lineBetween(2, 2, 2, size - 2); // 左
    
    // 角の装飾（水滴効果）
    graphics.fillStyle(0xFFFFFF, 0.3);
    graphics.fillCircle(size * 0.15, size * 0.15, 1.5); // 左上
    graphics.fillCircle(size * 0.85, size * 0.85, 1.2); // 右下
  }

  /**
   * 珊瑚の枝を描画するヘルパーメソッド
   */
  private static drawCoralBranch(graphics: Phaser.GameObjects.Graphics, x: number, y: number, angle: number, length: number, depth: number, color: number): void {
    if (depth <= 0 || length < 2) return;
    
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    
    graphics.lineStyle(Math.max(0.5, depth * 0.5), color, 0.7);
    graphics.lineBetween(x, y, endX, endY);
    
    // 分岐
    if (depth > 1) {
      const branchLength = length * 0.7;
      this.drawCoralBranch(graphics, endX, endY, angle - Math.PI/6, branchLength, depth - 1, color);
      this.drawCoralBranch(graphics, endX, endY, angle + Math.PI/6, branchLength, depth - 1, color);
    }
  }
  /**
   * 色の補間（ヘルパーメソッド）
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
