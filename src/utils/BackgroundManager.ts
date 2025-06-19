/**
 * 背景エフェクト管理システム
 * 海をテーマにした美しい背景演出を提供
 */
export class BackgroundManager {
  private scene: Phaser.Scene;
  private bubbles: Phaser.GameObjects.Graphics[] = [];
  private waves: Phaser.GameObjects.Graphics[] = [];
  private backgroundLayer!: Phaser.GameObjects.Container;
  private isActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 海の背景エフェクトを作成・開始
   */
  createOceanBackground(intensity: 'light' | 'normal' | 'heavy' = 'normal'): void {
    if (this.isActive) {
      this.destroy();
    }

    // 背景色を海の深い青に設定
    this.scene.cameras.main.setBackgroundColor('#0B2F5C');
    
    // 背景レイヤーを作成（最背面）
    this.backgroundLayer = this.scene.add.container(0, 0);
    this.backgroundLayer.setDepth(-1000);
    
    // 強度に応じてエフェクトを調整
    const config = this.getIntensityConfig(intensity);
    
    this.createBubbles(config.bubbleCount, config.bubbleOpacity);
    this.createWaves(config.waveCount, config.waveOpacity);
    this.startAnimations(config.animationSpeed);
    
    this.isActive = true;
  }

  /**
   * 強度設定を取得
   */
  private getIntensityConfig(intensity: 'light' | 'normal' | 'heavy') {
    switch (intensity) {
      case 'light':
        return {
          bubbleCount: 8,
          bubbleOpacity: 0.2,
          waveCount: 2,
          waveOpacity: 0.3,
          animationSpeed: 0.7
        };
      case 'heavy':
        return {
          bubbleCount: 25,
          bubbleOpacity: 0.4,
          waveCount: 5,
          waveOpacity: 0.6,
          animationSpeed: 1.3
        };
      default: // normal
        return {
          bubbleCount: 15,
          bubbleOpacity: 0.3,
          waveCount: 3,
          waveOpacity: 0.5,
          animationSpeed: 1.0
        };
    }
  }

  /**
   * 泡エフェクトを作成
   */
  private createBubbles(count: number, opacity: number): void {
    const { width, height } = this.scene.cameras.main;
    
    for (let i = 0; i < count; i++) {
      const bubble = this.scene.add.graphics();
      const size = Phaser.Math.Between(3, 8);
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(height, height + 100);
      
      bubble.fillStyle(0x7DB9E8, opacity);
      bubble.fillCircle(0, 0, size);
      bubble.setPosition(x, y);
      
      this.backgroundLayer.add(bubble);
      this.bubbles.push(bubble);
    }
  }

  /**
   * 波エフェクトを作成
   */
  private createWaves(count: number, opacity: number): void {
    const { width, height } = this.scene.cameras.main;
    
    for (let i = 0; i < count; i++) {
      const wave = this.scene.add.graphics();
      wave.lineStyle(2, 0x2E8B57, opacity);
      
      // 波の形を描画
      wave.beginPath();
      for (let x = 0; x <= width; x += 10) {
        const y = height - 50 - (i * 30) + Math.sin((x / 50) + (i * 0.5)) * 10;
        if (x === 0) {
          wave.moveTo(x, y);
        } else {
          wave.lineTo(x, y);
        }
      }
      wave.strokePath();
      
      this.backgroundLayer.add(wave);
      this.waves.push(wave);
    }
  }

  /**
   * アニメーションを開始
   */
  private startAnimations(speed: number): void {
    // 泡の上昇アニメーション
    this.bubbles.forEach((bubble, index) => {
      const delay = index * 200;
      const duration = Phaser.Math.Between(3000, 6000) / speed;
      
      this.scene.tweens.add({
        targets: bubble,
        y: -50,
        alpha: { from: bubble.alpha, to: 0 },
        duration: duration,
        delay: delay,
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          // 泡を画面下部にリセット
          bubble.y = this.scene.cameras.main.height + 50;
          bubble.x = Phaser.Math.Between(0, this.scene.cameras.main.width);
          bubble.alpha = bubble.alpha || 0.3;
        }
      });
    });
    
    // 波の揺らめきアニメーション
    this.waves.forEach((wave, index) => {
      this.scene.tweens.add({
        targets: wave,
        x: -20,
        duration: (4000 + (index * 500)) / speed,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    });
  }

  /**
   * 特別なエフェクトを追加（成功時など）
   */
  addSpecialEffect(type: 'success' | 'celebration' | 'transition'): void {
    const { width, height } = this.scene.cameras.main;
    
    switch (type) {
      case 'success':
        this.createSuccessBubbles();
        break;
      case 'celebration':
        this.createCelebrationWaves();
        break;
      case 'transition':
        this.createTransitionRipple();
        break;
    }
  }

  /**
   * 成功時の泡エフェクト
   */
  private createSuccessBubbles(): void {
    const { width, height } = this.scene.cameras.main;
    
    for (let i = 0; i < 20; i++) {
      const bubble = this.scene.add.graphics();
      const size = Phaser.Math.Between(5, 15);
      const x = Phaser.Math.Between(0, width);
      const y = height;
      
      bubble.fillStyle(0x7DB9E8, 0.6);
      bubble.fillCircle(0, 0, size);
      bubble.setPosition(x, y);
      bubble.setDepth(1000);
      
      this.scene.tweens.add({
        targets: bubble,
        y: -50,
        x: x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scale: 0.5,
        duration: Phaser.Math.Between(1000, 2000),
        ease: 'Power2',
        onComplete: () => {
          bubble.destroy();
        }
      });
    }
  }

  /**
   * お祝い時の波エフェクト
   */
  private createCelebrationWaves(): void {
    const { width, height } = this.scene.cameras.main;
    
    for (let i = 0; i < 5; i++) {
      const wave = this.scene.add.graphics();
      wave.lineStyle(4, 0xFFD700, 0.8);
      wave.setDepth(1000);
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      this.scene.tweens.add({
        targets: { radius: 0 },
        radius: Math.max(width, height),
        duration: 2000,
        delay: i * 200,
        ease: 'Power2.easeOut',
        onUpdate: (tween) => {
          const radius = tween.getValue();
          wave.clear();
          wave.lineStyle(4 - (radius / 200), 0xFFD700, 0.8 - (radius / 1000));
          wave.strokeCircle(centerX, centerY, radius);
        },
        onComplete: () => {
          wave.destroy();
        }
      });
    }
  }

  /**
   * 遷移時の波紋エフェクト
   */
  private createTransitionRipple(): void {
    const { width, height } = this.scene.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const ripple = this.scene.add.graphics();
    ripple.setDepth(1000);
    
    this.scene.tweens.add({
      targets: { radius: 0, alpha: 1 },
      radius: Math.max(width, height) * 1.5,
      alpha: 0,
      duration: 1000,
      ease: 'Power2.easeOut',
      onUpdate: (tween) => {
        const radius = tween.getValue();
        const alpha = 1 - tween.progress;
        
        ripple.clear();
        ripple.lineStyle(3, 0x1E5799, alpha);
        ripple.strokeCircle(centerX, centerY, radius);
      },
      onComplete: () => {
        ripple.destroy();
      }
    });
  }

  /**
   * 背景エフェクトを一時停止
   */
  pause(): void {
    if (this.backgroundLayer) {
      this.backgroundLayer.setVisible(false);
    }
  }

  /**
   * 背景エフェクトを再開
   */
  resume(): void {
    if (this.backgroundLayer) {
      this.backgroundLayer.setVisible(true);
    }
  }

  /**
   * 背景エフェクトを破棄
   */
  destroy(): void {
    if (this.backgroundLayer) {
      this.backgroundLayer.destroy();
    }
    
    this.bubbles.forEach(bubble => {
      if (bubble && bubble.scene) {
        bubble.destroy();
      }
    });
    
    this.waves.forEach(wave => {
      if (wave && wave.scene) {
        wave.destroy();
      }
    });
    
    this.bubbles = [];
    this.waves = [];
    this.isActive = false;
  }
}
