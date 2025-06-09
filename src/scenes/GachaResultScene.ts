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

    // 背景色設定（海のグラデーション）
    this.cameras.main.setBackgroundColor('#2E4057');
    
    // 海の波のような背景エフェクト
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x1E3B5E, 0x1E3B5E, 0x2E4057, 0x2E4057, 1);
    bgGraphics.fillRect(0, 0, width, height);
    
    // 波エフェクト
    const wave1 = this.add.graphics();
    wave1.fillStyle(0x3A6EA5, 0.2);
    wave1.fillEllipse(width / 2, height * 0.7, width * 1.5, 100);
    
    const wave2 = this.add.graphics();
    wave2.fillStyle(0x87CEEB, 0.1);
    wave2.fillEllipse(width / 2, height * 0.3, width * 1.2, 80);

    // タイトル
    const titleBg = this.add.rectangle(width / 2, 50, 250, 50, 0x1A3A5A, 0.8);
    titleBg.setStrokeStyle(2, 0x87CEEB, 0.8);
    
    this.add.text(width / 2, 50, '🎁 ガチャ結果 🎁', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 結果表示用のコンテナ（初期状態では非表示）
    this.resultContainer = this.add.container(width / 2, height / 2);
    this.resultContainer.setAlpha(0);

    // 宝箱の代わりに簡易的な表現（実際のゲームでは画像を使用）
    this.treasureChest = this.add.sprite(width / 2, height / 2 - 50, 'treasureChest');
    
    // 宝箱の代わりに簡易的な表現（画像がない場合）
    if (!this.textures.exists('treasureChest')) {
      const chestGraphics = this.add.graphics();
      
      // 宝箱の本体
      chestGraphics.fillStyle(this.isRare ? 0xFFD700 : 0xCD7F32, 1);
      chestGraphics.fillRect(-30, -20, 60, 40);
      
      // 宝箱の蓋
      chestGraphics.fillStyle(this.isRare ? 0xFFC125 : 0xB87333, 1);
      chestGraphics.fillRect(-35, -30, 70, 15);
      
      // 宝箱の装飾
      chestGraphics.fillStyle(0x000000, 0.5);
      chestGraphics.fillRect(-20, -10, 40, 5);
      
      // 宝箱の鍵穴
      chestGraphics.fillStyle(0x000000, 1);
      chestGraphics.fillCircle(0, 0, 5);
      
      // テクスチャとして生成
      chestGraphics.generateTexture('treasureChest', 80, 60);
      chestGraphics.clear();
      
      // スプライトを作成
      this.treasureChest = this.add.sprite(width / 2, height / 2 - 50, 'treasureChest');
    }
    
    // 宝箱の初期位置（画面外の下）
    this.treasureChest.setPosition(width / 2, height + 100);
    
    // 宝箱が海底から浮かび上がるアニメーション
    this.tweens.add({
      targets: this.treasureChest,
      y: height / 2 - 50,
      duration: 1500,
      ease: 'Bounce.Out',
      onComplete: () => {
        // 宝箱が開くアニメーション
        this.time.delayedCall(500, () => {
          // 宝箱が開く演出（スケールを少し大きくする）
          this.tweens.add({
            targets: this.treasureChest,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
              // 光のエフェクト
              const light = this.add.circle(width / 2, height / 2 - 50, 50, 0xFFFFFF, 0.8);
              
              this.tweens.add({
                targets: light,
                alpha: 0,
                scale: 3,
                duration: 800,
                onComplete: () => {
                  light.destroy();
                  
                  // 宝箱を消して結果を表示
                  this.treasureChest.setVisible(false);
                  this.showResults();
                }
              });
            }
          });
        });
      }
    });

    // 泡のエフェクト
    this.createBubbleEffect();

    // ボタン配置（初期状態では非表示）
    const buttonY = height - 120;
    
    // もう一度ボタン
    const againButton = this.add.rectangle(width / 2 - 80, buttonY, 120, 50, 0x4CAF50, 0.8);
    againButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    againButton.setInteractive();
    againButton.setAlpha(0);
    
    // ホバーエフェクト
    againButton.on('pointerover', () => {
      againButton.setFillStyle(0x5DBF60, 0.9);
    });
    againButton.on('pointerout', () => {
      againButton.setFillStyle(0x4CAF50, 0.8);
    });
    
    againButton.on('pointerdown', () => {
      this.scene.start('GachaScene', {
        gameStateManager: this.gameStateManager
      });
    });

    const againText = this.add.text(width / 2 - 80, buttonY, 'もう一度', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    againText.setAlpha(0);

    // 戻るボタン
    const backButton = this.add.rectangle(width / 2 + 80, buttonY, 120, 50, 0x2196F3, 0.8);
    backButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    backButton.setInteractive();
    backButton.setAlpha(0);
    
    // ホバーエフェクト
    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x42A5F5, 0.9);
    });
    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x2196F3, 0.8);
    });
    
    backButton.on('pointerdown', () => {
      this.scene.start('GachaScene', {
        gameStateManager: this.gameStateManager
      });
    });

    const backText = this.add.text(width / 2 + 80, buttonY, '戻る', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
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
    
    // 背景に金色の光を追加
    const goldenLight = this.add.graphics();
    goldenLight.fillStyle(0xFFD700, 0.1);
    goldenLight.fillRect(0, 0, width, height);
    
    // 光の波紋
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(width / 2, height / 2, 100 + i * 50, 0xFFD700, 0.1);
      
      this.tweens.add({
        targets: ring,
        scale: { from: 0.5, to: 3 },
        alpha: { from: 0.2, to: 0 },
        duration: 3000 + i * 500,
        repeat: -1,
        delay: i * 1000
      });
    }
  }

  private showResults() {
    // width, heightは両方使用するので残す
    const { width, height } = this.cameras.main;
    
    // 以下のコードでwidthとheightを使用
    
    if (this.drawCount === 1) {
      // 1回引きの場合
      const item = this.drawnItems[0];
      if (item) {
        // アイテム名
        const nameText = this.add.text(0, -40, item.name, {
          fontSize: '24px',
          color: getRarityColor(item.rarity),
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // レア度表示（星で表現）
        const stars = getRarityStars(item.rarity);
        const starText = '★'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars));
        const rarityText = this.add.text(0, 0, `${starText} (${item.rarity})`, {
          fontSize: '16px',
          color: getRarityColor(item.rarity)
        }).setOrigin(0.5);
        
        // 獲得数
        const countText = this.add.text(0, 40, '×1', {
          fontSize: '18px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // 説明文
        const descText = this.add.text(0, 80, item.description, {
          fontSize: '14px',
          color: '#CCCCCC',
          wordWrap: { width: 300 }
        }).setOrigin(0.5);
        
        this.resultContainer.add([nameText, rarityText, countText, descText]);
        
        // S・Aレアの場合は特別演出
        if (item.rarity === 'S' || item.rarity === 'A') {
          this.createRareItemEffect();
        }
      }
    } else {
      // 10回引きの場合
      const titleText = this.add.text(0, -150, `${this.drawCount}回の結果:`, {
        fontSize: '18px',
        color: '#FFFFFF',
        fontStyle: 'bold'
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
      
      // 結果表示（グリッドレイアウト）
      const entries = Object.values(itemCounts);
      const gridSize = 3; // 3×4のグリッド
      const cellWidth = 100;
      const cellHeight = 60;
      const startX = -cellWidth;
      const startY = -100;
      
      entries.forEach((entry, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const x = startX + col * cellWidth;
        const y = startY + row * cellHeight;
        
        // アイテム背景（レア度に応じた色）
        const bgColor = this.getRarityBackgroundColor(entry.item.rarity);
        const itemBg = this.add.rectangle(x, y, cellWidth - 10, cellHeight - 10, bgColor, 0.3);
        itemBg.setStrokeStyle(2, parseInt(getRarityColor(entry.item.rarity).replace('#', '0x')), 0.8);
        
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
        }
        
        // アイテム名
        const itemText = this.add.text(x, y - 10, entry.item.name, {
          fontSize: '12px',
          color: getRarityColor(entry.item.rarity),
          fontStyle: entry.item.rarity === 'S' || entry.item.rarity === 'A' ? 'bold' : 'normal'
        }).setOrigin(0.5);
        
        // 獲得数
        const countText = this.add.text(x, y + 10, `×${entry.count}`, {
          fontSize: '12px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // レア度（星で表現）
        const stars = getRarityStars(entry.item.rarity);
        const starText = '★'.repeat(stars);
        const starDisplay = this.add.text(x, y + 25, starText, {
          fontSize: '10px',
          color: getRarityColor(entry.item.rarity)
        }).setOrigin(0.5);
        
        this.resultContainer.add([itemBg, itemText, countText, starDisplay]);
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
            fontSize: '16px',
            color: '#FFD700',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          this.resultContainer.add([specialBg, specialText]);
          
          // レアアイテムがある場合は特別演出
          this.createRareItemEffect();
        }
      }
      
      // Dレア以上確定枠の表示（自然に出た場合は表示しない）
      if (this.guaranteedItemIndex !== -1) {
        const guaranteedY = -150;
        const guaranteedText = this.add.text(0, guaranteedY, 'Dレア以上1枠確定!', {
          fontSize: '14px',
          color: '#32CD32',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.resultContainer.add(guaranteedText);
      }
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
    
    // キラキラエフェクト
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(-150, 150);
      const y = Phaser.Math.Between(-150, 150);
      const size = Phaser.Math.Between(2, 6);
      
      const star = this.add.star(x, y, 5, size, size * 2, 0xFFD700);
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
    
    // 光の輪
    const ring = this.add.circle(0, 0, 100, 0xFFD700, 0.3);
    this.resultContainer.add(ring);
    
    this.tweens.add({
      targets: ring,
      scale: { from: 0.5, to: 2 },
      alpha: { from: 0.5, to: 0 },
      duration: 2000,
      repeat: -1
    });
  }

  private createBubbleEffect() {
    const { width, height } = this.cameras.main;
    
    // 泡の数
    const bubbleCount = 20;
    
    for (let i = 0; i < bubbleCount; i++) {
      // 泡の大きさをランダムに
      const size = Phaser.Math.Between(2, 8);
      
      // 泡の位置をランダムに
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(height, height + 200);
      
      // 泡を作成
      const bubble = this.add.circle(x, y, size, 0xFFFFFF, 0.6);
      
      // 泡が上昇するアニメーション
      this.tweens.add({
        targets: bubble,
        y: -50,
        x: x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 8000),
        delay: Phaser.Math.Between(0, 2000),
        onComplete: () => {
          bubble.destroy();
        }
      });
    }
  }
}
