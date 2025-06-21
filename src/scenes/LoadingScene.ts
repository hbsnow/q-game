import Phaser from "phaser";
import { GameConfig } from "../config/gameConfig";

/**
 * ローディング画面
 * 海をテーマにした美しい読み込み演出を表示
 */
export class LoadingScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private bubbles: Phaser.GameObjects.Graphics[] = [];
  private waves: Phaser.GameObjects.Graphics[] = [];
  private loadingDots: string = "";
  private dotTimer: number = 0;

  constructor() {
    super({ key: "LoadingScene" });
  }

  preload(): void {
    const { width, height } = this.cameras.main;

    // 背景色を海の深い青に設定
    this.cameras.main.setBackgroundColor("#0B2F5C");

    this.createLoadingUI();
    this.createOceanEffects();

    // プログレスバーの更新イベント
    this.load.on("progress", (value: number) => {
      this.updateProgress(value);
    });

    // ファイル読み込み完了イベント
    this.load.on("fileprogress", (file: any) => {
      console.log(`Loading: ${file.key}`);
    });

    // 全ての読み込み完了イベント
    this.load.on("complete", () => {
      this.onLoadComplete();
    });

    // 実際のアセット読み込み（現在は最小限）
    this.loadGameAssets();
  }

  create(): void {
    // アニメーション開始
    this.startOceanAnimations();
    this.startLoadingTextAnimation();
  }

  /**
   * ローディングUIを作成
   */
  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;

    // タイトル
    this.add
      .text(width / 2, height / 2 - 100, "さめがめオーシャン", {
        fontSize: "32px",
        color: "#FFFFFF",
        fontFamily: "Arial",
        stroke: "#1E5799",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // プログレスバーの背景
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRoundedRect(
      width / 2 - 160,
      height / 2 + 50,
      320,
      20,
      10
    );

    // プログレスバー
    this.progressBar = this.add.graphics();

    // ローディングテキスト
    this.loadingText = this.add
      .text(width / 2, height / 2 + 100, "Loading", {
        fontSize: "18px",
        color: "#7DB9E8",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);
  }

  /**
   * 海のエフェクトを作成
   */
  private createOceanEffects(): void {
    this.createBubbles();
    this.createWaves();
  }

  /**
   * 泡エフェクトを作成
   */
  private createBubbles(): void {
    const { width, height } = this.cameras.main;

    for (let i = 0; i < 15; i++) {
      const bubble = this.add.graphics();
      const size = Phaser.Math.Between(3, 8);
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(height, height + 100);

      bubble.fillStyle(0x7db9e8, 0.3);
      bubble.fillCircle(0, 0, size);
      bubble.setPosition(x, y);

      this.bubbles.push(bubble);
    }
  }

  /**
   * 波エフェクトを作成
   */
  private createWaves(): void {
    const { width, height } = this.cameras.main;

    for (let i = 0; i < 3; i++) {
      const wave = this.add.graphics();
      wave.lineStyle(2, 0x2e8b57, 0.5);

      // 波の形を描画
      wave.beginPath();
      for (let x = 0; x <= width; x += 10) {
        const y = height - 50 - i * 30 + Math.sin(x / 50 + i * 0.5) * 10;
        if (x === 0) {
          wave.moveTo(x, y);
        } else {
          wave.lineTo(x, y);
        }
      }
      wave.strokePath();

      this.waves.push(wave);
    }
  }

  /**
   * 海のアニメーションを開始
   */
  private startOceanAnimations(): void {
    // 泡の上昇アニメーション
    this.bubbles.forEach((bubble, index) => {
      const delay = index * 200;
      const duration = Phaser.Math.Between(3000, 6000);

      this.tweens.add({
        targets: bubble,
        y: -50,
        alpha: { from: 0.3, to: 0 },
        duration: duration,
        delay: delay,
        ease: "Linear",
        repeat: -1,
        onRepeat: () => {
          // 泡を画面下部にリセット
          bubble.y = this.cameras.main.height + 50;
          bubble.x = Phaser.Math.Between(0, this.cameras.main.width);
          bubble.alpha = 0.3;
        },
      });
    });

    // 波の揺らめきアニメーション
    this.waves.forEach((wave, index) => {
      this.tweens.add({
        targets: wave,
        x: -20,
        duration: 4000 + index * 500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    });
  }

  /**
   * ローディングテキストのアニメーション
   */
  private startLoadingTextAnimation(): void {
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.dotTimer++;
        this.loadingDots = ".".repeat(this.dotTimer % 4);
        this.loadingText.setText(`Loading${this.loadingDots}`);
      },
      loop: true,
    });
  }

  /**
   * プログレスバーを更新
   */
  private updateProgress(value: number): void {
    const { width } = this.cameras.main;

    this.progressBar.clear();

    // プログレスバーのグラデーション
    const barWidth = 320 * value;
    const colors = [0x1e5799, 0x7db9e8, 0x2e8b57];
    const colorIndex = Math.floor(value * (colors.length - 1));
    const color = colors[colorIndex] || colors[colors.length - 1];

    this.progressBar.fillStyle(color, 0.8);
    this.progressBar.fillRoundedRect(
      width / 2 - 160,
      this.cameras.main.height / 2 + 50,
      barWidth,
      20,
      10
    );

    // パーセンテージ表示
    const percentText = `${Math.round(value * 100)}%`;
    if (this.children.getByName("percentText")) {
      (
        this.children.getByName("percentText") as Phaser.GameObjects.Text
      ).setText(percentText);
    } else {
      this.add
        .text(width / 2, this.cameras.main.height / 2 + 25, percentText, {
          fontSize: "14px",
          color: "#FFFFFF",
          fontFamily: "Arial",
        })
        .setOrigin(0.5)
        .setName("percentText");
    }
  }

  /**
   * ゲームアセットを読み込み
   */
  private loadGameAssets(): void {
    // 現在は最小限のアセット読み込み
    // 実際の画像ファイルが用意されたら追加

    // プレースホルダー画像を生成
    this.load.image(
      "placeholder",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    );

    // 読み込み時間をシミュレート（実際のファイル読み込み時は不要）
    this.time.delayedCall(2000, () => {
      this.load.emit("complete");
    });
  }

  /**
   * 読み込み完了時の処理
   */
  private onLoadComplete(): void {
    // 完了メッセージ
    this.loadingText.setText("Complete!");

    // 完了エフェクト
    this.tweens.add({
      targets: this.loadingText,
      scale: 1.2,
      alpha: 0.8,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // メイン画面に遷移
        this.time.delayedCall(500, () => {
          this.scene.start("MainScene");
        });
      },
    });

    // 泡エフェクトを強化
    this.createCompletionBubbles();
  }

  /**
   * 完了時の特別な泡エフェクト
   */
  private createCompletionBubbles(): void {
    const { width, height } = this.cameras.main;

    for (let i = 0; i < 20; i++) {
      const bubble = this.add.graphics();
      const size = Phaser.Math.Between(5, 15);
      const x = Phaser.Math.Between(0, width);
      const y = height;

      bubble.fillStyle(0x7db9e8, 0.6);
      bubble.fillCircle(0, 0, size);
      bubble.setPosition(x, y);

      this.tweens.add({
        targets: bubble,
        y: -50,
        x: x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scale: 0.5,
        duration: Phaser.Math.Between(1000, 2000),
        ease: "Power2",
        onComplete: () => {
          bubble.destroy();
        },
      });
    }
  }

  /**
   * シーン終了時のクリーンアップ
   */
  shutdown(): void {
    // タイマーをクリア
    this.time.removeAllEvents();

    // 泡とエフェクトをクリア
    this.bubbles.forEach((bubble) => bubble.destroy());
    this.waves.forEach((wave) => wave.destroy());
    this.bubbles = [];
    this.waves = [];
  }
}
