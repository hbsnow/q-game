import { Scene } from 'phaser';
import { Block, BlockColor, GameState } from '@/types';
import { BlockGenerator, AssetGenerator, BlockRemover, GravityProcessor, getConnectedBlocks } from '@/utils';

export class GameScene extends Scene {
  private gameState!: GameState;
  private blockSprites: Phaser.GameObjects.Sprite[][] = [];
  private currentBlocks: Block[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  private retireButton!: Phaser.GameObjects.Rectangle;
  private retireButtonText!: Phaser.GameObjects.Text;
  private isProcessing: boolean = false; // 処理中フラグを追加
  
  // 盤面設定
  private readonly BOARD_WIDTH = 10;
  private readonly BOARD_HEIGHT = 14;
  private readonly BLOCK_SIZE = 40;
  private readonly BOARD_OFFSET_Y = 75;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { stage: number; equippedItems: string[] }) {
    // ゲーム状態の初期化
    this.gameState = {
      currentStage: data.stage || 1,
      score: 0,
      targetScore: 500,
      gold: 0,
      items: [],
      equipSlots: [
        { type: 'special', item: null, used: false },
        { type: 'normal', item: null, used: false }
      ],
      isScoreBoosterActive: false
    };
  }

  preload() {
    // 必要なブロックテクスチャを事前生成
    this.generateBlockTextures();
  }

  private generateBlockTextures() {
    // 基本色のブロックテクスチャを生成
    const colors: BlockColor[] = ['blue', 'lightBlue', 'seaGreen', 'coralRed', 'sandGold', 'pearlWhite'];
    
    colors.forEach(color => {
      AssetGenerator.generateBlockTexture(this, color, 'normal', this.BLOCK_SIZE);
    });
  }

  create() {
    // UI作成
    this.createUI();
    
    // 盤面初期化
    this.initializeBoard();
    
    // 入力設定
    this.setupInput();
  }

  private createUI() {
    const { width, height } = this.scale;

    // ヘッダー部分
    this.add.rectangle(width / 2, 37.5, width, 75, 0x2E8B57, 0.8);
    
    // ステージ情報
    this.add.text(10, 10, `Stage ${this.gameState.currentStage}`, {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });

    // スコア表示（更新可能にするため参照を保存）
    this.scoreText = this.add.text(10, 35, `Score: ${this.gameState.score}`, {
      fontSize: '16px',
      color: '#FFFFFF'
    });

    // 目標スコア表示（更新可能にするため参照を保存）
    this.targetText = this.add.text(width - 150, 10, `Target: ${this.gameState.targetScore}`, {
      fontSize: '16px',
      color: '#FFFFFF'
    });

    // フッター部分
    const footerY = height - 37.5;
    this.add.rectangle(width / 2, footerY, width, 75, 0x2E8B57, 0.8);

    // アイテムスロット（プレースホルダー）
    this.add.rectangle(50, footerY - 10, 60, 40, 0x7DB9E8, 0.8);
    this.add.rectangle(120, footerY - 10, 60, 40, 0x7DB9E8, 0.8);

    this.add.text(20, footerY - 20, 'Item1', { fontSize: '12px', color: '#FFFFFF' });
    this.add.text(90, footerY - 20, 'Item2', { fontSize: '12px', color: '#FFFFFF' });

    // リタイア/クリアボタン（状態に応じて変化）
    this.retireButton = this.add.rectangle(width - 60, footerY - 10, 100, 40, 0xFF6347, 0.8);
    this.retireButton.setInteractive();
    this.retireButton.on('pointerdown', () => {
      this.handleRetireOrClearButton();
    });

    this.retireButtonText = this.add.text(width - 85, footerY - 20, 'Retire', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
  }

  private initializeBoard() {
    // ステージ設定（Phase 1で実装したBlockGeneratorを使用）
    const stageConfig = {
      stage: this.gameState.currentStage,
      colors: Math.min(3 + Math.floor(this.gameState.currentStage / 3), 6),
      targetScore: 500,
      obstacles: []
    };

    // ブロック配置生成（静的メソッドを使用）
    this.currentBlocks = BlockGenerator.generateStageBlocks(stageConfig);

    // 盤面の中央配置計算
    const boardPixelWidth = this.BOARD_WIDTH * this.BLOCK_SIZE;
    const startX = (this.scale.width - boardPixelWidth) / 2;
    const startY = this.BOARD_OFFSET_Y;

    // ブロックスプライトの初期化
    this.blockSprites = [];
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      this.blockSprites[row] = [];
    }

    // ブロック配列からスプライトを作成
    this.currentBlocks.forEach(block => {
      const x = startX + block.x * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
      const y = startY + block.y * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
      
      const sprite = this.add.sprite(x, y, this.getBlockTexture(block));
      sprite.setDisplaySize(this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2); // 少し隙間を作る
      sprite.setInteractive();
      
      // ブロックデータを保存
      sprite.setData('block', block);
      sprite.setData('row', block.y);
      sprite.setData('col', block.x);
      
      this.blockSprites[block.y][block.x] = sprite;
    });
  }

  private getBlockTexture(block: Block): string {
    if (block.type === 'normal') {
      // AssetGeneratorで生成されたテクスチャキーを使用
      return `block-normal-${block.color}`;
    }
    
    // 妨害ブロックの場合（Phase 7で実装予定）
    return 'block-normal-blue'; // デフォルト
  }

  private setupInput() {
    // ブロックのクリック/タップ処理
    this.input.on('gameobjectdown', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
      if (gameObject.getData('block')) {
        this.handleBlockClick(gameObject);
      }
    });

    // ホバー処理（マウス/タッチ）
    this.input.on('gameobjectover', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
      if (gameObject.getData('block')) {
        this.handleBlockHover(gameObject, true);
      }
    });

    this.input.on('gameobjectout', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
      if (gameObject.getData('block')) {
        this.handleBlockHover(gameObject, false);
      }
    });
  }

  private handleBlockHover(sprite: Phaser.GameObjects.Sprite, isHovering: boolean) {
    // 処理中は無視
    if (this.isProcessing) {
      return;
    }

    const row = sprite.getData('row') as number;
    const col = sprite.getData('col') as number;
    
    // スプライトの位置に基づいて実際のブロックデータを取得
    const actualBlock = this.currentBlocks.find(b => b.x === col && b.y === row);
    
    if (!actualBlock || actualBlock.type !== 'normal') {
      return;
    }

    if (isHovering) {
      // ホバー開始：連結グループをハイライト
      const connectedGroup = getConnectedBlocks(actualBlock, this.currentBlocks);
      
      if (connectedGroup.count >= 2) {
        // 消去可能なグループの場合、全体をハイライト
        connectedGroup.blocks.forEach(block => {
          const blockSprite = this.blockSprites[block.y][block.x];
          if (blockSprite) {
            blockSprite.setTint(0xFFFFAA); // 薄い黄色でハイライト
            blockSprite.setScale(1.05); // 少し拡大
          }
        });
      } else {
        // 消去不可能な場合、薄い赤色でハイライト
        sprite.setTint(0xFFAAAA);
      }
    } else {
      // ホバー終了：全てのハイライトを解除
      this.clearAllHighlights();
    }
  }

  private clearAllHighlights() {
    // 全スプライトのハイライトを解除
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        const sprite = this.blockSprites[row][col];
        if (sprite) {
          sprite.clearTint();
          sprite.setScale(1.0);
        }
      }
    }
  }

  private handleBlockClick(sprite: Phaser.GameObjects.Sprite) {
    // 処理中の場合は無視
    if (this.isProcessing) {
      console.log('🚫 Processing in progress, ignoring click');
      return;
    }

    // ハイライトをクリア
    this.clearAllHighlights();

    const row = sprite.getData('row') as number;
    const col = sprite.getData('col') as number;

    console.log(`🎯 Clicked sprite at visual position [${row}][${col}]`);
    
    // スプライトの位置に基づいて実際のブロックデータを取得
    const actualBlock = this.currentBlocks.find(b => b.x === col && b.y === row);
    
    if (!actualBlock) {
      console.log('❌ No block found at clicked position');
      return;
    }
    
    console.log(`📦 Found block at position:`, actualBlock);
    
    // 通常ブロック以外はクリック無効
    if (actualBlock.type !== 'normal') {
      console.log('Non-normal block clicked, ignoring');
      return;
    }
    
    // 連結ブロックグループを取得（実際のブロックデータを使用）
    const connectedGroup = getConnectedBlocks(actualBlock, this.currentBlocks);
    
    // 2個未満の場合は消去不可
    if (connectedGroup.count < 2) {
      console.log('Group too small, cannot remove');
      this.showInvalidClickFeedback(sprite);
      return;
    }
    
    console.log(`Removing group of ${connectedGroup.count} blocks`);
    
    // 処理開始フラグを設定
    this.setProcessingState(true);
    
    // ブロック消去処理（非同期）
    this.removeBlockGroup(connectedGroup.blocks).finally(() => {
      // 処理完了後にフラグをリセット
      this.setProcessingState(false);
    });
  }

  /**
   * 処理状態を設定し、UI要素の有効/無効を切り替える
   */
  private setProcessingState(processing: boolean) {
    this.isProcessing = processing;
    
    // ボタンの有効/無効を切り替え
    if (processing) {
      this.retireButton.setAlpha(0.5);
      this.retireButtonText.setAlpha(0.5);
    } else {
      this.retireButton.setAlpha(1.0);
      this.retireButtonText.setAlpha(1.0);
    }
  }

  private showInvalidClickFeedback(sprite: Phaser.GameObjects.Sprite) {
    // 無効クリック時の視覚フィードバック（赤い点滅）
    this.tweens.add({
      targets: sprite,
      tint: 0xFF0000,
      duration: 100,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        sprite.clearTint();
      }
    });
  }

  private async removeBlockGroup(blocksToRemove: Block[]) {
    // Phase 1のBlockRemoverを使用してブロック消去とスコア計算
    const firstBlock = blocksToRemove[0];
    const removalResult = BlockRemover.removeBlockGroup(
      firstBlock,
      this.currentBlocks,
      this.gameState.isScoreBoosterActive
    );
    
    // スコア更新
    this.gameState.score += removalResult.scoreResult.finalScore;
    this.updateScoreDisplay();
    
    // 視覚的な消去エフェクト
    await this.playRemovalAnimation(removalResult.removedBlocks);
    
    // 消去されたブロックのスプライトを削除
    removalResult.removedBlocks.forEach(block => {
      const sprite = this.blockSprites[block.y][block.x];
      if (sprite) {
        sprite.destroy();
        this.blockSprites[block.y][block.x] = null as any;
      }
    });
    
    // ブロックデータを更新（消去後）
    this.currentBlocks = removalResult.remainingBlocks;
    
    // 重力処理
    await this.applyGravity();
    
    // ステージクリア判定（UI更新のみ）
    this.checkStageComplete();
    
    // 行き詰まり判定
    this.checkGameOver();
  }

  private updateScoreDisplay() {
    const oldScore = parseInt(this.scoreText.text.replace('Score: ', '')) || 0;
    const newScore = this.gameState.score;
    
    // スコアアニメーション
    if (newScore > oldScore) {
      this.animateScoreUpdate(oldScore, newScore);
    } else {
      this.scoreText.setText(`Score: ${newScore}`);
    }
    
    // 目標達成時の色変更とエフェクト
    if (this.gameState.score >= this.gameState.targetScore) {
      this.targetText.setColor('#00FF00'); // 緑色に変更
      
      // 目標達成エフェクト（初回のみ）
      if (!this.targetText.getData('achieved')) {
        this.targetText.setData('achieved', true);
        this.showTargetAchievedEffect();
      }
    }
  }

  private animateScoreUpdate(fromScore: number, toScore: number) {
    const duration = Math.min(800, Math.max(300, (toScore - fromScore) * 10)); // スコア差に応じて調整
    
    // 数値カウントアップアニメーション
    this.tweens.addCounter({
      from: fromScore,
      to: toScore,
      duration: duration,
      ease: 'Power2',
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue() || 0);
        this.scoreText.setText(`Score: ${value}`);
      },
      onComplete: () => {
        this.scoreText.setText(`Score: ${toScore}`);
      }
    });
    
    // スコアテキストの拡大・縮小エフェクト
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  private showTargetAchievedEffect() {
    // 目標テキストの点滅エフェクト
    this.tweens.add({
      targets: this.targetText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 5,
      ease: 'Power2'
    });
    
    // 目標達成メッセージ
    const { width } = this.scale;
    const achievedText = this.add.text(width / 2, 50, '目標達成！', {
      fontSize: '20px',
      color: '#00FF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // クリア可能メッセージ
    const clearHintText = this.add.text(width / 2, 75, 'クリアボタンを押してステージ終了', {
      fontSize: '14px',
      color: '#FFFF00'
    }).setOrigin(0.5);
    
    // メッセージアニメーション
    this.tweens.add({
      targets: [achievedText, clearHintText],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        // フェードアウト
        this.tweens.add({
          targets: [achievedText, clearHintText],
          alpha: 0,
          duration: 2000,
          delay: 2000,
          onComplete: () => {
            achievedText.destroy();
            clearHintText.destroy();
          }
        });
      }
    });
  }

  private async playRemovalAnimation(blocksToRemove: Block[]): Promise<void> {
    return new Promise((resolve) => {
      const sprites = blocksToRemove.map(block => this.blockSprites[block.y][block.x]).filter(Boolean);
      
      if (sprites.length === 0) {
        resolve();
        return;
      }
      
      // 消去アニメーション（拡大→フェードアウト）- 高速化
      this.tweens.add({
        targets: sprites,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0,
        duration: 200, // 300ms → 200ms に短縮
        ease: 'Power2',
        onComplete: () => {
          resolve();
        }
      });
      
      // スコア表示アニメーション
      this.showScorePopup(blocksToRemove);
    });
  }

  private showScorePopup(blocksToRemove: Block[]) {
    if (blocksToRemove.length === 0) return;
    
    // 正しいスコア計算（ブロック数の二乗）
    const score = blocksToRemove.length * blocksToRemove.length;
    const firstBlock = blocksToRemove[0];
    const sprite = this.blockSprites[firstBlock.y][firstBlock.x];
    
    if (!sprite) return;
    
    // スコアポップアップテキスト
    const scoreText = this.add.text(sprite.x, sprite.y, `+${score}`, {
      fontSize: '16px',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // ポップアップアニメーション
    this.tweens.add({
      targets: scoreText,
      y: sprite.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  private async applyGravity(): Promise<void> {
    // Phase 1のGravityProcessorを使用
    const gravityResult = GravityProcessor.applyGravity(this.currentBlocks);
    
    if (gravityResult.movements.length === 0) {
      return; // 移動するブロックがない
    }
    
    // 重力処理後のブロックデータで完全に置き換え
    this.currentBlocks = gravityResult.blocks;
    
    // アニメーション実行
    await this.executeGravityAnimations(gravityResult.movements);
    
    // アニメーション完了後、スプライトとブロックデータを完全に再同期
    this.rebuildSpriteBlockMapping();
  }

  private async executeGravityAnimations(movements: any[]): Promise<void> {
    return new Promise((resolve) => {
      if (movements.length === 0) {
        resolve();
        return;
      }
      
      // 位置計算用の定数
      const boardPixelWidth = this.BOARD_WIDTH * this.BLOCK_SIZE;
      const startX = (this.scale.width - boardPixelWidth) / 2;
      const startY = this.BOARD_OFFSET_Y;
      
      // 垂直移動と水平移動を分離
      const verticalMovements = movements.filter(m => m.from.y !== m.to.y);
      const horizontalMovements = movements.filter(m => m.from.x !== m.to.x);
      
      // ステップ1: 垂直移動（落下）を先に実行 - さらに高速化
      const verticalAnimations = verticalMovements.map(movement => {
        const sprite = this.blockSprites[movement.from.y][movement.from.x];
        if (sprite) {
          const targetY = startY + movement.to.y * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
          
          return new Promise<void>((animResolve) => {
            this.tweens.add({
              targets: sprite,
              y: targetY,
              duration: 150, // 200ms → 150ms にさらに短縮
              ease: 'Power2.easeOut',
              onComplete: () => {
                animResolve();
              }
            });
          });
        }
        return Promise.resolve();
      });
      
      // 垂直移動完了後に水平移動を実行
      Promise.all(verticalAnimations).then(() => {
        // 間隔をさらに短縮
        this.time.delayedCall(20, () => { // 30ms → 20ms に短縮
          const horizontalAnimations = horizontalMovements.map(movement => {
            const sprite = this.blockSprites[movement.from.y][movement.from.x];
            if (sprite) {
              const targetX = startX + movement.to.x * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
              
              return new Promise<void>((animResolve) => {
                this.tweens.add({
                  targets: sprite,
                  x: targetX,
                  duration: 180, // 250ms → 180ms に短縮
                  ease: 'Power2.easeOut',
                  onComplete: () => {
                    animResolve();
                  }
                });
              });
            }
            return Promise.resolve();
          });
          
          Promise.all(horizontalAnimations).then(() => {
            resolve();
          });
        });
      });
    });
  }

  private rebuildSpriteBlockMapping() {
    console.log('🔄 Rebuilding sprite-block mapping...');
    
    // 既存のスプライトを一時的に保存（ブロックIDをキーとして）
    const spriteMap = new Map<string, Phaser.GameObjects.Sprite>();
    
    // 全てのスプライトを収集してマップに保存
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        if (this.blockSprites[row] && this.blockSprites[row][col]) {
          const sprite = this.blockSprites[row][col];
          const oldBlock = sprite.getData('block') as Block;
          if (oldBlock) {
            spriteMap.set(oldBlock.id, sprite);
          }
        }
      }
    }
    
    // スプライト配列を完全にクリア
    this.blockSprites = [];
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      this.blockSprites[row] = [];
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        this.blockSprites[row][col] = null as any;
      }
    }
    
    // 位置計算用の定数
    const boardPixelWidth = this.BOARD_WIDTH * this.BLOCK_SIZE;
    const startX = (this.scale.width - boardPixelWidth) / 2;
    const startY = this.BOARD_OFFSET_Y;
    
    // 現在のブロックデータに基づいて再配置
    this.currentBlocks.forEach(block => {
      const sprite = spriteMap.get(block.id);
      if (sprite) {
        // 正しい位置に配置
        this.blockSprites[block.y][block.x] = sprite;
        
        // スプライトの物理的位置を更新
        const newX = startX + block.x * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
        const newY = startY + block.y * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
        sprite.setPosition(newX, newY);
        
        // スプライトデータを最新のブロックデータで更新
        sprite.setData('block', block);
        sprite.setData('row', block.y);
        sprite.setData('col', block.x);
      }
    });
    
    console.log('✅ Sprite-block mapping rebuilt successfully');
    console.log(`📊 Mapped ${this.currentBlocks.length} blocks to sprites`);
  }

  /**
   * ステージクリア判定（UI更新のみ）
   */
  private checkStageComplete() {
    if (this.gameState.score >= this.gameState.targetScore) {
      console.log('Target score achieved! Player can now clear the stage.');
      this.updateRetireButtonToClear();
    }
  }

  /**
   * リタイアボタンをクリアボタンに変更
   */
  private updateRetireButtonToClear() {
    // ボタンの色を緑に変更
    this.retireButton.setFillStyle(0x4CAF50, 0.8);
    
    // テキストを「クリア」に変更
    this.retireButtonText.setText('Clear');
    
    // ボタンの位置を調整（テキストが短くなるため）
    this.retireButtonText.setX(this.retireButton.x - 15);
  }
  private handleRetireOrClearButton() {
    // 処理中の場合は無視
    if (this.isProcessing) {
      console.log('🚫 Processing in progress, ignoring button click');
      return;
    }

    if (this.gameState.score >= this.gameState.targetScore) {
      // 目標達成時：クリア処理
      this.handleStageComplete();
    } else {
      // 目標未達成時：リタイア処理
      this.scene.start('MainScene');
    }
  }

  /**
   * ステージクリア処理（手動クリア時）
   */
  private handleStageComplete() {
    // 全消し判定
    const isAllClear = this.checkAllClear();
    
    // 全消しボーナス適用
    if (isAllClear) {
      const bonusScore = Math.floor(this.gameState.score * 0.5); // 1.5倍 - 1 = 0.5倍のボーナス
      this.gameState.score += bonusScore;
      this.updateScoreDisplay();
      
      console.log(`All Clear Bonus! +${bonusScore} points`);
      
      // 全消しボーナス表示
      this.showAllClearBonus(bonusScore);
      
      // ボーナス表示後にリザルト画面へ
      setTimeout(() => {
        this.goToResultScene(isAllClear);
      }, 2000);
    } else {
      // 通常クリア：即座にリザルト画面へ
      this.goToResultScene(isAllClear);
    }
  }

  /**
   * リザルト画面への遷移
   */
  private goToResultScene(isAllClear: boolean) {
    this.scene.start('ResultScene', {
      stage: this.gameState.currentStage,
      score: this.gameState.score,
      targetScore: this.gameState.targetScore,
      isAllClear: isAllClear,
      gold: this.gameState.score // スコア = ゴールド
    });
  }

  private checkAllClear(): boolean {
    // 消去可能ブロック：通常ブロック、氷結ブロック、カウンターブロック、カウンター+ブロック
    // 消去不可能ブロック：岩ブロック、鋼鉄ブロック（全消し条件に含まれない）
    
    const removableBlocks = this.currentBlocks.filter(block => {
      // Phase 1では通常ブロックのみ実装されているため、通常ブロックのみをチェック
      // Phase 7で妨害ブロック実装時に条件を拡張
      return block.type === 'normal';
    });
    
    // 消去可能ブロックが全て消去されている場合は全消し
    const isAllClear = removableBlocks.length === 0;
    
    console.log(`🎯 All Clear Check: ${removableBlocks.length} removable blocks remaining`);
    console.log(`🏆 All Clear Status: ${isAllClear ? 'ACHIEVED' : 'NOT ACHIEVED'}`);
    
    return isAllClear;
  }

  private showAllClearBonus(bonusScore: number) {
    // 画面中央に大きく表示
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    
    // 全消しテキスト
    const allClearText = this.add.text(centerX, centerY - 50, '全消しボーナス！', {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // ボーナススコアテキスト
    const bonusText = this.add.text(centerX, centerY + 10, `+${bonusScore}`, {
      fontSize: '24px',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // アニメーション効果
    this.tweens.add({
      targets: [allClearText, bonusText],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // フェードアウト
        this.tweens.add({
          targets: [allClearText, bonusText],
          alpha: 0,
          duration: 500,
          onComplete: () => {
            allClearText.destroy();
            bonusText.destroy();
          }
        });
      }
    });
  }

  private checkGameOver() {
    // 消去可能なブロックがあるかチェック
    const removableGroups = this.findRemovableGroups();
    
    if (removableGroups.length === 0 && this.gameState.score < this.gameState.targetScore) {
      console.log('Game over - no removable blocks');
      console.log(`📊 Final Score: ${this.gameState.score}/${this.gameState.targetScore}`);
      
      // 行き詰まり状態の詳細情報を表示
      this.showGameOverInfo();
      
      setTimeout(() => {
        this.scene.start('ResultScene', {
          stage: this.gameState.currentStage,
          score: this.gameState.score,
          targetScore: this.gameState.targetScore,
          isAllClear: false,
          gold: this.gameState.score
        });
      }, 2000);
    } else if (removableGroups.length > 0) {
      console.log(`✅ Game continues: ${removableGroups.length} removable groups found`);
    }
  }

  private findRemovableGroups(): Block[][] {
    const removableGroups: Block[][] = [];
    const checkedBlocks = new Set<string>();
    
    this.currentBlocks.forEach(block => {
      if (checkedBlocks.has(block.id) || block.type !== 'normal') {
        return;
      }
      
      const group = getConnectedBlocks(block, this.currentBlocks);
      if (group.count >= 2) {
        removableGroups.push(group.blocks);
        // このグループの全ブロックをチェック済みに追加
        group.blocks.forEach(b => checkedBlocks.add(b.id));
      } else {
        checkedBlocks.add(block.id);
      }
    });
    
    return removableGroups;
  }

  private showGameOverInfo() {
    const { width, height } = this.scale;
    
    // 半透明オーバーレイ
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // ゲームオーバーテキスト
    const gameOverText = this.add.text(width / 2, height / 2 - 80, '行き詰まり', {
      fontSize: '28px',
      color: '#FF6347',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 詳細情報
    const infoText = this.add.text(width / 2, height / 2 - 20, 
      `消去可能なブロックがありません\n\nスコア: ${this.gameState.score}\n目標: ${this.gameState.targetScore}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5);
    
    // アニメーション効果
    this.tweens.add({
      targets: [gameOverText, infoText],
      alpha: { from: 0, to: 1 },
      duration: 500
    });
  }

  update() {
    // ゲームループ処理（必要に応じて実装）
  }
}
