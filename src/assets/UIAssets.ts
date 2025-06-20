/**
 * 海をテーマにしたUI要素アセット生成（改良版）
 */
export class UIAssets {
  /**
   * 海洋テーマのボタンを生成（通常状態）
   */
  static createOceanButton(
    scene: Phaser.Scene, 
    width: number, 
    height: number, 
    type: 'primary' | 'secondary' | 'danger' | 'success' = 'primary'
  ): Phaser.Textures.Texture {
    return this.createOceanButtonState(scene, width, height, type, 'normal');
  }

  /**
   * 海洋テーマのボタンを生成（ホバー状態）
   */
  static createOceanButtonHover(
    scene: Phaser.Scene, 
    width: number, 
    height: number, 
    type: 'primary' | 'secondary' | 'danger' | 'success' = 'primary'
  ): Phaser.Textures.Texture {
    return this.createOceanButtonState(scene, width, height, type, 'hover');
  }

  /**
   * 海洋テーマのボタンを生成（プレス状態）
   */
  static createOceanButtonPressed(
    scene: Phaser.Scene, 
    width: number, 
    height: number, 
    type: 'primary' | 'secondary' | 'danger' | 'success' = 'primary'
  ): Phaser.Textures.Texture {
    return this.createOceanButtonState(scene, width, height, type, 'pressed');
  }

  /**
   * 海洋テーマのボタンを生成（無効状態）
   */
  static createOceanButtonDisabled(
    scene: Phaser.Scene, 
    width: number, 
    height: number, 
    type: 'primary' | 'secondary' | 'danger' | 'success' = 'primary'
  ): Phaser.Textures.Texture {
    return this.createOceanButtonState(scene, width, height, type, 'disabled');
  }

  /**
   * 海洋テーマのボタンを状態別に生成（改良版）
   */
  private static createOceanButtonState(
    scene: Phaser.Scene, 
    width: number, 
    height: number, 
    type: 'primary' | 'secondary' | 'danger' | 'success',
    state: 'normal' | 'hover' | 'pressed' | 'disabled'
  ): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    // ボタンタイプ別の色設定（より美しい海洋テーマ）
    const buttonThemes = {
      primary: {
        gradient: [0x0D47A1, 0x1565C0, 0x1976D2, 0x1E88E5, 0x2196F3],
        border: 0x01579B,
        highlight: 0x90CAF9,
        shadow: 0x0D47A1,
        glow: 0x64B5F6,
        innerShadow: 0x0A3D91
      },
      secondary: {
        gradient: [0x004D40, 0x00695C, 0x00796B, 0x0097A7, 0x00BCD4],
        border: 0x00251A,
        highlight: 0xB2EBF2,
        shadow: 0x004D40,
        glow: 0x4DD0E1,
        innerShadow: 0x003D32
      },
      danger: {
        gradient: [0xB71C1C, 0xC62828, 0xD32F2F, 0xE53935, 0xF44336],
        border: 0x8B0000,
        highlight: 0xFFCDD2,
        shadow: 0xB71C1C,
        glow: 0xEF5350,
        innerShadow: 0xA71717
      },
      success: {
        gradient: [0x1B5E20, 0x2E7D32, 0x388E3C, 0x43A047, 0x4CAF50],
        border: 0x0D4E11,
        highlight: 0xC8E6C9,
        shadow: 0x1B5E20,
        glow: 0x66BB6A,
        innerShadow: 0x17541B
      }
    };
    
    const theme = buttonThemes[type];
    const cornerRadius = Math.min(width, height) * 0.15;
    
    // 状態による調整
    let stateMultiplier = 1.0;
    let offsetY = 0;
    let glowIntensity = 0.3;
    
    switch (state) {
      case 'hover':
        stateMultiplier = 1.1;
        glowIntensity = 0.5;
        break;
      case 'pressed':
        stateMultiplier = 0.95;
        offsetY = 2;
        glowIntensity = 0.1;
        break;
      case 'disabled':
        stateMultiplier = 0.6;
        glowIntensity = 0;
        break;
    }
    
    // 外側のグロー効果
    if (glowIntensity > 0) {
      graphics.fillStyle(theme.glow, glowIntensity * 0.3);
      graphics.fillRoundedRect(-4, -4 + offsetY, width + 8, height + 8, cornerRadius + 4);
    }
    
    // メインボタンの背景（グラデーション効果）
    this.createEnhancedButtonGradient(graphics, width, height, theme, stateMultiplier, offsetY);
    
    // 立体感のある枠線
    this.addButtonBorders(graphics, width, height, theme, cornerRadius, offsetY);
    
    // 内側のハイライト
    this.addButtonHighlight(graphics, width, height, theme, cornerRadius, stateMultiplier, offsetY);
    
    // 水の波紋効果（ボタン特有の装飾）
    if (state !== 'disabled') {
      this.addWaterRippleEffect(graphics, width, height, theme, offsetY);
    }
    
    // テクスチャとして保存
    const key = `ocean_button_${type}_${state}_${width}x${height}`;
    const rt = scene.add.renderTexture(0, 0, width + 8, height + 8);
    rt.draw(graphics, 4, 4);
    
    graphics.destroy();
    
    return scene.textures.get(key);
  }

  /**
   * 改良されたボタングラデーション背景を作成
   */
  private static createEnhancedButtonGradient(
    graphics: Phaser.GameObjects.Graphics, 
    width: number, 
    height: number, 
    theme: any, 
    stateMultiplier: number, 
    offsetY: number
  ): void {
    const cornerRadius = Math.min(width, height) * 0.15;
    const colors = theme.gradient;
    
    // 基本背景
    graphics.fillStyle(colors[0], stateMultiplier);
    graphics.fillRoundedRect(0, offsetY, width, height, cornerRadius);
    
    // 複数層のグラデーション効果
    for (let layer = 0; layer < colors.length - 1; layer++) {
      const layerHeight = height / (colors.length - 1);
      const y = offsetY + (layer * layerHeight);
      const alpha = (0.8 - layer * 0.1) * stateMultiplier;
      
      graphics.fillStyle(colors[layer + 1], alpha);
      graphics.fillRoundedRect(0, y, width, layerHeight + 2, layer === 0 ? cornerRadius : 0);
    }
    
    // 中央のハイライト
    graphics.fillStyle(theme.highlight, 0.2 * stateMultiplier);
    graphics.fillRoundedRect(width * 0.1, offsetY + height * 0.2, width * 0.8, height * 0.3, cornerRadius * 0.5);
  }

  /**
   * ボタンの立体的な枠線を追加
   */
  private static addButtonBorders(
    graphics: Phaser.GameObjects.Graphics, 
    width: number, 
    height: number, 
    theme: any, 
    cornerRadius: number, 
    offsetY: number
  ): void {
    // 外側の枠線（メイン）
    graphics.lineStyle(2, theme.border, 0.9);
    graphics.strokeRoundedRect(1, offsetY + 1, width - 2, height - 2, cornerRadius);
    
    // 内側の枠線（ハイライト）
    graphics.lineStyle(1, theme.highlight, 0.6);
    graphics.strokeRoundedRect(3, offsetY + 3, width - 6, height - 6, cornerRadius - 2);
    
    // 影の枠線（下と右）
    graphics.lineStyle(1.5, theme.shadow, 0.5);
    graphics.lineBetween(2, offsetY + height - 2, width - 2, offsetY + height - 2); // 下
    graphics.lineBetween(width - 2, offsetY + 2, width - 2, offsetY + height - 2); // 右
  }

  /**
   * ボタンのハイライト効果を追加
   */
  private static addButtonHighlight(
    graphics: Phaser.GameObjects.Graphics, 
    width: number, 
    height: number, 
    theme: any, 
    cornerRadius: number, 
    stateMultiplier: number, 
    offsetY: number
  ): void {
    // 上部のハイライト（光沢効果）
    graphics.fillStyle(0xFFFFFF, 0.3 * stateMultiplier);
    graphics.fillRoundedRect(4, offsetY + 4, width - 8, height * 0.4, cornerRadius - 2);
    
    // 中央のソフトハイライト
    graphics.fillStyle(theme.highlight, 0.15 * stateMultiplier);
    graphics.fillEllipse(width * 0.5, offsetY + height * 0.3, width * 0.6, height * 0.3);
  }

  /**
   * 水の波紋効果を追加
   */
  private static addWaterRippleEffect(
    graphics: Phaser.GameObjects.Graphics, 
    width: number, 
    height: number, 
    theme: any, 
    offsetY: number
  ): void {
    graphics.lineStyle(1, theme.glow, 0.4);
    
    // 波紋の円
    const centerX = width * 0.5;
    const centerY = offsetY + height * 0.5;
    
    for (let i = 0; i < 3; i++) {
      const radius = (width * 0.15) + (i * width * 0.1);
      const alpha = 0.4 - (i * 0.1);
      graphics.lineStyle(0.8, theme.glow, alpha);
      graphics.strokeCircle(centerX, centerY, radius);
    }
    
    // 小さな泡の装飾
    graphics.fillStyle(0xFFFFFF, 0.3);
    const bubbles = [
      { x: width * 0.2, y: offsetY + height * 0.3, r: 1 },
      { x: width * 0.8, y: offsetY + height * 0.7, r: 0.8 },
      { x: width * 0.6, y: offsetY + height * 0.2, r: 0.6 }
    ];
    
    bubbles.forEach(bubble => {
      graphics.fillCircle(bubble.x, bubble.y, bubble.r);
    });
  }

  /**
   * 海洋テーマのパネル背景を生成
   */
  static createOceanPanel(
    scene: Phaser.Scene, 
    width: number, 
    height: number, 
    style: 'light' | 'dark' | 'transparent' = 'light'
  ): string {
    const graphics = scene.add.graphics();
    
    const panelThemes = {
      light: {
        background: [0xE3F2FD, 0xBBDEFB, 0x90CAF9],
        border: 0x1976D2,
        highlight: 0xFFFFFF,
        shadow: 0x0D47A1
      },
      dark: {
        background: [0x0D47A1, 0x1565C0, 0x1976D2],
        border: 0x01579B,
        highlight: 0x64B5F6,
        shadow: 0x0A3D91
      },
      transparent: {
        background: [0x000000, 0x000000, 0x000000],
        border: 0x4FC3F7,
        highlight: 0xFFFFFF,
        shadow: 0x0277BD
      }
    };
    
    const theme = panelThemes[style];
    const cornerRadius = 12;
    
    // 背景のグラデーション
    if (style === 'transparent') {
      graphics.fillStyle(theme.background[0], 0.3);
    } else {
      graphics.fillStyle(theme.background[0], 0.9);
    }
    graphics.fillRoundedRect(0, 0, width, height, cornerRadius);
    
    // グラデーション効果
    for (let i = 1; i < theme.background.length; i++) {
      const alpha = style === 'transparent' ? 0.1 : 0.6 - (i * 0.2);
      graphics.fillStyle(theme.background[i], alpha);
      graphics.fillRoundedRect(0, height * (i / theme.background.length), width, height / theme.background.length, cornerRadius);
    }
    
    // 枠線
    graphics.lineStyle(2, theme.border, 0.8);
    graphics.strokeRoundedRect(1, 1, width - 2, height - 2, cornerRadius);
    
    // 内側のハイライト
    graphics.lineStyle(1, theme.highlight, 0.4);
    graphics.strokeRoundedRect(3, 3, width - 6, height - 6, cornerRadius - 2);
    
    const key = `ocean_panel_${style}_${width}x${height}`;
    const rt = scene.add.renderTexture(0, 0, width, height);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return key;
  }

  /**
   * 海洋テーマの装飾枠を生成
   */
  static createOceanFrame(
    scene: Phaser.Scene, 
    width: number, 
    height: number, 
    thickness: number = 4
  ): string {
    const graphics = scene.add.graphics();
    
    // 外枠（深い青）
    graphics.lineStyle(thickness, 0x0D47A1, 0.9);
    graphics.strokeRoundedRect(0, 0, width, height, 8);
    
    // 内枠（明るい青）
    graphics.lineStyle(thickness - 2, 0x2196F3, 0.7);
    graphics.strokeRoundedRect(thickness, thickness, width - thickness * 2, height - thickness * 2, 6);
    
    // 装飾的な波模様
    graphics.lineStyle(1, 0x64B5F6, 0.5);
    for (let i = 0; i < 3; i++) {
      const y = height * (0.2 + i * 0.3);
      graphics.beginPath();
      for (let x = thickness; x < width - thickness; x += 4) {
        const waveY = y + Math.sin((x / width) * Math.PI * 4) * 2;
        if (x === thickness) {
          graphics.moveTo(x, waveY);
        } else {
          graphics.lineTo(x, waveY);
        }
      }
      graphics.strokePath();
    }
    
    const key = `ocean_frame_${width}x${height}_${thickness}`;
    const rt = scene.add.renderTexture(0, 0, width, height);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return key;
  }

  /**
   * 海洋テーマの背景を生成
   */
  static createOceanBackground(
    scene: Phaser.Scene, 
    width: number, 
    height: number
  ): string {
    const graphics = scene.add.graphics();
    
    // グラデーション背景（深海から浅瀬へ）
    const colors = [0x0D47A1, 0x1565C0, 0x1976D2, 0x1E88E5, 0x2196F3, 0x42A5F5];
    const stepHeight = height / colors.length;
    
    for (let i = 0; i < colors.length; i++) {
      graphics.fillStyle(colors[i], 0.8);
      graphics.fillRect(0, i * stepHeight, width, stepHeight + 1);
    }
    
    // 水の波紋効果
    graphics.lineStyle(1, 0x64B5F6, 0.3);
    for (let i = 0; i < 5; i++) {
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      const maxRadius = 50 + Math.random() * 50;
      
      for (let r = 10; r < maxRadius; r += 15) {
        graphics.strokeCircle(centerX, centerY, r);
      }
    }
    
    // 泡のエフェクト
    graphics.fillStyle(0xFFFFFF, 0.2);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 2 + Math.random() * 4;
      graphics.fillCircle(x, y, size);
    }
    
    const key = `ocean_background_${width}x${height}`;
    const rt = scene.add.renderTexture(0, 0, width, height);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    
    return key;
  }
}
