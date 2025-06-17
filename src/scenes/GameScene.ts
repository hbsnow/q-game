import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { Block, BlockType } from '../types/Block';
import { BlockLogic } from '../utils/BlockLogic';
import { GameStateManager } from '../utils/GameStateManager';
import { BlockFactory } from '../utils/BlockFactory';
import { BlockAsciiRenderer } from '../utils/BlockAsciiRenderer';

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

  constructor() {
    super({ key: 'GameScene' });
    this.gameStateManager = GameStateManager.getInstance();
    this.blockLogic = new BlockLogic();
  }

  init(data: any): void {
    this.currentStage = data.stage || 1;
    this.score = 0;
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
    const headerText = this.add.text(10, 30, `Stage ${this.currentStage}  Score: ${this.score}`, {
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setName('headerText');
    
    const targetText = this.add.text(10, 60, `Target: ${this.targetScore}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    // ゲーム盤面の位置を計算
    const titleHeight = 90;
    const titleCenterY = 45;
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
    
    // リタイアボタン
    const buttonHeight = 60;
    const buttonCenterY = height - buttonHeight / 2;
    const retireButton = this.add.rectangle(width - 70, buttonCenterY, 120, 40, 0xAA2222)
      .setInteractive({ useHandCursor: true })
      .setName('retireButton');
    
    const retireText = this.add.text(width - 70, buttonCenterY, 'リタイア', {
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setName('retireText');
    
    // ボタンクリックイベント
    retireButton.on('pointerdown', () => {
      this.scene.start('MainScene');
    });
    
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
    
    // 色の配列（ステージに応じて色数を変える）
    const colorKeys = Object.keys(GameConfig.BLOCK_COLORS);
    const colorCount = Math.min(3 + Math.floor(this.currentStage / 5), 6); // ステージが進むと色が増える
    const availableColors = colorKeys.slice(0, colorCount);
    
    // ブロックファクトリーの作成
    const blockFactory = new BlockFactory();
    
    // 鋼鉄ブロックを特定の位置に配置（ステージ1から出現）
    // 鋼鉄ブロックのパターンを定義（例：L字型）
    const steelBlockPositions = [
      { x: 3, y: 10 },
      { x: 4, y: 10 }
    ];
    
    // 鋼鉄ブロックを配置
    steelBlockPositions.forEach(pos => {
      if (pos.y < GameConfig.BOARD_HEIGHT && pos.x < GameConfig.BOARD_WIDTH) {
        const steelBlock = blockFactory.createSteelBlock(pos.x, pos.y);
        this.blocks[pos.y][pos.x] = steelBlock;
      }
    });
    
    // ブロックの生成
    for (let y = 0; y < GameConfig.BOARD_HEIGHT; y++) {
      for (let x = 0; x < GameConfig.BOARD_WIDTH; x++) {
        // 既に鋼鉄ブロックが配置されている場合はスキップ
        if (this.blocks[y][x] && this.blocks[y][x]?.type === BlockType.STEEL) {
          // スプライトのみ作成
          this.createBlockSprite(x, y, this.blocks[y][x]!);
          continue;
        }
        
        // ランダムな色を選択
        const colorKey = availableColors[Math.floor(Math.random() * availableColors.length)];
        const color = GameConfig.BLOCK_COLORS[colorKey as keyof typeof GameConfig.BLOCK_COLORS];
        
        // テスト用に妨害ブロックを配置（ランダムに配置）
        let block: Block;
        const rand = Math.random();
        if (rand < 0.02) {
          // 約2%の確率で岩ブロック（ステージ1から出現）
          block = blockFactory.createRockBlock(x, y);
        } else if (rand < 0.04) {
          // 約2%の確率で氷結Lv1
          block = blockFactory.createIceBlockLv1(x, y, color);
        } else if (rand < 0.05) {
          // 約1%の確率で氷結Lv2
          block = blockFactory.createIceBlockLv2(x, y, color);
        } else if (rand < 0.07) {
          // 約2%の確率で氷結カウンター+ブロック（テスト用）
          const counterValue = Math.floor(Math.random() * 5) + 3; // 3〜7の値
          block = blockFactory.createIceCounterPlusBlock(x, y, color, counterValue);
        } else if (rand < 0.09) {
          // 約2%の確率で氷結カウンター-ブロック（テスト用）
          const counterValue = Math.floor(Math.random() * 5) + 3; // 3〜7の値
          block = blockFactory.createIceCounterMinusBlock(x, y, color, counterValue);
        } else if (rand < 0.11) {
          // 約2%の確率でカウンター+ブロック
          // カウンター値は3〜7の間でランダム
          const counterValue = Math.floor(Math.random() * 5) + 3;
          block = blockFactory.createCounterPlusBlock(x, y, color, counterValue);
        } else if (rand < 0.12) {
          // 約1%の確率でカウンター-ブロック
          // カウンター値は3〜7の間でランダム
          const counterValue = Math.floor(Math.random() * 5) + 3;
          block = blockFactory.createCounterMinusBlock(x, y, color, counterValue);
        } else {
          // 残りは通常ブロック
          block = blockFactory.createNormalBlock(x, y, color);
        }
        
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
   * ブロッククリック時の処理
   */
  private onBlockClick(x: number, y: number): void {
    if (this.isProcessing) return;
    
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
      const score = this.blockLogic.calculateScore(removableCount);
      this.score += score;
      
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
      this.time.delayedCall(300, () => {
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
          // 全消しボーナス
          this.score = Math.floor(this.score * 1.5);
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
          duration: 200,
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
    // ゲーム状態を更新
    this.gameStateManager.setScore(this.score);
    this.gameStateManager.onStageClear();
    this.gameStateManager.goToNextStage();
    
    // TODO: リザルト画面に遷移
    this.scene.start('MainScene');
  }
  
  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア（ステージ情報とスコア）
    const titleHeight = 90;
    const titleCenterY = 45;
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
    
    // 左側空白エリア
    const sideSpaceWidth = (width - boardWidth) / 2;
    if (sideSpaceWidth > 0) {
      this.debugHelper.addAreaBorder(
        sideSpaceWidth / 2,
        adjustedBoardCenterY,
        sideSpaceWidth,
        boardHeight,
        0x0000FF,
        '左側空白エリア'
      );
    }
    
    // 右側空白エリア
    if (sideSpaceWidth > 0) {
      this.debugHelper.addAreaBorder(
        width - sideSpaceWidth / 2,
        adjustedBoardCenterY,
        sideSpaceWidth,
        boardHeight,
        0x0000FF,
        '右側空白エリア'
      );
    }
    
    // ボタン/アクションエリア（アイテムボタン）
    const buttonHeight = 60;
    const buttonCenterY = height - buttonHeight / 2;
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, width, buttonHeight, 0xFF00FF, 'ボタン/アクションエリア');
    
    // メインコンテンツとボタンの間の空白
    const boardBottomY = adjustedBoardCenterY + boardHeight / 2;
    const buttonTopY = buttonCenterY - buttonHeight / 2;
    const contentToButtonSpaceHeight = buttonTopY - boardBottomY;
    
    if (contentToButtonSpaceHeight > 0) {
      this.debugHelper.addAreaBorder(
        width / 2,
        boardBottomY + contentToButtonSpaceHeight / 2,
        width,
        contentToButtonSpaceHeight,
        0x0000FF,
        'コンテンツ下空白エリア'
      );
    }
  }
}
