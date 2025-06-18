import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';
import { GameStateManager } from '../utils/GameStateManager';
import { BlockFactory } from '../utils/BlockFactory';
import { BlockAsciiRenderer } from '../utils/BlockAsciiRenderer';
import { StageManager } from '../managers/StageManager';
import { StageConfig } from '../types/StageConfig';
import { ItemManager } from '../managers/ItemManager';
import { ItemEffectManager } from '../managers/ItemEffectManager';
import { ITEM_DATA } from '../data/ItemData';

/**
 * ゲーム画面
 */
export class GameScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private currentStage: number = 1;
  private score: number = 0;
  private targetScore: number = GameConfig.TARGET_SCORE;
  private blocks: Block[][] = [];
  private blockSprites: Phaser.GameObjects.Sprite[][] = [];
  private boardX: number = 0;
  private boardY: number = 0;
  private isProcessing: boolean = false;

  private gameStateManager: GameStateManager;
  private blockLogic: BlockLogic;
  private stageManager: StageManager;
  private itemManager: ItemManager;
  private currentStageConfig: StageConfig | null = null;
  
  // アイテム使用状態
  private isItemMode: boolean = false;
  private selectedItemSlot: 'special' | 'normal' | null = null;
  private scoreBoosterActive: boolean = false; // スコアブースターが有効かどうか

  constructor() {
    super({ key: 'GameScene' });
    this.gameStateManager = GameStateManager.getInstance();
    this.blockLogic = new BlockLogic();
    this.stageManager = new StageManager();
    this.itemManager = new ItemManager();
  }

  init(data: any): void {
    // ステージ情報を設定
    if (data.stage) {
      this.currentStage = data.stage;
      this.stageManager.goToStage(data.stage);
    } else {
      this.currentStage = this.stageManager.getCurrentStage();
    }
    
    // ステージ設定を取得
    this.currentStageConfig = this.stageManager.getCurrentStageConfig();
    if (this.currentStageConfig) {
      this.targetScore = this.currentStageConfig.targetScore;
    } else {
      this.targetScore = GameConfig.TARGET_SCORE;
    }
    
    // 装備されたアイテムを設定
    if (data.equippedItems) {
      if (data.equippedItems.specialSlot) {
        this.itemManager.equipItem(data.equippedItems.specialSlot, 'special');
      }
      if (data.equippedItems.normalSlot) {
        this.itemManager.equipItem(data.equippedItems.normalSlot, 'normal');
      }
    }
    
    this.score = 0;
    this.isItemMode = false;
    this.selectedItemSlot = null;
    this.scoreBoosterActive = false;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // 岩ブロック用のテクスチャを生成
    if (!this.textures.exists('rockBlockTexture')) {
      // 六角形のテクスチャを生成
      const graphics = this.make.graphics({});
      graphics.fillStyle(0x808080, 1); // 灰色
      graphics.lineStyle(2, 0x000000, 1); // 黒い輪郭
      
      const size = GameConfig.BLOCK_SIZE / 2 - 2;
      const sides = 6;
      
      // 中心を原点として六角形を描画
      graphics.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const x = GameConfig.BLOCK_SIZE / 2 + size * Math.cos(angle);
        const y = GameConfig.BLOCK_SIZE / 2 + size * Math.sin(angle);
        
        if (i === 0) {
          graphics.moveTo(x, y);
        } else {
          graphics.lineTo(x, y);
        }
      }
      graphics.closePath();
      graphics.fillPath();
      graphics.strokePath();
      
      // 岩の質感を表現する線を追加
      graphics.lineStyle(1, 0x000000, 0.3);
      graphics.moveTo(GameConfig.BLOCK_SIZE / 2 - size / 2, GameConfig.BLOCK_SIZE / 2 - size / 3);
      graphics.lineTo(GameConfig.BLOCK_SIZE / 2 + size / 2, GameConfig.BLOCK_SIZE / 2 - size / 3);
      graphics.moveTo(GameConfig.BLOCK_SIZE / 2 - size / 3, GameConfig.BLOCK_SIZE / 2);
      graphics.lineTo(GameConfig.BLOCK_SIZE / 2 + size / 3, GameConfig.BLOCK_SIZE / 2);
      graphics.moveTo(GameConfig.BLOCK_SIZE / 2 - size / 2, GameConfig.BLOCK_SIZE / 2 + size / 3);
      graphics.lineTo(GameConfig.BLOCK_SIZE / 2 + size / 2, GameConfig.BLOCK_SIZE / 2 + size / 3);
      graphics.strokePath();
      
      // テクスチャとして生成
      graphics.generateTexture('rockBlockTexture', GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
      graphics.destroy();
    }
    
    // ヘッダー（ステージ情報とスコア）
    const headerText = this.add.text(10, 15, `Stage ${this.currentStage}  Score: ${this.score}`, { // 30から15に調整
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setName('headerText');
    
    const targetText = this.add.text(10, 40, `Target: ${this.targetScore}`, { // 60から40に調整
      fontSize: '16px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    // ゲーム盤面の位置を計算
    const titleHeight = 80; // 60px + 20px（旧タイトル下空白エリア）
    const titleCenterY = 40; // 中心位置を調整
    const titleBottomY = titleCenterY + titleHeight / 2;
    const boardWidth = GameConfig.BOARD_WIDTH * GameConfig.BLOCK_SIZE;
    const boardHeight = GameConfig.BOARD_HEIGHT * GameConfig.BLOCK_SIZE;
    
    // タイトルエリアの直下にメインコンテンツエリアを配置
    this.boardX = width / 2 - boardWidth / 2;
    this.boardY = titleBottomY; // タイトルエリアの直下に配置
    
    // ゲーム盤面の背景
    const adjustedBoardCenterY = titleBottomY + boardHeight / 2;
    const boardBg = this.add.rectangle(
      width / 2,
      adjustedBoardCenterY,
      GameConfig.BOARD_WIDTH * GameConfig.BLOCK_SIZE,
      GameConfig.BOARD_HEIGHT * GameConfig.BLOCK_SIZE,
      0x000033,
      0.3
    );
    
    // ボタンエリア
    const buttonHeight = 60;
    const buttonCenterY = height - buttonHeight / 2;
    
    // アイテムボタンを作成
    this.createItemButtons(buttonCenterY);
    
    // リタイアボタン
    const retireButton = this.add.rectangle(width - 70, buttonCenterY, 120, 40, 0xAA2222)
      .setInteractive({ useHandCursor: true })
      .setName('retireButton');
    
    const retireText = this.add.text(width - 70, buttonCenterY, 'リタイア', {
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setName('retireText');
    
    // ボタンクリックイベント
    retireButton.on('pointerdown', () => {
      // リタイア時の処理
      this.onRetire();
    });
    
    // ボタンホバーエフェクト
    this.addButtonHoverEffect(retireButton, retireText);
    
    // ブロックの初期配置
    this.createInitialBlocks();
    
    // デバッグヘルパーにブロック配列を設定
    this.debugHelper.setBlocks(this.blocks);
    
    // デバッグライン
    if (GameConfig.DEBUG_MODE) {
      this.addDebugLines();
    }
  }
  
  /**
   * ブロックの初期配置を作成
   */
  private createInitialBlocks(): void {
    // ブロック配列の初期化
    this.blocks = Array(GameConfig.BOARD_HEIGHT).fill(0).map(() => 
      Array(GameConfig.BOARD_WIDTH).fill(null)
    );
    
    this.blockSprites = Array(GameConfig.BOARD_HEIGHT).fill(0).map(() => 
      Array(GameConfig.BOARD_WIDTH).fill(null)
    );
    
    // ステージ設定から色数を取得
    const colorCount = this.currentStageConfig?.colors || 3;
    const colorKeys = Object.keys(GameConfig.BLOCK_COLORS);
    const availableColors = colorKeys.slice(0, colorCount);
    
    // ブロックファクトリーの作成
    const blockFactory = new BlockFactory();
    
    // まず妨害ブロックを配置
    if (this.currentStageConfig?.obstacles) {
      this.currentStageConfig.obstacles.forEach(obstacle => {
        if (obstacle.y < GameConfig.BOARD_HEIGHT && obstacle.x < GameConfig.BOARD_WIDTH) {
          let block: Block;
          
          switch (obstacle.type) {
            case 'iceLv1':
              block = blockFactory.createIceBlockLv1(obstacle.x, obstacle.y, obstacle.color || availableColors[0]);
              break;
            case 'iceLv2':
              block = blockFactory.createIceBlockLv2(obstacle.x, obstacle.y, obstacle.color || availableColors[0]);
              break;
            case 'counterPlus':
              block = blockFactory.createCounterPlusBlock(obstacle.x, obstacle.y, obstacle.color || availableColors[0], obstacle.counter || 3);
              break;
            case 'counterMinus':
              block = blockFactory.createCounterMinusBlock(obstacle.x, obstacle.y, obstacle.color || availableColors[0], obstacle.counter || 3);
              break;
            case 'iceCounterPlus':
              block = blockFactory.createIceCounterPlusBlock(obstacle.x, obstacle.y, obstacle.color || availableColors[0], obstacle.counter || 3);
              break;
            case 'iceCounterMinus':
              block = blockFactory.createIceCounterMinusBlock(obstacle.x, obstacle.y, obstacle.color || availableColors[0], obstacle.counter || 3);
              break;
            case 'rock':
              block = blockFactory.createRockBlock(obstacle.x, obstacle.y);
              break;
            case 'steel':
              // 注意: 鋼鉄ブロックは仕様として定義されていますが、現在のゲームバージョンでは出現しません
              block = blockFactory.createSteelBlock(obstacle.x, obstacle.y);
              break;
            default:
              // 不明なタイプの場合は通常ブロックを作成
              const colorKey = availableColors[Math.floor(Math.random() * availableColors.length)];
              const color = GameConfig.BLOCK_COLORS[colorKey as keyof typeof GameConfig.BLOCK_COLORS];
              block = blockFactory.createNormalBlock(obstacle.x, obstacle.y, color);
              break;
          }
          
          this.blocks[obstacle.y][obstacle.x] = block;
        }
      });
    }
    
    // 残りの位置に通常ブロックを配置
    for (let y = 0; y < GameConfig.BOARD_HEIGHT; y++) {
      for (let x = 0; x < GameConfig.BOARD_WIDTH; x++) {
        // 既に妨害ブロックが配置されている場合はスキップ
        if (this.blocks[y][x]) {
          // スプライトのみ作成
          this.createBlockSprite(x, y, this.blocks[y][x]!);
          continue;
        }
        
        // ランダムな色を選択
        const colorKey = availableColors[Math.floor(Math.random() * availableColors.length)];
        const color = GameConfig.BLOCK_COLORS[colorKey as keyof typeof GameConfig.BLOCK_COLORS];
        
        // 通常ブロックを作成
        const block = blockFactory.createNormalBlock(x, y, color);
        this.blocks[y][x] = block;
        
        // ブロックのスプライトを作成
        this.createBlockSprite(x, y, block);
      }
    }
    
    // 消去可能なブロックがない場合は再生成
    if (!this.blockLogic.hasRemovableBlocks(this.blocks)) {
      // スプライトを破棄
      for (let y = 0; y < GameConfig.BOARD_HEIGHT; y++) {
        for (let x = 0; x < GameConfig.BOARD_WIDTH; x++) {
          if (this.blockSprites[y][x]) {
            this.blockSprites[y][x].destroy();
            this.blockSprites[y][x] = null;
          }
        }
      }
      
      // 再生成
      this.createInitialBlocks();
    }
  }
  
  /**
   * 指定位置にブロックスプライトを作成
   */
  private createBlockSprite(x: number, y: number, block: Block): Phaser.GameObjects.Sprite {
    const blockX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    const blockY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    
    // 単純な円形のスプライトを作成
    const blockSprite = this.add.circle(
      blockX, 
      blockY, 
      GameConfig.BLOCK_SIZE / 2 - 2, 
      parseInt(block.color.replace('#', '0x'))
    );
    
    // 妨害ブロックの場合は特殊な見た目にする
    if (block.type === BlockType.ICE_LV1) {
      // 氷結Lv1は輪郭を付ける
      blockSprite.setStrokeStyle(2, 0xADD8E6);
    } else if (block.type === BlockType.ICE_LV2) {
      // 氷結Lv2は太い輪郭を付ける
      blockSprite.setStrokeStyle(4, 0x87CEFA);
    } else if (block.type === BlockType.ICE_COUNTER_PLUS || block.type === BlockType.ICE_COUNTER_MINUS) {
      // 氷結カウンターブロックは氷の輪郭と数字を表示
      const borderColor = block.type === BlockType.ICE_COUNTER_PLUS ? 0xADD8E6 : 0xADD8E6; // 氷の色
      blockSprite.setStrokeStyle(4, borderColor);
      
      // 内側に星のマークを追加
      const starGraphics = this.add.graphics();
      starGraphics.fillStyle(0xFFFFFF, 0.5);
      const starSize = GameConfig.BLOCK_SIZE / 4;
      
      // 星形を描画
      const starPoints = 5;
      const starInnerRadius = starSize / 2;
      const starOuterRadius = starSize;
      
      starGraphics.beginPath();
      for (let i = 0; i < starPoints * 2; i++) {
        const radius = i % 2 === 0 ? starOuterRadius : starInnerRadius;
        const angle = (Math.PI * 2 * i) / (starPoints * 2) - Math.PI / 2;
        const x = blockX + radius * Math.cos(angle);
        const y = blockY + radius * Math.sin(angle);
        
        if (i === 0) {
          starGraphics.moveTo(x, y);
        } else {
          starGraphics.lineTo(x, y);
        }
      }
      starGraphics.closePath();
      starGraphics.fillPath();
      
      // カウンター値のテキスト表示
      const prefix = block.type === BlockType.ICE_COUNTER_PLUS ? '+' : '-';
      const counterText = this.add.text(
        blockX, 
        blockY, 
        `${prefix}${block.counterValue}`, 
        { 
          fontSize: '16px', 
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 2
        }
      ).setOrigin(0.5);
      
      // テキストをスプライトに関連付ける（後で一緒に削除するため）
      blockSprite.setData('counterText', counterText);
      blockSprite.setData('starGraphics', starGraphics);
    } else if (block.type === BlockType.ROCK) {
      // 岩ブロックはテクスチャを使用
      blockSprite.destroy(); // 円形スプライトを破棄
      
      // 事前生成したテクスチャを使用
      const rockSprite = this.add.sprite(blockX, blockY, 'rockBlockTexture');
      
      // スプライトを対話可能に設定
      rockSprite.setInteractive({ useHandCursor: true });
      
      // ホバーエフェクトを追加
      this.addBlockHoverEffect(rockSprite as unknown as Phaser.GameObjects.Sprite, block);
      
      // スプライト配列に保存（型変換が必要）
      this.blockSprites[y][x] = rockSprite as unknown as Phaser.GameObjects.Sprite;
      
      // ブロックオブジェクトにスプライト参照を追加
      this.blocks[y][x].sprite = rockSprite as unknown as Phaser.GameObjects.Sprite;
      
      // クリックイベント
      rockSprite.on('pointerdown', () => {
        if (!this.isProcessing) {
          this.onBlockClick(x, y);
        }
      });
      
      return rockSprite as unknown as Phaser.GameObjects.Sprite;
    } else if (block.type === BlockType.STEEL) {
      // 鋼鉄ブロックは特別な見た目にする
      blockSprite.destroy(); // 円形スプライトを破棄
      
      // 鋼鉄ブロック用のグラフィックスを作成
      const steelGraphics = this.add.graphics();
      
      // 鋼鉄ブロックの背景
      steelGraphics.fillStyle(0xC0C0C0, 1); // シルバー
      steelGraphics.fillRect(
        blockX - GameConfig.BLOCK_SIZE / 2 + 2, 
        blockY - GameConfig.BLOCK_SIZE / 2 + 2, 
        GameConfig.BLOCK_SIZE - 4, 
        GameConfig.BLOCK_SIZE - 4
      );
      
      // 鋼鉄の質感を表現する線
      steelGraphics.lineStyle(1, 0x808080, 0.8);
      
      // 横線
      for (let i = 1; i < 4; i++) {
        const lineY = blockY - GameConfig.BLOCK_SIZE / 2 + 2 + i * (GameConfig.BLOCK_SIZE - 4) / 4;
        steelGraphics.moveTo(blockX - GameConfig.BLOCK_SIZE / 2 + 2, lineY);
        steelGraphics.lineTo(blockX + GameConfig.BLOCK_SIZE / 2 - 2, lineY);
      }
      
      // 縦線
      for (let i = 1; i < 4; i++) {
        const lineX = blockX - GameConfig.BLOCK_SIZE / 2 + 2 + i * (GameConfig.BLOCK_SIZE - 4) / 4;
        steelGraphics.moveTo(lineX, blockY - GameConfig.BLOCK_SIZE / 2 + 2);
        steelGraphics.lineTo(lineX, blockY + GameConfig.BLOCK_SIZE / 2 - 2);
      }
      
      steelGraphics.strokePath();
      
      // 輪郭
      steelGraphics.lineStyle(2, 0x404040, 1);
      steelGraphics.strokeRect(
        blockX - GameConfig.BLOCK_SIZE / 2 + 2, 
        blockY - GameConfig.BLOCK_SIZE / 2 + 2, 
        GameConfig.BLOCK_SIZE - 4, 
        GameConfig.BLOCK_SIZE - 4
      );
      
      // スプライトとして扱うためのダミースプライト
      const steelSprite = this.add.sprite(blockX, blockY, '__WHITE');
      steelSprite.setScale(0.01); // ほぼ見えないサイズに
      steelSprite.setAlpha(0.01); // ほぼ透明に
      
      // グラフィックスをスプライトに関連付ける
      steelSprite.setData('steelGraphics', steelGraphics);
      
      // スプライト配列に保存
      this.blockSprites[y][x] = steelSprite;
      
      // ブロックオブジェクトにスプライト参照を追加
      this.blocks[y][x].sprite = steelSprite;
      
      // クリックイベント
      steelSprite.setInteractive({ useHandCursor: true });
      
      // ホバーエフェクトを追加
      this.addBlockHoverEffect(steelSprite, block);
      
      steelSprite.on('pointerdown', () => {
        if (!this.isProcessing) {
          this.onBlockClick(x, y);
        }
      });
      
      return steelSprite;
    } else if (block.type === BlockType.COUNTER_PLUS || block.type === BlockType.COUNTER_MINUS) {
      // カウンターブロックは輪郭と数字を表示
      const borderColor = block.type === BlockType.COUNTER_PLUS ? 0xFFD700 : 0xFF4500; // 金色または赤橙色
      blockSprite.setStrokeStyle(3, borderColor);
      
      // カウンター値のテキスト表示
      const prefix = block.type === BlockType.COUNTER_PLUS ? '+' : '-';
      const counterText = this.add.text(
        blockX, 
        blockY, 
        `${prefix}${block.counterValue}`, 
        { 
          fontSize: '16px', 
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 2
        }
      ).setOrigin(0.5);
      
      // テキストをスプライトに関連付ける（後で一緒に削除するため）
      blockSprite.setData('counterText', counterText);
    }
    
    // スプライトを対話可能に設定
    blockSprite.setInteractive({ useHandCursor: true });
    
    // ホバーエフェクトを追加
    this.addBlockHoverEffect(blockSprite, block);
    
    // スプライト配列に保存（型変換が必要）
    this.blockSprites[y][x] = blockSprite as unknown as Phaser.GameObjects.Sprite;
    
    // ブロックオブジェクトにスプライト参照を追加
    this.blocks[y][x].sprite = blockSprite as unknown as Phaser.GameObjects.Sprite;
    
    // クリックイベント
    blockSprite.on('pointerdown', () => {
      if (!this.isProcessing) {
        this.onBlockClick(x, y);
      }
    });
    
    return blockSprite as unknown as Phaser.GameObjects.Sprite;
  }
  
  /**
   * ブロックにホバーエフェクトを追加
   */
  private addBlockHoverEffect(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc, block: Block): void {
    // 元のスケールを保存
    const originalScale = sprite.scale;
    const originalAlpha = sprite.alpha;
    
    // ホバー時のエフェクト
    sprite.on('pointerover', () => {
      if (this.isProcessing) return;
      
      // 色弱対応：スケールと透明度の変化で視覚的フィードバック
      this.tweens.add({
        targets: sprite,
        scale: originalScale * 1.1,
        alpha: 0.8,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
      
      // 脈動エフェクト（妨害ブロック以外）
      if (block.type === BlockType.NORMAL) {
        this.tweens.add({
          targets: sprite,
          scaleX: originalScale * 1.05,
          scaleY: originalScale * 1.05,
          duration: GameConfig.ANIMATION.PULSE_DURATION,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
    
    // ホバー終了時のエフェクト
    sprite.on('pointerout', () => {
      // 全てのTweenを停止
      this.tweens.killTweensOf(sprite);
      
      // 元の状態に戻す
      this.tweens.add({
        targets: sprite,
        scale: originalScale,
        alpha: originalAlpha,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });
  }
  

  
  /**
   * ボタンにホバーエフェクトを追加
   */
  private addButtonHoverEffect(button: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text): void {
    const originalScale = button.scale;
    const originalTextScale = text.scale;
    
    button.on('pointerover', () => {
      // ボタンとテキストを少し拡大
      this.tweens.add({
        targets: [button, text],
        scale: originalScale * 1.05,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });
    
    button.on('pointerout', () => {
      // 元のサイズに戻す
      this.tweens.add({
        targets: [button, text],
        scale: originalScale,
        duration: GameConfig.ANIMATION.HOVER_DURATION,
        ease: 'Power2'
      });
    });
    
    button.on('pointerdown', () => {
      // クリック時の押し込みエフェクト
      this.tweens.add({
        targets: [button, text],
        scale: originalScale * 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    });
  }
  
  /**
   * ブロッククリック時の処理
   */
  private onBlockClick(x: number, y: number): void {
    if (this.isProcessing) return;
    
    // アイテムモード時の処理
    if (this.isItemMode && this.selectedItemSlot) {
      this.handleItemModeClick(x, y);
      return;
    }
    
    // 通常のブロック消去処理
    this.handleNormalBlockClick(x, y);
  }

  /**
   * アイテムモード時のクリック処理
   */
  private handleItemModeClick(x: number, y: number): void {
    const equippedItems = this.itemManager.getEquippedItems();
    const item = this.selectedItemSlot === 'special' ? equippedItems.specialSlot : equippedItems.normalSlot;
    
    if (!item) {
      this.exitItemMode();
      return;
    }
    
    let result;
    
    switch (item.effectType) {
      case 'swap':
        // スワップは2つのブロックが必要（簡略化のため、隣接ブロックと入れ替え）
        const adjacentPos = this.findAdjacentBlock(x, y);
        if (adjacentPos) {
          result = ItemEffectManager.applySwap(this.blocks, {x, y}, adjacentPos);
        }
        break;
        
      case 'changeOne':
        // 色変更（とりあえず赤色に変更）
        result = ItemEffectManager.applyChangeOne(this.blocks, {x, y}, '#FF0000');
        break;
        
      case 'miniBomb':
        result = ItemEffectManager.applyMiniBomb(this.blocks, {x, y});
        break;
        
      case 'changeArea':
        // エリア色変更（とりあえず青色に変更）
        result = ItemEffectManager.applyChangeArea(this.blocks, {x, y}, '#0000FF');
        break;
        
      case 'meltingAgent':
        result = ItemEffectManager.applyMeltingAgent(this.blocks, {x, y});
        break;
        
      case 'counterReset':
        result = ItemEffectManager.applyCounterReset(this.blocks, {x, y});
        break;
        
      case 'adPlus':
        result = ItemEffectManager.applyAdPlus(this.blocks, {x, y});
        break;
        
      case 'bomb':
        result = ItemEffectManager.applyBomb(this.blocks, {x, y});
        break;
        
      case 'hammer':
        result = ItemEffectManager.applyHammer(this.blocks, {x, y});
        break;
        
      case 'steelHammer':
        result = ItemEffectManager.applySteelHammer(this.blocks, {x, y});
        break;
        
      case 'specialHammer':
        result = ItemEffectManager.applySpecialHammer(this.blocks, {x, y});
        break;
        
      default:
        console.log(`アイテム ${item.name} の効果は未実装です`);
        this.exitItemMode();
        return;
    }
    
    if (result && result.success && result.newBlocks) {
      this.isProcessing = true;
      
      // アイテムを使用済みに設定
      this.itemManager.useItem(this.selectedItemSlot!);
      
      // ブロック配列を更新
      this.blocks = result.newBlocks;
      
      // 視覚表現を更新
      this.updateBlockSprites();
      
      // アイテムボタンの表示を更新
      this.updateItemButtons();
      
      // アイテムモードを終了
      this.exitItemMode();
      
      this.isProcessing = false;
    } else {
      // 失敗時はメッセージを表示
      console.log(result?.message || 'アイテムの使用に失敗しました');
    }
  }

  /**
   * 隣接するブロックを見つける（スワップ用の簡易実装）
   */
  private findAdjacentBlock(x: number, y: number): {x: number, y: number} | null {
    const directions = [
      {x: 0, y: -1}, // 上
      {x: 1, y: 0},  // 右
      {x: 0, y: 1},  // 下
      {x: -1, y: 0}  // 左
    ];
    
    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;
      
      if (newX >= 0 && newX < GameConfig.BOARD_WIDTH && 
          newY >= 0 && newY < GameConfig.BOARD_HEIGHT &&
          this.blocks[newY][newX]) {
        return {x: newX, y: newY};
      }
    }
    
    return null;
  }

  /**
   * 通常のブロッククリック処理
   */
  /**
   * 通常のブロッククリック処理
   */
  private handleNormalBlockClick(x: number, y: number): void {
    // クリックされたブロックが氷結ブロックまたはカウンターブロックかチェック
    const clickedBlock = this.blocks[y][x];
    if (!clickedBlock) return;
    
    if (clickedBlock.type === BlockType.ICE_LV1 || 
        clickedBlock.type === BlockType.ICE_LV2 || 
        clickedBlock.type === BlockType.COUNTER_PLUS || 
        clickedBlock.type === BlockType.COUNTER_MINUS ||
        clickedBlock.type === BlockType.ICE_COUNTER_PLUS ||
        clickedBlock.type === BlockType.ICE_COUNTER_MINUS ||
        clickedBlock.type === BlockType.ROCK) {
      // 妨害ブロックは直接クリックできない
      console.log('妨害ブロックは直接クリックできません');
      return;
    }
    
    this.isProcessing = true;
    
    // デバッグヘルパーにクリック位置を設定
    this.debugHelper.setLastClickPosition({x, y});
    
    // デバッグ用：クリック前の状態を記録
    const beforeBlocks = JSON.parse(JSON.stringify(this.blocks));
    
    // 通常ブロックの処理
    // 隣接する同色ブロックを検索
    const connectedBlocks = this.blockLogic.findConnectedBlocks(this.blocks, x, y);
    
    // 2つ以上のブロックが隣接している場合のみ消去（自分自身を含めて2つ以上）
    if (connectedBlocks.length >= 2) {
      // 条件を満たさないカウンターブロックを特定
      const nonRemovableCounterBlocks = connectedBlocks.filter(block => {
        if (block.type === BlockType.COUNTER_PLUS || 
            block.type === BlockType.COUNTER_MINUS ||
            block.type === BlockType.ICE_COUNTER_PLUS ||
            block.type === BlockType.ICE_COUNTER_MINUS) {
          return !this.blockLogic.checkCounterCondition(this.blocks, block);
        }
        return false;
      });
      
      // 条件を満たさないカウンターブロックを点滅させる
      if (nonRemovableCounterBlocks.length > 0) {
        this.showCounterConditionNotMetEffect(nonRemovableCounterBlocks);
      }
      
      // スコア計算（消去可能なブロックの数で計算）
      const removableCount = connectedBlocks.length - nonRemovableCounterBlocks.length;
      let score = this.blockLogic.calculateScore(removableCount);
      
      // スコアブースターが有効な場合は1.5倍
      if (this.scoreBoosterActive) {
        score = Math.round(score * 1.5);
      }
      
      this.score += score;
      
      // スコア獲得エフェクトを表示
      this.showScoreGainEffect(score, x, y);
      
      // スコア表示を更新
      this.updateScoreDisplay();
      
      // デバッグ用：氷結ブロック更新前の状態を記録
      const beforeIceUpdate = JSON.parse(JSON.stringify(this.blocks));
      
      // 氷結ブロックの状態更新（レベルダウン）
      this.blocks = this.blockLogic.updateIceBlocks(this.blocks, connectedBlocks);
      
      // デバッグ用：氷結ブロック更新後の状態を記録
      BlockAsciiRenderer.logBlocksComparison(beforeIceUpdate, this.blocks, `氷結ブロック更新 (${String.fromCharCode(97 + x)}${y})`, {x, y});
      
      // 消去対象のブロックを特定
      const blocksToRemove = [];
      for (const block of connectedBlocks) {
        // 条件を満たさないカウンターブロックは消去しない
        if (nonRemovableCounterBlocks.includes(block)) {
          continue;
        }
        
        // 現在の状態で氷結ブロックかどうかをチェック
        const currentBlock = this.blocks[block.y][block.x];
        if (!currentBlock) continue;
        
        // 氷結ブロックは消去しない（レベルダウンのみ）
        if (currentBlock.type === BlockType.ICE_LV1 ||
            currentBlock.type === BlockType.ICE_LV2 ||
            currentBlock.type === BlockType.ICE_COUNTER_PLUS ||
            currentBlock.type === BlockType.ICE_COUNTER_MINUS) {
          continue;
        }
        
        // 元々通常ブロックだったもの、または条件を満たすカウンターブロックを消去対象とする
        if (beforeIceUpdate[block.y][block.x].type === BlockType.NORMAL ||
            beforeIceUpdate[block.y][block.x].type === BlockType.COUNTER_PLUS ||
            beforeIceUpdate[block.y][block.x].type === BlockType.COUNTER_MINUS) {
          blocksToRemove.push(block);
        }
      }
      
      // デバッグ用：通常ブロック消去前の状態を記録
      const beforeRemove = JSON.parse(JSON.stringify(this.blocks));
      
      // ブロックを消去
      this.removeBlocks(blocksToRemove);
      
      // デバッグ用：通常ブロック消去後の状態を記録
      this.time.delayedCall(100, () => {
        BlockAsciiRenderer.logBlocksComparison(beforeRemove, this.blocks, `ブロック消去 (${String.fromCharCode(97 + x)}${y})`, {x, y});
      });
      
      // 少し待ってから重力を適用（アニメーション完了を待つ）
      this.time.delayedCall(GameConfig.ANIMATION.PROCESSING_DELAY, () => {
        // デバッグ用：重力適用前の状態を記録
        const beforeGravity = JSON.parse(JSON.stringify(this.blocks));
        
        // 重力を適用（ブロックを落下させる）
        this.applyGravity();
        
        // デバッグ用：重力適用後の状態を比較
        BlockAsciiRenderer.logBlocksComparison(beforeGravity, this.blocks, `重力適用 (${String.fromCharCode(97 + x)}${y})`, {x, y});
        
        // デバッグ用：全体の処理前後を比較
        BlockAsciiRenderer.logBlocksComparison(beforeBlocks, this.blocks, `全体処理 (${String.fromCharCode(97 + x)}${y})`, {x, y});
        
        // 全消し判定
        if (this.blockLogic.isAllCleared(this.blocks)) {
          // 全消しボーナス（1.5倍）
          let bonusScore = Math.floor(this.score * 0.5); // 0.5倍分がボーナス
          
          // スコアブースターが有効な場合はボーナス分にも適用
          if (this.scoreBoosterActive) {
            bonusScore = Math.round(bonusScore * 1.5);
          }
          
          this.score += bonusScore;
          this.updateScoreDisplay();
          
          // 全消し演出
          this.showAllClearedEffect();
        }
        
        // 行き詰まり判定
        if (!this.blockLogic.hasRemovableBlocks(this.blocks)) {
          // 行き詰まり演出
          this.showNoMovesEffect();
        }
        
        // 目標スコア達成判定
        if (this.score >= this.targetScore) {
          // クリアボタンを表示
          this.showClearButton();
        }
        
        this.isProcessing = false;
      });
    } else {
      this.isProcessing = false;
    }
  }
  
  /**
   * カウンターブロックの条件を満たしていない場合の演出
   * @param counterBlocks 条件を満たさないカウンターブロック
   */
  private showCounterConditionNotMetEffect(counterBlocks: Block[]): void {
    // 各カウンターブロックを点滅させる
    counterBlocks.forEach(block => {
      if (block.sprite) {
        this.tweens.add({
          targets: block.sprite,
          alpha: 0.3,
          yoyo: true,
          repeat: 2,
          duration: 150
        });
      }
    });
  }
  
  /**
   * ブロックを消去する
   */
  private removeBlocks(blocks: Block[]): void {
    blocks.forEach(block => {
      // ブロックの論理状態を更新
      if (block && block.y >= 0 && block.y < this.blocks.length && 
          block.x >= 0 && block.x < this.blocks[block.y].length) {
        this.blocks[block.y][block.x] = null;
      }
      
      // スプライトのアニメーション
      if (block && block.sprite) {
        const sprite = block.sprite;
        // スプライト参照を先にnullに設定（メモリリーク防止）
        block.sprite = null;
        
        // スプライト配列からも参照を削除
        if (block.y >= 0 && block.y < this.blockSprites.length && 
            block.x >= 0 && block.x < this.blockSprites[block.y].length) {
          this.blockSprites[block.y][block.x] = null;
        }
        
        // カウンターテキストがある場合は削除
        const counterText = sprite.getData('counterText') as Phaser.GameObjects.Text;
        if (counterText) {
          counterText.destroy();
        }
        
        // 星グラフィックスがある場合は削除
        const starGraphics = sprite.getData('starGraphics') as Phaser.GameObjects.Graphics;
        if (starGraphics) {
          starGraphics.destroy();
        }
        
        this.tweens.add({
          targets: sprite,
          alpha: 0,
          scale: 0.5,
          duration: GameConfig.ANIMATION.BLOCK_REMOVE_DURATION,
          onComplete: () => {
            // スプライトを破棄
            sprite.destroy();
          }
        });
      }
    });
  }
  
  /**
   * 重力を適用し、ブロックを落下させる
   */
  private applyGravity(): void {
    // 論理状態の更新（重力適用）
    let updatedBlocks = this.blockLogic.applyGravity(this.blocks);
    
    // 空の列を左にスライド
    updatedBlocks = this.blockLogic.applyHorizontalSlide(updatedBlocks);
    
    this.blocks = updatedBlocks;
    
    // デバッグヘルパーにブロック配列を更新
    this.debugHelper.setBlocks(this.blocks);
    
    // 視覚表現を完全に再構築
    this.updateBlockSprites();
  }
  
  /**
   * ブロックスプライトを更新する（全て再作成）
   */
  private updateBlockSprites(): void {
    // 既存のスプライトを全て破棄
    for (let y = 0; y < GameConfig.BOARD_HEIGHT; y++) {
      for (let x = 0; x < GameConfig.BOARD_WIDTH; x++) {
        if (this.blockSprites[y][x]) {
          // カウンターテキストがある場合は削除
          const counterText = this.blockSprites[y][x].getData('counterText') as Phaser.GameObjects.Text;
          if (counterText) {
            counterText.destroy();
          }
          
          // 星グラフィックスがある場合は削除
          const starGraphics = this.blockSprites[y][x].getData('starGraphics') as Phaser.GameObjects.Graphics;
          if (starGraphics) {
            starGraphics.destroy();
          }
          
          this.blockSprites[y][x].destroy();
          this.blockSprites[y][x] = null;
        }
      }
    }
    
    // 新しいスプライトを作成
    for (let y = 0; y < this.blocks.length; y++) {
      for (let x = 0; x < this.blocks[y].length; x++) {
        const block = this.blocks[y][x];
        if (block) {
          this.createBlockSprite(x, y, block);
        }
      }
    }
  }
  
  /**
   * スコア表示を更新
   */
  private updateScoreDisplay(): void {
    // ヘッダーテキストを更新
    const headerText = this.children.getByName('headerText') as Phaser.GameObjects.Text;
    if (headerText) {
      headerText.setText(`Stage ${this.currentStage}  Score: ${this.score}`);
    }
    
    // 目標スコア達成チェック
    if (this.score >= this.targetScore) {
      this.showClearButton();
    }
  }
  
  /**
   * 全消し演出を表示
   */
  private showAllClearedEffect(): void {
    const { width, height } = this.cameras.main;
    
    // 全消しテキスト
    const allClearedText = this.add.text(width / 2, height / 2, '全消しボーナス！', {
      fontSize: '32px',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);
    
    // テキストアニメーション
    this.tweens.add({
      targets: allClearedText,
      alpha: 1,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        allClearedText.destroy();
      }
    });
  }
  
  /**
   * 行き詰まり演出を表示
   */
  private showNoMovesEffect(): void {
    const { width, height } = this.cameras.main;
    
    // 行き詰まりテキスト
    const noMovesText = this.add.text(width / 2, height / 2, '消去可能なブロックがありません', {
      fontSize: '20px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);
    
    // テキストアニメーション
    this.tweens.add({
      targets: noMovesText,
      alpha: 1,
      duration: 300,
      hold: 2000,
      onComplete: () => {
        noMovesText.destroy();
      }
    });
  }
  
  /**
   * クリアボタンを表示
   */
  private showClearButton(): void {
    const { width, height } = this.cameras.main;
    
    // リタイアボタンをクリアボタンに変更
    const retireButton = this.children.getByName('retireButton') as Phaser.GameObjects.Rectangle;
    const retireText = this.children.getByName('retireText') as Phaser.GameObjects.Text;
    
    if (retireButton && retireText) {
      retireButton.setFillStyle(0x00AA00);
      retireText.setText('クリア');
      
      // クリックイベントを更新
      retireButton.off('pointerdown');
      retireButton.on('pointerdown', () => {
        // ステージクリア処理
        this.onStageClear();
      });
    }
  }
  
  /**
   * ステージクリア時の処理
   */
  private onStageClear(): void {
    // StageManager でステージクリア処理
    this.stageManager.clearStage(this.currentStage, this.score);
    
    // ItemManager でアイテム消費処理
    this.itemManager.onStageComplete();
    
    // スコアブースターをリセット
    this.scoreBoosterActive = false;
    
    // 最終ステージかどうかを判定
    const isGameComplete = this.stageManager.isCurrentStageFinal();
    
    // リザルト画面に遷移
    this.scene.start('ResultScene', {
      stage: this.currentStage,
      score: this.score,
      earnedGold: this.score, // スコア = ゴールド
      isGameComplete: isGameComplete,
      isStageCleared: true
    });
  }

  /**
   * リタイア時の処理
   */
  private onRetire(): void {
    // ItemManager でリトライ処理（アイテム消費なし）
    this.itemManager.onStageRetry();
    
    // スコアブースターをリセット
    this.scoreBoosterActive = false;
    
    // リザルト画面に遷移（失敗として）
    this.scene.start('ResultScene', {
      stage: this.currentStage,
      score: this.score,
      earnedGold: 0, // リタイア時はゴールド獲得なし
      isGameComplete: false,
      isStageCleared: false // ステージ失敗
    });
  }

  /**
   * リタイア時の処理
   */
  /**
   * アイテムボタンを作成
   */
  private createItemButtons(buttonY: number): void {
    const equippedItems = this.itemManager.getEquippedItems();
    
    // 特殊枠アイテムボタン
    if (equippedItems.specialSlot) {
      this.createItemButton(equippedItems.specialSlot.name, 'special', 80, buttonY);
    }
    
    // 通常枠アイテムボタン
    if (equippedItems.normalSlot) {
      this.createItemButton(equippedItems.normalSlot.name, 'normal', 220, buttonY);
    }
  }

  /**
   * 個別のアイテムボタンを作成
   */
  private createItemButton(itemName: string, slot: 'special' | 'normal', x: number, y: number): void {
    const isUsed = this.itemManager.isItemUsed(slot);
    const buttonColor = isUsed ? 0x666666 : 0x0066CC;
    const textColor = isUsed ? '#AAAAAA' : '#FFFFFF';
    
    const button = this.add.rectangle(x, y, 120, 40, buttonColor)
      .setInteractive({ useHandCursor: !isUsed })
      .setName(`itemButton_${slot}`);
    
    const text = this.add.text(x, y, itemName, {
      fontSize: '14px',
      color: textColor
    }).setOrigin(0.5).setName(`itemText_${slot}`);
    
    if (!isUsed) {
      button.on('pointerdown', () => {
        this.onItemButtonClick(slot);
      });
      
      // ホバーエフェクト
      this.addButtonHoverEffect(button, text);
    }
  }

  /**
   * アイテムボタンクリック時の処理
   */
  private onItemButtonClick(slot: 'special' | 'normal'): void {
    const equippedItems = this.itemManager.getEquippedItems();
    const item = slot === 'special' ? equippedItems.specialSlot : equippedItems.normalSlot;
    
    if (!item) return;
    
    // アイテムの種類に応じて処理を分岐
    switch (item.effectType) {
      case 'shuffle':
        this.useShuffleItem(slot);
        break;
      case 'scoreBooster':
        this.useScoreBoosterItem(slot);
        break;
      case 'swap':
      case 'changeOne':
      case 'miniBomb':
      case 'changeArea':
      case 'meltingAgent':
      case 'counterReset':
      case 'adPlus':
      case 'bomb':
      case 'hammer':
      case 'steelHammer':
      case 'specialHammer':
        // 対象選択が必要なアイテム
        this.enterItemMode(slot);
        break;
      default:
        // 未実装のアイテム
        console.log(`アイテム ${item.name} は未実装です`);
        break;
    }
  }

  /**
   * スコアブースターアイテムを使用
   */
  private useScoreBoosterItem(slot: 'special' | 'normal'): void {
    if (this.isProcessing) return;
    
    const result = ItemEffectManager.applyScoreBooster();
    if (result.success) {
      // スコアブースターフラグを設定
      this.scoreBoosterActive = true;
      
      // アイテムを使用済みに設定
      this.itemManager.useItem(slot);
      
      // アイテムボタンの表示を更新
      this.updateItemButtons();
      
      // メッセージ表示
      console.log(result.message);
    }
  }

  /**
   * シャッフルアイテムを使用
   */
  private useShuffleItem(slot: 'special' | 'normal'): void {
    if (this.isProcessing) return;
    
    const result = ItemEffectManager.applyShuffle(this.blocks);
    if (result.success && result.newBlocks) {
      this.isProcessing = true;
      
      // アイテムを使用済みに設定
      this.itemManager.useItem(slot);
      
      // ブロック配列を更新
      this.blocks = result.newBlocks;
      
      // 視覚表現を更新
      this.updateBlockSprites();
      
      // アイテムボタンの表示を更新
      this.updateItemButtons();
      
      this.isProcessing = false;
    }
  }

  /**
   * アイテムモードに入る（対象選択が必要なアイテム用）
   */
  private enterItemMode(slot: 'special' | 'normal'): void {
    this.isItemMode = true;
    this.selectedItemSlot = slot;
    
    // UI表示を変更（アイテム使用中であることを示す）
    this.showItemModeUI();
  }

  /**
   * アイテムモードのUI表示
   */
  private showItemModeUI(): void {
    const { width, height } = this.cameras.main;
    
    // アイテム使用中のメッセージを表示
    const equippedItems = this.itemManager.getEquippedItems();
    const item = this.selectedItemSlot === 'special' ? equippedItems.specialSlot : equippedItems.normalSlot;
    
    if (item) {
      const message = this.add.text(width / 2, 100, `${item.name}を使用中 - 対象を選択してください`, {
        fontSize: '16px',
        color: '#FFFF00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setName('itemModeMessage');
      
      // キャンセルボタン
      const cancelButton = this.add.rectangle(width - 50, 100, 80, 30, 0xAA2222)
        .setInteractive({ useHandCursor: true })
        .setName('itemCancelButton');
      
      const cancelText = this.add.text(width - 50, 100, 'キャンセル', {
        fontSize: '12px',
        color: '#FFFFFF'
      }).setOrigin(0.5).setName('itemCancelText');
      
      cancelButton.on('pointerdown', () => {
        this.exitItemMode();
      });
    }
  }

  /**
   * アイテムモードを終了
   */
  private exitItemMode(): void {
    this.isItemMode = false;
    this.selectedItemSlot = null;
    
    // UI要素を削除
    const message = this.children.getByName('itemModeMessage');
    const cancelButton = this.children.getByName('itemCancelButton');
    const cancelText = this.children.getByName('itemCancelText');
    
    if (message) message.destroy();
    if (cancelButton) cancelButton.destroy();
    if (cancelText) cancelText.destroy();
  }

  /**
   * アイテムボタンの表示を更新
   */
  private updateItemButtons(): void {
    // 既存のアイテムボタンを削除
    ['special', 'normal'].forEach(slot => {
      const button = this.children.getByName(`itemButton_${slot}`);
      const text = this.children.getByName(`itemText_${slot}`);
      if (button) button.destroy();
      if (text) text.destroy();
    });
    
    // アイテムボタンを再作成
    const { height } = this.cameras.main;
    const buttonHeight = 60;
    const buttonCenterY = height - buttonHeight / 2;
    this.createItemButtons(buttonCenterY);
  }
  
  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア（ステージ情報とスコア + 下部余白）
    const titleHeight = 80; // 60px + 20px（旧タイトル下空白エリア）
    const titleCenterY = 40; // 中心位置を調整
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // メインコンテンツエリア（ゲーム盤面）
    const boardWidth = GameConfig.BOARD_WIDTH * GameConfig.BLOCK_SIZE;
    const boardHeight = GameConfig.BOARD_HEIGHT * GameConfig.BLOCK_SIZE;
    const boardCenterX = width / 2;
    
    // タイトルエリアの直下にメインコンテンツエリアを配置
    const titleBottomY = titleCenterY + titleHeight / 2;
    const adjustedBoardCenterY = titleBottomY + boardHeight / 2;
    
    this.debugHelper.addAreaBorder(
      boardCenterX,
      adjustedBoardCenterY,
      boardWidth,
      boardHeight,
      0xFFFF00,
      'メインコンテンツエリア'
    );
    
    // 左右の空白エリアは2pxずつしかないため、デバッグ表示から除外
    // const sideSpaceWidth = (width - boardWidth) / 2; // 2px
    
    // ボタン/アクションエリア（アイテムボタン）
    const buttonHeight = 60;
    const buttonCenterY = height - buttonHeight / 2;
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, width, buttonHeight, 0xFF00FF, 'ボタン/アクションエリア');
  }
  
  /**
   * スコア獲得エフェクトを表示
   */
  private showScoreGainEffect(score: number, blockX: number, blockY: number): void {
    const screenX = this.boardX + blockX * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    const screenY = this.boardY + blockY * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    
    // スコアテキストを作成
    const scoreText = this.add.text(screenX, screenY, `+${score}`, {
      fontSize: score >= 100 ? '24px' : '18px',
      color: score >= 100 ? '#FFD700' : '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(500);
    
    // 上昇アニメーション（最初の0.8秒は完全に表示）
    this.tweens.add({
      targets: scoreText,
      y: screenY - 30,
      scale: score >= 100 ? 1.5 : 1.2,
      duration: GameConfig.ANIMATION.SCORE_ANIMATION_DURATION * 0.7,
      ease: 'Power2',
      onComplete: () => {
        // フェードアウトアニメーション
        this.tweens.add({
          targets: scoreText,
          y: screenY - 50,
          alpha: 0,
          duration: GameConfig.ANIMATION.SCORE_ANIMATION_DURATION * 0.3,
          ease: 'Power2',
          onComplete: () => {
            scoreText.destroy();
          }
        });
      }
    });
  }
}
