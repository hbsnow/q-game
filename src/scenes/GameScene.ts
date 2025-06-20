import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { AdvancedDebugHelper } from '../utils/AdvancedDebugHelper';
import { ErrorHandler } from '../utils/ErrorHandler';
import { LoadingManager } from '../utils/LoadingManager';
import { AudioManager } from '../utils/AudioManager';
import { AssetManager } from '../assets/AssetManager';
import { BackgroundManager } from '../utils/BackgroundManager';
import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';
import { GameStateManager } from '../utils/GameStateManager';
import { BlockFactory } from '../utils/BlockFactory';
import { BlockAsciiRenderer } from '../utils/BlockAsciiRenderer';
import { StageManager } from '../managers/StageManager';
import { StageConfig } from '../types/StageConfig';
import { ItemManager } from '../managers/ItemManager';
import { ItemEffectManager } from '../managers/ItemEffectManager';
import { ItemEffectVisualizer } from '../utils/ItemEffectVisualizer';
import { ITEM_DATA } from '../data/ItemData';
import { ParticleManager } from '../utils/ParticleManager';
import { SimpleOceanButton } from '../components/SimpleOceanButton';
import { SoundManager } from '../utils/SoundManager';
import { ErrorManager, ErrorType } from '../utils/ErrorManager';
import { TooltipManager } from '../utils/TooltipManager';
import { AnimationManager, TransitionType, AppearType } from '../utils/AnimationManager';
import { Logger } from '../utils/Logger';

/**
 * ゲーム画面
 */
export class GameScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private backgroundManager!: BackgroundManager;
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
  private itemEffectVisualizer!: ItemEffectVisualizer;
  private particleManager!: ParticleManager;
  private soundManager!: SoundManager;
  private errorManager!: ErrorManager;
  private tooltipManager!: TooltipManager;
  private animationManager!: AnimationManager;
  private advancedDebugHelper!: AdvancedDebugHelper;
  private errorHandler!: ErrorHandler;
  private loadingManager!: LoadingManager;
  private audioManager!: AudioManager;
  private assetManager!: AssetManager;
  private currentStageConfig: StageConfig | null = null;
  
  // アイテム使用状態
  private isItemMode: boolean = false;
  private selectedItemSlot: 'special' | 'normal' | null = null;
  private scoreBoosterActive: boolean = false; // スコアブースターが有効かどうか
  
  // スワップ用の状態
  private swapFirstBlock: {x: number, y: number} | null = null;

  constructor() {
    super({ key: 'GameScene' });
    this.gameStateManager = GameStateManager.getInstance();
    this.blockLogic = new BlockLogic();
    this.stageManager = StageManager.getInstance();
    this.itemManager = ItemManager.getInstance();
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
    Logger.debug('GameScene init data:', data);
    if (data.equippedItems) {
      Logger.debug('装備アイテムデータ:', data.equippedItems);
      if (data.equippedItems.specialSlot) {
        Logger.debug('特殊枠アイテム装備:', data.equippedItems.specialSlot);
        // アイテムを所持品に追加してから装備
        this.itemManager.addItem(data.equippedItems.specialSlot.id, 1);
        Logger.debug('特殊枠アイテム追加後の所持数:', this.itemManager.getItemCount(data.equippedItems.specialSlot.id));
        const success1 = this.itemManager.equipItem(data.equippedItems.specialSlot, 'special');
        Logger.debug('特殊枠装備結果:', success1);
      }
      if (data.equippedItems.normalSlot) {
        Logger.debug('通常枠アイテム装備:', data.equippedItems.normalSlot);
        // アイテムを所持品に追加してから装備
        this.itemManager.addItem(data.equippedItems.normalSlot.id, 1);
        Logger.debug('通常枠アイテム追加後の所持数:', this.itemManager.getItemCount(data.equippedItems.normalSlot.id));
        const success2 = this.itemManager.equipItem(data.equippedItems.normalSlot, 'normal');
        Logger.debug('通常枠装備結果:', success2);
      }
    } else {
      Logger.debug('装備アイテムデータがありません');
    }
    
    // 装備確認
    const equippedCheck = this.itemManager.getEquippedItems();
    Logger.debug('装備確認:', equippedCheck);
    
    this.score = 0;
    this.isItemMode = false;
    this.selectedItemSlot = null;
    this.scoreBoosterActive = false;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // 背景マネージャーを初期化
    this.backgroundManager = new BackgroundManager(this);
    
    // 美しい海の背景を作成（ゲーム中は控えめに）
    this.backgroundManager.createOceanBackground('light');
    
    // 高度なデバッグヘルパーを初期化
    this.advancedDebugHelper = new AdvancedDebugHelper(this);
    
    // エラーハンドラーを初期化
    this.errorHandler = new ErrorHandler(this);
    
    // ローディングマネージャーを初期化
    this.loadingManager = new LoadingManager(this);
    
    // オーディオマネージャーを初期化
    this.audioManager = new AudioManager(this);
    
    // アセットマネージャーを初期化
    this.assetManager = AssetManager.getInstance(this);
    
    // アイテム効果ビジュアライザーを初期化
    this.itemEffectVisualizer = new ItemEffectVisualizer(this);
    
    // パーティクルマネージャーを初期化
    this.particleManager = new ParticleManager(this);
    
    // サウンドマネージャーを初期化
    this.soundManager = new SoundManager(this);
    this.soundManager.preloadSounds();
    
    // エラーマネージャーを初期化
    this.errorManager = new ErrorManager(this);
    
    // ツールチップマネージャーを初期化
    this.tooltipManager = new TooltipManager(this);
    
    // アニメーションマネージャーを初期化
    this.animationManager = new AnimationManager(this);
    
    // ゲームBGMを開始
    this.soundManager.playGameBgm();
    
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
    ).setName('boardBackground'); // 背景識別用の名前を設定
    
    // ボタンエリア
    const buttonHeight = 60;
    const buttonCenterY = height - buttonHeight / 2;
    Logger.debug(`ボタン座標計算: height=${height}, buttonHeight=${buttonHeight}, buttonCenterY=${buttonCenterY}`);
    
    // アイテムボタンを作成
    this.createItemButtons(buttonCenterY);
    
    // デバッグ: 作成されたオブジェクトを確認
    Logger.debug('シーンの子要素数:', this.children.length);
    const itemButtons = this.children.list.filter(child => child.name && child.name.startsWith('itemButton_'));
    Logger.debug('アイテムボタン数:', itemButtons.length);
    itemButtons.forEach(button => {
      Logger.debug('アイテムボタン:', button.name, 'x:', (button as any).x, 'y:', (button as any).y);
    });
    
    // リタイアボタン
    const retireButton = new SimpleOceanButton(
      this,
      width - 70,
      buttonCenterY,
      100,
      40,
      'リタイア',
      'danger',
      () => this.onRetire()
    );
    
    // ボタンに名前を設定（後で参照するため）
    retireButton.setName('retireButton');
    
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
          continue; // スプライト作成は後で演出付きで行う
        }
        
        // ランダムな色を選択
        const colorKey = availableColors[Math.floor(Math.random() * availableColors.length)];
        const color = GameConfig.BLOCK_COLORS[colorKey as keyof typeof GameConfig.BLOCK_COLORS];
        
        // 通常ブロックを作成
        const block = blockFactory.createNormalBlock(x, y, color);
        this.blocks[y][x] = block;
      }
    }
    
    // 消去可能なブロックがない場合は再生成
    if (!this.blockLogic.hasRemovableBlocks(this.blocks)) {
      // 再生成
      this.createInitialBlocks();
      return;
    }
    
    // 演出付きでブロックを配置
    this.animateBlockPlacement();
  }
  
  /**
   * 指定位置にブロックスプライトを作成
   */
  private createBlockSprite(x: number, y: number, block: Block): Phaser.GameObjects.Sprite {
    const blockX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    const blockY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    
    // 海をテーマにした美しいブロックを作成
    const blockContainer = this.createOceanThemedBlock(blockX, blockY, block.color, block.type, block);
    
    // コンテナを対話可能に設定
    const blockSize = GameConfig.BLOCK_SIZE - 4;
    blockContainer.setInteractive(
      new Phaser.Geom.Rectangle(-blockSize/2, -blockSize/2, blockSize, blockSize),
      Phaser.Geom.Rectangle.Contains
    );
    
    // カーソルを設定
    blockContainer.input.cursor = 'pointer';
    
    // ホバーエフェクトを追加
    this.addContainerHoverEffect(blockContainer, block);
    
    // スプライト配列に保存（型変換が必要）
    this.blockSprites[y][x] = blockContainer as unknown as Phaser.GameObjects.Sprite;
    
    // ブロックオブジェクトにスプライト参照を追加
    this.blocks[y][x].sprite = blockContainer as unknown as Phaser.GameObjects.Sprite;
    
    // クリックイベント
    blockContainer.on('pointerdown', () => {
      if (!this.isProcessing) {
        this.onBlockClick(x, y);
      }
    });
    
    return blockContainer as unknown as Phaser.GameObjects.Sprite;
  }
  
  /**
   * コンテナにホバーエフェクトを追加
   */
  private addContainerHoverEffect(container: Phaser.GameObjects.Container, block: Block): void {
    // 元のスケールを保存
    const originalScale = container.scale;
    const originalAlpha = container.alpha;
    
    // ホバー時のエフェクト
    container.on('pointerover', () => {
      if (this.isProcessing) return;
      
      // ブロックの座標を取得
      const blockX = Math.floor((container.x - this.boardX) / GameConfig.BLOCK_SIZE);
      const blockY = Math.floor((container.y - this.boardY) / GameConfig.BLOCK_SIZE);
      
      // 消去対象となる隣接ブロックを取得
      const connectedBlocks = this.getConnectedBlocksForPreview(blockX, blockY);
      
      // 消去対象が2個以上の場合のみ演出を適用
      if (connectedBlocks.length >= 2) {
        // 全ての消去対象ブロックに演出を適用
        connectedBlocks.forEach(pos => {
          const targetSprite = this.blockSprites[pos.y]?.[pos.x];
          if (targetSprite) {
            // 色弱対応：スケールと透明度の変化で視覚的フィードバック
            this.tweens.add({
              targets: targetSprite,
              scale: originalScale * 1.1,
              alpha: 0.8,
              duration: GameConfig.ANIMATION.HOVER_DURATION,
              ease: 'Power2'
            });
            
            // 脈動エフェクト（妨害ブロック以外）
            const targetBlock = this.blocks[pos.y]?.[pos.x];
            if (targetBlock && (targetBlock.type === BlockType.NORMAL || targetBlock.type === 'normal')) {
              this.tweens.add({
                targets: targetSprite,
                scaleX: originalScale * 1.05,
                scaleY: originalScale * 1.05,
                duration: GameConfig.ANIMATION.PULSE_DURATION,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
              });
            }
          }
        });
      } else {
        // 消去対象が1個以下の場合は通常の演出（薄く表示）
        this.tweens.add({
          targets: container,
          scale: originalScale * 1.05,
          alpha: 0.6,
          duration: GameConfig.ANIMATION.HOVER_DURATION,
          ease: 'Power2'
        });
      }
    });
    
    // ホバー終了時のエフェクト
    container.on('pointerout', () => {
      // ブロックの座標を取得
      const blockX = Math.floor((container.x - this.boardX) / GameConfig.BLOCK_SIZE);
      const blockY = Math.floor((container.y - this.boardY) / GameConfig.BLOCK_SIZE);
      
      // 消去対象となる隣接ブロックを取得
      const connectedBlocks = this.getConnectedBlocksForPreview(blockX, blockY);
      
      // 全ての関連ブロックのTweenを停止して元に戻す
      if (connectedBlocks.length >= 2) {
        connectedBlocks.forEach(pos => {
          const targetSprite = this.blockSprites[pos.y]?.[pos.x];
          if (targetSprite) {
            // 全てのTweenを停止
            this.tweens.killTweensOf(targetSprite);
            
            // 元の状態に戻す
            this.tweens.add({
              targets: targetSprite,
              scale: originalScale,
              alpha: originalAlpha,
              duration: GameConfig.ANIMATION.HOVER_DURATION,
              ease: 'Power2'
            });
          }
        });
      } else {
        // 全てのTweenを停止
        this.tweens.killTweensOf(container);
        
        // 元の状態に戻す
        this.tweens.add({
          targets: container,
          scale: originalScale,
          alpha: originalAlpha,
          duration: GameConfig.ANIMATION.HOVER_DURATION,
          ease: 'Power2'
        });
      }
    });
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
      
      // ブロックの座標を取得
      const blockX = Math.floor((sprite.x - this.boardX) / GameConfig.BLOCK_SIZE);
      const blockY = Math.floor((sprite.y - this.boardY) / GameConfig.BLOCK_SIZE);
      
      // 消去対象となる隣接ブロックを取得
      const connectedBlocks = this.getConnectedBlocksForPreview(blockX, blockY);
      
      // 消去対象が2個以上の場合のみ演出を適用
      if (connectedBlocks.length >= 2) {
        // 全ての消去対象ブロックに演出を適用
        connectedBlocks.forEach(pos => {
          const targetSprite = this.blockSprites[pos.y]?.[pos.x];
          if (targetSprite) {
            // 色弱対応：スケールと透明度の変化で視覚的フィードバック
            this.tweens.add({
              targets: targetSprite,
              scale: originalScale * 1.1,
              alpha: 0.8,
              duration: GameConfig.ANIMATION.HOVER_DURATION,
              ease: 'Power2'
            });
            
            // 脈動エフェクト（妨害ブロック以外）
            const targetBlock = this.blocks[pos.y]?.[pos.x];
            if (targetBlock && (targetBlock.type === BlockType.NORMAL || targetBlock.type === 'normal')) {
              this.tweens.add({
                targets: targetSprite,
                scaleX: originalScale * 1.05,
                scaleY: originalScale * 1.05,
                duration: GameConfig.ANIMATION.PULSE_DURATION,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
              });
            }
          }
        });
      } else {
        // 消去対象が1個以下の場合は通常の演出（薄く表示）
        this.tweens.add({
          targets: sprite,
          scale: originalScale * 1.05,
          alpha: 0.6,
          duration: GameConfig.ANIMATION.HOVER_DURATION,
          ease: 'Power2'
        });
      }
    });
    
    // ホバー終了時のエフェクト
    sprite.on('pointerout', () => {
      // ブロックの座標を取得
      const blockX = Math.floor((sprite.x - this.boardX) / GameConfig.BLOCK_SIZE);
      const blockY = Math.floor((sprite.y - this.boardY) / GameConfig.BLOCK_SIZE);
      
      // 消去対象となる隣接ブロックを取得
      const connectedBlocks = this.getConnectedBlocksForPreview(blockX, blockY);
      
      // 全ての関連ブロックのTweenを停止して元に戻す
      if (connectedBlocks.length >= 2) {
        connectedBlocks.forEach(pos => {
          const targetSprite = this.blockSprites[pos.y]?.[pos.x];
          if (targetSprite) {
            // 全てのTweenを停止
            this.tweens.killTweensOf(targetSprite);
            
            // 元の状態に戻す
            this.tweens.add({
              targets: targetSprite,
              scale: originalScale,
              alpha: originalAlpha,
              duration: GameConfig.ANIMATION.HOVER_DURATION,
              ease: 'Power2'
            });
          }
        });
      } else {
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
      }
    });
  }
  
  /**
   * 海をテーマにした美しいブロックを作成
   */
  private createOceanThemedBlock(x: number, y: number, color: string, type: string | BlockType, block?: Block): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const blockSize = GameConfig.BLOCK_SIZE - 4;
    const radius = blockSize / 2;
    
    // 基本色を取得
    const baseColor = parseInt(color.replace('#', '0x'));
    
    // 海をテーマにした背景グラデーション
    const graphics = this.add.graphics();
    
    // 外側の輪郭（波のような効果）
    graphics.lineStyle(2, this.getDarkerColor(baseColor), 0.8);
    graphics.fillGradientStyle(
      baseColor, baseColor, 
      this.getLighterColor(baseColor), this.getLighterColor(baseColor),
      0.9, 0.9, 0.6, 0.6
    );
    
    // 丸みを帯びた正方形（海の石のイメージ）
    const cornerRadius = radius * 0.3;
    graphics.fillRoundedRect(-radius, -radius, blockSize, blockSize, cornerRadius);
    graphics.strokeRoundedRect(-radius, -radius, blockSize, blockSize, cornerRadius);
    
    // 海のテクスチャ効果を追加
    this.addOceanTexture(graphics, baseColor, radius);
    
    container.add(graphics);
    
    // 妨害ブロックの特殊効果
    if (type === BlockType.ICE_LV1 || type === 'iceLv1') {
      this.addIceEffect(container, radius, 1);
    } else if (type === BlockType.ICE_LV2 || type === 'iceLv2') {
      this.addIceEffect(container, radius, 2);
    } else if (type === BlockType.ICE_COUNTER_PLUS || type === 'iceCounterPlus') {
      this.addIceEffect(container, radius, 1);
      const counterValue = block?.counterValue || 3;
      this.addCounterDisplay(container, '+', counterValue);
    } else if (type === BlockType.ICE_COUNTER_MINUS || type === 'iceCounterMinus') {
      this.addIceEffect(container, radius, 1);
      const counterValue = block?.counterValue || 3;
      this.addCounterDisplay(container, '-', counterValue);
    } else if (type === BlockType.COUNTER_PLUS || type === 'counterPlus') {
      const counterValue = block?.counterValue || 3;
      this.addCounterDisplay(container, '+', counterValue);
    } else if (type === BlockType.COUNTER_MINUS || type === 'counterMinus') {
      const counterValue = block?.counterValue || 3;
      this.addCounterDisplay(container, '-', counterValue);
    } else if (type === BlockType.ROCK || type === 'rock') {
      this.addRockEffect(container, radius);
    } else if (type === BlockType.STEEL || type === 'steel') {
      this.addSteelEffect(container, radius);
    }
    
    return container;
  }
  
  /**
   * 海のテクスチャ効果を追加
   */
  private addOceanTexture(graphics: Phaser.GameObjects.Graphics, baseColor: number, radius: number): void {
    // 波模様の追加
    graphics.lineStyle(1, this.getLighterColor(baseColor), 0.4);
    
    // 水平の波線
    for (let i = 0; i < 3; i++) {
      const waveY = -radius + (i + 1) * (radius * 2 / 4);
      graphics.beginPath();
      
      for (let x = -radius; x <= radius; x += 4) {
        const waveHeight = Math.sin((x / radius) * Math.PI * 2) * 2;
        if (x === -radius) {
          graphics.moveTo(x, waveY + waveHeight);
        } else {
          graphics.lineTo(x, waveY + waveHeight);
        }
      }
      graphics.strokePath();
    }
    
    // 泡のような小さな円
    graphics.fillStyle(this.getLighterColor(baseColor), 0.3);
    for (let i = 0; i < 3; i++) {
      const bubbleX = (Math.random() - 0.5) * radius;
      const bubbleY = (Math.random() - 0.5) * radius;
      const bubbleSize = Math.random() * 3 + 1;
      graphics.fillCircle(bubbleX, bubbleY, bubbleSize);
    }
  }
  
  /**
   * 氷の効果を追加
   */
  private addIceEffect(container: Phaser.GameObjects.Container, radius: number, level: number): void {
    const iceGraphics = this.add.graphics();
    
    // 氷の輪郭
    const iceColor = level === 1 ? 0xADD8E6 : 0x87CEFA;
    const thickness = level === 1 ? 2 : 4;
    
    iceGraphics.lineStyle(thickness, iceColor, 0.8);
    iceGraphics.strokeRoundedRect(-radius, -radius, radius * 2, radius * 2, radius * 0.3);
    
    // 氷の結晶模様
    iceGraphics.lineStyle(1, 0xFFFFFF, 0.6);
    
    // 十字の結晶
    iceGraphics.moveTo(-radius * 0.6, 0);
    iceGraphics.lineTo(radius * 0.6, 0);
    iceGraphics.moveTo(0, -radius * 0.6);
    iceGraphics.lineTo(0, radius * 0.6);
    
    // 斜めの結晶
    iceGraphics.moveTo(-radius * 0.4, -radius * 0.4);
    iceGraphics.lineTo(radius * 0.4, radius * 0.4);
    iceGraphics.moveTo(radius * 0.4, -radius * 0.4);
    iceGraphics.lineTo(-radius * 0.4, radius * 0.4);
    
    iceGraphics.strokePath();
    container.add(iceGraphics);
  }
  
  /**
   * カウンター表示を追加
   */
  private addCounterDisplay(container: Phaser.GameObjects.Container, prefix: string, value: number): void {
    // 背景円
    const counterBg = this.add.graphics();
    counterBg.fillStyle(0x000000, 0.7);
    counterBg.fillCircle(0, 0, 12);
    
    // カウンターテキスト
    const counterText = this.add.text(0, 0, `${prefix}${value}`, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    container.add([counterBg, counterText]);
  }
  
  /**
   * 岩の効果を追加
   */
  private addRockEffect(container: Phaser.GameObjects.Container, radius: number): void {
    const rockGraphics = this.add.graphics();
    
    // 岩の基本形状（不規則な形）
    rockGraphics.fillStyle(0x8B4513, 1); // 茶色
    rockGraphics.lineStyle(2, 0x654321, 1); // 濃い茶色の輪郭
    
    // 不規則な岩の形を描画
    const points: number[] = [];
    const numPoints = 8;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const variation = 0.7 + Math.random() * 0.3; // 0.7-1.0の範囲
      const x = Math.cos(angle) * radius * variation;
      const y = Math.sin(angle) * radius * variation;
      points.push(x, y);
    }
    
    rockGraphics.fillPoints(points, true);
    rockGraphics.strokePoints(points, true);
    
    // 岩の質感（ひび割れ）
    rockGraphics.lineStyle(1, 0x654321, 0.6);
    for (let i = 0; i < 3; i++) {
      const startX = (Math.random() - 0.5) * radius;
      const startY = (Math.random() - 0.5) * radius;
      const endX = startX + (Math.random() - 0.5) * radius * 0.5;
      const endY = startY + (Math.random() - 0.5) * radius * 0.5;
      
      rockGraphics.moveTo(startX, startY);
      rockGraphics.lineTo(endX, endY);
    }
    rockGraphics.strokePath();
    
    container.add(rockGraphics);
  }
  
  /**
   * 鋼鉄の効果を追加
   */
  private addSteelEffect(container: Phaser.GameObjects.Container, radius: number): void {
    const steelGraphics = this.add.graphics();
    
    // 鋼鉄の背景
    steelGraphics.fillGradientStyle(0xC0C0C0, 0xC0C0C0, 0x808080, 0x808080, 1, 1, 1, 1);
    steelGraphics.fillRoundedRect(-radius, -radius, radius * 2, radius * 2, 4);
    
    // 鋼鉄の格子模様
    steelGraphics.lineStyle(1, 0x404040, 0.8);
    
    // 縦線
    for (let i = 1; i < 4; i++) {
      const x = -radius + (i * radius * 2 / 4);
      steelGraphics.moveTo(x, -radius);
      steelGraphics.lineTo(x, radius);
    }
    
    // 横線
    for (let i = 1; i < 4; i++) {
      const y = -radius + (i * radius * 2 / 4);
      steelGraphics.moveTo(-radius, y);
      steelGraphics.lineTo(radius, y);
    }
    
    steelGraphics.strokePath();
    
    // 外枠
    steelGraphics.lineStyle(2, 0x404040, 1);
    steelGraphics.strokeRoundedRect(-radius, -radius, radius * 2, radius * 2, 4);
    
    container.add(steelGraphics);
  }
  
  /**
   * 色を明るくする
   */
  private getLighterColor(color: number): number {
    const r = Math.min(255, ((color >> 16) & 0xFF) + 40);
    const g = Math.min(255, ((color >> 8) & 0xFF) + 40);
    const b = Math.min(255, (color & 0xFF) + 40);
    return (r << 16) | (g << 8) | b;
  }
  
  /**
   * 色を暗くする
   */
  private getDarkerColor(color: number): number {
    const r = Math.max(0, ((color >> 16) & 0xFF) - 40);
    const g = Math.max(0, ((color >> 8) & 0xFF) - 40);
    const b = Math.max(0, (color & 0xFF) - 40);
    return (r << 16) | (g << 8) | b;
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
    
    // ブロック選択音を再生
    this.soundManager.playBlockSelect();
    
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
        // スワップは2つのブロックを順番に選択
        this.handleSwapSelection(x, y);
        return; // スワップ処理は別途実行
        
      case 'changeOne':
        // 色選択UIを表示
        this.showColorSelectionUI(x, y, 'changeOne');
        return; // 色選択後に処理を継続
        
      case 'miniBomb':
        result = ItemEffectManager.applyMiniBomb(this.blocks, {x, y});
        if (result && result.success) {
          // ミニ爆弾音を再生
          this.soundManager.playItemUse();
          
          // 小さな爆発エフェクトを表示
          const centerX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          const centerY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          this.itemEffectVisualizer.showBombEffect(centerX, centerY);
          
          // パーティクルエフェクトを追加
          this.particleManager.createItemUseEffect(centerX, centerY, 'miniBomb');
        }
        break;
        
      case 'changeArea':
        // 色選択UIを表示
        this.showColorSelectionUI(x, y, 'changeArea');
        return; // 色選択後に処理を継続
        
      case 'meltingAgent':
        result = ItemEffectManager.applyMeltingAgent(this.blocks, {x, y});
        if (result && result.success) {
          // 溶解エフェクトを表示
          const targetX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          const targetY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          this.itemEffectVisualizer.showMeltingEffect(targetX, targetY);
        }
        break;
        
      case 'counterReset':
        result = ItemEffectManager.applyCounterReset(this.blocks, {x, y});
        break;
        
      case 'adPlus':
        result = ItemEffectManager.applyAdPlus(this.blocks, {x, y});
        break;
        
      case 'bomb':
        result = ItemEffectManager.applyBomb(this.blocks, {x, y});
        if (result && result.success) {
          // 爆弾音を再生
          this.soundManager.playBombExplode();
          
          // 爆弾エフェクトを表示
          const centerX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          const centerY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          this.itemEffectVisualizer.showBombEffect(centerX, centerY);
          
          // パーティクルエフェクトを追加
          this.particleManager.createItemUseEffect(centerX, centerY, 'bomb');
        }
        break;
        
      case 'hammer':
        result = ItemEffectManager.applyHammer(this.blocks, {x, y});
        if (result && result.success) {
          // ハンマー音を再生
          this.soundManager.playHammerHit();
          
          // ハンマーエフェクトを表示
          const targetX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          const targetY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          this.itemEffectVisualizer.showHammerEffect(targetX, targetY);
          
          // パーティクルエフェクトを追加
          this.particleManager.createItemUseEffect(targetX, targetY, 'hammer');
        }
        break;
        
      case 'steelHammer':
        result = ItemEffectManager.applySteelHammer(this.blocks, {x, y});
        if (result && result.success) {
          // ハンマーエフェクトを表示
          const targetX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          const targetY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          this.itemEffectVisualizer.showHammerEffect(targetX, targetY);
        }
        break;
        
      case 'specialHammer':
        result = ItemEffectManager.applySpecialHammer(this.blocks, {x, y});
        if (result && result.success) {
          // ハンマーエフェクトを表示
          const targetX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          const targetY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          this.itemEffectVisualizer.showHammerEffect(targetX, targetY);
        }
        break;
        
      default:
        Logger.debug(`アイテム ${item.name} の効果は未実装です`);
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
      
      // 重力を適用（ブロックが破壊された場合の落下処理）
      this.applyGravity();
      
      // アイテムボタンの表示を更新
      this.updateItemButtons();
      
      // アイテムモードを終了
      this.exitItemMode();
      
      this.isProcessing = false;
    } else {
      // 失敗時はメッセージを表示
      Logger.debug(result?.message || 'アイテムの使用に失敗しました');
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
    try {
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
        this.errorHandler.handleItemUseError('ブロック', '妨害ブロックは直接クリックできません');
        return;
      }
      
      this.isProcessing = true;
      
      // 効果音を再生
      this.audioManager.playBlockClick();
      
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
          // 全消し音を再生
          this.audioManager.playAllClear();
          
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
          // エラーハンドラーで行き詰まり状態を通知
          this.errorHandler.handleNoRemovableBlocksError();
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
    } catch (error) {
      // システムエラーの処理
      this.errorHandler.handleSystemError(error as Error);
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
    // ブロック消去音を再生（ブロック数に応じて音量調整）
    this.soundManager.playBlockRemove(blocks.length);
    
    blocks.forEach(block => {
      // ブロックの論理状態を更新
      if (block && block.y >= 0 && block.y < this.blocks.length && 
          block.x >= 0 && block.x < this.blocks[block.y].length) {
        this.blocks[block.y][block.x] = null;
      }
      
      // スプライトのアニメーション
      if (block && block.sprite) {
        const sprite = block.sprite;
        
        // パーティクルエフェクトを追加
        const worldX = this.boardX + block.x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
        const worldY = this.boardY + block.y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
        this.particleManager.createBubbleEffect({
          x: worldX,
          y: worldY,
          count: 3,
          duration: 600,
          alpha: 0.7
        });
        
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
    Logger.debug('🔄 updateBlockSprites開始');
    
    // 🚨 重要：進行中のすべてのTweenを停止
    this.tweens.killAll();
    
    // 🚨 最も根本的な解決：ゲーム盤面エリア内のすべてのオブジェクトを削除
    const boardLeft = this.boardX;
    const boardRight = this.boardX + GameConfig.BOARD_WIDTH * GameConfig.BLOCK_SIZE;
    const boardTop = this.boardY;
    const boardBottom = this.boardY + GameConfig.BOARD_HEIGHT * GameConfig.BLOCK_SIZE;
    
    let removedCount = 0;
    this.children.list.slice().forEach(child => {
      // 位置プロパティを持つオブジェクトかチェック
      if ('x' in child && 'y' in child) {
        const gameObject = child as any;
        // ゲーム盤面エリア内にあるオブジェクトを削除（背景は除外）
        if (gameObject.x >= boardLeft && gameObject.x <= boardRight && 
            gameObject.y >= boardTop && gameObject.y <= boardBottom &&
            gameObject.name !== 'boardBackground') { // 背景は削除しない
          child.destroy();
          removedCount++;
        }
      }
      // スコア表示テキスト（depth=500）も削除
      if (child instanceof Phaser.GameObjects.Text && (child as any).depth === 500) {
        child.destroy();
        removedCount++;
      }
    });
    Logger.debug(`📊 削除したオブジェクト数: ${removedCount}`);
    
    // blockSprites配列をクリア
    for (let y = 0; y < this.blockSprites.length; y++) {
      for (let x = 0; x < this.blockSprites[y].length; x++) {
        this.blockSprites[y][x] = null;
      }
    }
    
    // 🚨 重要：blocks配列内のスプライト参照もクリア
    // blocks配列内のスプライト参照をクリア
    for (let y = 0; y < this.blocks.length; y++) {
      for (let x = 0; x < this.blocks[y].length; x++) {
        if (this.blocks[y][x] && this.blocks[y][x].sprite) {
          this.blocks[y][x].sprite = null;
        }
      }
    }
    
    // blockSprites配列をblocks配列と同じサイズに再初期化
    this.blockSprites = Array(this.blocks.length).fill(0).map(() => 
      Array(this.blocks[0]?.length || GameConfig.BOARD_WIDTH).fill(null)
    );
    
    // 論理状態と視覚状態の同期チェック（再初期化後）
    let syncIssues = 0;
    for (let y = 0; y < this.blocks.length; y++) {
      for (let x = 0; x < this.blocks[y].length; x++) {
        const hasLogic = this.blocks[y][x] !== null;
        const hasVisual = this.blockSprites[y] && this.blockSprites[y][x] !== null;
        if (hasLogic !== hasVisual) {
          Logger.warn(`⚠️ 不整合検出: (${x}, ${y}) 論理=${hasLogic}, 視覚=${hasVisual}`);
          syncIssues++;
        }
      }
    }
    
    // 新しいスプライトを作成
    let createCount = 0;
    for (let y = 0; y < this.blocks.length; y++) {
      for (let x = 0; x < this.blocks[y].length; x++) {
        const block = this.blocks[y][x];
        if (block) {
          this.createBlockSprite(x, y, block);
          createCount++;
        }
      }
    }
    Logger.debug(`📊 作成したスプライト数: ${createCount}`);
    
    Logger.debug('✅ updateBlockSprites完了');
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
    
    // 全消し音を再生
    this.soundManager.playAllClear();
    
    // 全消しパーティクルエフェクト
    this.particleManager.createAllClearEffect(width / 2, height / 2);
    
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
    
    // OceanButtonで作成されたボタンを取得
    const retireButton = this.children.getByName('retireButton') as SimpleOceanButton;
    
    if (retireButton) {
      // ボタンのテキストを「クリア」に変更
      retireButton.setText('クリア');
      
      // ボタンのコールバックを変更
      retireButton.setCallback(() => this.onClear());
    }
  }
  
  /**
   * クリア処理
   */
  private onClear(): void {
    this.soundManager.playButtonTap();
    
    // ステージクリア処理
    this.onStageClear();
  }
  
  /**
   * ステージクリア時の処理
   */
  private onStageClear(): void {
    // ステージクリア音を再生
    this.soundManager.playStageComplete();
    
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
    Logger.debug('createItemButtons - 装備アイテム:', equippedItems);
    
    // シンプルに左寄せで配置（リタイアボタンとは完全に別物として扱う）
    const leftButtonX = 70;   // 左端から70px
    const rightButtonX = 200; // 左端から200px
    
    Logger.debug(`シンプル配置: 左=${leftButtonX}, 右=${rightButtonX}`);
    
    // 特殊枠アイテムボタン
    if (equippedItems.specialSlot) {
      Logger.debug('特殊枠ボタン作成:', equippedItems.specialSlot.name);
      this.createItemButton(equippedItems.specialSlot.name, 'special', leftButtonX, buttonY);
    } else {
      Logger.debug('特殊枠にアイテムが装備されていません');
    }
    
    // 通常枠アイテムボタン
    if (equippedItems.normalSlot) {
      Logger.debug('通常枠ボタン作成:', equippedItems.normalSlot.name);
      this.createItemButton(equippedItems.normalSlot.name, 'normal', rightButtonX, buttonY);
    } else {
      Logger.debug('通常枠にアイテムが装備されていません');
    }
  }

  /**
   * 個別のアイテムボタンを作成
   */
  private createItemButton(itemName: string, slot: 'special' | 'normal', x: number, y: number): void {
    Logger.debug(`createItemButton呼び出し: ${itemName}, slot: ${slot}, x: ${x}, y: ${y}`);
    
    const isUsed = this.itemManager.isItemUsed(slot);
    
    // TODO: アイテムボタンを新しいOceanButtonシステムで実装
    // 一旦シンプルなボタンで代替
    const button = this.add.rectangle(x, y, 120, 40, isUsed ? 0x666666 : 0x4CAF50);
    button.setStrokeStyle(2, 0x333333);
    button.setInteractive();
    
    const text = this.add.text(x, y, itemName, {
      fontSize: '14px',
      color: isUsed ? '#999999' : '#FFFFFF'
    });
    text.setOrigin(0.5, 0.5);
    
    // ボタンに名前を設定（後で参照するため）
    button.setName(`itemButton_${slot}`);
    text.setName(`itemText_${slot}`);
    
    if (!isUsed) {
      button.on('pointerdown', () => this.onItemButtonClick(slot));
    }
    
    Logger.debug(`ボタン作成完了: ${button.name}, 座標: (${button.x}, ${button.y})`);
    Logger.debug(`テキスト作成完了: ${text.name}, テキスト: "${itemName}", 座標: (${text.x}, ${text.y})`);
    
    Logger.debug(`アイテムボタン作成完了: ${slot}枠`);
  }

  /**
   * アイテムボタンクリック時の処理
   */
  private onItemButtonClick(slot: 'special' | 'normal'): void {
    // ボタンタップ音を再生
    this.soundManager.playButtonTap();
    
    // 使用済みチェック
    if (this.itemManager.isItemUsed(slot)) {
      this.errorManager.showError(ErrorType.INVALID_OPERATION, 'このアイテムはすでに使用済みです。');
      return;
    }
    
    const equippedItems = this.itemManager.getEquippedItems();
    const item = slot === 'special' ? equippedItems.specialSlot : equippedItems.normalSlot;
    
    if (!item) {
      this.errorManager.showError(ErrorType.INVALID_OPERATION, 'アイテムが装備されていません。');
      return;
    }
    
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
        Logger.debug(`アイテム ${item.name} は未実装です`);
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
      // アイテム使用音を再生
      this.soundManager.playItemUse();
      
      // スコアブースターエフェクトを表示
      this.itemEffectVisualizer.showScoreBoosterEffect(() => {
        // スコアブースターフラグを設定
        this.scoreBoosterActive = true;
        
        // アイテムを使用済みに設定
        this.itemManager.useItem(slot);
        
        // アイテムボタンの表示を更新
        this.updateItemButtons();
        
        // メッセージ表示
        Logger.debug(result.message);
      });
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
      
      // シャッフル音を再生
      this.soundManager.playShuffle();
      
      // シャッフルエフェクトを表示
      this.itemEffectVisualizer.showShuffleEffect(() => {
        // アイテムを使用済みに設定
        this.itemManager.useItem(slot);
        
        // ブロック配列を更新
        this.blocks = result.newBlocks!;
        
        // 視覚表現を更新
        this.updateBlockSprites();
        
        // アイテムボタンの表示を更新
        this.updateItemButtons();
        
        this.isProcessing = false;
      });
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
      let messageText = `${item.name}を使用中 - 対象を選択してください`;
      
      // スワップの場合は特別なメッセージ
      if (item.effectType === 'swap') {
        messageText = `${item.name}を使用中 - 1つ目のブロックを選択してください`;
      }
      
      const message = this.add.text(width / 2, 100, messageText, {
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
    
    // スワップ状態をリセット
    if (this.swapFirstBlock) {
      this.highlightSwapBlock(this.swapFirstBlock.x, this.swapFirstBlock.y, false);
      this.resetSwapState();
    }
    
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
    
    // スコア獲得音を再生
    const isGreat = score >= 100;
    this.soundManager.playScoreGain(isGreat);
    
    // パーティクルエフェクトを追加
    this.particleManager.createScoreEffect(screenX, screenY, score, isGreat);
    
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

  /**
   * 隣接する同色ブロックを取得（プレビュー用）
   */
  private getConnectedBlocksForPreview(startX: number, startY: number): {x: number, y: number}[] {
    const startBlock = this.blocks[startY]?.[startX];
    if (!startBlock) return [];
    
    const visited = new Set<string>();
    const connected: {x: number, y: number}[] = [];
    const queue: {x: number, y: number}[] = [{x: startX, y: startY}];
    
    const boardHeight = this.blocks.length;
    const boardWidth = this.blocks[0]?.length || 0;
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      const currentBlock = this.blocks[current.y][current.x];
      if (!currentBlock || currentBlock.color !== startBlock.color) continue;
      
      connected.push(current);
      
      // 上下左右の隣接ブロックをチェック
      const directions = [
        {x: 0, y: -1}, // 上
        {x: 0, y: 1},  // 下
        {x: -1, y: 0}, // 左
        {x: 1, y: 0}   // 右
      ];
      
      directions.forEach(dir => {
        const nextX = current.x + dir.x;
        const nextY = current.y + dir.y;
        const nextKey = `${nextX},${nextY}`;
        
        if (nextX >= 0 && nextX < boardWidth && nextY >= 0 && nextY < boardHeight && !visited.has(nextKey)) {
          queue.push({x: nextX, y: nextY});
        }
      });
    }
    
    return connected;
  }

  /**
   * 色選択UIを表示
   */
  private showColorSelectionUI(x: number, y: number, itemType: 'changeOne' | 'changeArea'): void {
    const { width, height } = this.cameras.main;
    
    // モーダル背景
    const modalBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive()
      .setDepth(1000)
      .setName('colorSelectionModalBg');

    // モーダルウィンドウ
    const modalWidth = width * 0.8;
    const modalHeight = 200;
    const modal = this.add.rectangle(width / 2, height / 2, modalWidth, modalHeight, 0x333333, 0.95)
      .setStrokeStyle(2, 0xFFFFFF)
      .setDepth(1001)
      .setName('colorSelectionModal');

    // タイトル
    const title = itemType === 'changeOne' ? 'ブロックの色を選択' : 'エリアの色を選択';
    this.add.text(width / 2, height / 2 - modalHeight / 2 + 30, title, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(1002).setName('colorSelectionTitle');

    // 色選択ボタン
    const colors = [
      { name: '深い青', color: '#1E5799', hex: 0x1E5799 },
      { name: '水色', color: '#7DB9E8', hex: 0x7DB9E8 },
      { name: '海緑', color: '#2E8B57', hex: 0x2E8B57 },
      { name: '珊瑚赤', color: '#FF6347', hex: 0xFF6347 },
      { name: '砂金色', color: '#F4D03F', hex: 0xF4D03F },
      { name: '真珠白', color: '#F5F5F5', hex: 0xF5F5F5 }
    ];

    const buttonSize = 30;
    const buttonSpacing = 45;
    const startX = width / 2 - (colors.length - 1) * buttonSpacing / 2;
    const buttonY = height / 2 + 10;

    colors.forEach((colorData, index) => {
      const buttonX = startX + index * buttonSpacing;
      
      // 色ボタン
      const colorButton = this.add.rectangle(buttonX, buttonY, buttonSize, buttonSize, colorData.hex)
        .setStrokeStyle(2, 0xFFFFFF)
        .setInteractive({ useHandCursor: true })
        .setDepth(1002)
        .setName(`colorButton_${index}`);

      // 色名ラベル
      this.add.text(buttonX, buttonY + buttonSize / 2 + 15, colorData.name, {
        fontSize: '10px',
        color: '#FFFFFF',
        fontFamily: 'Arial'
      }).setOrigin(0.5).setDepth(1002).setName(`colorLabel_${index}`);

      // クリックイベント
      colorButton.on('pointerdown', () => {
        this.applyColorChange(x, y, itemType, colorData.color, colorData.hex);
        this.closeColorSelectionUI();
      });

      // ホバーエフェクト
      colorButton.on('pointerover', () => {
        colorButton.setScale(1.1);
      });

      colorButton.on('pointerout', () => {
        colorButton.setScale(1);
      });
    });

    // 閉じるボタン
    const closeButton = this.add.rectangle(width / 2, height / 2 + modalHeight / 2 - 20, 80, 25, 0x9E9E9E)
      .setInteractive({ useHandCursor: true })
      .setDepth(1002)
      .setName('colorSelectionCloseButton');
    
    this.add.text(width / 2, height / 2 + modalHeight / 2 - 20, '閉じる', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(1002).setName('colorSelectionCloseText');

    closeButton.on('pointerdown', () => {
      this.closeColorSelectionUI();
    });

    // モーダル背景クリックで閉じる
    modalBg.on('pointerdown', () => {
      this.closeColorSelectionUI();
    });
  }

  /**
   * 色変更を適用
   */
  private applyColorChange(x: number, y: number, itemType: 'changeOne' | 'changeArea', color: string, colorHex: number): void {
    let result;
    
    Logger.debug(`色変更適用: ${itemType}, 座標: (${x}, ${y}), 色: ${color}`);
    
    if (itemType === 'changeOne') {
      result = ItemEffectManager.applyChangeOne(this.blocks, {x, y}, color);
      if (result && result.success) {
        Logger.debug('チェンジワン成功');
        // 結果を盤面に適用
        if (result.newBlocks) {
          this.blocks = result.newBlocks;
        }
        this.itemEffectVisualizer.showColorChangeEffect(
          [{x, y}], 
          this.boardX, 
          this.boardY, 
          GameConfig.BLOCK_SIZE, 
          colorHex
        );
      } else {
        Logger.debug('チェンジワン失敗:', result?.message);
      }
    } else if (itemType === 'changeArea') {
      const connectedBlocks = this.getConnectedBlocksForPreview(x, y);
      result = ItemEffectManager.applyChangeArea(this.blocks, {x, y}, color);
      if (result && result.success) {
        Logger.debug('チェンジエリア成功');
        // 結果を盤面に適用
        if (result.newBlocks) {
          this.blocks = result.newBlocks;
        }
        if (connectedBlocks.length > 0) {
          this.itemEffectVisualizer.showColorChangeEffect(
            connectedBlocks, 
            this.boardX, 
            this.boardY, 
            GameConfig.BLOCK_SIZE, 
            colorHex
          );
        }
      } else {
        Logger.debug('チェンジエリア失敗:', result?.message);
      }
    }

    if (result && result.success) {
      // アイテムを使用済みに設定
      this.itemManager.useItem(this.selectedItemSlot!);
      
      // ブロック表示を更新
      this.updateBlockSprites();
      
      // アイテムボタンの表示を更新
      this.updateItemButtons();
      
      // アイテムモードを終了
      this.exitItemMode();
    } else {
      Logger.debug('色変更に失敗しました:', result?.message);
    }
  }

  /**
   * 色選択UIを閉じる
   */
  private closeColorSelectionUI(): void {
    // モーダル関連のオブジェクトを削除
    const modalObjects = [
      'colorSelectionModalBg',
      'colorSelectionModal',
      'colorSelectionTitle',
      'colorSelectionCloseButton',
      'colorSelectionCloseText'
    ];

    modalObjects.forEach(name => {
      const obj = this.children.getByName(name);
      if (obj) {
        obj.destroy();
      }
    });

    // 色ボタンとラベルを削除
    for (let i = 0; i < 6; i++) {
      const button = this.children.getByName(`colorButton_${i}`);
      const label = this.children.getByName(`colorLabel_${i}`);
      if (button) button.destroy();
      if (label) label.destroy();
    }
  }

  /**
   * スワップアイテムの選択処理
   */
  private handleSwapSelection(x: number, y: number): void {
    Logger.debug(`スワップ選択: (${x}, ${y})`);
    
    // ブロックの存在チェック
    if (!this.blocks[y] || !this.blocks[y][x]) {
      Logger.debug('ブロックが存在しません');
      return;
    }
    
    // 岩ブロックと鋼鉄ブロックは選択不可
    const block = this.blocks[y][x];
    if (block.type === 'rock' || block.type === 'steel') {
      Logger.debug('岩ブロックと鋼鉄ブロックは選択できません');
      return;
    }
    
    if (!this.swapFirstBlock) {
      // 1つ目のブロックを選択
      this.swapFirstBlock = {x, y};
      Logger.debug(`1つ目のブロックを選択: (${x}, ${y})`);
      
      // 選択されたブロックをハイライト表示
      this.highlightSwapBlock(x, y, true);
      
      // メッセージを更新
      this.updateItemModeMessage('2つ目のブロックを選択してください');
    } else {
      // 2つ目のブロックを選択
      Logger.debug(`2つ目のブロックを選択: (${x}, ${y})`);
      
      // 同じブロックを選択した場合はキャンセル
      if (this.swapFirstBlock.x === x && this.swapFirstBlock.y === y) {
        Logger.debug('同じブロックが選択されました。選択をキャンセルします');
        this.cancelSwapSelection();
        return;
      }
      
      // スワップを実行
      this.executeSwap(this.swapFirstBlock, {x, y});
    }
  }

  /**
   * スワップを実行
   */
  private executeSwap(pos1: {x: number, y: number}, pos2: {x: number, y: number}): void {
    Logger.debug(`スワップ実行: (${pos1.x}, ${pos1.y}) <-> (${pos2.x}, ${pos2.y})`);
    
    const result = ItemEffectManager.applySwap(this.blocks, pos1, pos2);
    
    if (result && result.success) {
      Logger.debug('スワップ成功');
      
      // 結果を盤面に適用
      if (result.newBlocks) {
        this.blocks = result.newBlocks;
      }
      
      // スワップエフェクトを表示（簡易版）
      Logger.debug('スワップエフェクト表示');
      // TODO: 後でスワップ専用エフェクトを実装
      
      // アイテムを使用済みに設定
      this.itemManager.useItem(this.selectedItemSlot!);
      
      // ブロック表示を更新
      this.updateBlockSprites();
      
      // アイテムボタンの表示を更新
      this.updateItemButtons();
      
      // スワップ状態をリセット
      this.resetSwapState();
      
      // アイテムモードを終了
      this.exitItemMode();
    } else {
      Logger.debug('スワップ失敗:', result?.message);
      this.cancelSwapSelection();
    }
  }

  /**
   * スワップ選択をキャンセル
   */
  private cancelSwapSelection(): void {
    if (this.swapFirstBlock) {
      // ハイライトを削除
      this.highlightSwapBlock(this.swapFirstBlock.x, this.swapFirstBlock.y, false);
    }
    this.resetSwapState();
    this.updateItemModeMessage('1つ目のブロックを選択してください');
  }

  /**
   * スワップ状態をリセット
   */
  private resetSwapState(): void {
    this.swapFirstBlock = null;
  }

  /**
   * スワップブロックのハイライト表示
   */
  private highlightSwapBlock(x: number, y: number, highlight: boolean): void {
    const blockSprite = this.blockSprites[y] && this.blockSprites[y][x];
    if (blockSprite) {
      if (highlight) {
        // ハイライト効果（明るくする）
        blockSprite.setTint(0xFFFFAA);
        blockSprite.setScale(1.1);
      } else {
        // ハイライト解除
        blockSprite.clearTint();
        blockSprite.setScale(1);
      }
    }
  }

  /**
   * アイテムモードのメッセージを更新
   */
  private updateItemModeMessage(message: string): void {
    // 既存のメッセージテキストを更新
    const messageText = this.children.getByName('itemModeMessage') as Phaser.GameObjects.Text;
    if (messageText) {
      messageText.setText(message);
    }
  }

  /**
   * 演出付きでブロックを配置する
   */
  private animateBlockPlacement(): void {
    Logger.debug('🌊 ブロック配置演出開始');
    
    let delay = 0;
    const baseDelay = 4; // さらに短縮（8ms → 4ms）
    
    // 上から下へ、左から右へ順番に配置
    for (let row = 0; row < GameConfig.BOARD_HEIGHT; row++) {
      for (let col = 0; col < GameConfig.BOARD_WIDTH; col++) {
        const block = this.blocks[row][col];
        if (block) {
          // 遅延を設定して演出付きでスプライトを作成
          this.time.delayedCall(delay, () => {
            this.createBlockSpriteWithAnimation(col, row, block);
          });
          
          delay += baseDelay;
        }
      }
    }
    
    // 全ブロック配置完了後の処理（さらに短縮）
    const totalDelay = delay + 50; // 余裕時間をさらに短縮（100ms → 50ms）
    this.time.delayedCall(totalDelay, () => {
      Logger.debug('✅ ブロック配置演出完了');
      // 配置完了音を再生
      this.soundManager.playBlockPlace();
    });
  }

  /**
   * 演出付きでブロックスプライトを作成
   */
  private createBlockSpriteWithAnimation(x: number, y: number, block: Block): void {
    const finalX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    const finalY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    
    // ブロックの色に応じた演出設定を取得
    const animConfig = this.getBlockAnimationConfig(block.color);
    
    // 通常のスプライト作成処理を実行
    const blockContainer = this.createOceanThemedBlock(finalX, finalY, block.color, block.type, block);
    
    // コンテナを対話可能に設定
    const blockSize = GameConfig.BLOCK_SIZE - 4;
    blockContainer.setInteractive(
      new Phaser.Geom.Rectangle(-blockSize/2, -blockSize/2, blockSize, blockSize),
      Phaser.Geom.Rectangle.Contains
    );
    
    // クリックイベント
    blockContainer.on('pointerdown', () => {
      this.onBlockClick(x, y);
    });
    
    // スプライト配列に保存（型変換が必要）
    this.blockSprites[y][x] = blockContainer as unknown as Phaser.GameObjects.Sprite;
    
    // ブロックオブジェクトにスプライト参照を追加
    this.blocks[y][x].sprite = blockContainer as unknown as Phaser.GameObjects.Sprite;
    
    // 初期状態を設定（最終位置のすぐ下から開始）
    const startY = finalY + animConfig.startOffset; // 画面下ではなく最終位置の下
    blockContainer.setPosition(finalX, startY);
    blockContainer.setAlpha(0);
    blockContainer.setScale(0.8); // 初期スケールをさらに大きく（0.7 → 0.8）
    
    // 浮上アニメーション（超短距離）
    this.tweens.add({
      targets: blockContainer,
      x: finalX,
      y: finalY,
      alpha: 1,
      scale: 1,
      duration: animConfig.duration,
      ease: 'Power2.easeOut'
    });
  }

  /**
   * ブロックの色に応じたアニメーション設定を取得
   */
  private getBlockAnimationConfig(color: string): any {
    // アニメーション時間をさらに短縮（250-300ms → 150-200ms）
    const configs: { [key: string]: any } = {
      '#1E5799': { // 深い青
        startOffset: 20,  // さらに短縮（25px → 20px）
        duration: 200,    // 大幅短縮（300ms → 200ms）
        ease: 'Power2.easeOut'
      },
      '#7DB9E8': { // 水色
        startOffset: 18,  // さらに短縮（22px → 18px）
        duration: 180,    // 大幅短縮（280ms → 180ms）
        ease: 'Power2.easeOut'
      },
      '#2E8B57': { // 海緑
        startOffset: 19,  // さらに短縮（23px → 19px）
        duration: 190,    // 大幅短縮（290ms → 190ms）
        ease: 'Power2.easeOut'
      },
      '#FF6347': { // 珊瑚赤
        startOffset: 16,  // さらに短縮（20px → 16px）
        duration: 170,    // 大幅短縮（270ms → 170ms）
        ease: 'Power2.easeOut'
      },
      '#F4D03F': { // 砂金色
        startOffset: 14,  // さらに短縮（18px → 14px）
        duration: 160,    // 大幅短縮（260ms → 160ms）
        ease: 'Power2.easeOut'
      },
      '#F5F5F5': { // 真珠白
        startOffset: 12,  // さらに短縮（15px → 12px）
        duration: 150,    // 大幅短縮（250ms → 150ms）
        ease: 'Power2.easeOut'
      }
    };
    
    return configs[color] || {
      startOffset: 16,  // デフォルトも短縮（20px → 16px）
      duration: 180,    // デフォルトも短縮（280ms → 180ms）
      ease: 'Power2.easeOut'
    };
  }

  /**
   * シーン終了時のクリーンアップ
   */
  shutdown(): void {
    // パーティクルマネージャーをクリーンアップ
    if (this.particleManager) {
      this.particleManager.destroy();
    }
    
    // サウンドマネージャーをクリーンアップ
    if (this.soundManager) {
      this.soundManager.destroy();
    }
    
    // エラーマネージャーをクリーンアップ
    if (this.errorManager) {
      this.errorManager.destroy();
    }
    
    // ツールチップマネージャーをクリーンアップ
    if (this.tooltipManager) {
      this.tooltipManager.destroy();
    }
    
    // アニメーションマネージャーをクリーンアップ
    if (this.animationManager) {
      this.animationManager.destroy();
    }
  }
}
