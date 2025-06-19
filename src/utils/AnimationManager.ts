/**
 * アニメーション管理システム
 * 滑らかで美しいアニメーション効果を提供
 */
export class AnimationManager {
  private scene: Phaser.Scene;
  private activeAnimations: Set<Phaser.Tweens.Tween> = new Set();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 画面遷移アニメーション
   */
  screenTransition(
    fromScene: string,
    toScene: string,
    type: TransitionType = TransitionType.FADE,
    duration: number = 500
  ): Promise<void> {
    return new Promise((resolve) => {
      switch (type) {
        case TransitionType.FADE:
          this.fadeTransition(toScene, duration, resolve);
          break;
        case TransitionType.SLIDE_LEFT:
          this.slideTransition(toScene, 'left', duration, resolve);
          break;
        case TransitionType.SLIDE_RIGHT:
          this.slideTransition(toScene, 'right', duration, resolve);
          break;
        case TransitionType.WAVE:
          this.waveTransition(toScene, duration, resolve);
          break;
        case TransitionType.BUBBLE:
          this.bubbleTransition(toScene, duration, resolve);
          break;
        default:
          this.fadeTransition(toScene, duration, resolve);
      }
    });
  }

  /**
   * フェード遷移
   */
  private fadeTransition(toScene: string, duration: number, callback: () => void): void {
    const { width, height } = this.scene.cameras.main;
    
    // フェードオーバーレイ
    const fadeOverlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
    fadeOverlay.setOrigin(0);
    fadeOverlay.setDepth(10000);
    
    const tween = this.scene.tweens.add({
      targets: fadeOverlay,
      alpha: 1,
      duration: duration / 2,
      ease: 'Power2.easeIn',
      onComplete: () => {
        this.scene.scene.start(toScene);
        callback();
      }
    });
    
    this.activeAnimations.add(tween);
  }

  /**
   * スライド遷移
   */
  private slideTransition(toScene: string, direction: 'left' | 'right', duration: number, callback: () => void): void {
    const { width, height } = this.scene.cameras.main;
    const slideDistance = direction === 'left' ? -width : width;
    
    // 現在の画面をスライドアウト
    const camera = this.scene.cameras.main;
    const tween = this.scene.tweens.add({
      targets: camera,
      scrollX: slideDistance,
      duration: duration,
      ease: 'Power2.easeInOut',
      onComplete: () => {
        this.scene.scene.start(toScene);
        callback();
      }
    });
    
    this.activeAnimations.add(tween);
  }

  /**
   * 波遷移（海テーマ）
   */
  private waveTransition(toScene: string, duration: number, callback: () => void): void {
    const { width, height } = this.scene.cameras.main;
    
    // 波のマスクを作成
    const waveGraphics = this.scene.add.graphics();
    waveGraphics.setDepth(10000);
    
    let progress = 0;
    const waveHeight = height * 0.3;
    
    const tween = this.scene.tweens.add({
      targets: { progress: 0 },
      progress: 1,
      duration: duration,
      ease: 'Power2.easeInOut',
      onUpdate: (tween) => {
        progress = tween.getValue();
        
        waveGraphics.clear();
        waveGraphics.fillStyle(0x1E5799, 1);
        
        // 波の形を描画
        waveGraphics.beginPath();
        waveGraphics.moveTo(0, height);
        
        for (let x = 0; x <= width; x += 10) {
          const waveY = height - (progress * height) + 
                       Math.sin((x / 50) + (progress * Math.PI * 2)) * waveHeight * (1 - progress);
          waveGraphics.lineTo(x, waveY);
        }
        
        waveGraphics.lineTo(width, height);
        waveGraphics.lineTo(0, height);
        waveGraphics.closePath();
        waveGraphics.fillPath();
      },
      onComplete: () => {
        this.scene.scene.start(toScene);
        callback();
      }
    });
    
    this.activeAnimations.add(tween);
  }

  /**
   * 泡遷移（海テーマ）
   */
  private bubbleTransition(toScene: string, duration: number, callback: () => void): void {
    const { width, height } = this.scene.cameras.main;
    
    // 複数の泡を作成
    const bubbles: Phaser.GameObjects.Graphics[] = [];
    const bubbleCount = 20;
    
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = this.scene.add.graphics();
      const size = Phaser.Math.Between(20, 80);
      const x = Phaser.Math.Between(-size, width + size);
      const y = height + size;
      
      bubble.fillStyle(0x7DB9E8, 0.8);
      bubble.fillCircle(0, 0, size);
      bubble.setPosition(x, y);
      bubble.setDepth(10000);
      
      bubbles.push(bubble);
      
      // 各泡のアニメーション
      const delay = i * (duration / bubbleCount / 2);
      const tween = this.scene.tweens.add({
        targets: bubble,
        y: -size,
        x: x + Phaser.Math.Between(-100, 100),
        scale: { from: 0.5, to: 1.2 },
        alpha: { from: 0.8, to: 0 },
        duration: duration,
        delay: delay,
        ease: 'Power2.easeOut',
        onComplete: () => {
          bubble.destroy();
        }
      });
      
      this.activeAnimations.add(tween);
    }
    
    // 遷移タイミング
    this.scene.time.delayedCall(duration * 0.7, () => {
      this.scene.scene.start(toScene);
      callback();
    });
  }

  /**
   * ボタンクリックアニメーション
   */
  buttonClick(target: Phaser.GameObjects.GameObject, callback?: () => void): void {
    const tween = this.scene.tweens.add({
      targets: target,
      scale: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
      }
    });
    
    this.activeAnimations.add(tween);
  }

  /**
   * ボタンホバーアニメーション
   */
  buttonHover(target: Phaser.GameObjects.GameObject, isHover: boolean): void {
    const targetScale = isHover ? 1.05 : 1;
    
    const tween = this.scene.tweens.add({
      targets: target,
      scale: targetScale,
      duration: 200,
      ease: 'Power2'
    });
    
    this.activeAnimations.add(tween);
  }

  /**
   * 要素の登場アニメーション
   */
  elementAppear(
    target: Phaser.GameObjects.GameObject,
    type: AppearType = AppearType.FADE_IN,
    delay: number = 0
  ): void {
    switch (type) {
      case AppearType.FADE_IN:
        this.fadeInAnimation(target, delay);
        break;
      case AppearType.SCALE_IN:
        this.scaleInAnimation(target, delay);
        break;
      case AppearType.SLIDE_UP:
        this.slideUpAnimation(target, delay);
        break;
      case AppearType.BOUNCE_IN:
        this.bounceInAnimation(target, delay);
        break;
      case AppearType.BUBBLE_UP:
        this.bubbleUpAnimation(target, delay);
        break;
    }
  }

  /**
   * フェードイン
   */
  private fadeInAnimation(target: Phaser.GameObjects.GameObject, delay: number): void {
    if ('setAlpha' in target) {
      (target as any).setAlpha(0);
      
      const tween = this.scene.tweens.add({
        targets: target,
        alpha: 1,
        duration: 500,
        delay: delay,
        ease: 'Power2.easeOut'
      });
      
      this.activeAnimations.add(tween);
    }
  }

  /**
   * スケールイン
   */
  private scaleInAnimation(target: Phaser.GameObjects.GameObject, delay: number): void {
    if ('setScale' in target && 'setAlpha' in target) {
      (target as any).setScale(0);
      (target as any).setAlpha(0);
      
      const tween = this.scene.tweens.add({
        targets: target,
        scale: 1,
        alpha: 1,
        duration: 400,
        delay: delay,
        ease: 'Back.easeOut'
      });
      
      this.activeAnimations.add(tween);
    }
  }

  /**
   * 上からスライドイン
   */
  private slideUpAnimation(target: Phaser.GameObjects.GameObject, delay: number): void {
    if ('y' in target && 'setAlpha' in target) {
      const originalY = (target as any).y;
      (target as any).y = originalY + 50;
      (target as any).setAlpha(0);
      
      const tween = this.scene.tweens.add({
        targets: target,
        y: originalY,
        alpha: 1,
        duration: 600,
        delay: delay,
        ease: 'Power2.easeOut'
      });
      
      this.activeAnimations.add(tween);
    }
  }

  /**
   * バウンスイン
   */
  private bounceInAnimation(target: Phaser.GameObjects.GameObject, delay: number): void {
    if ('setScale' in target) {
      (target as any).setScale(0);
      
      const tween = this.scene.tweens.add({
        targets: target,
        scale: 1,
        duration: 800,
        delay: delay,
        ease: 'Bounce.easeOut'
      });
      
      this.activeAnimations.add(tween);
    }
  }

  /**
   * 泡のように浮上
   */
  private bubbleUpAnimation(target: Phaser.GameObjects.GameObject, delay: number): void {
    if ('y' in target && 'setScale' in target && 'setAlpha' in target) {
      const originalY = (target as any).y;
      (target as any).y = originalY + 30;
      (target as any).setScale(0.8);
      (target as any).setAlpha(0);
      
      const tween = this.scene.tweens.add({
        targets: target,
        y: originalY,
        scale: 1,
        alpha: 1,
        duration: 700,
        delay: delay,
        ease: 'Power2.easeOut'
      });
      
      this.activeAnimations.add(tween);
    }
  }

  /**
   * 連続アニメーション
   */
  sequenceAnimation(animations: SequenceAnimation[]): Promise<void> {
    return new Promise((resolve) => {
      let currentIndex = 0;
      
      const playNext = () => {
        if (currentIndex >= animations.length) {
          resolve();
          return;
        }
        
        const anim = animations[currentIndex];
        currentIndex++;
        
        this.elementAppear(anim.target, anim.type, 0);
        
        this.scene.time.delayedCall(anim.delay || 200, playNext);
      };
      
      playNext();
    });
  }

  /**
   * パルスアニメーション（注意喚起用）
   */
  pulseAnimation(target: Phaser.GameObjects.GameObject, count: number = 3): void {
    const tween = this.scene.tweens.add({
      targets: target,
      scale: 1.1,
      alpha: 0.8,
      duration: 300,
      yoyo: true,
      repeat: count * 2 - 1,
      ease: 'Power2'
    });
    
    this.activeAnimations.add(tween);
  }

  /**
   * 全てのアニメーションを停止
   */
  stopAllAnimations(): void {
    this.activeAnimations.forEach(tween => {
      if (tween && !tween.isDestroyed()) {
        tween.stop();
      }
    });
    this.activeAnimations.clear();
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    this.stopAllAnimations();
  }
}

/**
 * 遷移タイプ
 */
export enum TransitionType {
  FADE = 'fade',
  SLIDE_LEFT = 'slide_left',
  SLIDE_RIGHT = 'slide_right',
  WAVE = 'wave',
  BUBBLE = 'bubble'
}

/**
 * 登場アニメーションタイプ
 */
export enum AppearType {
  FADE_IN = 'fade_in',
  SCALE_IN = 'scale_in',
  SLIDE_UP = 'slide_up',
  BOUNCE_IN = 'bounce_in',
  BUBBLE_UP = 'bubble_up'
}

/**
 * 連続アニメーション設定
 */
export interface SequenceAnimation {
  target: Phaser.GameObjects.GameObject;
  type: AppearType;
  delay?: number;
}
