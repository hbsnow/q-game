import { Scene } from 'phaser';
import { Block, BlockType, BlockColor, GameState } from '@/types';
import { BlockGenerator, AssetGenerator, BlockRemover, GravityProcessor, getConnectedBlocks } from '@/utils';

export class GameScene extends Scene {
  private gameState!: GameState;
  private blockSprites: Phaser.GameObjects.Sprite[][] = [];
  private currentBlocks: Block[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  
  // 盤面設定
  private readonly BOARD_WIDTH = 10;
  private readonly BOARD_HEIGHT = 14;
  private readonly BLOCK_SIZE = 40;
  private readonly BOARD_OFFSET_X = 0;
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
    // 背景色設定（海のテーマ）
    this.cameras.main.setBackgroundColor('#1E5799');

    // UI要素の作成
    this.createUI();

    // ゲーム盤面の初期化
    this.initializeBoard();

    // 入力処理の設定
    this.setupInput();
  }

  private createUI() {
    const { width, height } = this.scale;

    // ヘッダー部分
    const headerBg = this.add.rectangle(width / 2, 37.5, width, 75, 0x2E8B57, 0.8);
    
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
    const footerBg = this.add.rectangle(width / 2, footerY, width, 75, 0x2E8B57, 0.8);

    // アイテムスロット（プレースホルダー）
    const itemSlot1 = this.add.rectangle(50, footerY - 10, 60, 40, 0x7DB9E8, 0.8);
    const itemSlot2 = this.add.rectangle(120, footerY - 10, 60, 40, 0x7DB9E8, 0.8);

    this.add.text(20, footerY - 20, 'Item1', { fontSize: '12px', color: '#FFFFFF' });
    this.add.text(90, footerY - 20, 'Item2', { fontSize: '12px', color: '#FFFFFF' });

    // リタイアボタン
    const retireButton = this.add.rectangle(width - 60, footerY - 10, 100, 40, 0xFF6347, 0.8);
    retireButton.setInteractive();
    retireButton.on('pointerdown', () => {
      this.scene.start('MainScene');
    });

    this.add.text(width - 85, footerY - 20, 'Retire', {
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
    const boardPixelHeight = this.BOARD_HEIGHT * this.BLOCK_SIZE;
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
    this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
      if (gameObject.getData('block')) {
        this.handleBlockClick(gameObject);
      }
    });
  }

  private handleBlockClick(sprite: Phaser.GameObjects.Sprite) {
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
    
    // デバッグ: ブロックデータの整合性をチェック
    this.debugBlockConsistency();
    
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
    
    // ブロック消去処理
    this.removeBlockGroup(connectedGroup.blocks);
  }
  
  private debugBlockConsistency() {
    console.log('=== Block Consistency Check ===');
    console.log('Current blocks count:', this.currentBlocks.length);
    
    // 現在のブロックデータを表示
    console.log('📊 Block data positions:');
    this.currentBlocks.forEach(block => {
      console.log(`  Block ${block.id.substring(0, 8)}: (${block.x}, ${block.y}) - ${block.color}`);
    });
    
    // 盤面の視覚的な状態を表示
    console.log('🎮 Visual board state (sprite array):');
    this.printVisualBoard();
    
    // 論理的な盤面状態を表示
    console.log('💾 Logical board state (block data):');
    this.printLogicalBoard();
    
    // 同期チェック
    const syncResult = this.checkBoardSync();
    
    // スプライト配列の状態をチェック
    let spriteCount = 0;
    let mismatchCount = 0;
    
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        if (this.blockSprites[row] && this.blockSprites[row][col]) {
          spriteCount++;
          const sprite = this.blockSprites[row][col];
          const spriteBlock = sprite.getData('block') as Block;
          const spriteRow = sprite.getData('row') as number;
          const spriteCol = sprite.getData('col') as number;
          
          // データの整合性をチェック
          if (spriteRow !== row || spriteCol !== col) {
            console.error(`❌ Sprite position mismatch at [${row}][${col}]: sprite data says (${spriteRow}, ${spriteCol})`);
            mismatchCount++;
          }
          
          // 対応するブロックデータが存在するかチェック
          const matchingBlock = this.currentBlocks.find(b => b.id === spriteBlock.id);
          if (!matchingBlock) {
            console.error(`❌ Sprite at [${row}][${col}] has no matching block data: ${spriteBlock.id}`);
            mismatchCount++;
          } else if (matchingBlock.x !== col || matchingBlock.y !== row) {
            console.error(`❌ Block data position mismatch: sprite at [${row}][${col}], block at (${matchingBlock.x}, ${matchingBlock.y})`);
            mismatchCount++;
          }
        }
      }
    }
    
    console.log(`📈 Summary: ${spriteCount} sprites, ${mismatchCount} mismatches`);
    console.log(`🔍 Board Sync Status: ${syncResult.isSync ? '✅ SYNCHRONIZED' : '❌ DESYNCHRONIZED'}`);
    
    if (!syncResult.isSync) {
      console.error(`❌ BOARD SYNC ERROR: Found ${syncResult.mismatches} position mismatches!`);
    }
    
    console.log('================================');
  }
  
  private printVisualBoard() {
    const board: string[][] = Array(this.BOARD_HEIGHT).fill(null).map(() => 
      Array(this.BOARD_WIDTH).fill('.')
    );
    
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        if (this.blockSprites[row] && this.blockSprites[row][col]) {
          const sprite = this.blockSprites[row][col];
          const block = sprite.getData('block') as Block;
          board[row][col] = this.getColorSymbol(block.color);
        }
      }
    }
    
    board.forEach((row, i) => {
      console.log(`  ${i.toString().padStart(2)}: ${row.join(' ')}`);
    });
  }
  
  private printLogicalBoard() {
    const board: string[][] = Array(this.BOARD_HEIGHT).fill(null).map(() => 
      Array(this.BOARD_WIDTH).fill('.')
    );
    
    this.currentBlocks.forEach(block => {
      if (block.y >= 0 && block.y < this.BOARD_HEIGHT && 
          block.x >= 0 && block.x < this.BOARD_WIDTH) {
        board[block.y][block.x] = this.getColorSymbol(block.color);
      }
    });
    
    board.forEach((row, i) => {
      console.log(`  ${i.toString().padStart(2)}: ${row.join(' ')}`);
    });
  }
  
  private getColorSymbol(color: BlockColor): string {
    switch (color) {
      case 'blue': return 'B';
      case 'lightBlue': return 'L';
      case 'seaGreen': return 'G';
      case 'coralRed': return 'C';
      case 'sandGold': return 'S';
      case 'pearlWhite': return 'W';
      default: return '?';
    }
  }
  
  private checkBoardSync(): { isSync: boolean; mismatches: number } {
    let mismatches = 0;
    
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        const hasSprite = this.blockSprites[row] && this.blockSprites[row][col];
        const hasBlock = this.currentBlocks.some(b => b.x === col && b.y === row);
        
        if (hasSprite && !hasBlock) {
          console.error(`❌ Sync Error [${row}][${col}]: Has sprite but no block data`);
          mismatches++;
        } else if (!hasSprite && hasBlock) {
          console.error(`❌ Sync Error [${row}][${col}]: Has block data but no sprite`);
          mismatches++;
        } else if (hasSprite && hasBlock) {
          const sprite = this.blockSprites[row][col];
          const spriteBlock = sprite.getData('block') as Block;
          const logicalBlock = this.currentBlocks.find(b => b.x === col && b.y === row);
          
          if (spriteBlock.color !== logicalBlock!.color) {
            console.error(`❌ Sync Error [${row}][${col}]: Color mismatch - Sprite: ${spriteBlock.color}, Logical: ${logicalBlock!.color}`);
            mismatches++;
          }
        }
      }
    }
    
    return { isSync: mismatches === 0, mismatches };
  }
  
  private printVisualBoard() {
    const board: string[][] = Array(this.BOARD_HEIGHT).fill(null).map(() => 
      Array(this.BOARD_WIDTH).fill('.')
    );
    
    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        if (this.blockSprites[row] && this.blockSprites[row][col]) {
          const sprite = this.blockSprites[row][col];
          const block = sprite.getData('block') as Block;
          board[row][col] = block.color.charAt(0).toUpperCase();
        }
      }
    }
    
    board.forEach((row, i) => {
      console.log(`  ${i.toString().padStart(2)}: ${row.join(' ')}`);
    });
  }
  
  private printLogicalBoard() {
    const board: string[][] = Array(this.BOARD_HEIGHT).fill(null).map(() => 
      Array(this.BOARD_WIDTH).fill('.')
    );
    
    this.currentBlocks.forEach(block => {
      if (block.y >= 0 && block.y < this.BOARD_HEIGHT && 
          block.x >= 0 && block.x < this.BOARD_WIDTH) {
        board[block.y][block.x] = block.color.charAt(0).toUpperCase();
      }
    });
    
    board.forEach((row, i) => {
      console.log(`  ${i.toString().padStart(2)}: ${row.join(' ')}`);
    });
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
    
    // ステージクリア判定
    this.checkStageComplete();
    
    // 行き詰まり判定
    this.checkGameOver();
  }
  
  private updateScoreDisplay() {
    this.scoreText.setText(`Score: ${this.gameState.score}`);
    
    // 目標達成時の色変更
    if (this.gameState.score >= this.gameState.targetScore) {
      this.targetText.setColor('#00FF00'); // 緑色に変更
    }
  }
  
  private async playRemovalAnimation(blocksToRemove: Block[]): Promise<void> {
    return new Promise((resolve) => {
      const sprites = blocksToRemove.map(block => this.blockSprites[block.y][block.x]).filter(Boolean);
      
      if (sprites.length === 0) {
        resolve();
        return;
      }
      
      // 消去アニメーション（拡大→フェードアウト）
      this.tweens.add({
        targets: sprites,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0,
        duration: 300,
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
      
      const animations: Promise<void>[] = [];
      
      // 位置計算用の定数
      const boardPixelWidth = this.BOARD_WIDTH * this.BLOCK_SIZE;
      const startX = (this.scale.width - boardPixelWidth) / 2;
      const startY = this.BOARD_OFFSET_Y;
      
      movements.forEach(movement => {
        const sprite = this.blockSprites[movement.from.y][movement.from.x];
        if (sprite) {
          // 落下アニメーション（最終位置は rebuildSpriteBlockMapping で設定される）
          const targetY = startY + movement.to.y * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
          
          const animPromise = new Promise<void>((animResolve) => {
            this.tweens.add({
              targets: sprite,
              y: targetY,
              duration: 300,
              ease: 'Bounce.easeOut',
              onComplete: () => {
                animResolve();
              }
            });
          });
          
          animations.push(animPromise);
        }
      });
      
      Promise.all(animations).then(() => {
        resolve();
      });
    });
  }
  
  /**
   * スプライトとブロックデータの対応関係を完全に再構築
   */
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
    
    // デバッグ情報を出力
    if (process.env.NODE_ENV === 'development') {
      this.debugBlockConsistency();
    }
  }
  
  private checkStageComplete() {
    if (this.gameState.score >= this.gameState.targetScore) {
      console.log('Stage completed!');
      // リザルト画面への遷移（Phase 3で実装予定）
      setTimeout(() => {
        alert(`Stage ${this.gameState.currentStage} Clear!\nScore: ${this.gameState.score}`);
        this.scene.start('MainScene');
      }, 1000);
    }
  }
  
  private checkGameOver() {
    // 消去可能なブロックがあるかチェック
    const hasRemovableBlocks = this.currentBlocks.some(block => {
      if (block.type !== 'normal') return false;
      const group = getConnectedBlocks(block, this.currentBlocks);
      return group.count >= 2;
    });
    
    if (!hasRemovableBlocks && this.gameState.score < this.gameState.targetScore) {
      console.log('Game over - no removable blocks');
      setTimeout(() => {
        alert(`Game Over!\nScore: ${this.gameState.score}\nTarget: ${this.gameState.targetScore}`);
        this.scene.start('MainScene');
      }, 1000);
    }
  }

  update() {
    // ゲームループ処理（必要に応じて実装）
  }
}
