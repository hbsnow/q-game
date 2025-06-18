/**
 * アイテム効果の視覚化ユーティリティ
 */

import Phaser from 'phaser';
import { Block } from '../types/Block';

/**
 * アイテム効果の視覚化クラス
 */
export class ItemEffectVisualizer {
  private scene: Phaser.Scene;
  private previewSprites: Phaser.GameObjects.Sprite[] = [];
  private effectSprites: Phaser.GameObjects.Sprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * アイテム効果のプレビューを表示
   */
  showPreview(affectedPositions: {x: number, y: number}[], boardX: number, boardY: number, blockSize: number): void {
    this.clearPreview();

    affectedPositions.forEach(pos => {
      const previewSprite = this.scene.add.sprite(
        boardX + pos.x * blockSize + blockSize / 2,
        boardY + pos.y * blockSize + blockSize / 2,
        'block'
      );
      
      previewSprite.setTint(0xFFFF00); // 黄色でハイライト
      previewSprite.setAlpha(0.5);
      previewSprite.setScale(1.1); // 少し大きく表示
      
      // 脈動エフェクト
      this.scene.tweens.add({
        targets: previewSprite,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.previewSprites.push(previewSprite);
    });
  }

  /**
   * プレビューをクリア
   */
  clearPreview(): void {
    this.previewSprites.forEach(sprite => {
      this.scene.tweens.killTweensOf(sprite);
      sprite.destroy();
    });
    this.previewSprites = [];
  }

  /**
   * 爆弾エフェクトを表示
   */
  showBombEffect(centerX: number, centerY: number, callback?: () => void): void {
    // 爆発の中心エフェクト
    const explosionCenter = this.scene.add.sprite(centerX, centerY, 'block');
    explosionCenter.setTint(0xFF4500); // オレンジ色
    explosionCenter.setScale(0.1);

    // 爆発拡大アニメーション
    this.scene.tweens.add({
      targets: explosionCenter,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        explosionCenter.destroy();
        if (callback) callback();
      }
    });

    // 波紋エフェクト
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const ripple = this.scene.add.sprite(centerX, centerY, 'block');
        ripple.setTint(0xFFFFFF);
        ripple.setAlpha(0.3);
        ripple.setScale(1 + i * 0.5);

        this.scene.tweens.add({
          targets: ripple,
          scaleX: 4 + i,
          scaleY: 4 + i,
          alpha: 0,
          duration: 500,
          ease: 'Power2',
          onComplete: () => ripple.destroy()
        });
      });
    }
  }

  /**
   * ハンマーエフェクトを表示
   */
  showHammerEffect(targetX: number, targetY: number, callback?: () => void): void {
    // ハンマーアイコン（仮想的な表現）
    const hammer = this.scene.add.sprite(targetX, targetY - 50, 'block');
    hammer.setTint(0x8B4513); // 茶色
    hammer.setScale(0.8);

    // ハンマーが降りてくるアニメーション
    this.scene.tweens.add({
      targets: hammer,
      y: targetY,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // 衝撃エフェクト
        const impact = this.scene.add.sprite(targetX, targetY, 'block');
        impact.setTint(0xFFFFFF);
        impact.setScale(0.5);

        this.scene.tweens.add({
          targets: impact,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            impact.destroy();
            hammer.destroy();
            if (callback) callback();
          }
        });
      }
    });
  }

  /**
   * 色変更エフェクトを表示
   */
  showColorChangeEffect(positions: {x: number, y: number}[], boardX: number, boardY: number, blockSize: number, newColor: number, callback?: () => void): void {
    let completedCount = 0;
    const totalCount = positions.length;

    positions.forEach((pos, index) => {
      this.scene.time.delayedCall(index * 50, () => {
        const effectSprite = this.scene.add.sprite(
          boardX + pos.x * blockSize + blockSize / 2,
          boardY + pos.y * blockSize + blockSize / 2,
          'block'
        );
        
        effectSprite.setTint(newColor);
        effectSprite.setScale(0.1);
        effectSprite.setAlpha(0.8);

        this.scene.tweens.add({
          targets: effectSprite,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 300,
          ease: 'Power2',
          onComplete: () => {
            effectSprite.destroy();
            completedCount++;
            if (completedCount === totalCount && callback) {
              callback();
            }
          }
        });
      });
    });
  }

  /**
   * シャッフルエフェクトを表示
   */
  showShuffleEffect(callback?: () => void): void {
    // 画面全体に渦巻きエフェクト
    const swirl = this.scene.add.sprite(400, 355, 'block'); // 画面中央
    swirl.setTint(0x00FFFF); // 水色
    swirl.setScale(0.1);
    swirl.setAlpha(0.6);

    this.scene.tweens.add({
      targets: swirl,
      scaleX: 10,
      scaleY: 10,
      rotation: Math.PI * 4, // 2回転
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        swirl.destroy();
        if (callback) callback();
      }
    });
  }

  /**
   * 氷結解除エフェクトを表示
   */
  showMeltingEffect(targetX: number, targetY: number, callback?: () => void): void {
    // 氷が溶けるエフェクト
    const meltEffect = this.scene.add.sprite(targetX, targetY, 'block');
    meltEffect.setTint(0x87CEEB); // スカイブルー
    meltEffect.setScale(1.2);

    // 溶解アニメーション
    this.scene.tweens.add({
      targets: meltEffect,
      scaleY: 0.1,
      alpha: 0.3,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        meltEffect.destroy();
        if (callback) callback();
      }
    });

    // 水滴エフェクト
    for (let i = 0; i < 3; i++) {
      const droplet = this.scene.add.sprite(
        targetX + (Math.random() - 0.5) * 20,
        targetY,
        'block'
      );
      droplet.setTint(0x0000FF); // 青色
      droplet.setScale(0.2);

      this.scene.tweens.add({
        targets: droplet,
        y: targetY + 30,
        alpha: 0,
        duration: 300 + i * 100,
        ease: 'Power2',
        onComplete: () => droplet.destroy()
      });
    }
  }

  /**
   * スコアブースターエフェクトを表示
   */
  showScoreBoosterEffect(callback?: () => void): void {
    // 画面全体に金色の光エフェクト
    const boostEffect = this.scene.add.sprite(400, 355, 'block'); // 画面中央
    boostEffect.setTint(0xFFD700); // 金色
    boostEffect.setScale(0.1);
    boostEffect.setAlpha(0.8);

    this.scene.tweens.add({
      targets: boostEffect,
      scaleX: 15,
      scaleY: 15,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        boostEffect.destroy();
        if (callback) callback();
      }
    });

    // 星のエフェクト
    for (let i = 0; i < 8; i++) {
      const star = this.scene.add.sprite(
        400 + Math.cos(i * Math.PI / 4) * 100,
        355 + Math.sin(i * Math.PI / 4) * 100,
        'block'
      );
      star.setTint(0xFFD700);
      star.setScale(0.3);

      this.scene.tweens.add({
        targets: star,
        scaleX: 0.8,
        scaleY: 0.8,
        alpha: 0,
        duration: 800,
        delay: i * 50,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }
  }

  /**
   * 全てのエフェクトをクリア
   */
  clearAllEffects(): void {
    this.clearPreview();
    this.effectSprites.forEach(sprite => {
      this.scene.tweens.killTweensOf(sprite);
      sprite.destroy();
    });
    this.effectSprites = [];
  }
}
