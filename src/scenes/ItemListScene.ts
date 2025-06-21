import Phaser from "phaser";
import { GameConfig } from "../config/gameConfig";
import { DebugHelper } from "../utils/DebugHelper";
import { GameStateManager } from "../utils/GameStateManager";
import { AnimationManager, TransitionType } from "../utils/AnimationManager";
import { SoundManager } from "../utils/SoundManager";
import { BackgroundManager } from "../utils/BackgroundManager";
import { SimpleOceanButton } from "../components/SimpleOceanButton";
import { ItemManager } from "../managers/ItemManager";
import { ITEM_DATA, getRarityColor } from "../data/ItemData";
import { ItemRarity } from "../types/Item";

/**
 * アイテム一覧画面（2列表示）
 */
export class ItemListScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private animationManager!: AnimationManager;
  private soundManager!: SoundManager;
  private backgroundManager!: BackgroundManager;
  private gameStateManager: GameStateManager;
  private itemManager: ItemManager;

  constructor() {
    super({ key: "ItemListScene" });
    this.gameStateManager = GameStateManager.getInstance();
    this.itemManager = ItemManager.getInstance();
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);

    // アニメーションマネージャーを初期化
    this.animationManager = new AnimationManager(this);

    // サウンドマネージャーを初期化
    this.soundManager = new SoundManager(this);
    this.soundManager.preloadSounds();

    // 背景マネージャーを初期化
    this.backgroundManager = new BackgroundManager(this);

    // 美しい海の背景を作成
    this.backgroundManager.createOceanBackground("light");

    // 背景色を設定
    this.cameras.main.setBackgroundColor("#1E5799");

    this.createUI();
    this.addDebugLines();
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;

    // タイトルエリア（美しいグラデーション背景）
    const titleBg = this.add.rectangle(width / 2, 40, width, 80, 0x1e5799, 0.8);
    titleBg.setStrokeStyle(2, 0x7db9e8);

    const titleY = 40;
    const titleText = this.add
      .text(width / 2, titleY, "アイテム一覧", {
        fontSize: "28px",
        color: "#FFFFFF",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // タイトルに輝きエフェクト
    this.tweens.add({
      targets: titleText,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // メインコンテンツエリア
    this.createItemList();

    // ボタンエリア
    this.createButtons();
  }

  private createItemList(): void {
    const { width, height } = this.cameras.main;
    const contentStartY = 120;
    const cardWidth = (width - 60) / 2; // 2列表示用の幅
    const cardHeight = 60; // 高さを80から60に縮小
    const cardSpacing = 8; // スペースも縮小
    const columnSpacing = 20;

    // 実際のアイテムデータを取得
    const itemCounts = this.itemManager.getInventory();

    // アイテムをレア度順にソート
    const sortedItems = Object.entries(itemCounts)
      .filter(([itemId, count]) => (count as number) > 0) // 所持数が0より大きいもののみ
      .map(([itemId, count]) => ({
        itemId,
        count: count as number,
        data: ITEM_DATA[itemId],
        rarity: ITEM_DATA[itemId]?.rarity || ItemRarity.F,
      }))
      .sort((a, b) => {
        // レア度順（S > A > B > C > D > E > F）
        const rarityOrder = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
        return (
          (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
          (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0)
        );
      });

    const animationDelay = 60; // カードが順番に現れるアニメーション（短縮）

    // アイテムが存在しない場合
    if (sortedItems.length === 0) {
      const noItemsText = this.add
        .text(
          width / 2,
          height / 2,
          "アイテムを所持していません\nガチャでアイテムを獲得しましょう！",
          {
            fontSize: "18px",
            color: "#CCCCCC",
            fontFamily: "Arial",
            align: "center",
          }
        )
        .setOrigin(0.5);
      return;
    }

    // アイテムカードを2列で配置
    sortedItems.forEach((item, index) => {
      const col = index % 2; // 0 or 1
      const row = Math.floor(index / 2);

      const x = 20 + cardWidth / 2 + col * (cardWidth + columnSpacing);
      const y = contentStartY + row * (cardHeight + cardSpacing);

      const card = this.createItemCard(
        x,
        y,
        cardWidth,
        item,
        index * animationDelay
      );
    });
  }

  private createItemCard(
    x: number,
    y: number,
    cardWidth: number,
    item: any,
    animationDelay: number
  ): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);

    // レア度に応じた色を取得
    const rarityColor = this.getRarityColorHex(item.rarity);
    const rarityColorString = getRarityColor(item.rarity);

    // カード背景（グラデーション風）- 高さを縮小
    const cardBg = this.add.rectangle(0, 0, cardWidth, 50, 0x000000, 0.6);
    cardBg.setStrokeStyle(3, rarityColor, 0.8);

    // レア度に応じた装飾
    if (item.rarity === "S" || item.rarity === "A") {
      // 高レアアイテムには光るエフェクト
      const glowBg = this.add.rectangle(0, 0, cardWidth, 50, rarityColor, 0.2);
      card.add(glowBg);

      // 光るアニメーション
      this.tweens.add({
        targets: glowBg,
        alpha: 0.1,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    card.add(cardBg);

    // アイテム名（左側）
    const nameText = this.add
      .text(-cardWidth / 2 + 10, -8, item.data?.name || item.itemId, {
        fontSize: "14px",
        color: "#FFFFFF",
        fontFamily: "Arial",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);
    card.add(nameText);

    // レア度表示（左側、アイテム名の下）
    const rarityText = this.add
      .text(-cardWidth / 2 + 10, 8, `${item.rarity}レア`, {
        fontSize: "10px",
        color: rarityColorString,
        fontFamily: "Arial",
      })
      .setOrigin(0, 0.5);
    card.add(rarityText);

    // 所持数表示（右下）- 背景を黒に変更
    const countBg = this.add.rectangle(
      cardWidth / 2 - 25,
      13,
      40,
      20,
      0x000000,
      0.8
    );
    countBg.setStrokeStyle(1, 0xffffff, 0.8);
    card.add(countBg);

    const countText = this.add
      .text(cardWidth / 2 - 25, 13, `×${item.count}`, {
        fontSize: "11px",
        color: "#FFFFFF",
        fontFamily: "Arial",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    card.add(countText);

    // カード出現アニメーション
    card.setAlpha(0);
    card.setScale(0.8);

    this.time.delayedCall(animationDelay, () => {
      this.tweens.add({
        targets: card,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 200, // アニメーション時間を短縮（300ms → 200ms）
        ease: "Back.easeOut",
      });
    });

    return card;
  }

  private getRarityColorHex(rarity: string): number {
    switch (rarity) {
      case "S":
        return 0xffd700; // 金色
      case "A":
        return 0xff0000; // 赤色
      case "B":
        return 0x800080; // 紫色
      case "C":
        return 0x0000ff; // 青色
      case "D":
        return 0x00ff00; // 緑色
      case "E":
        return 0xffffff; // 白色
      case "F":
        return 0x808080; // 灰色
      default:
        return 0x808080;
    }
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;

    // 戻るボタン
    const backButton = new SimpleOceanButton(
      this,
      width / 2,
      height - 40,
      160,
      50,
      "戻る",
      "secondary",
      () => {
        this.soundManager.playButtonTap();
        this.soundManager.playScreenTransition();

        this.animationManager
          .screenTransition("ItemListScene", "MainScene", TransitionType.BUBBLE)
          .then(() => {
            this.scene.start("MainScene");
          });
      }
    );
  }

  private addDebugLines(): void {
    if (!GameConfig.DEBUG_MODE) return;

    const { width, height } = this.cameras.main;

    // タイトルエリア
    this.debugHelper.addAreaBorder(
      width / 2,
      40,
      width,
      80,
      0xff0000,
      "タイトルエリア"
    );

    // メインコンテンツエリア（アイテム表示エリア）
    const contentHeight = height - 200; // タイトル(80) + ボタン(80) + マージン(40)
    this.debugHelper.addAreaBorder(
      width / 2,
      120 + contentHeight / 2,
      width - 40,
      contentHeight,
      0x0000ff,
      "メインコンテンツエリア"
    );

    // ボタンエリア
    this.debugHelper.addAreaBorder(
      width / 2,
      height - 40,
      width,
      80,
      0xff00ff,
      "ボタンエリア"
    );
  }

  /**
   * シーン終了時のクリーンアップ
   */
  shutdown(): void {
    // デバッグヘルパーをクリーンアップ
    if (this.debugHelper) {
      this.debugHelper.destroy();
    }

    // アニメーションマネージャーをクリーンアップ
    if (this.animationManager) {
      this.animationManager.destroy();
    }

    // サウンドマネージャーをクリーンアップ
    if (this.soundManager) {
      this.soundManager.destroy();
    }

    // 背景マネージャーをクリーンアップ
    if (this.backgroundManager) {
      this.backgroundManager.destroy();
    }
  }
}
