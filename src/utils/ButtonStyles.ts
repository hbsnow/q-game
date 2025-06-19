import Phaser from 'phaser';

/**
 * ボタンサイズの定義（XS/S/M/L）
 */
export const BUTTON_SIZES = {
  XS: { width: 100, height: 30 },
  S: { width: 120, height: 40 },
  M: { width: 140, height: 50 },
  L: { width: 200, height: 60 }
} as const;

/**
 * ボタン配置の統一間隔定義
 */
export const BUTTON_SPACING = {
  // 2つのボタンが並ぶ時の標準間隔（中心間距離）
  DUAL_BUTTONS: 160,
  // ガチャボタンなど、少し狭めの間隔
  COMPACT: 140
} as const;

/**
 * 統一されたボタンスタイル定義
 */
export interface ButtonStyle {
  width: number;
  height: number;
  backgroundColor: number;
  borderColor: number;
  borderWidth: number;
  textColor: string;
  fontSize: string;
  hoverScale: number;
}

/**
 * ボタンタイプ別のスタイル定義（サイズは別途指定）
 */
export const BUTTON_STYLES = {
  // プライマリボタン（メインアクション用）
  PRIMARY: {
    backgroundColor: 0x4A90E2,
    borderColor: 0x2E5984,
    borderWidth: 3,
    textColor: '#FFFFFF',
    fontSize: '18px',
    hoverScale: 1.05
  },

  // セカンダリボタン（サブアクション用）
  SECONDARY: {
    backgroundColor: 0x22AA22,
    borderColor: 0x1A7A1A,
    borderWidth: 2,
    textColor: '#FFFFFF',
    fontSize: '14px',
    hoverScale: 1.05
  },

  // 危険ボタン（注意が必要なアクション用）
  DANGER: {
    backgroundColor: 0xAA2222,
    borderColor: 0x7A1A1A,
    borderWidth: 2,
    textColor: '#FFFFFF',
    fontSize: '14px',
    hoverScale: 1.05
  },

  // ニュートラルボタン（戻る、キャンセル用）
  NEUTRAL: {
    backgroundColor: 0x666666,
    borderColor: 0x444444,
    borderWidth: 2,
    textColor: '#FFFFFF',
    fontSize: '14px',
    hoverScale: 1.05
  },

  // 情報ボタン（確率表示など）
  INFO: {
    backgroundColor: 0x888888,
    borderColor: 0x666666,
    borderWidth: 1,
    textColor: '#FFFFFF',
    fontSize: '12px',
    hoverScale: 1.03
  },

  // 使用済みボタン（無効化されたアイテム用）
  USED: {
    backgroundColor: 0x444444,
    borderColor: 0x333333,
    borderWidth: 2,
    textColor: '#AAAAAA',
    fontSize: '14px',
    hoverScale: 1.0 // ホバーエフェクトなし
  }
};

/**
 * 統一されたボタンを作成するヘルパークラス
 */
export class ButtonFactory {
  /**
   * 統一されたボタンを作成
   */
  static createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    styleType: keyof typeof BUTTON_STYLES,
    size: keyof typeof BUTTON_SIZES,
    onClick?: () => void
  ): { button: Phaser.GameObjects.Graphics, text: Phaser.GameObjects.Text } {
    const style = BUTTON_STYLES[styleType];
    const sizeInfo = BUTTON_SIZES[size];
    
    // 角丸のボタンの背景をGraphicsで作成
    const button = scene.add.graphics();
    
    // 角丸の矩形を描画
    button.fillStyle(style.backgroundColor);
    button.lineStyle(style.borderWidth, style.borderColor);
    
    const cornerRadius = 8; // 角丸の半径
    
    // 中央基準で描画するため、座標を調整
    const rectX = -sizeInfo.width / 2;
    const rectY = -sizeInfo.height / 2;
    
    button.fillRoundedRect(
      rectX,
      rectY,
      sizeInfo.width,
      sizeInfo.height,
      cornerRadius
    );
    button.strokeRoundedRect(
      rectX,
      rectY,
      sizeInfo.width,
      sizeInfo.height,
      cornerRadius
    );

    // ボタンの位置を設定
    button.setPosition(x, y);

    // インタラクティブエリアを設定（中央基準）
    button.setInteractive(
      new Phaser.Geom.Rectangle(
        rectX,
        rectY,
        sizeInfo.width,
        sizeInfo.height
      ),
      Phaser.Geom.Rectangle.Contains
    );
    button.input!.cursor = 'pointer';

    // ボタンのテキスト
    const buttonText = scene.add.text(x, y, text, {
      fontSize: style.fontSize,
      color: style.textColor,
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5, 0.5);

    // テキストの境界を確保するため、わずかに下に調整
    buttonText.y = y + 1;

    // クリックイベント
    if (onClick) {
      button.on('pointerdown', onClick);
    }

    // ホバーエフェクト
    button.on('pointerover', () => {
      scene.tweens.add({
        targets: [button, buttonText],
        scale: style.hoverScale,
        duration: 150,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      scene.tweens.add({
        targets: [button, buttonText],
        scale: 1,
        duration: 150,
        ease: 'Power2'
      });
    });

    return { button, text: buttonText };
  }

  /**
   * プライマリボタンを作成
   */
  static createPrimaryButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    size: keyof typeof BUTTON_SIZES = 'L',
    onClick?: () => void
  ) {
    return this.createButton(scene, x, y, text, 'PRIMARY', size, onClick);
  }

  /**
   * セカンダリボタンを作成
   */
  static createSecondaryButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    size: keyof typeof BUTTON_SIZES = 'S',
    onClick?: () => void
  ) {
    return this.createButton(scene, x, y, text, 'SECONDARY', size, onClick);
  }

  /**
   * 危険ボタンを作成
   */
  static createDangerButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    size: keyof typeof BUTTON_SIZES = 'S',
    onClick?: () => void
  ) {
    return this.createButton(scene, x, y, text, 'DANGER', size, onClick);
  }

  /**
   * ニュートラルボタンを作成
   */
  static createNeutralButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    size: keyof typeof BUTTON_SIZES = 'S',
    onClick?: () => void
  ) {
    return this.createButton(scene, x, y, text, 'NEUTRAL', size, onClick);
  }

  /**
   * 情報ボタンを作成
   */
  static createInfoButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    size: keyof typeof BUTTON_SIZES = 'XS',
    onClick?: () => void
  ) {
    return this.createButton(scene, x, y, text, 'INFO', size, onClick);
  }

  /**
   * 無効化されたボタンを作成（角丸）
   */
  static createDisabledButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    size: keyof typeof BUTTON_SIZES = 'M'
  ): { button: Phaser.GameObjects.Graphics, text: Phaser.GameObjects.Text } {
    const sizeInfo = BUTTON_SIZES[size];
    
    // 角丸の無効化ボタンをGraphicsで作成
    const button = scene.add.graphics();
    
    // 角丸の矩形を描画
    button.fillStyle(0x666666);
    button.lineStyle(2, 0x444444);
    
    const cornerRadius = 8;
    
    // 中央基準で描画するため、座標を調整
    const rectX = -sizeInfo.width / 2;
    const rectY = -sizeInfo.height / 2;
    
    button.fillRoundedRect(
      rectX,
      rectY,
      sizeInfo.width,
      sizeInfo.height,
      cornerRadius
    );
    button.strokeRoundedRect(
      rectX,
      rectY,
      sizeInfo.width,
      sizeInfo.height,
      cornerRadius
    );

    // ボタンの位置を設定
    button.setPosition(x, y);

    // ボタンのテキスト
    const buttonText = scene.add.text(x, y, text, {
      fontSize: '16px',
      color: '#AAAAAA',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5, 0.5);

    // テキストの境界を確保するため、わずかに下に調整
    buttonText.y = y + 1;

    return { button, text: buttonText };
  }

  /**
   * 使用済みボタンを作成（アイテム用）
   */
  static createUsedButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    size: keyof typeof BUTTON_SIZES = 'M'
  ): { button: Phaser.GameObjects.Graphics, text: Phaser.GameObjects.Text } {
    const style = BUTTON_STYLES.USED;
    const sizeInfo = BUTTON_SIZES[size];
    
    // 角丸の使用済みボタンをGraphicsで作成
    const button = scene.add.graphics();
    
    // 角丸の矩形を描画
    button.fillStyle(style.backgroundColor);
    button.lineStyle(style.borderWidth, style.borderColor);
    
    const cornerRadius = 8;
    
    // 中央基準で描画するため、座標を調整
    const rectX = -sizeInfo.width / 2;
    const rectY = -sizeInfo.height / 2;
    
    button.fillRoundedRect(
      rectX,
      rectY,
      sizeInfo.width,
      sizeInfo.height,
      cornerRadius
    );
    button.strokeRoundedRect(
      rectX,
      rectY,
      sizeInfo.width,
      sizeInfo.height,
      cornerRadius
    );

    // ボタンの位置を設定
    button.setPosition(x, y);

    // ボタンのテキスト
    const buttonText = scene.add.text(x, y, text, {
      fontSize: style.fontSize,
      color: style.textColor,
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5, 0.5);

    // テキストの境界を確保するため、わずかに下に調整
    buttonText.y = y + 1;

    // 使用済みマークを追加（右上に小さなチェックマーク）
    const checkMark = scene.add.text(
      x + sizeInfo.width / 2 - 10,
      y - sizeInfo.height / 2 + 5,
      '✓',
      {
        fontSize: '12px',
        color: '#AAAAAA',
        fontFamily: 'Arial, sans-serif'
      }
    ).setOrigin(0.5, 0);

    return { button, text: buttonText };
  }

  /**
   * アイテムボタンを作成（統一デザイン + 左端カラーバー）
   */
  static createItemButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    isUsed: boolean = false,
    size: keyof typeof BUTTON_SIZES = 'M',
    onClick?: () => void,
    isSpecialSlot: boolean = false
  ): { button: Phaser.GameObjects.Graphics, text: Phaser.GameObjects.Text } {
    const sizeInfo = BUTTON_SIZES[size];
    
    // アイテムボタン専用の特殊な色設定
    const colors = isUsed ? {
      backgroundColor: 0x2A2A2A,
      borderColor: 0x1A1A1A,
      barColor: 0x444444,
      textColor: '#777777'
    } : isSpecialSlot ? {
      backgroundColor: 0x4A2C5A, // 特殊枠：深い紫色（神秘的）
      borderColor: 0x6A3C7A,
      barColor: 0xFFD700,      // 特殊枠：金色のバー
      textColor: '#FFFFFF'
    } : {
      backgroundColor: 0x1A4A5A, // 通常枠：深い青緑色（海の宝石）
      borderColor: 0x2A6A7A,
      barColor: 0x00CED1,      // 通常枠：ターコイズ色のバー（海の宝石色）
      textColor: '#FFFFFF'
    };
    
    // 統一デザインの角丸ボタンをGraphicsで作成
    const button = scene.add.graphics();
    
    const cornerRadius = 8;
    const barWidth = 8; // 左端カラーバーの幅
    
    // 中央基準で描画するため、座標を調整
    const rectX = -sizeInfo.width / 2;
    const rectY = -sizeInfo.height / 2;
    
    // メインボタンの背景を描画
    button.fillStyle(colors.backgroundColor);
    button.lineStyle(3, colors.borderColor);
    
    button.fillRoundedRect(
      rectX,
      rectY,
      sizeInfo.width,
      sizeInfo.height,
      cornerRadius
    );
    button.strokeRoundedRect(
      rectX,
      rectY,
      sizeInfo.width,
      sizeInfo.height,
      cornerRadius
    );
    
    // 左端カラーバーを描画
    button.fillStyle(colors.barColor);
    button.fillRoundedRect(
      rectX,
      rectY,
      barWidth,
      sizeInfo.height,
      { tl: cornerRadius, tr: 0, bl: cornerRadius, br: 0 } // 左側のみ角丸
    );
    
    // アイテムボタンに微細な光るエフェクトを追加（使用済みでない場合）
    if (!isUsed) {
      // 内側に薄い光のライン
      button.lineStyle(1, isSpecialSlot ? 0xFFFFAA : 0xAAFFFF, 0.3);
      button.strokeRoundedRect(
        rectX + 2,
        rectY + 2,
        sizeInfo.width - 4,
        sizeInfo.height - 4,
        cornerRadius - 2
      );
    }
    
    // ボタンの位置を設定
    button.setPosition(x, y);
    
    // インタラクティブエリアを設定
    button.setInteractive(
      new Phaser.Geom.Rectangle(
        rectX,
        rectY,
        sizeInfo.width,
        sizeInfo.height
      ),
      Phaser.Geom.Rectangle.Contains
    );
    
    if (!isUsed) {
      button.input!.cursor = 'pointer';
    }
    
    // ボタンのテキスト（カラーバーを避けて配置）
    const textX = x - sizeInfo.width / 2 + barWidth + 8; // バー幅 + 余白
    const buttonText = scene.add.text(textX, y, text, {
      fontSize: '14px',
      color: colors.textColor,
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0, 0.5); // 左寄せ、垂直中央
    
    // 使用済みマークを追加（右端に表示）
    if (isUsed) {
      const usedMark = scene.add.text(
        x + sizeInfo.width / 2 - 8,
        y,
        '✓',
        {
          fontSize: '16px',
          color: '#555555',
          fontFamily: 'Arial, sans-serif'
        }
      ).setOrigin(1, 0.5); // 右寄せ、垂直中央
    }
    
    // クリックイベント
    if (onClick && !isUsed) {
      button.on('pointerdown', onClick);
    }
    
    // ホバーエフェクト（使用済みでない場合のみ）
    if (!isUsed) {
      button.on('pointerover', () => {
        scene.tweens.add({
          targets: [button, buttonText],
          scale: 1.05,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      button.on('pointerout', () => {
        scene.tweens.add({
          targets: [button, buttonText],
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
      });
    }
    
    return { button, text: buttonText };
  }
}
