/**
 * ツールチップ管理システム
 * ユーザーガイダンスとヘルプ機能を提供
 */
export class TooltipManager {
  private scene: Phaser.Scene;
  private currentTooltip: Phaser.GameObjects.Container | null = null;
  private tooltipDelay: number = 500; // ホバー後の表示遅延（ミリ秒）

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 要素にツールチップを追加
   */
  addTooltip(
    target: Phaser.GameObjects.GameObject,
    content: TooltipContent,
    options: TooltipOptions = {}
  ): void {
    if (!target.input) {
      console.warn('ツールチップ対象がインタラクティブではありません');
      return;
    }

    const config = {
      delay: options.delay ?? this.tooltipDelay,
      position: options.position ?? 'top',
      maxWidth: options.maxWidth ?? 200,
      theme: options.theme ?? 'default'
    };

    let showTimer: Phaser.Time.TimerEvent | null = null;

    // ホバー開始
    target.on('pointerover', (pointer: Phaser.Input.Pointer) => {
      showTimer = this.scene.time.delayedCall(config.delay, () => {
        this.showTooltip(content, pointer.x, pointer.y, config);
      });
    });

    // ホバー終了
    target.on('pointerout', () => {
      if (showTimer) {
        showTimer.destroy();
        showTimer = null;
      }
      this.hideTooltip();
    });

    // マウス移動時の位置更新
    target.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.currentTooltip) {
        this.updateTooltipPosition(pointer.x, pointer.y, config);
      }
    });
  }

  /**
   * ツールチップを表示
   */
  private showTooltip(
    content: TooltipContent,
    x: number,
    y: number,
    config: Required<TooltipOptions>
  ): void {
    this.hideTooltip(); // 既存のツールチップを非表示

    const { width, height } = this.scene.cameras.main;
    
    // ツールチップコンテナ
    this.currentTooltip = this.scene.add.container(0, 0);
    this.currentTooltip.setDepth(2000);

    // テーマ設定
    const theme = this.getTheme(config.theme);
    
    // コンテンツサイズを計算
    const padding = 12;
    const lineHeight = 18;
    const titleHeight = content.title ? 24 : 0;
    const textLines = this.wrapText(content.text, config.maxWidth - padding * 2);
    const textHeight = textLines.length * lineHeight;
    const tooltipWidth = Math.min(config.maxWidth, this.getTextWidth(content.text) + padding * 2);
    const tooltipHeight = titleHeight + textHeight + padding * 2;

    // 背景
    const background = this.scene.add.graphics();
    background.fillStyle(theme.backgroundColor, theme.backgroundAlpha);
    background.lineStyle(2, theme.borderColor, theme.borderAlpha);
    background.fillRoundedRect(0, 0, tooltipWidth, tooltipHeight, 8);
    background.strokeRoundedRect(0, 0, tooltipWidth, tooltipHeight, 8);
    this.currentTooltip.add(background);

    let currentY = padding;

    // タイトル
    if (content.title) {
      const titleText = this.scene.add.text(padding, currentY, content.title, {
        fontSize: '14px',
        color: theme.titleColor,
        fontFamily: 'Arial',
        fontStyle: 'bold'
      });
      this.currentTooltip.add(titleText);
      currentY += titleHeight;
    }

    // 本文
    textLines.forEach((line, index) => {
      const lineText = this.scene.add.text(padding, currentY + index * lineHeight, line, {
        fontSize: '12px',
        color: theme.textColor,
        fontFamily: 'Arial'
      });
      this.currentTooltip.add(lineText);
    });

    // ショートカット表示
    if (content.shortcut) {
      const shortcutBg = this.scene.add.graphics();
      shortcutBg.fillStyle(theme.shortcutBgColor, 0.8);
      shortcutBg.fillRoundedRect(tooltipWidth - 60, tooltipHeight - 25, 50, 20, 4);
      this.currentTooltip.add(shortcutBg);

      const shortcutText = this.scene.add.text(tooltipWidth - 35, tooltipHeight - 15, content.shortcut, {
        fontSize: '10px',
        color: theme.shortcutTextColor,
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.currentTooltip.add(shortcutText);
    }

    // 位置を設定
    this.updateTooltipPosition(x, y, config);

    // 登場アニメーション
    this.currentTooltip.setAlpha(0);
    this.currentTooltip.setScale(0.8);
    
    this.scene.tweens.add({
      targets: this.currentTooltip,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  /**
   * ツールチップの位置を更新
   */
  private updateTooltipPosition(
    x: number,
    y: number,
    config: Required<TooltipOptions>
  ): void {
    if (!this.currentTooltip) return;

    const { width, height } = this.scene.cameras.main;
    const tooltipBounds = this.currentTooltip.getBounds();
    const offset = 10;

    let tooltipX = x;
    let tooltipY = y;

    // 位置調整
    switch (config.position) {
      case 'top':
        tooltipX = x - tooltipBounds.width / 2;
        tooltipY = y - tooltipBounds.height - offset;
        break;
      case 'bottom':
        tooltipX = x - tooltipBounds.width / 2;
        tooltipY = y + offset;
        break;
      case 'left':
        tooltipX = x - tooltipBounds.width - offset;
        tooltipY = y - tooltipBounds.height / 2;
        break;
      case 'right':
        tooltipX = x + offset;
        tooltipY = y - tooltipBounds.height / 2;
        break;
      case 'auto':
      default:
        // 自動位置調整
        tooltipX = x + offset;
        tooltipY = y - tooltipBounds.height - offset;
        break;
    }

    // 画面外に出ないよう調整
    tooltipX = Math.max(5, Math.min(tooltipX, width - tooltipBounds.width - 5));
    tooltipY = Math.max(5, Math.min(tooltipY, height - tooltipBounds.height - 5));

    this.currentTooltip.setPosition(tooltipX, tooltipY);
  }

  /**
   * ツールチップを非表示
   */
  private hideTooltip(): void {
    if (this.currentTooltip) {
      this.scene.tweens.add({
        targets: this.currentTooltip,
        alpha: 0,
        scale: 0.8,
        duration: 150,
        ease: 'Power2',
        onComplete: () => {
          this.currentTooltip?.destroy();
          this.currentTooltip = null;
        }
      });
    }
  }

  /**
   * テーマを取得
   */
  private getTheme(themeName: string): TooltipTheme {
    const themes: Record<string, TooltipTheme> = {
      default: {
        backgroundColor: 0x2C3E50,
        backgroundAlpha: 0.95,
        borderColor: 0x34495E,
        borderAlpha: 1,
        titleColor: '#ECF0F1',
        textColor: '#BDC3C7',
        shortcutBgColor: 0x3498DB,
        shortcutTextColor: '#FFFFFF'
      },
      ocean: {
        backgroundColor: 0x1E5799,
        backgroundAlpha: 0.95,
        borderColor: 0x7DB9E8,
        borderAlpha: 1,
        titleColor: '#FFFFFF',
        textColor: '#E8F4FD',
        shortcutBgColor: 0x2E8B57,
        shortcutTextColor: '#FFFFFF'
      },
      error: {
        backgroundColor: 0xE74C3C,
        backgroundAlpha: 0.95,
        borderColor: 0xC0392B,
        borderAlpha: 1,
        titleColor: '#FFFFFF',
        textColor: '#FADBD8',
        shortcutBgColor: 0x922B21,
        shortcutTextColor: '#FFFFFF'
      },
      success: {
        backgroundColor: 0x27AE60,
        backgroundAlpha: 0.95,
        borderColor: 0x229954,
        borderAlpha: 1,
        titleColor: '#FFFFFF',
        textColor: '#D5F4E6',
        shortcutBgColor: 0x1E8449,
        shortcutTextColor: '#FFFFFF'
      }
    };

    return themes[themeName] || themes.default;
  }

  /**
   * テキストを折り返し
   */
  private wrapText(text: string, maxWidth: number): string[] {
    // 簡単な折り返し実装
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (this.getTextWidth(testLine) <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * テキスト幅を取得（概算）
   */
  private getTextWidth(text: string): number {
    // 簡単な幅計算（実際のフォントメトリクスではない）
    return text.length * 7;
  }

  /**
   * 便利メソッド：アイテム説明ツールチップ
   */
  addItemTooltip(target: Phaser.GameObjects.GameObject, itemName: string, description: string, rarity: string): void {
    this.addTooltip(target, {
      title: `${itemName} (${rarity}レア)`,
      text: description
    }, {
      theme: 'ocean',
      maxWidth: 250
    });
  }

  /**
   * 便利メソッド：ボタンヘルプツールチップ
   */
  addButtonTooltip(target: Phaser.GameObjects.GameObject, description: string, shortcut?: string): void {
    this.addTooltip(target, {
      text: description,
      shortcut: shortcut
    }, {
      theme: 'default',
      position: 'top'
    });
  }

  /**
   * 便利メソッド：エラーツールチップ
   */
  addErrorTooltip(target: Phaser.GameObjects.GameObject, errorMessage: string): void {
    this.addTooltip(target, {
      title: 'エラー',
      text: errorMessage
    }, {
      theme: 'error',
      position: 'auto'
    });
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    this.hideTooltip();
  }
}

/**
 * ツールチップコンテンツ
 */
export interface TooltipContent {
  title?: string;
  text: string;
  shortcut?: string;
}

/**
 * ツールチップオプション
 */
export interface TooltipOptions {
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  maxWidth?: number;
  theme?: string;
}

/**
 * ツールチップテーマ
 */
interface TooltipTheme {
  backgroundColor: number;
  backgroundAlpha: number;
  borderColor: number;
  borderAlpha: number;
  titleColor: string;
  textColor: string;
  shortcutBgColor: number;
  shortcutTextColor: string;
}
