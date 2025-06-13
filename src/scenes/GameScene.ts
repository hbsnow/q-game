import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { Block } from '../types/Block';
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

  constructor() {
    super({ key: 'GameScene' });
    this.gameStateManager = GameStateManager.getInstance();
  }

  init(data: any): void {
    this.currentStage = data.stage || 1;
    this.score = 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
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
    
    // ゲーム盤面の位置を計算 - デバッグラインに合わせて調整
    const titleHeight = 90;
    const titleCenterY = 45;
    const titleBottomY = titleCenterY + titleHeight / 2;
    const boardWidth = GameConfig.BOARD_WIDTH * GameConfig.BLOCK_SIZE;
    const boardHeight = GameConfig.BOARD_HEIGHT * GameConfig.BLOCK_SIZE;
    
    // タイトルエリアの直下にメインコンテンツエリアを配置
    this.boardX = width / 2 - boardWidth / 2;
    this.boardY = titleBottomY; // タイトルエリアの直下に配置
    
    // ゲーム盤面の背景 - デバッグラインに合わせて調整
    const adjustedBoardCenterY = titleBottomY + boardHeight / 2;
    const boardBg = this.add.rectangle(
      width / 2,
      adjustedBoardCenterY,
      GameConfig.BOARD_WIDTH * GameConfig.BLOCK_SIZE,
      GameConfig.BOARD_HEIGHT * GameConfig.BLOCK_SIZE,
      0x000033,
      0.3
    );
    
    // リタイアボタン - デバッグラインに合わせて調整
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
    
    // Bキーでブロック状態をアスキーアートで出力するように設定
    this.input.keyboard?.addKey('B').on('down', () => {
      BlockAsciiRenderer.logBlocks(this.blocks, 'CURRENT BLOCK STATE');
    });
    
    // デバッグライン
    if (GameConfig.DEBUG_MODE) {
      this.addDebugLines();
    }
  }
  
  /**
   * ブロックの初期配置を作成
   */
  private createInitialBlocks(): void {
    const { width } = this.cameras.main;
    
    // タイトルエリアの計算 - createInitialBlocks内でも使用できるように
    const titleHeight = 90;
    const titleCenterY = 45;
    const titleBottomY = titleCenterY + titleHeight / 2;
    
    // 色の配列（ステージに応じて色数を変える）
    const colorKeys = Object.keys(GameConfig.BLOCK_COLORS);
    const colorCount = Math.min(3 + Math.floor(this.currentStage / 5), 6); // ステージが進むと色が増える
    const availableColors = colorKeys.slice(0, colorCount);
    
    // ブロック配列の初期化
    this.blocks = Array(GameConfig.BOARD_HEIGHT).fill(0).map(() => 
      Array(GameConfig.BOARD_WIDTH).fill(null)
    );
    
    this.blockSprites = Array(GameConfig.BOARD_HEIGHT).fill(0).map(() => 
      Array(GameConfig.BOARD_WIDTH).fill(null)
    );
    
    // ブロックファクトリーの作成
    const blockFactory = new BlockFactory();
    
    // ブロックの生成
    for (let y = 0; y < GameConfig.BOARD_HEIGHT; y++) {
      for (let x = 0; x < GameConfig.BOARD_WIDTH; x++) {
        // ランダムな色を選択
        const colorKey = availableColors[Math.floor(Math.random() * availableColors.length)];
        const color = GameConfig.BLOCK_COLORS[colorKey as keyof typeof GameConfig.BLOCK_COLORS];
        
        // テスト用に氷結ブロックを配置（特定の位置に配置）
        let block: Block;
        
        // テスト用に妨害ブロックを配置（ランダムに配置）
        const rand = Math.random();
        if (rand < 0.07) {
          // 約7%の確率で氷結Lv1
          block = blockFactory.createIceBlockLv1(x, y, color);
        } else if (rand < 0.12) {
          // 約5%の確率で氷結Lv2
          block = blockFactory.createIceBlockLv2(x, y, color);
        } else {
          // 残りは通常ブロック
          block = blockFactory.createNormalBlock(x, y, color);
        }
        
        this.blocks[y][x] = block;
        
        // ブロックのスプライトを作成 - デバッグラインに合わせて調整
        const blockX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
        const blockY = titleBottomY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
        
        const blockSprite = this.add.sprite(blockX, blockY, '');
        
        // スプライトの代わりに円を描画（ブロックタイプに応じて見た目を変える）
        const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(color.replace('#', '0x')));
        const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
        rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
        
        // 妨害ブロックの場合は特殊なエフェクトを追加
        if (block.type === 'iceLv1') {
          // 氷結Lv1のエフェクト（薄い半透明の白い円）
          const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.5);
          rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // 氷の結晶マーク
          const crystalSize = GameConfig.BLOCK_SIZE / 4;
          const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0xADD8E6);
          rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
        } else if (block.type === 'iceLv2') {
          // 氷結Lv2のエフェクト（濃い半透明の白い円）
          const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.7);
          rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // 氷の結晶マーク（大きめ）
          const crystalSize = GameConfig.BLOCK_SIZE / 3;
          const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0x87CEFA);
          rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // 雪の結晶マーク（小さめ、複数）
          const smallCrystalSize = GameConfig.BLOCK_SIZE / 6;
          const positions = [
            { x: -GameConfig.BLOCK_SIZE / 4, y: -GameConfig.BLOCK_SIZE / 4 },
            { x: GameConfig.BLOCK_SIZE / 4, y: GameConfig.BLOCK_SIZE / 4 }
          ];
          
          positions.forEach(pos => {
            const smallCrystal = this.add.star(0, 0, 6, smallCrystalSize, smallCrystalSize / 2, 0xFFFFFF);
            rt.draw(smallCrystal, GameConfig.BLOCK_SIZE / 2 + pos.x, GameConfig.BLOCK_SIZE / 2 + pos.y);
          });
        }
        
        blockSprite.setTexture(rt.texture as unknown as string);
        blockSprite.setInteractive({ useHandCursor: true });
        
        this.blockSprites[y][x] = blockSprite;
        
        // ブロックオブジェクトにスプライト参照を追加
        this.blocks[y][x].sprite = blockSprite;
        
        // クリックイベント
        blockSprite.on('pointerdown', () => {
          if (!this.isProcessing) {
            this.onBlockClick(x, y);
          }
        });
      }
    }
    
    // 消去可能なブロックがない場合は再生成
    const blockLogic = new BlockLogic();
    if (!blockLogic.hasRemovableBlocks(this.blocks)) {
      // スプライトを破棄
      for (let y = 0; y < GameConfig.BOARD_HEIGHT; y++) {
        for (let x = 0; x < GameConfig.BOARD_WIDTH; x++) {
          if (this.blockSprites[y][x]) {
            this.blockSprites[y][x].destroy();
          }
        }
      }
      
      // 再生成
      this.createInitialBlocks();
    }
  }
  
  /**
   * ブロッククリック時の処理
   */
  private onBlockClick(x: number, y: number): void {
    if (this.isProcessing) return;
    
    // クリックされたブロックが氷結ブロックかチェック
    const clickedBlock = this.blocks[y][x];
    if (clickedBlock && (clickedBlock.type === 'iceLv1' || clickedBlock.type === 'iceLv2')) {
      // 氷結ブロックは直接クリックできない
      console.log('氷結ブロックは直接クリックできません');
      return;
    }
    
    this.isProcessing = true;
    
    // デバッグヘルパーにクリック位置を設定
    this.debugHelper.setLastClickPosition({x, y});
    
    // BlockLogicのインスタンスを作成
    const blockLogic = new BlockLogic();
    
    // デバッグ用：クリック前の状態を記録
    const beforeBlocks = JSON.parse(JSON.stringify(this.blocks));
    
    // 通常ブロックの処理
    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(this.blocks, x, y);
    
    // 2つ以上のブロックが隣接している場合のみ消去（自分自身を含めて2つ以上）
    if (connectedBlocks.length >= 2) {
      // スコア計算
      const score = blockLogic.calculateScore(connectedBlocks.length);
      this.score += score;
      
      // スコア表示を更新
      this.updateScoreDisplay();
      
      // デバッグ用：氷結ブロック更新前の状態を記録
      const beforeIceUpdate = JSON.parse(JSON.stringify(this.blocks));
      
      // 氷結ブロックの状態更新（レベルダウン）
      this.blocks = blockLogic.updateIceBlocks(this.blocks, connectedBlocks);
      
      // デバッグ用：氷結ブロック更新後の状態を記録
      BlockAsciiRenderer.logBlocksComparison(beforeIceUpdate, this.blocks, `氷結ブロック更新 (${String.fromCharCode(97 + x)}${y})`, {x, y});
      
      // 通常ブロックのみを消去（氷結ブロックは消去しない）
      const normalBlocks = [];
      for (const block of connectedBlocks) {
        // 元々通常ブロックだったもののみを消去対象とする
        // 氷結ブロックから変化した通常ブロックは消去しない
        if (beforeIceUpdate[block.y][block.x].type === 'normal') {
          normalBlocks.push(block);
        }
      }
      
      // デバッグ用：通常ブロック消去前の状態を記録
      const beforeRemove = JSON.parse(JSON.stringify(this.blocks));
      
      // ブロックを消去
      this.removeBlocks(normalBlocks);
      
      // デバッグ用：通常ブロック消去後の状態を記録
      this.time.delayedCall(100, () => {
        BlockAsciiRenderer.logBlocksComparison(beforeRemove, this.blocks, `通常ブロック消去 (${String.fromCharCode(97 + x)}${y})`, {x, y});
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
        if (blockLogic.isAllCleared(this.blocks)) {
          // 全消しボーナス
          this.score = Math.floor(this.score * 1.5);
          this.updateScoreDisplay();
          
          // 全消し演出
          this.showAllClearedEffect();
        }
        
        // 行き詰まり判定
        if (!blockLogic.hasRemovableBlocks(this.blocks)) {
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
   * 氷結ブロックを処理する
   */
  private processIceBlocks(iceBlocks: Block[]): void {
    // BlockLogicのインスタンスを作成
    const blockLogic = new BlockLogic();
    
    // スコア計算（氷結ブロックの数に基づく）
    const score = blockLogic.calculateScore(iceBlocks.length);
    this.score += score;
    
    // スコア表示を更新
    this.updateScoreDisplay();
    
    // 各氷結ブロックを処理（レベルダウンする）
    iceBlocks.forEach(iceBlock => {
      if (iceBlock.type === 'iceLv2') {
        // 氷結Lv2 → 氷結Lv1
        this.blocks[iceBlock.y][iceBlock.x] = {
          x: iceBlock.x,
          y: iceBlock.y,
          color: iceBlock.color,
          type: 'iceLv1',
          sprite: iceBlock.sprite
        };
        
        // 視覚効果（氷が薄くなるエフェクト）
        if (iceBlock.sprite) {
          // 現在のスプライトを保存
          const sprite = iceBlock.sprite;
          
          // 新しいテクスチャを作成（氷Lv1）
          const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(iceBlock.color.replace('#', '0x')));
          const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
          rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // 氷のエフェクト（半透明の白い円）
          const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.5);
          rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // 氷の結晶マーク
          const crystalSize = GameConfig.BLOCK_SIZE / 4;
          const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0xADD8E6);
          rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // テクスチャを更新
          sprite.setTexture(rt.texture as unknown as string);
          
          // 氷が薄くなるエフェクト
          this.tweens.add({
            targets: sprite,
            scale: { from: 0.9, to: 1 },
            alpha: { from: 0.8, to: 1 },
            duration: 200,
            ease: 'Cubic.easeOut'
          });
        }
      } else if (iceBlock.type === 'iceLv1') {
        // 氷結Lv1 → 通常ブロック
        this.blocks[iceBlock.y][iceBlock.x] = {
          x: iceBlock.x,
          y: iceBlock.y,
          color: iceBlock.color,
          type: 'normal',
          sprite: iceBlock.sprite
        };
        
        // 視覚効果（氷が溶けるエフェクト）
        if (iceBlock.sprite) {
          // 現在のスプライトを保存
          const sprite = iceBlock.sprite;
          
          // 新しいテクスチャを作成（氷なし）
          const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(iceBlock.color.replace('#', '0x')));
          const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
          rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // テクスチャを更新
          sprite.setTexture(rt.texture as unknown as string);
          
          // 氷が溶けるエフェクト
          this.tweens.add({
            targets: sprite,
            scale: { from: 0.9, to: 1 },
            alpha: { from: 0.8, to: 1 },
            duration: 200,
            ease: 'Cubic.easeOut'
          });
        }
      }
    });
    
    // 少し待ってから重力を適用（アニメーション完了を待つ）
    this.time.delayedCall(300, () => {
      // 重力を適用（ブロックを落下させる）
      this.applyGravity();
      
      // 全消し判定
      if (blockLogic.isAllCleared(this.blocks)) {
        // 全消しボーナス
        this.score = Math.floor(this.score * 1.5);
        this.updateScoreDisplay();
        
        // 全消し演出
        this.showAllClearedEffect();
      }
      
      // 行き詰まり判定
      if (!blockLogic.hasRemovableBlocks(this.blocks)) {
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
  }
  
  /**
   * 氷結ブロックの状態を更新する
   * 通常ブロック消去時に隣接する同色の氷結ブロックを解除する
   */
  private updateIceBlocks(removedBlocks: Block[]): void {
    // 消去されたブロックに隣接する氷結ブロックを探す
    const adjacentIceBlocks: Block[] = [];
    
    // 消去されたブロックごとに処理
    removedBlocks.forEach(block => {
      const { x, y, color } = block;
      
      // 隣接する4方向をチェック
      const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }  // 左
      ];
      
      directions.forEach(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        
        // 範囲外チェック
        if (ny < 0 || ny >= this.blocks.length || nx < 0 || nx >= this.blocks[ny].length) {
          return;
        }
        
        // 氷結ブロックかつ同じ色のブロックをチェック
        const adjacentBlock = this.blocks[ny][nx];
        if (adjacentBlock && 
            (adjacentBlock.type === 'iceLv1' || adjacentBlock.type === 'iceLv2') && 
            adjacentBlock.color === color) {
          // 重複を避けるため、まだリストにないブロックのみ追加
          if (!adjacentIceBlocks.some(b => b.x === nx && b.y === ny)) {
            adjacentIceBlocks.push(adjacentBlock);
          }
        }
      });
    });
    
    // 氷結ブロックの状態を更新
    adjacentIceBlocks.forEach(iceBlock => {
      if (iceBlock.type === 'iceLv1') {
        // 氷結Lv1は解除されて通常ブロックになる
        this.blocks[iceBlock.y][iceBlock.x] = {
          x: iceBlock.x,
          y: iceBlock.y,
          color: iceBlock.color,
          type: 'normal',
          sprite: iceBlock.sprite
        };
        
        // 視覚効果（氷が溶けるエフェクト）
        if (iceBlock.sprite) {
          // 現在のスプライトを保存
          const sprite = iceBlock.sprite;
          
          // 新しいテクスチャを作成（氷なし）
          const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(iceBlock.color.replace('#', '0x')));
          const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
          rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // テクスチャを更新
          sprite.setTexture(rt.texture as unknown as string);
          
          // 氷が溶けるエフェクト
          this.tweens.add({
            targets: sprite,
            scale: { from: 0.9, to: 1 },
            alpha: { from: 0.8, to: 1 },
            duration: 200,
            ease: 'Cubic.easeOut'
          });
        }
        
        // 解除されたブロックの周囲に同色の氷結ブロックがあるか確認し、連鎖的に解除
        this.checkAdjacentIceBlocks(iceBlock.x, iceBlock.y, iceBlock.color);
      } else if (iceBlock.type === 'iceLv2') {
        // 氷結Lv2は氷結Lv1になる
        this.blocks[iceBlock.y][iceBlock.x] = {
          x: iceBlock.x,
          y: iceBlock.y,
          color: iceBlock.color,
          type: 'iceLv1',
          sprite: iceBlock.sprite
        };
        
        // 視覚効果（氷が薄くなるエフェクト）
        if (iceBlock.sprite) {
          // 現在のスプライトを保存
          const sprite = iceBlock.sprite;
          
          // 新しいテクスチャを作成（氷Lv1）
          const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(iceBlock.color.replace('#', '0x')));
          const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
          rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // 氷のエフェクト（半透明の白い円）
          const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.5);
          rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // 氷の結晶マーク
          const crystalSize = GameConfig.BLOCK_SIZE / 4;
          const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0xADD8E6);
          rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // テクスチャを更新
          sprite.setTexture(rt.texture as unknown as string);
          
          // 氷が薄くなるエフェクト
          this.tweens.add({
            targets: sprite,
            scale: { from: 0.9, to: 1 },
            alpha: { from: 0.8, to: 1 },
            duration: 200,
            ease: 'Cubic.easeOut'
          });
        }
      }
    });
  }
  
  /**
   * 指定位置の周囲に同色の氷結ブロックがあるか確認し、連鎖的に解除する
   * @param x X座標
   * @param y Y座標
   * @param color ブロックの色
   */
  private checkAdjacentIceBlocks(x: number, y: number, color: string): void {
    // 隣接する4方向をチェック
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }  // 左
    ];
    
    const adjacentIceBlocks: Block[] = [];
    
    directions.forEach(dir => {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      // 範囲外チェック
      if (ny < 0 || ny >= this.blocks.length || nx < 0 || nx >= this.blocks[ny].length) {
        return;
      }
      
      // 氷結ブロックかつ同じ色のブロックをチェック
      const adjacentBlock = this.blocks[ny][nx];
      if (adjacentBlock && 
          (adjacentBlock.type === 'iceLv1' || adjacentBlock.type === 'iceLv2') && 
          adjacentBlock.color === color) {
        adjacentIceBlocks.push(adjacentBlock);
      }
    });
    
    // 見つかった氷結ブロックを処理
    if (adjacentIceBlocks.length > 0) {
      // 氷結ブロックの状態を更新（連鎖的に）
      adjacentIceBlocks.forEach(iceBlock => {
        if (iceBlock.type === 'iceLv1') {
          // 氷結Lv1は解除されて通常ブロックになる
          this.blocks[iceBlock.y][iceBlock.x] = {
            x: iceBlock.x,
            y: iceBlock.y,
            color: iceBlock.color,
            type: 'normal',
            sprite: iceBlock.sprite
          };
          
          // 視覚効果（氷が溶けるエフェクト）
          if (iceBlock.sprite) {
            // 現在のスプライトを保存
            const sprite = iceBlock.sprite;
            
            // 新しいテクスチャを作成（氷なし）
            const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(iceBlock.color.replace('#', '0x')));
            const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
            rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
            
            // テクスチャを更新
            sprite.setTexture(rt.texture as unknown as string);
            
            // 氷が溶けるエフェクト
            this.tweens.add({
              targets: sprite,
              scale: { from: 0.9, to: 1 },
              alpha: { from: 0.8, to: 1 },
              duration: 200,
              ease: 'Cubic.easeOut',
              delay: 100 // 連鎖解除は少し遅延させる
            });
          }
          
          // さらに連鎖的に解除
          this.checkAdjacentIceBlocks(iceBlock.x, iceBlock.y, iceBlock.color);
        } else if (iceBlock.type === 'iceLv2') {
          // 氷結Lv2は氷結Lv1になる
          this.blocks[iceBlock.y][iceBlock.x] = {
            x: iceBlock.x,
            y: iceBlock.y,
            color: iceBlock.color,
            type: 'iceLv1',
            sprite: iceBlock.sprite
          };
          
          // 視覚効果（氷が薄くなるエフェクト）
          if (iceBlock.sprite) {
            // 現在のスプライトを保存
            const sprite = iceBlock.sprite;
            
            // 新しいテクスチャを作成（氷Lv1）
            const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(iceBlock.color.replace('#', '0x')));
            const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
            rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
            
            // 氷のエフェクト（半透明の白い円）
            const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.5);
            rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
            
            // 氷の結晶マーク
            const crystalSize = GameConfig.BLOCK_SIZE / 4;
            const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0xADD8E6);
            rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
            
            // テクスチャを更新
            sprite.setTexture(rt.texture as unknown as string);
            
            // 氷が薄くなるエフェクト
            this.tweens.add({
              targets: sprite,
              scale: { from: 0.9, to: 1 },
              alpha: { from: 0.8, to: 1 },
              duration: 200,
              ease: 'Cubic.easeOut',
              delay: 100 // 連鎖解除は少し遅延させる
            });
          }
        }
      });
    }
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
    const blockLogic = new BlockLogic();
    
    // 論理状態の更新（重力適用）
    let updatedBlocks = blockLogic.applyGravity(this.blocks);
    
    // 空の列を左にスライド
    updatedBlocks = blockLogic.slideColumnsLeft(updatedBlocks);
    
    this.blocks = updatedBlocks;
    
    // デバッグヘルパーにブロック配列を更新
    this.debugHelper.setBlocks(this.blocks);
    
    // 視覚表現を完全に再構築
    this.updateBlockSprites();
  }
  
  /**
   * ブロックの移動をアニメーションで表現する
   */
  private animateBlockMovements(oldPositions: {[key: string]: {x: number, y: number}}): void {
    // 移動が必要なブロックを特定し、アニメーションを適用
    let animationsRunning = 0;
    
    // 各列ごとに処理（下から上に）
    for (let x = 0; x < this.blocks[0].length; x++) {
      // 各列の落下アニメーションを順番に処理
      this.animateColumnMovements(x, oldPositions, () => {
        animationsRunning--;
        if (animationsRunning === 0) {
          // 全ての列のアニメーションが完了したら処理を続行
          this.isProcessing = false;
        }
      });
      animationsRunning++;
    }
    
    // アニメーションがない場合は即座に処理完了
    if (animationsRunning === 0) {
      this.isProcessing = false;
    }
  }
  
  /**
   * 特定の列のブロック移動をアニメーションで表現する
   */
  private animateColumnMovements(column: number, oldPositions: {[key: string]: {x: number, y: number}}, onComplete: () => void): void {
    const columnBlocks: {block: Block, oldY: number, newY: number}[] = [];
    
    // 列内の移動が必要なブロックを特定
    for (let y = 0; y < this.blocks.length; y++) {
      const block = this.blocks[y][column];
      if (block) {
        const oldPos = oldPositions[`${block.x},${block.y}`];
        if (oldPos && (oldPos.y !== block.y || oldPos.x !== block.x)) {
          columnBlocks.push({
            block,
            oldY: oldPos.y,
            newY: y
          });
        } else {
          // 移動していないブロック
          const blockX = this.boardX + column * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          const blockY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          
          // 既存のスプライトがあれば再利用
          if (oldPos && this.blockSprites[oldPos.y][oldPos.x]) {
            const sprite = this.blockSprites[oldPos.y][oldPos.x];
            this.blockSprites[y][column] = sprite;
            this.blockSprites[oldPos.y][oldPos.x] = null;
            
            // ブロックオブジェクトにスプライト参照を設定
            this.blocks[y][column].sprite = sprite;
          } else {
            // 新しいスプライトを作成（通常は発生しないはず）
            this.createBlockSprite(column, y, block);
          }
        }
      }
    }
    
    // 移動が必要なブロックがない場合は即座に完了
    if (columnBlocks.length === 0) {
      onComplete();
      return;
    }
    
    // 移動が必要なブロックを下から順にアニメーション
    let blocksAnimated = 0;
    
    // 下から順にアニメーション（配列を逆順にソート）
    columnBlocks.sort((a, b) => b.newY - a.newY);
    
    // 各ブロックを順番にアニメーション
    columnBlocks.forEach((item, index) => {
      const { block, oldY, newY } = item;
      const oldX = oldPositions[`${block.x},${block.y}`].x;
      
      // 元の位置のスプライトを取得
      const sprite = this.blockSprites[oldY][oldX];
      
      if (sprite) {
        // 新しい位置を計算
        const newPosX = this.boardX + column * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
        const newPosY = this.boardY + newY * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
        
        // 移動距離に応じてアニメーション時間を調整
        const distance = Math.abs(newY - oldY);
        const duration = Math.min(100 + distance * 50, 500); // 距離に応じて時間を増やすが上限あり
        
        // 落下アニメーション（バウンドなし、または小さいバウンド）
        this.tweens.add({
          targets: sprite,
          x: newPosX,
          y: newPosY,
          duration: duration,
          // 最後のブロックのみ小さなバウンド、それ以外はバウンドなし
          ease: index === 0 && distance > 2 ? 'Bounce.easeOut' : 'Cubic.easeIn',
          delay: index * 30, // 下のブロックから順に少しずつ遅延をつける
          onComplete: () => {
            // スプライトを新しい位置に設定
            this.blockSprites[newY][column] = sprite;
            this.blockSprites[oldY][oldX] = null;
            
            // ブロックオブジェクトにスプライト参照を設定
            this.blocks[newY][column].sprite = sprite;
            
            blocksAnimated++;
            if (blocksAnimated === columnBlocks.length) {
              // この列の全てのブロックのアニメーションが完了
              onComplete();
            }
          }
        });
      } else {
        // スプライトがない場合は新しく作成
        this.createBlockSprite(column, newY, block);
        blocksAnimated++;
        if (blocksAnimated === columnBlocks.length) {
          onComplete();
        }
      }
    });
  }
  
  /**
   * 指定位置にブロックスプライトを作成
   */
  private createBlockSprite(x: number, y: number, block: Block): Phaser.GameObjects.Sprite {
    const blockX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    const blockY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
    
    const blockSprite = this.add.sprite(blockX, blockY, '');
    
    // スプライトの代わりに円を描画
    const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(block.color.replace('#', '0x')));
    const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
    rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
    
    // 妨害ブロックの場合は特殊なエフェクトを追加
    if (block.type === 'iceLv1') {
      // 氷結Lv1のエフェクト（薄い半透明の白い円）
      const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.5);
      rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
      
      // 氷の結晶マーク
      const crystalSize = GameConfig.BLOCK_SIZE / 4;
      const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0xADD8E6);
      rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
    } else if (block.type === 'iceLv2') {
      // 氷結Lv2のエフェクト（濃い半透明の白い円）
      const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.7);
      rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
      
      // 氷の結晶マーク（大きめ）
      const crystalSize = GameConfig.BLOCK_SIZE / 3;
      const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0x87CEFA);
      rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
      
      // 雪の結晶マーク（小さめ、複数）
      const smallCrystalSize = GameConfig.BLOCK_SIZE / 6;
      const positions = [
        { x: -GameConfig.BLOCK_SIZE / 4, y: -GameConfig.BLOCK_SIZE / 4 },
        { x: GameConfig.BLOCK_SIZE / 4, y: GameConfig.BLOCK_SIZE / 4 }
      ];
      
      positions.forEach(pos => {
        const smallCrystal = this.add.star(0, 0, 6, smallCrystalSize, smallCrystalSize / 2, 0xFFFFFF);
        rt.draw(smallCrystal, GameConfig.BLOCK_SIZE / 2 + pos.x, GameConfig.BLOCK_SIZE / 2 + pos.y);
      });
    }
    
    blockSprite.setTexture(rt.texture as unknown as string);
    blockSprite.setInteractive({ useHandCursor: true });
    
    this.blockSprites[y][x] = blockSprite;
    
    // ブロックオブジェクトにスプライト参照を追加
    this.blocks[y][x].sprite = blockSprite;
    
    // クリックイベント
    blockSprite.on('pointerdown', () => {
      if (!this.isProcessing) {
        this.onBlockClick(x, y);
      }
    });
    
    return blockSprite;
  }
  
  /**
   * ブロックスプライトを更新する（全て再作成）
   */
  private updateBlockSprites(): void {
    // 既存のスプライトを全て破棄
    for (let y = 0; y < GameConfig.BOARD_HEIGHT; y++) {
      for (let x = 0; x < GameConfig.BOARD_WIDTH; x++) {
        if (this.blockSprites[y][x]) {
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
          const blockX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          const blockY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
          
          const blockSprite = this.add.sprite(blockX, blockY, '');
          
          // スプライトの代わりに円を描画
          const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(block.color.replace('#', '0x')));
          const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
          rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          
          // 妨害ブロックの場合は特殊なエフェクトを追加
          if (block.type === 'iceLv1') {
            // 氷結Lv1のエフェクト（薄い半透明の白い円）
            const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.5);
            rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
            
            // 氷の結晶マーク
            const crystalSize = GameConfig.BLOCK_SIZE / 4;
            const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0xADD8E6);
            rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
          } else if (block.type === 'iceLv2') {
            // 氷結Lv2のエフェクト（濃い半透明の白い円）
            const iceEffect = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2, 0xFFFFFF, 0.7);
            rt.draw(iceEffect, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
            
            // 氷の結晶マーク（大きめ）
            const crystalSize = GameConfig.BLOCK_SIZE / 3;
            const crystal = this.add.star(0, 0, 6, crystalSize, crystalSize / 2, 0x87CEFA);
            rt.draw(crystal, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
            
            // 雪の結晶マーク（小さめ、複数）
            const smallCrystalSize = GameConfig.BLOCK_SIZE / 6;
            const positions = [
              { x: -GameConfig.BLOCK_SIZE / 4, y: -GameConfig.BLOCK_SIZE / 4 },
              { x: GameConfig.BLOCK_SIZE / 4, y: GameConfig.BLOCK_SIZE / 4 }
            ];
            
            positions.forEach(pos => {
              const smallCrystal = this.add.star(0, 0, 6, smallCrystalSize, smallCrystalSize / 2, 0xFFFFFF);
              rt.draw(smallCrystal, GameConfig.BLOCK_SIZE / 2 + pos.x, GameConfig.BLOCK_SIZE / 2 + pos.y);
            });
          }
          
          blockSprite.setTexture(rt.texture as unknown as string);
          blockSprite.setInteractive({ useHandCursor: true });
          
          this.blockSprites[y][x] = blockSprite;
          
          // ブロックオブジェクトにスプライト参照を追加
          this.blocks[y][x].sprite = blockSprite;
          
          // クリックイベント
          blockSprite.on('pointerdown', () => {
            if (!this.isProcessing) {
              this.onBlockClick(x, y);
            }
          });
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
