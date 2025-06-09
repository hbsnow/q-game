import { Scene } from 'phaser';
import { Item } from '../types';
import { GameStateManager } from '../utils/GameStateManager';
import { getRarityColor, getRarityStars } from '../data/ItemData';

export class GachaResultScene extends Scene {
  private gameStateManager!: GameStateManager;
  private drawnItems: Item[] = [];
  private drawCount: number = 1;
  private isRare: boolean = false;
  private guaranteedItemIndex: number = -1;
  // アニメーション完了フラグ - 実際にはthis.time.delayedCallで使用されている
  private animationComplete: boolean = false;
  private treasureChest!: Phaser.GameObjects.Sprite;
  private resultContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GachaResultScene' });
  }

  init(data: any) {
    // GameStateManagerを取得
    this.gameStateManager = data.gameStateManager || GameStateManager.getInstance();
    
    // ガチャ結果を取得
    if (data.drawnItems) {
      this.drawnItems = data.drawnItems;
    }
    if (data.drawCount) {
      this.drawCount = data.drawCount;
    }
    if (data.isRare !== undefined) {
      this.isRare = data.isRare;
    }
    if (data.guaranteedItemIndex !== undefined) {
      this.guaranteedItemIndex = data.guaranteedItemIndex;
    }
    
    // アニメーション状態をリセット
    this.animationComplete = false;
    
    console.log(`GachaResultScene initialized: ${this.drawCount} items, isRare: ${this.isRare}, guaranteedItemIndex: ${this.guaranteedItemIndex}`);
    console.log('Drawn items:', this.drawnItems);
  }

  create() {
    const { width, height } = this.cameras.main;

    console.log('🎬 === GACHA RESULT SCENE ===');
    console.log('📍 Current Scene: ガチャ結果画面');

    // 背景色設定（海のグラデーション）- より豊かな表現に
    this.cameras.main.setBackgroundColor('#2E4057');
    
    // 海の波のような背景エフェクト - 強化版
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x1E3B5E, 0x1E3B5E, 0x2E4057, 0x2E4057, 1);
    bgGraphics.fillRect(0, 0, width, height);
    
    // 複数の波エフェクト
    const waveCount = 3;
    for (let i = 0; i < waveCount; i++) {
      const waveY = height * (0.3 + i * 0.2);
      const waveWidth = width * (1.2 + i * 0.2);
      const waveHeight = 60 + i * 20;
      const waveAlpha = 0.1 + (i * 0.05);
      const waveColor = i === 0 ? 0x3A6EA5 : (i === 1 ? 0x87CEEB : 0x5F9EA0);
      
      const wave = this.add.graphics();
      wave.fillStyle(waveColor, waveAlpha);
      wave.fillEllipse(width / 2, waveY, waveWidth, waveHeight);
      
      // 波の動きアニメーション
      this.tweens.add({
        targets: wave,
        x: Phaser.Math.Between(-20, 20),
        duration: 3000 + i * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    // 水中の光線エフェクト
    for (let i = 0; i < 3; i++) {
      const lightX = width * (0.2 + i * 0.3);
      const lightY = 0;
      const lightWidth = 100;
      const lightHeight = height;
      const lightAlpha = 0.05;
      
      const light = this.add.graphics();
      light.fillStyle(0xFFFFFF, lightAlpha);
      light.fillRect(lightX - lightWidth/2, lightY, lightWidth, lightHeight);
      
      // 光の揺らぎアニメーション
      this.tweens.add({
        targets: light,
        x: Phaser.Math.Between(-30, 30),
        alpha: { from: lightAlpha, to: lightAlpha * 2 },
        duration: 5000 + i * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // タイトル - 強化版
    const titleBg = this.add.rectangle(width / 2, 50, 280, 60, 0x1A3A5A, 0.8);
    titleBg.setStrokeStyle(3, 0x87CEEB, 0.8);
    
    // タイトル装飾
    const titleDecor1 = this.add.rectangle(width / 2 - 120, 50, 20, 3, 0x87CEEB, 0.8);
    const titleDecor2 = this.add.rectangle(width / 2 + 120, 50, 20, 3, 0x87CEEB, 0.8);
    const titleDecor3 = this.add.circle(width / 2 - 130, 50, 5, 0x87CEEB, 0.8);
    const titleDecor4 = this.add.circle(width / 2 + 130, 50, 5, 0x87CEEB, 0.8);
    
    // タイトルテキスト - 強化版
    const titleText = this.add.text(width / 2, 50, '🎁 ガチャ結果 🎁', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#1A3A5A',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // タイトルのキラキラエフェクト
    this.tweens.add({
      targets: titleText,
      scale: { from: 1, to: 1.05 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 結果表示用のコンテナ（初期状態では非表示）
    this.resultContainer = this.add.container(width / 2, height / 2);
    this.resultContainer.setAlpha(0);

    // 宝箱の代わりに簡易的な表現（実際のゲームでは画像を使用）
    this.treasureChest = this.add.sprite(width / 2, height / 2 - 50, 'treasureChest');
    
    // 宝箱の代わりに簡易的な表現（画像がない場合）- 強化版
    if (!this.textures.exists('treasureChest')) {
      const chestGraphics = this.add.graphics();
      
      // 宝箱の本体
      const chestColor = this.isRare ? 0xFFD700 : 0xCD7F32;
      chestGraphics.fillStyle(chestColor, 1);
      chestGraphics.fillRect(-30, -20, 60, 40);
      
      // 宝箱の蓋
      const lidColor = this.isRare ? 0xFFC125 : 0xB87333;
      chestGraphics.fillStyle(lidColor, 1);
      chestGraphics.fillRect(-35, -30, 70, 15);
      
      // 宝箱の装飾
      chestGraphics.fillStyle(0x000000, 0.5);
      chestGraphics.fillRect(-20, -10, 40, 5);
      
      // 宝箱の鍵穴
      chestGraphics.fillStyle(0x000000, 1);
      chestGraphics.fillCircle(0, 0, 5);
      
      // レア宝箱の場合は追加装飾
      if (this.isRare) {
        // 金色の縁取り
        chestGraphics.lineStyle(2, 0xFFFFFF, 0.8);
        chestGraphics.strokeRect(-35, -30, 70, 50);
        
        // 宝石装飾
        chestGraphics.fillStyle(0xFF0000, 1);
        chestGraphics.fillCircle(-20, -25, 3);
        chestGraphics.fillStyle(0x0000FF, 1);
        chestGraphics.fillCircle(0, -25, 3);
        chestGraphics.fillStyle(0x00FF00, 1);
        chestGraphics.fillCircle(20, -25, 3);
      }
      
      // テクスチャとして生成
      chestGraphics.generateTexture('treasureChest', 100, 80);
      chestGraphics.clear();
      
      // スプライトを作成
      this.treasureChest = this.add.sprite(width / 2, height / 2 - 50, 'treasureChest');
    }
    
    // 宝箱の初期位置（画面外の下）
    this.treasureChest.setPosition(width / 2, height + 100);
    
    // 宝箱が海底から浮かび上がるアニメーション - 強化版
    this.tweens.add({
      targets: this.treasureChest,
      y: height / 2 - 50,
      duration: 1800,
      ease: 'Bounce.Out',
      onStart: () => {
        // 宝箱の登場時に波紋エフェクト
        const ripple = this.add.circle(width / 2, height + 50, 50, 0xFFFFFF, 0.3);
        this.tweens.add({
          targets: ripple,
          scale: { from: 0.5, to: 3 },
          alpha: { from: 0.3, to: 0 },
          duration: 1000,
          onComplete: () => {
            ripple.destroy();
          }
        });
      },
      onComplete: () => {
        // 宝箱が開くアニメーション
        this.time.delayedCall(700, () => {
          // 宝箱が開く演出（スケールを少し大きくする）
          this.tweens.add({
            targets: this.treasureChest,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 400,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
              // 光のエフェクト - 強化版
              const lightColor = this.isRare ? 0xFFD700 : 0xFFFFFF;
              const light = this.add.circle(width / 2, height / 2 - 50, 60, lightColor, 0.8);
              
              // 光の波紋
              for (let i = 0; i < 3; i++) {
                const ringDelay = i * 200;
                const ringSize = 40 + i * 20;
                const ring = this.add.circle(width / 2, height / 2 - 50, ringSize, lightColor, 0.4);
                
                this.tweens.add({
                  targets: ring,
                  scale: { from: 0.5, to: 3 },
                  alpha: { from: 0.4, to: 0 },
                  duration: 800,
                  delay: ringDelay,
                  onComplete: () => {
                    ring.destroy();
                  }
                });
              }
              
              this.tweens.add({
                targets: light,
                alpha: 0,
                scale: 4,
                duration: 1000,
                onComplete: () => {
                  light.destroy();
                  
                  // 宝箱を消して結果を表示
                  this.treasureChest.setVisible(false);
                  this.showResults();
                }
              });
              
              // レアアイテムの場合は追加エフェクト
              if (this.isRare) {
                // 光の柱
                const beam = this.add.rectangle(width / 2, height / 2 - 150, 100, 300, 0xFFD700, 0.3);
                this.tweens.add({
                  targets: beam,
                  scaleX: { from: 0.1, to: 1 },
                  scaleY: { from: 0.1, to: 1 },
                  alpha: { from: 0.5, to: 0 },
                  duration: 1000,
                  onComplete: () => {
                    beam.destroy();
                  }
                });
                
                // 星のエフェクト
                for (let i = 0; i < 20; i++) {
                  const starX = width / 2 + Phaser.Math.Between(-100, 100);
                  const starY = height / 2 - 50 + Phaser.Math.Between(-100, 100);
                  const star = this.add.star(starX, starY, 5, 3, 6, 0xFFD700);
                  
                  this.tweens.add({
                    targets: star,
                    angle: 360,
                    scale: { from: 0.1, to: 1 },
                    alpha: { from: 1, to: 0 },
                    duration: 800,
                    delay: Phaser.Math.Between(0, 500),
                    onComplete: () => {
                      star.destroy();
                    }
                  });
                }
              }
            }
          });
        });
      }
    });

    // 泡のエフェクト - 強化版
    this.createBubbleEffect();

    // ボタン配置（初期状態では非表示）
    const buttonY = height - 120;
    
    // もう一度ボタン - 強化版
    const againButton = this.add.rectangle(width / 2 - 80, buttonY, 120, 50, 0x4CAF50, 0.8);
    againButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    againButton.setInteractive();
    againButton.setAlpha(0);
    
    // ホバーエフェクト
    againButton.on('pointerover', () => {
      againButton.setFillStyle(0x5DBF60, 0.9);
      againButton.setScale(1.05);
    });
    againButton.on('pointerout', () => {
      againButton.setFillStyle(0x4CAF50, 0.8);
      againButton.setScale(1);
    });
    
    againButton.on('pointerdown', () => {
      this.scene.start('GachaScene', {
        gameStateManager: this.gameStateManager
      });
    });

    const againText = this.add.text(width / 2 - 80, buttonY, 'もう一度', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    againText.setAlpha(0);

    // 戻るボタン - 強化版
    const backButton = this.add.rectangle(width / 2 + 80, buttonY, 120, 50, 0x2196F3, 0.8);
    backButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    backButton.setInteractive();
    backButton.setAlpha(0);
    
    // ホバーエフェクト
    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x42A5F5, 0.9);
      backButton.setScale(1.05);
    });
    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x2196F3, 0.8);
      backButton.setScale(1);
    });
    
    backButton.on('pointerdown', () => {
      this.scene.start('GachaScene', {
        gameStateManager: this.gameStateManager
      });
    });

    const backText = this.add.text(width / 2 + 80, buttonY, '戻る', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    backText.setAlpha(0);
    
    // アニメーション完了後にボタンを表示
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: [againButton, againText, backButton, backText],
        alpha: 1,
        duration: 500,
        ease: 'Power2'
      });
      
      this.animationComplete = true;
    });
    
    // S・Aレアの場合は特別な背景エフェクト
    if (this.isRare) {
      this.createRareBackgroundEffect();
    }
  }
  
  private createRareBackgroundEffect() {
    const { width, height } = this.cameras.main;
    
    // 背景に金色の光を追加 - 強化版
    const goldenLight = this.add.graphics();
    goldenLight.fillStyle(0xFFD700, 0.15);
    goldenLight.fillRect(0, 0, width, height);
    
    // 光の波紋 - 強化版
    for (let i = 0; i < 5; i++) {
      const ring = this.add.circle(width / 2, height / 2, 100 + i * 50, 0xFFD700, 0.1);
      
      this.tweens.add({
        targets: ring,
        scale: { from: 0.5, to: 3.5 },
        alpha: { from: 0.2, to: 0 },
        duration: 3000 + i * 500,
        repeat: -1,
        delay: i * 1000
      });
    }
    
    // 金色の粒子
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      
      const particle = this.add.circle(x, y, size, 0xFFD700, 0.7);
      
      this.tweens.add({
        targets: particle,
        alpha: { from: 0.7, to: 0.2 },
        scale: { from: 1, to: 0.5 },
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
        yoyo: true
      });
    }
    
    // 光の柱
    for (let i = 0; i < 3; i++) {
      const x = width * (0.25 + i * 0.25);
      const beam = this.add.rectangle(x, height / 2, 30, height * 2, 0xFFD700, 0.05);
      
      this.tweens.add({
        targets: beam,
        alpha: { from: 0.05, to: 0.1 },
        width: { from: 30, to: 50 },
        duration: 3000 + i * 1000,
        repeat: -1,
        yoyo: true
      });
    }
    
    // 背景の虹色グラデーション（S・Aレア専用）
    const rainbowColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
    for (let i = 0; i < rainbowColors.length; i++) {
      const y = height * (i / rainbowColors.length);
      const rainbow = this.add.rectangle(width / 2, y, width, height / rainbowColors.length, rainbowColors[i], 0.03);
      
      this.tweens.add({
        targets: rainbow,
        alpha: { from: 0.03, to: 0.06 },
        duration: 2000 + i * 300,
        repeat: -1,
        yoyo: true
      });
    }
  }

  private showResults() {
    const { width, height } = this.cameras.main;
    
    if (this.drawCount === 1) {
      // 1回引きの場合 - 改善された表示
      const item = this.drawnItems[0];
      if (item) {
        // アイテム背景（レア度に応じた色）
        const bgColor = this.getRarityBackgroundColor(item.rarity);
        const itemBg = this.add.rectangle(0, 0, 280, 200, bgColor, 0.3);
        itemBg.setStrokeStyle(3, parseInt(getRarityColor(item.rarity).replace('#', '0x')), 0.8);
        
        // アイテム名
        const nameText = this.add.text(0, -70, item.name, {
          fontSize: '28px',
          color: getRarityColor(item.rarity),
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5);
        
        // レア度表示（星で表現）
        const stars = getRarityStars(item.rarity);
        const starText = '★'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars));
        const rarityText = this.add.text(0, -40, `${starText} (${item.rarity})`, {
          fontSize: '18px',
          color: getRarityColor(item.rarity),
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
        
        // 獲得数
        const countText = this.add.text(0, -10, '×1', {
          fontSize: '22px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
        
        // 説明文
        const descText = this.add.text(0, 30, item.description, {
          fontSize: '16px',
          color: '#FFFFFF',
          wordWrap: { width: 260 },
          align: 'center'
        }).setOrigin(0.5);
        
        // 開放ステージ情報
        const unlockText = this.add.text(0, 70, `開放ステージ: ${item.unlockStage}`, {
          fontSize: '14px',
          color: '#CCCCCC'
        }).setOrigin(0.5);
        
        this.resultContainer.add([itemBg, nameText, rarityText, countText, descText, unlockText]);
        
        // S・Aレアの場合は特別演出
        if (item.rarity === 'S' || item.rarity === 'A') {
          this.createRareItemEffect();
          
          // 特別な背景エフェクト
          const specialBg = this.add.rectangle(0, 0, 300, 220, 0xFFD700, 0.1);
          specialBg.setStrokeStyle(4, 0xFFD700, 0.5);
          this.resultContainer.add(specialBg);
          
          // 輝くエフェクト
          this.tweens.add({
            targets: specialBg,
            alpha: { from: 0.1, to: 0.3 },
            yoyo: true,
            repeat: -1,
            duration: 1000
          });
        }
      }
    } else {
      // 10回引きの場合 - 改善されたグリッドレイアウト
      const titleText = this.add.text(0, -180, `${this.drawCount}回の結果:`, {
        fontSize: '20px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      this.resultContainer.add(titleText);
      
      // アイテムをカウント
      const itemCounts: { [key: string]: { item: Item, count: number, index: number } } = {};
      
      this.drawnItems.forEach((item, index) => {
        const key = item.type;
        if (!itemCounts[key]) {
          itemCounts[key] = { item, count: 0, index };
        }
        itemCounts[key].count++;
      });
      
      // 結果表示（改善されたグリッドレイアウト）
      const entries = Object.values(itemCounts);
      const gridSize = 3; // 3×4のグリッド
      const cellWidth = 110;
      const cellHeight = 80;
      const startX = -cellWidth;
      const startY = -130;
      
      // すべて確認ボタン
      const viewAllButton = this.add.rectangle(0, 150, 200, 40, 0x4CAF50, 0.8);
      viewAllButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
      viewAllButton.setInteractive();
      
      const viewAllText = this.add.text(0, 150, 'すべて確認', {
        fontSize: '16px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // ホバーエフェクト
      viewAllButton.on('pointerover', () => {
        viewAllButton.setFillStyle(0x5DBF60, 0.9);
      });
      viewAllButton.on('pointerout', () => {
        viewAllButton.setFillStyle(0x4CAF50, 0.8);
      });
      
      // 詳細表示コンテナ
      const detailContainer = this.add.container(0, 0);
      detailContainer.setVisible(false);
      this.resultContainer.add(detailContainer);
      
      // 詳細表示背景
      const detailBg = this.add.rectangle(0, 0, 320, 400, 0x1A3A5A, 0.9);
      detailBg.setStrokeStyle(2, 0x87CEEB, 0.8);
      detailContainer.add(detailBg);
      
      // 詳細表示閉じるボタン
      const closeButton = this.add.rectangle(detailBg.width / 2 - 30, -detailBg.height / 2 + 20, 40, 40, 0xFF5555, 0.8);
      closeButton.setInteractive();
      const closeText = this.add.text(detailBg.width / 2 - 30, -detailBg.height / 2 + 20, '×', {
        fontSize: '24px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      detailContainer.add([closeButton, closeText]);
      
      // 詳細表示タイトル
      const detailTitle = this.add.text(0, -detailBg.height / 2 + 20, '獲得アイテム一覧', {
        fontSize: '20px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      detailContainer.add(detailTitle);
      
      // 詳細表示内容
      let detailY = -detailBg.height / 2 + 60;
      entries.forEach((entry, index) => {
        const item = entry.item;
        const rarity = item.rarity;
        const stars = getRarityStars(rarity);
        const starText = '★'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars));
        
        // アイテム背景
        const itemDetailBg = this.add.rectangle(0, detailY + 20, 280, 60, this.getRarityBackgroundColor(rarity), 0.3);
        itemDetailBg.setStrokeStyle(2, parseInt(getRarityColor(rarity).replace('#', '0x')), 0.8);
        
        // アイテム名
        const itemNameText = this.add.text(-120, detailY, item.name, {
          fontSize: '16px',
          color: getRarityColor(rarity),
          fontStyle: rarity === 'S' || rarity === 'A' ? 'bold' : 'normal'
        }).setOrigin(0, 0.5);
        
        // レア度
        const itemRarityText = this.add.text(-120, detailY + 20, `${starText} (${rarity})`, {
          fontSize: '12px',
          color: getRarityColor(rarity)
        }).setOrigin(0, 0.5);
        
        // 獲得数
        const itemCountText = this.add.text(120, detailY, `×${entry.count}`, {
          fontSize: '16px',
          color: '#FFFFFF'
        }).setOrigin(1, 0.5);
        
        // 確定枠表示
        if (this.guaranteedItemIndex !== -1 && entry.index === this.guaranteedItemIndex) {
          const guaranteedTag = this.add.text(120, detailY + 20, '確定', {
            fontSize: '12px',
            color: '#FFD700',
            fontStyle: 'bold'
          }).setOrigin(1, 0.5);
          detailContainer.add(guaranteedTag);
        }
        
        detailContainer.add([itemDetailBg, itemNameText, itemRarityText, itemCountText]);
        detailY += 70;
      });
      
      // 閉じるボタンの動作
      closeButton.on('pointerdown', () => {
        detailContainer.setVisible(false);
      });
      
      // すべて確認ボタンの動作
      viewAllButton.on('pointerdown', () => {
        detailContainer.setVisible(true);
      });
      
      // グリッドアイテムの作成
      entries.forEach((entry, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const x = startX + col * cellWidth;
        const y = startY + row * cellHeight;
        
        // アイテム背景（レア度に応じた色）
        const bgColor = this.getRarityBackgroundColor(entry.item.rarity);
        const itemBg = this.add.rectangle(x, y, cellWidth - 10, cellHeight - 10, bgColor, 0.3);
        itemBg.setStrokeStyle(2, parseInt(getRarityColor(entry.item.rarity).replace('#', '0x')), 0.8);
        itemBg.setInteractive();
        
        // アイテムをタップしたときの詳細表示
        const itemDetailContainer = this.add.container(x, y);
        itemDetailContainer.setVisible(false);
        
        // 詳細背景
        const detailPopupBg = this.add.rectangle(0, 0, 180, 120, 0x1A3A5A, 0.9);
        detailPopupBg.setStrokeStyle(2, parseInt(getRarityColor(entry.item.rarity).replace('#', '0x')), 0.8);
        
        // 詳細テキスト
        const detailName = this.add.text(0, -40, entry.item.name, {
          fontSize: '14px',
          color: getRarityColor(entry.item.rarity),
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const detailRarity = this.add.text(0, -20, `レア度: ${entry.item.rarity}`, {
          fontSize: '12px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
        
        const detailDesc = this.add.text(0, 10, entry.item.description, {
          fontSize: '10px',
          color: '#CCCCCC',
          wordWrap: { width: 160 },
          align: 'center'
        }).setOrigin(0.5);
        
        itemDetailContainer.add([detailPopupBg, detailName, detailRarity, detailDesc]);
        this.resultContainer.add(itemDetailContainer);
        
        // タップで詳細表示切り替え
        itemBg.on('pointerdown', () => {
          itemDetailContainer.setVisible(!itemDetailContainer.visible);
        });
        
        // 確定枠の場合は特別な枠
        if (this.guaranteedItemIndex !== -1 && entry.index === this.guaranteedItemIndex) {
          itemBg.setStrokeStyle(3, 0xFFD700, 1);
          
          // 「確定」テキスト
          const guaranteedText = this.add.text(x, y + cellHeight / 2 - 8, '確定', {
            fontSize: '10px',
            color: '#FFD700',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          this.resultContainer.add(guaranteedText);
          
          // 確定枠の輝きエフェクト
          const guaranteedGlow = this.add.rectangle(x, y, cellWidth, cellHeight, 0xFFD700, 0.2);
          this.resultContainer.add(guaranteedGlow);
          
          this.tweens.add({
            targets: guaranteedGlow,
            alpha: { from: 0.2, to: 0.4 },
            yoyo: true,
            repeat: -1,
            duration: 1000
          });
        }
        
        // アイテム名
        const itemText = this.add.text(x, y - 20, entry.item.name, {
          fontSize: '12px',
          color: getRarityColor(entry.item.rarity),
          fontStyle: entry.item.rarity === 'S' || entry.item.rarity === 'A' ? 'bold' : 'normal'
        }).setOrigin(0.5);
        
        // 獲得数
        const countText = this.add.text(x, y, `×${entry.count}`, {
          fontSize: '14px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // レア度（星で表現）
        const stars = getRarityStars(entry.item.rarity);
        const starText = '★'.repeat(stars);
        const starDisplay = this.add.text(x, y + 20, starText, {
          fontSize: '12px',
          color: getRarityColor(entry.item.rarity)
        }).setOrigin(0.5);
        
        this.resultContainer.add([itemBg, itemText, countText, starDisplay]);
        
        // S・Aレアの場合は特別なエフェクト
        if (entry.item.rarity === 'S' || entry.item.rarity === 'A') {
          // キラキラエフェクト
          for (let i = 0; i < 5; i++) {
            const starX = x + Phaser.Math.Between(-cellWidth/2, cellWidth/2);
            const starY = y + Phaser.Math.Between(-cellHeight/2, cellHeight/2);
            const star = this.add.star(starX, starY, 5, 2, 4, 0xFFD700);
            this.resultContainer.add(star);
            
            this.tweens.add({
              targets: star,
              angle: 360,
              alpha: { from: 0, to: 1, yoyo: true },
              scale: { from: 0.5, to: 1.5, yoyo: true },
              duration: Phaser.Math.Between(1000, 2000),
              repeat: -1
            });
          }
          
          // 輝く背景
          const glowBg = this.add.rectangle(x, y, cellWidth, cellHeight, 0xFFD700, 0.2);
          this.resultContainer.add(glowBg);
          
          this.tweens.add({
            targets: glowBg,
            alpha: { from: 0.2, to: 0.4 },
            yoyo: true,
            repeat: -1,
            duration: 1000
          });
        }
      });
      
      // S・Aレアが含まれている場合は特別表示
      if (this.isRare) {
        const rareItems = this.drawnItems.filter(item => 
          item.rarity === 'S' || item.rarity === 'A'
        );
        
        if (rareItems.length > 0) {
          const specialY = startY + Math.ceil(entries.length / gridSize) * cellHeight + 20;
          
          const specialBg = this.add.rectangle(0, specialY, 300, 40, 0xFFD700, 0.3);
          specialBg.setStrokeStyle(2, 0xFFD700, 0.8);
          
          const specialText = this.add.text(0, specialY, `★ レアアイテム ${rareItems.length}個 獲得! ★`, {
            fontSize: '18px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5);
          
          this.resultContainer.add([specialBg, specialText]);
          
          // レアアイテムがある場合は特別演出
          this.createRareItemEffect();
          
          // 特別な背景エフェクト
          const rareEffectBg = this.add.rectangle(0, 0, width - 40, height - 200, 0xFFD700, 0.1);
          rareEffectBg.setStrokeStyle(3, 0xFFD700, 0.3);
          this.resultContainer.add(rareEffectBg);
          
          // 背景の脈動エフェクト
          this.tweens.add({
            targets: rareEffectBg,
            alpha: { from: 0.1, to: 0.2 },
            yoyo: true,
            repeat: -1,
            duration: 1500
          });
        }
      }
      
      // Dレア以上確定枠の表示（自然に出た場合は表示しない）
      if (this.guaranteedItemIndex !== -1) {
        const guaranteedY = -180;
        const guaranteedBg = this.add.rectangle(0, guaranteedY, 250, 30, 0x32CD32, 0.3);
        guaranteedBg.setStrokeStyle(2, 0x32CD32, 0.8);
        
        const guaranteedText = this.add.text(0, guaranteedY, 'Dレア以上1枠確定!', {
          fontSize: '16px',
          color: '#32CD32',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 1
        }).setOrigin(0.5);
        
        this.resultContainer.add([guaranteedBg, guaranteedText]);
      }
      
      // すべて確認ボタンを追加
      this.resultContainer.add([viewAllButton, viewAllText]);
    }
    
    // 結果を表示
    this.tweens.add({
      targets: this.resultContainer,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  }

  private getRarityBackgroundColor(rarity: string): number {
    switch (rarity) {
      case 'S': return 0x332200;
      case 'A': return 0x330000;
      case 'B': return 0x220033;
      case 'C': return 0x001133;
      case 'D': return 0x003300;
      case 'E': return 0x222222;
      case 'F': return 0x111111;
      default: return 0x000000;
    }
  }

  private createRareItemEffect() {
    // heightは実際に使用する
    const { height } = this.cameras.main;
    
    // キラキラエフェクト - 強化版
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(-180, 180);
      const y = Phaser.Math.Between(-180, 180);
      const size = Phaser.Math.Between(2, 8);
      const color = i % 3 === 0 ? 0xFFD700 : (i % 3 === 1 ? 0xFFFFFF : 0xFFA500);
      
      // 星型と円形を混在させる
      let particle;
      if (i % 2 === 0) {
        particle = this.add.star(x, y, 5, size, size * 2, color);
      } else {
        particle = this.add.circle(x, y, size, color, 0.8);
      }
      
      this.resultContainer.add(particle);
      
      // より複雑なアニメーション
      this.tweens.add({
        targets: particle,
        angle: 360,
        alpha: { from: 0, to: 1, yoyo: true },
        scale: { from: 0.5, to: Phaser.Math.FloatBetween(1.0, 2.0), yoyo: true },
        x: x + Phaser.Math.Between(-30, 30),
        y: y + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(1000, 3000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000)
      });
    }
    
    // 光の輪 - 複数の輪を重ねる
    const colors = [0xFFD700, 0xFFA500, 0xFFFFFF];
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(0, 0, 100 + i * 30, colors[i], 0.2);
      this.resultContainer.add(ring);
      
      this.tweens.add({
        targets: ring,
        scale: { from: 0.5, to: 2.5 },
        alpha: { from: 0.5, to: 0 },
        duration: 2000 + i * 500,
        repeat: -1,
        delay: i * 500
      });
    }
    
    // 光線エフェクト
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const length = 200;
      const thickness = 3;
      
      const ray = this.add.rectangle(
        0, 0,
        length, thickness,
        0xFFD700, 0.5
      );
      
      ray.setOrigin(0, 0.5);
      ray.setRotation(angle);
      this.resultContainer.add(ray);
      
      this.tweens.add({
        targets: ray,
        scaleX: { from: 0.3, to: 1 },
        alpha: { from: 0.7, to: 0 },
        duration: 1500,
        repeat: -1,
        delay: i * 200
      });
    }
    
    // 背景の波紋エフェクト
    const wavesCount = 3;
    for (let i = 0; i < wavesCount; i++) {
      const wave = this.add.circle(0, 0, 50, 0xFFFFFF, 0.2);
      wave.setStrokeStyle(2, 0xFFD700, 0.5);
      this.resultContainer.add(wave);
      
      this.tweens.add({
        targets: wave,
        scale: { from: 0.1, to: 4 },
        alpha: { from: 0.5, to: 0 },
        duration: 3000,
        repeat: -1,
        delay: i * (3000 / wavesCount)
      });
    }
    
    // 音符エフェクト（お祝い感を演出）
    const noteSymbols = ['♪', '♫', '♬', '♩'];
    for (let i = 0; i < 10; i++) {
      const noteX = Phaser.Math.Between(-200, 200);
      const noteY = Phaser.Math.Between(-200, 200);
      const noteSymbol = noteSymbols[i % noteSymbols.length];
      
      const note = this.add.text(noteX, noteY, noteSymbol, {
        fontSize: '24px',
        color: i % 2 === 0 ? '#FFD700' : '#FFFFFF'
      });
      
      this.resultContainer.add(note);
      
      this.tweens.add({
        targets: note,
        y: noteY - Phaser.Math.Between(50, 150),
        x: noteX + Phaser.Math.Between(-30, 30),
        alpha: { from: 1, to: 0 },
        scale: { from: 0.5, to: 1.5 },
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  private createBubbleEffect() {
    const { width, height } = this.cameras.main;
    
    // 泡の数を増やす
    const bubbleCount = 40;
    
    for (let i = 0; i < bubbleCount; i++) {
      // 泡の大きさをランダムに（より多様なサイズ）
      const size = Phaser.Math.FloatBetween(1.5, 10);
      
      // 泡の位置をランダムに
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(height, height + 300);
      
      // 泡の透明度をサイズに応じて調整
      const alpha = Phaser.Math.FloatBetween(0.4, 0.8);
      
      // 泡を作成（円形と楕円形を混在）
      let bubble;
      if (i % 3 === 0) {
        // 楕円形の泡
        const ellipse = this.add.ellipse(x, y, size * 1.5, size, 0xFFFFFF, alpha);
        bubble = ellipse;
      } else {
        // 円形の泡
        bubble = this.add.circle(x, y, size, 0xFFFFFF, alpha);
        
        // 光の反射効果（小さな白い円）
        if (size > 5 && i % 4 === 0) {
          const reflection = this.add.circle(
            x - size * 0.3, 
            y - size * 0.3, 
            size * 0.2, 
            0xFFFFFF, 
            0.9
          );
          
          // 反射も泡と一緒に移動
          this.tweens.add({
            targets: reflection,
            y: -50,
            x: x + Phaser.Math.Between(-70, 70),
            alpha: 0,
            duration: Phaser.Math.Between(3000, 10000),
            delay: Phaser.Math.Between(0, 2000),
            onComplete: () => {
              reflection.destroy();
            }
          });
        }
      }
      
      // 泡が上昇するアニメーション（より自然な動き）
      this.tweens.add({
        targets: bubble,
        y: -50,
        x: x + Phaser.Math.Between(-70, 70), // 左右にも揺れる
        alpha: 0,
        scale: Phaser.Math.FloatBetween(0.8, 1.5), // サイズも変化
        duration: Phaser.Math.Between(3000, 10000), // より多様な速度
        delay: Phaser.Math.Between(0, 3000), // 出現タイミングをばらつかせる
        ease: 'Sine.easeInOut', // より自然な動き
        onComplete: () => {
          bubble.destroy();
        }
      });
      
      // 泡の揺れアニメーション（自然な水中感）
      if (i % 2 === 0) {
        this.tweens.add({
          targets: bubble,
          x: x + Phaser.Math.Between(-15, 15),
          duration: Phaser.Math.Between(1000, 3000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
    
    // 定期的に新しい泡を生成
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        // アニメーション完了後は泡を生成しない
        if (!this.animationComplete) {
          this.createAdditionalBubbles(width, height, 10);
        }
      },
      repeat: 3
    });
  }
  
  private createAdditionalBubbles(width: number, height: number, count: number) {
    for (let i = 0; i < count; i++) {
      const size = Phaser.Math.FloatBetween(1.5, 8);
      const x = Phaser.Math.Between(0, width);
      const y = height;
      
      const bubble = this.add.circle(x, y, size, 0xFFFFFF, 0.6);
      
      this.tweens.add({
        targets: bubble,
        y: -50,
        x: x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scale: Phaser.Math.FloatBetween(0.8, 1.2),
        duration: Phaser.Math.Between(3000, 8000),
        ease: 'Sine.easeInOut',
        onComplete: () => {
          bubble.destroy();
        }
      });
    }
  }
}
