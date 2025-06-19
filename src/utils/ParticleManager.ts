/**
 * パーティクル管理システム
 * ゲーム内の視覚エフェクトを統一管理
 */

export interface ParticleConfig {
  x: number;
  y: number;
  count?: number;
  duration?: number;
  color?: number;
  scale?: number;
  alpha?: number;
  speed?: number;
}

/**
 * パーティクル管理クラス
 */
export class ParticleManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * ブロック消去時の泡エフェクト
   */
  createBubbleEffect(config: ParticleConfig): void {
    // 複数の小さな円を作成して泡エフェクトを模擬
    const count = config.count || 5;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const distance = Math.random() * 15;
      const x = config.x + Math.cos(angle) * distance;
      const y = config.y + Math.sin(angle) * distance;
      
      const bubble = this.scene.add.circle(x, y, 3, 0x7DB9E8, config.alpha || 0.8);
      
      this.scene.tweens.add({
        targets: bubble,
        y: y - 30,
        alpha: 0,
        scale: config.scale || 0.3,
        duration: config.duration || 800,
        ease: 'Power2',
        onComplete: () => {
          bubble.destroy();
        }
      });
    }
  }

  /**
   * 爆発エフェクト（爆弾・ハンマー用）
   */
  createExplosionEffect(config: ParticleConfig): void {
    const count = config.count || 10;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = Math.random() * 20;
      const x = config.x + Math.cos(angle) * distance;
      const y = config.y + Math.sin(angle) * distance;
      
      const spark = this.scene.add.rectangle(x, y, 4, 4, config.color || 0xFF6347);
      
      const targetX = x + Math.cos(angle) * (config.speed || 100);
      const targetY = y + Math.sin(angle) * (config.speed || 100);
      
      this.scene.tweens.add({
        targets: spark,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0,
        duration: config.duration || 600,
        ease: 'Power2',
        onComplete: () => {
          spark.destroy();
        }
      });
    }
  }

  /**
   * 全消しボーナス時の特別エフェクト
   */
  createAllClearEffect(centerX: number, centerY: number): void {
    // 虹色の星エフェクト
    const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
    
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const distance = Math.random() * 30;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const color = colors[i % colors.length];
      
      const star = this.scene.add.star(x, y, 5, 4, 8, color);
      
      const targetX = x + Math.cos(angle) * 150;
      const targetY = y + Math.sin(angle) * 150;
      
      this.scene.tweens.add({
        targets: star,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0,
        rotation: Math.PI * 2,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          star.destroy();
        }
      });
    }

    // 波紋エフェクト
    this.createRippleEffect(centerX, centerY);
  }

  /**
   * レアアイテム獲得時のキラキラエフェクト
   */
  createRareItemEffect(config: ParticleConfig): void {
    const count = config.count || 15;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 25;
      const x = config.x + Math.cos(angle) * distance;
      const y = config.y + Math.sin(angle) * distance;
      
      const sparkle = this.scene.add.star(x, y, 4, 2, 4, config.color || 0xFFD700);
      
      this.scene.tweens.add({
        targets: sparkle,
        y: y - 20,
        alpha: 0,
        scale: 0,
        rotation: Math.PI * 2,
        duration: 1200,
        ease: 'Power2',
        onComplete: () => {
          sparkle.destroy();
        }
      });
    }
  }

  /**
   * 波紋エフェクト
   */
  private createRippleEffect(x: number, y: number): void {
    // 複数の波紋を作成
    for (let i = 0; i < 3; i++) {
      const ripple = this.scene.add.circle(x, y, 10, 0x7DB9E8, 0.3);
      
      this.scene.tweens.add({
        targets: ripple,
        scaleX: 8,
        scaleY: 8,
        alpha: 0,
        duration: 1000,
        delay: i * 200,
        ease: 'Power2',
        onComplete: () => {
          ripple.destroy();
        }
      });
    }
  }

  /**
   * スコア獲得時のテキストエフェクト
   */
  createScoreEffect(x: number, y: number, score: number, isGreat: boolean = false): void {
    const scoreText = this.scene.add.text(x, y, `+${score}`, {
      fontSize: isGreat ? '24px' : '18px',
      color: isGreat ? '#FFD700' : '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 称賛テキストも表示（大量消去時）
    if (isGreat) {
      const praiseText = this.scene.add.text(x, y - 30, 'GREAT!', {
        fontSize: '20px',
        color: '#FF6347',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: praiseText,
        y: y - 60,
        alpha: 0,
        scale: 1.2,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          praiseText.destroy();
        }
      });
    }

    // スコアテキストのアニメーション
    this.scene.tweens.add({
      targets: scoreText,
      y: y - 40,
      alpha: 0,
      scale: isGreat ? 1.3 : 1.1,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  /**
   * アイテム使用時のエフェクト
   */
  createItemUseEffect(x: number, y: number, itemType: string): void {
    let config: ParticleConfig;

    switch (itemType) {
      case 'bomb':
      case 'miniBomb':
        config = {
          x, y,
          count: 15,
          duration: 800,
          color: 0xFF6347,
          speed: 120
        };
        this.createExplosionEffect(config);
        break;

      case 'hammer':
      case 'steelHammer':
      case 'specialHammer':
        config = {
          x, y,
          count: 8,
          duration: 600,
          color: 0x8B4513,
          speed: 100
        };
        this.createExplosionEffect(config);
        break;

      case 'shuffle':
        // シャッフル時は画面全体に軽いエフェクト
        this.createShuffleEffect();
        break;

      default:
        // その他のアイテムは軽いキラキラエフェクト
        config = {
          x, y,
          count: 5,
          duration: 400,
          color: 0x7DB9E8
        };
        this.createBubbleEffect(config);
        break;
    }
  }

  /**
   * シャッフル時の全画面エフェクト
   */
  private createShuffleEffect(): void {
    const { width, height } = this.scene.cameras.main;
    
    // 画面全体に軽い波紋エフェクト
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(100, height - 100);
      
      this.scene.time.delayedCall(i * 100, () => {
        this.createBubbleEffect({
          x, y,
          count: 3,
          duration: 600,
          alpha: 0.4
        });
      });
    }
  }

  /**
   * 全てのパーティクルエミッターを停止・削除
   */
  destroy(): void {
    // 現在のアプローチでは特別なクリーンアップは不要
    // 各エフェクトは自動的にクリーンアップされる
  }
}
