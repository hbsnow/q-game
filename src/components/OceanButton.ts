import { UIAssets } from '../assets/UIAssets';

/**
 * 海洋テーマのインタラクティブボタンコンポーネント
 */
export class OceanButton extends Phaser.GameObjects.Container {
  private buttonSprite!: Phaser.GameObjects.Image;
  private buttonText!: Phaser.GameObjects.Text;
  private normalTextureKey!: string;
  private hoverTextureKey!: string;
  private pressedTextureKey!: string;
  private disabledTextureKey!: string;
  private clickCallback?: () => void;
  private isButtonEnabled: boolean = true;
  private buttonType: 'primary' | 'secondary' | 'danger' | 'success';
  private buttonWidth: number;
  private buttonHeight: number;

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
    // テクスチャキーを生成
    this.normalTextureKey = `ocean_button_${this.buttonType}_normal_${this.buttonWidth}x${this.buttonHeight}`;
    this.hoverTextureKey = `ocean_button_${this.buttonType}_hover_${this.buttonWidth}x${this.buttonHeight}`;
    this.pressedTextureKey = `ocean_button_${this.buttonType}_pressed_${this.buttonWidth}x${this.buttonHeight}`;
    this.disabledTextureKey = `ocean_button_${this.buttonType}_disabled_${this.buttonWidth}x${this.buttonHeight}`;

    // テクスチャを生成
    UIAssets.createOceanButton(this.scene, this.buttonWidth, this.buttonHeight, this.buttonType);
    UIAssets.createOceanButtonHover(this.scene, this.buttonWidth, this.buttonHeight, this.buttonType);
    UIAssets.createOceanButtonPressed(this.scene, this.buttonWidth, this.buttonHeight, this.buttonType);
    UIAssets.createOceanButtonDisabled(this.scene, this.buttonWidth, this.buttonHeight, this.buttonType);

    // ボタンスプライト
    this.buttonSprite = this.scene.add.image(0, 0, this.normalTextureKey);
    this.buttonSprite.setOrigin(0.5, 0.5);
    this.add(this.buttonSprite);

    // ボタンテキスト
    const textStyle = this.getTextStyle();
    this.buttonText = this.scene.add.text(0, 0, text, textStyle);
    this.buttonText.setOrigin(0.5, 0.5);
    this.add(this.buttonText);

    // インタラクティブ設定
    this.setSize(this.buttonWidth, this.buttonHeight);
    this.setInteractive();
  }

  /**
   * テキストスタイルを取得
   */
  private getTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    const baseStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '18px',
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

    // ボタンタイプに応じた色調整
    switch (this.buttonType) {
      case 'primary':
        baseStyle.color = '#FFFFFF';
        break;
      case 'secondary':
        baseStyle.color = '#FFFFFF';
        break;
      case 'danger':
        baseStyle.color = '#FFFFFF';
        break;
      case 'success':
        baseStyle.color = '#FFFFFF';
        break;
    }

    return baseStyle;
  }

  /**
   * インタラクションを設定
   */
  private setupInteractions(): void {
    // ホバー開始
    this.on('pointerover', () => {
      if (this.isButtonEnabled) {
        this.buttonSprite.setTexture(this.hoverTextureKey);
        this.addHoverEffects();
      }
    });

    // ホバー終了
    this.on('pointerout', () => {
      if (this.isButtonEnabled) {
        this.buttonSprite.setTexture(this.normalTextureKey);
        this.removeHoverEffects();
      }
    });

    // プレス開始
    this.on('pointerdown', () => {
      if (this.isButtonEnabled) {
        this.buttonSprite.setTexture(this.pressedTextureKey);
        this.addPressEffects();
      }
    });

    // プレス終了
    this.on('pointerup', () => {
      if (this.isButtonEnabled) {
        this.buttonSprite.setTexture(this.hoverTextureKey);
        this.removePressEffects();
        
        // クリック処理
        if (this.clickCallback) {
          this.clickCallback();
        }
        
        // クリックエフェクト
        this.addClickEffects();
      }
    });
  }

  /**
   * ホバーエフェクトを追加
   */
  private addHoverEffects(): void {
    // スケールアニメーション
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 150,
      ease: 'Power2'
    });

    // テキストの輝きエフェクト
    this.scene.tweens.add({
      targets: this.buttonText,
      alpha: 0.8,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * ホバーエフェクトを削除
   */
  private removeHoverEffects(): void {
    // スケールを元に戻す
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Power2'
    });

    // テキストのアニメーションを停止
    this.scene.tweens.killTweensOf(this.buttonText);
    this.buttonText.setAlpha(1);
  }

  /**
   * プレスエフェクトを追加
   */
  private addPressEffects(): void {
    // 押し込みアニメーション
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
    // スケールを戻す
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

    // パーティクル風エフェクト
    this.createClickParticles();
  }

  /**
   * クリック時のパーティクルエフェクト
   */
  private createClickParticles(): void {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      
      const particle = this.scene.add.graphics();
      particle.fillStyle(0xFFFFFF, 0.8);
      particle.fillCircle(0, 0, 2);
      
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      
      this.add(particle);
      
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 500 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * ボタンを有効/無効にする
   */
  public setEnabled(enabled: boolean): void {
    this.isButtonEnabled = enabled;
    
    if (enabled) {
      this.buttonSprite.setTexture(this.normalTextureKey);
      this.setInteractive();
      this.setAlpha(1);
    } else {
      this.buttonSprite.setTexture(this.disabledTextureKey);
      this.disableInteractive();
      this.setAlpha(0.6);
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
    // アニメーションを停止
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.buttonText);
    
    super.destroy();
  }
}
