/**
 * シンプルな海洋テーマボタン（Graphics使用）
 */
export class SimpleOceanButton extends Phaser.GameObjects.Container {
  private buttonGraphics!: Phaser.GameObjects.Graphics;
  private buttonText!: Phaser.GameObjects.Text;
  private clickCallback?: () => void;
  private isButtonEnabled: boolean = true;
  private buttonType: 'primary' | 'secondary' | 'danger' | 'success';
  private buttonWidth: number;
  private buttonHeight: number;
  private currentState: 'normal' | 'hover' | 'pressed' | 'disabled' = 'normal';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    type: 'primary' | 'secondary' | 'danger' | 'success' = 'primary',
    callback?: () => void
  ) {
    super(scene, x, y);
    
    this.buttonType = type;
    this.buttonWidth = width;
    this.buttonHeight = height;
    this.clickCallback = callback;
    
    this.createButton(text);
    this.setupInteractions();
    
    scene.add.existing(this);
  }

  /**
   * ボタンを作成
   */
  private createButton(text: string): void {
    // ボタンのGraphics
    this.buttonGraphics = this.scene.add.graphics();
    this.add(this.buttonGraphics);

    // ボタンテキスト
    const textStyle = this.getTextStyle();
    this.buttonText = this.scene.add.text(0, 0, text, textStyle);
    this.buttonText.setOrigin(0.5, 0.5);
    this.add(this.buttonText);

    // 初期描画
    this.drawButton('normal');

    // インタラクティブ設定
    this.setSize(this.buttonWidth, this.buttonHeight);
    this.setInteractive();
  }

  /**
   * ボタンを描画
   */
  private drawButton(state: 'normal' | 'hover' | 'pressed' | 'disabled'): void {
    this.currentState = state;
    this.buttonGraphics.clear();

    const colors = this.getButtonColors();
    const stateColors = colors[state];
    
    const x = -this.buttonWidth / 2;
    const y = -this.buttonHeight / 2;

    // シャドウ（プレス時は小さく）
    if (state !== 'disabled' && state !== 'pressed') {
      this.buttonGraphics.fillStyle(0x000000, 0.3);
      this.buttonGraphics.fillRect(x + 2, y + 4, this.buttonWidth, this.buttonHeight);
    }

    // メインボタン（プレス時は少し下に）
    const buttonY = state === 'pressed' ? y + 2 : y;
    
    // グラデーション風の効果（複数の矩形で表現）
    const steps = 5;
    const stepHeight = this.buttonHeight / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const color = this.interpolateColor(stateColors.top, stateColors.bottom, ratio);
      const alpha = stateColors.alpha;
      
      this.buttonGraphics.fillStyle(color, alpha);
      this.buttonGraphics.fillRect(
        x, 
        buttonY + i * stepHeight, 
        this.buttonWidth, 
        stepHeight + 1
      );
    }

    // 枠線
    this.buttonGraphics.lineStyle(2, stateColors.border, 1);
    this.buttonGraphics.strokeRect(x, buttonY, this.buttonWidth, this.buttonHeight);

    // ハイライト（上部）
    if (state !== 'disabled') {
      this.buttonGraphics.fillStyle(0xFFFFFF, stateColors.highlight);
      this.buttonGraphics.fillRect(
        x + 4, 
        buttonY + 4, 
        this.buttonWidth - 8, 
        this.buttonHeight * 0.3
      );
    }

    // ホバー時のグロー
    if (state === 'hover') {
      this.buttonGraphics.lineStyle(3, stateColors.glow, 0.4);
      this.buttonGraphics.strokeRect(x - 1, buttonY - 1, this.buttonWidth + 2, this.buttonHeight + 2);
    }

    // 泡エフェクト
    this.addBubbleEffects(x, buttonY, state);
    
    // 海洋装飾を追加
    this.addOceanDecorations(x, buttonY, state);
  }

  /**
   * 海洋装飾を追加
   */
  private addOceanDecorations(x: number, y: number, state: string): void {
    if (state === 'disabled') return;

    // 波線エフェクト（水流を表現）
    const waveOpacity = state === 'hover' ? 0.4 : 0.2;
    this.buttonGraphics.lineStyle(1, 0xFFFFFF, waveOpacity);
    
    const waveCount = 2;
    for (let w = 0; w < waveCount; w++) {
      const waveY = y + this.buttonHeight * (0.4 + w * 0.3);
      this.buttonGraphics.beginPath();
      this.buttonGraphics.moveTo(x + 8, waveY);
      
      for (let i = 0; i <= this.buttonWidth - 16; i += 6) {
        const waveX = x + 8 + i;
        const waveOffset = Math.sin((i / 6) * Math.PI * 0.5) * 1.5;
        this.buttonGraphics.lineTo(waveX, waveY + waveOffset);
      }
      this.buttonGraphics.strokePath();
    }

    // 深海の粒子エフェクト
    if (this.buttonType === 'primary' && state !== 'disabled') {
      const particleCount = state === 'hover' ? 8 : 5;
      const particleOpacity = state === 'hover' ? 0.3 : 0.15;
      
      for (let i = 0; i < particleCount; i++) {
        const particleX = x + 8 + Math.random() * (this.buttonWidth - 16);
        const particleY = y + 8 + Math.random() * (this.buttonHeight - 16);
        const size = 0.5 + Math.random() * 1;
        
        this.buttonGraphics.fillStyle(0x87CEEB, particleOpacity);
        this.buttonGraphics.fillCircle(particleX, particleY, size);
      }
    }

    // 角の装飾（四角形の力強さを強調）
    if (state === 'hover' || state === 'pressed') {
      const cornerSize = 3;
      const cornerOpacity = 0.6;
      
      this.buttonGraphics.fillStyle(0xFFFFFF, cornerOpacity);
      
      // 四隅に小さな四角形
      this.buttonGraphics.fillRect(x + 2, y + 2, cornerSize, cornerSize);
      this.buttonGraphics.fillRect(x + this.buttonWidth - cornerSize - 2, y + 2, cornerSize, cornerSize);
      this.buttonGraphics.fillRect(x + 2, y + this.buttonHeight - cornerSize - 2, cornerSize, cornerSize);
      this.buttonGraphics.fillRect(x + this.buttonWidth - cornerSize - 2, y + this.buttonHeight - cornerSize - 2, cornerSize, cornerSize);
    }
  }

  /**
   * 泡エフェクトを追加
   */
  private addBubbleEffects(x: number, y: number, state: string): void {
    if (state === 'disabled') return;

    const bubbleCount = state === 'hover' ? 6 : 4;
    const bubbleOpacity = state === 'hover' ? 0.4 : 0.2;

    for (let i = 0; i < bubbleCount; i++) {
      const bubbleX = x + (this.buttonWidth / (bubbleCount + 1)) * (i + 1);
      const bubbleY = y + this.buttonHeight * (0.3 + Math.random() * 0.4);
      const radius = 1 + Math.random() * 1.5;

      this.buttonGraphics.fillStyle(0xFFFFFF, bubbleOpacity);
      this.buttonGraphics.fillCircle(bubbleX, bubbleY, radius);

      this.buttonGraphics.lineStyle(0.5, 0xFFFFFF, bubbleOpacity * 1.5);
      this.buttonGraphics.strokeCircle(bubbleX, bubbleY, radius);
    }
  }

  /**
   * ボタンの色設定を取得
   */
  private getButtonColors(): any {
    const baseColors = {
      primary: {
        normal: { top: 0x1E88E5, bottom: 0x0D47A1, border: 0x01579B, glow: 0x2196F3, alpha: 1, highlight: 0.2 },
        hover: { top: 0x42A5F5, bottom: 0x1E88E5, border: 0x0D47A1, glow: 0x64B5F6, alpha: 1, highlight: 0.3 },
        pressed: { top: 0x0D47A1, bottom: 0x01579B, border: 0x01579B, glow: 0x1E88E5, alpha: 1, highlight: 0.1 },
        disabled: { top: 0x666666, bottom: 0x444444, border: 0x333333, glow: 0x666666, alpha: 0.5, highlight: 0 }
      },
      secondary: {
        normal: { top: 0x26A69A, bottom: 0x004D40, border: 0x00251A, glow: 0x009688, alpha: 1, highlight: 0.2 },
        hover: { top: 0x4DB6AC, bottom: 0x26A69A, border: 0x004D40, glow: 0x80CBC4, alpha: 1, highlight: 0.3 },
        pressed: { top: 0x004D40, bottom: 0x00251A, border: 0x00251A, glow: 0x26A69A, alpha: 1, highlight: 0.1 },
        disabled: { top: 0x666666, bottom: 0x444444, border: 0x333333, glow: 0x666666, alpha: 0.5, highlight: 0 }
      },
      danger: {
        normal: { top: 0xE53935, bottom: 0xB71C1C, border: 0x8E0000, glow: 0xF44336, alpha: 1, highlight: 0.2 },
        hover: { top: 0xEF5350, bottom: 0xE53935, border: 0xB71C1C, glow: 0xEF9A9A, alpha: 1, highlight: 0.3 },
        pressed: { top: 0xB71C1C, bottom: 0x8E0000, border: 0x8E0000, glow: 0xE53935, alpha: 1, highlight: 0.1 },
        disabled: { top: 0x666666, bottom: 0x444444, border: 0x333333, glow: 0x666666, alpha: 0.5, highlight: 0 }
      },
      success: {
        normal: { top: 0x43A047, bottom: 0x1B5E20, border: 0x0D3311, glow: 0x4CAF50, alpha: 1, highlight: 0.2 },
        hover: { top: 0x66BB6A, bottom: 0x43A047, border: 0x1B5E20, glow: 0xA5D6A7, alpha: 1, highlight: 0.3 },
        pressed: { top: 0x1B5E20, bottom: 0x0D3311, border: 0x0D3311, glow: 0x43A047, alpha: 1, highlight: 0.1 },
        disabled: { top: 0x666666, bottom: 0x444444, border: 0x333333, glow: 0x666666, alpha: 0.5, highlight: 0 }
      }
    };

    return baseColors[this.buttonType];
  }

  /**
   * 色の補間
   */
  private interpolateColor(color1: number, color2: number, ratio: number): number {
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
   * テキストスタイルを取得
   */
  private getTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 2,
        fill: true
      }
    };
  }

  /**
   * インタラクションを設定
   */
  private setupInteractions(): void {
    this.on('pointerover', () => {
      if (this.isButtonEnabled && this.currentState !== 'hover') {
        this.drawButton('hover');
        this.addHoverEffects();
      }
    });

    this.on('pointerout', () => {
      if (this.isButtonEnabled && this.currentState !== 'normal') {
        this.drawButton('normal');
        this.removeHoverEffects();
      }
    });

    this.on('pointerdown', () => {
      if (this.isButtonEnabled) {
        this.drawButton('pressed');
        this.addPressEffects();
      }
    });

    this.on('pointerup', () => {
      if (this.isButtonEnabled) {
        this.drawButton('hover');
        this.removePressEffects();
        
        if (this.clickCallback) {
          this.clickCallback();
        }
        
        this.addClickEffects();
      }
    });
  }

  /**
   * ホバーエフェクトを追加
   */
  private addHoverEffects(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 150,
      ease: 'Power2'
    });
  }

  /**
   * ホバーエフェクトを削除
   */
  private removeHoverEffects(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Power2'
    });
  }

  /**
   * プレスエフェクトを追加
   */
  private addPressEffects(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 100,
      ease: 'Power2'
    });
  }

  /**
   * プレスエフェクトを削除
   */
  private removePressEffects(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2'
    });
  }

  /**
   * クリックエフェクトを追加
   */
  private addClickEffects(): void {
    // 波紋エフェクト
    const ripple = this.scene.add.graphics();
    ripple.lineStyle(3, 0xFFFFFF, 0.8);
    ripple.strokeCircle(0, 0, 10);
    
    this.add(ripple);
    
    this.scene.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        ripple.destroy();
      }
    });
  }

  /**
   * ボタンを有効/無効にする
   */
  public setEnabled(enabled: boolean): void {
    this.isButtonEnabled = enabled;
    
    if (enabled) {
      this.drawButton('normal');
      this.setInteractive();
      this.setAlpha(1);
    } else {
      this.drawButton('disabled');
      this.disableInteractive();
      this.setAlpha(0.8);
    }
  }

  /**
   * ボタンテキストを変更
   */
  public setText(text: string): void {
    this.buttonText.setText(text);
  }

  /**
   * クリックコールバックを設定
   */
  public setCallback(callback: () => void): void {
    this.clickCallback = callback;
  }

  /**
   * ボタンの破棄
   */
  public destroy(): void {
    this.scene.tweens.killTweensOf(this);
    super.destroy();
  }
}
