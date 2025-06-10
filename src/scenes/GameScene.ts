import { Scene } from 'phaser';
import { Block, BlockColor, GameState } from '@/types';
import { BlockGenerator, AssetGenerator, BlockRemover, GravityProcessor, getConnectedBlocks } from '@/utils';
import { GameStateManager } from '../utils/GameStateManager';
import { ItemManager } from '../utils/ItemManager';
import { ItemEffectManager } from '../utils/ItemEffectManager';
import { ObstacleBlockManager } from '../utils/ObstacleBlockManager';
import { ObstacleBlockRenderer } from '../utils/ObstacleBlockRenderer';

export class GameScene extends Scene {
  private gameStateManager!: GameStateManager;
  private gameState!: GameState;
  private blockSprites: Phaser.GameObjects.Sprite[][] = [];
  private currentBlocks: Block[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  private retireButton!: Phaser.GameObjects.Rectangle;
  private retireButtonText!: Phaser.GameObjects.Text;
  private isProcessing: boolean = false; // 処理中フラグを追加
  
  // アイテム関連
  private itemManager!: ItemManager;
  private itemEffectManager!: ItemEffectManager;
  private itemButtons: Phaser.GameObjects.Container[] = [];
  private isItemSelectionMode: boolean = false;
  private selectedItemType: string | null = null;
  private selectedItemSlotIndex: number | null = null;
  
  // 妨害ブロック関連
  private obstacleBlockManager!: ObstacleBlockManager;
  private obstacleBlockRenderer!: ObstacleBlockRenderer;
  private blockContainer!: Phaser.GameObjects.Container;
  
  // デバッグライン管理
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private debugVisible = true; // 初期表示ON
  
  // 盤面設定
  private readonly BOARD_WIDTH = 10;
  private readonly BOARD_HEIGHT = 14;
  private readonly BLOCK_SIZE = 40;
  private readonly BOARD_OFFSET_Y = 75;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: any) {
    // GameStateManagerを受け取る
    this.gameStateManager = data.gameStateManager || GameStateManager.getInstance();
    this.gameState = this.gameStateManager.getGameState();
    
    // ItemManagerとItemEffectManagerを初期化
    this.itemManager = this.gameStateManager.getItemManager();
    this.itemEffectManager = new ItemEffectManager(this);
    
    console.log('GameScene initialized with GameStateManager:', this.gameStateManager);
    console.log('Current stage:', this.gameState.currentStage);
    console.log('Equipped items:', this.gameState.equipSlots);
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
    // 🏷️ 画面名をコンソールに表示
    console.log('🎬 === GAME SCENE ===');
    console.log('📍 Current Scene: ゲーム画面');
    console.log('🎯 Purpose: メインゲームプレイ画面');
    console.log('🎮 Stage:', this.gameState.currentStage);
    console.log('🎯 Target Score:', this.gameState.targetScore);
    console.log('📊 Current Score:', this.gameState.score);
    
    // ステージ設定を取得
    const stageManager = this.gameStateManager.getStageManager();
    const stageConfig = stageManager.getStageConfig(this.gameState.currentStage);
    console.log('🎮 Stage Config:', stageConfig);
    
    // デバッグショートカットキーを設定
    this.setupDebugShortcut();
    
    // UI作成
    this.createUI();
    
    // 盤面初期化
    this.initializeBoard();
    
    // 入力設定
    this.setupInput();
    
    // デバッグライン追加
    this.addDebugLines();
  }

  private createUI() {
    const { width, height } = this.cameras.main;

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

    // アイテムスロット（実際の装備アイテムを表示）
    this.createItemButtons(footerY);

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

  private createItemButtons(footerY: number) {
    const equipSlots = this.gameState.equipSlots;
    
    // 特殊枠アイテム（左側）
    this.createItemButton(equipSlots[0], 50, footerY - 10, 0);
    
    // 通常枠アイテム（右側）
    this.createItemButton(equipSlots[1], 120, footerY - 10, 1);
  }

  private createItemButton(equipSlot: any, x: number, y: number, slotIndex: number) {
    const container = this.add.container(x, y);
    
    // 背景
    const bg = this.add.rectangle(0, 0, 60, 40, 0x7DB9E8, 0.8);
    bg.setStrokeStyle(2, 0xFFFFFF, 0.6);
    
    let itemText: Phaser.GameObjects.Text;
    
    if (equipSlot.item && !equipSlot.used) {
      // アイテムが装備されており、未使用の場合
      itemText = this.add.text(0, 0, equipSlot.item.name, {
        fontSize: '10px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // クリック可能にする
      container.setSize(60, 40);
      container.setInteractive();
      container.on('pointerdown', () => {
        this.useItem(slotIndex);
      });
      
      // ホバー効果
      container.on('pointerover', () => {
        bg.setFillStyle(0x87CEEB, 1.0);
      });
      container.on('pointerout', () => {
        bg.setFillStyle(0x7DB9E8, 0.8);
      });
      
    } else if (equipSlot.item && equipSlot.used) {
      // アイテムが装備されているが、使用済みの場合
      itemText = this.add.text(0, 0, equipSlot.item.name, {
        fontSize: '10px',
        color: '#888888',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // グレーアウト
      bg.setFillStyle(0x555555, 0.5);
      
      // 使用済みマーク
      const usedMark = this.add.text(20, -15, '✓', {
        fontSize: '12px',
        color: '#00FF00'
      });
      container.add(usedMark);
      
    } else {
      // アイテムが装備されていない場合
      itemText = this.add.text(0, 0, '未装備', {
        fontSize: '10px',
        color: '#CCCCCC'
      }).setOrigin(0.5);
    }
    
    container.add([bg, itemText]);
    this.itemButtons.push(container);
  }

  private initializeBoard() {
    // ステージ管理システムからステージ設定を取得
    const stageManager = this.gameStateManager.getStageManager();
    const stageConfig = stageManager.getStageConfig(this.gameState.currentStage);

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

    // ブロックコンテナを作成（全てのブロックスプライトの親）
    this.blockContainer = this.add.container(0, 0);
    
    // 妨害ブロック管理システムを初期化
    this.obstacleBlockManager = new ObstacleBlockManager(this.currentBlocks);
    this.obstacleBlockRenderer = new ObstacleBlockRenderer(this, this.obstacleBlockManager);

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
      this.blockContainer.add(sprite);
    });
    
    // 妨害ブロックを描画
    this.obstacleBlockRenderer.renderObstacleBlocks(this.currentBlocks, this.blockContainer);
  }

  private getBlockTexture(block: Block): string {
    if (block.type === 'normal') {
      // AssetGeneratorで生成されたテクスチャキーを使用
      return `block-normal-${block.color}`;
    }
    
    // 妨害ブロックの場合は通常ブロックのテクスチャを使用
    // 実際の描画はObstacleBlockRendererが担当
    return `block-normal-${block.color}`;
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
        // 消去可能なグループの場合、全体を拡大＋脈動エフェクト
        connectedGroup.blocks.forEach(block => {
          const blockSprite = this.blockSprites[block.y][block.x];
          if (blockSprite) {
            // 拡大
            blockSprite.setScale(1.15);
            // 脈動エフェクト
            this.tweens.add({
              targets: blockSprite,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 600,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        });
      } else {
        // 消去不可能な場合、点滅エフェクト
        this.tweens.add({
          targets: sprite,
          alpha: 0.3,
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
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
          sprite.setScale(1.0); // スケールリセット
          sprite.setAlpha(1.0); // 透明度リセット
          // 全てのアニメーションを停止
          this.tweens.killTweensOf(sprite);
        }
      }
    }
  }

  private handleBlockClick(sprite: Phaser.GameObjects.Sprite) {
    // アイテム選択モードの場合は、処理中フラグに関わらずブロック選択を許可
    if (this.isItemSelectionMode) {
      const row = sprite.getData('row') as number;
      const col = sprite.getData('col') as number;
      const actualBlock = this.currentBlocks.find(b => b.x === col && b.y === row);
      
      if (actualBlock) {
        // ItemEffectManagerにブロック選択を委譲
        const handled = this.itemEffectManager.handleBlockSelection(actualBlock, sprite);
        if (handled) {
          return;
        }
        
        // 従来のアイテムターゲット選択処理（互換性のため残す）
        this.handleItemTargetSelection(actualBlock);
      }
      return;
    }
    
    // 通常モードでは処理中の場合は無視
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
    
    // 妨害ブロックの場合は特別な処理
    if (actualBlock.type !== 'normal') {
      // 消去可能な妨害ブロックかチェック
      const removableIds = this.obstacleBlockManager.getRemovableObstacleBlocks(this.currentBlocks);
      if (removableIds.includes(actualBlock.id)) {
        console.log('Removable obstacle block clicked:', actualBlock.type);
        this.handleRemovableObstacleBlock(actualBlock);
        return;
      }
      
      console.log('Non-removable obstacle block clicked, ignoring');
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

  private async handleItemTargetSelection(block: Block) {
    if (!this.selectedItemType || this.selectedItemSlotIndex === null) {
      return;
    }
    
    // 選択可能なブロックかチェック
    if (!this.isBlockSelectableForItem(block, this.selectedItemType)) {
      console.log(`Block type ${block.type} is not selectable for item ${this.selectedItemType}`);
      return;
    }
    
    console.log(`Using ${this.selectedItemType} on block:`, block);
    
    // アイテム効果を実行
    let success = false;
    
    try {
      switch (this.selectedItemType) {
        case 'miniBomb':
          success = await this.itemEffectManager.executeItemEffect('miniBomb', block);
          break;
        case 'swap':
          // スワップは2つのブロックを選択する必要がある（簡易実装）
          // 実際には1つ目のブロックを選択→2つ目のブロックを選択の2段階が必要
          const randomBlock = this.getRandomDifferentBlock(block);
          if (randomBlock) {
            success = await this.itemEffectManager.executeItemEffect('swap', block, randomBlock);
          }
          break;
        case 'changeOne':
          // 色選択UIが必要（簡易実装）
          const randomColor = this.getRandomDifferentColor(block.color);
          success = await this.itemEffectManager.executeItemEffect('changeOne', block, randomColor);
          break;
      }
    } catch (error) {
      console.error(`Error executing item effect ${this.selectedItemType}:`, error);
      success = false;
    }
    
    // 選択モードを終了
    this.exitTargetSelectionMode();
    
    // 処理中フラグを解除
    this.setProcessingState(false);
    
    if (success) {
      console.log(`✅ Item ${this.selectedItemType} used successfully`);
      // 盤面を更新
      this.redrawBoard();
    } else {
      console.log(`❌ Failed to use item ${this.selectedItemType}`);
    }
  }

  private getRandomDifferentBlock(excludeBlock: Block): Block | null {
    // 選択可能なブロックをフィルタリング
    const selectableBlocks = this.currentBlocks.filter(block => 
      block.id !== excludeBlock.id && 
      block.type !== 'rock' && 
      block.type !== 'steel'
    );
    
    if (selectableBlocks.length === 0) {
      return null;
    }
    
    // ランダムに1つ選択
    return selectableBlocks[Math.floor(Math.random() * selectableBlocks.length)];
  }

  private getRandomDifferentColor(excludeColor: BlockColor): BlockColor {
    const colors: BlockColor[] = ['blue', 'lightBlue', 'seaGreen', 'coralRed', 'sandGold', 'pearlWhite'];
    const availableColors = colors.filter(color => color !== excludeColor);
    return availableColors[Math.floor(Math.random() * availableColors.length)];
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
    
    // スコア更新（GameStateManagerにも反映）
    this.gameState.score += removalResult.scoreResult.finalScore;
    this.gameStateManager.setScore(this.gameState.score);
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
    
    // 妨害ブロックの状態を更新
    this.currentBlocks = this.obstacleBlockManager.updateObstacleBlocks(
      removalResult.removedBlocks, 
      this.currentBlocks
    );
    
    // 妨害ブロックの描画を更新
    this.obstacleBlockRenderer.updateObstacleBlocks(this.currentBlocks, this.blockContainer);
    
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
      
      // ブロックIDごとに移動をグループ化
      const blockMovements = new Map<string, {
        blockId: string;
        from: { x: number; y: number };
        to: { x: number; y: number };
        hasVertical: boolean;
        hasHorizontal: boolean;
      }>();
      
      // 移動データを統合
      movements.forEach(movement => {
        const existing = blockMovements.get(movement.blockId);
        if (existing) {
          // 既存の移動データを更新
          if (movement.from.y !== movement.to.y) {
            existing.to.y = movement.to.y;
            existing.hasVertical = true;
          }
          if (movement.from.x !== movement.to.x) {
            existing.to.x = movement.to.x;
            existing.hasHorizontal = true;
          }
        } else {
          // 新しい移動データを作成
          blockMovements.set(movement.blockId, {
            blockId: movement.blockId,
            from: { x: movement.from.x, y: movement.from.y },
            to: { x: movement.to.x, y: movement.to.y },
            hasVertical: movement.from.y !== movement.to.y,
            hasHorizontal: movement.from.x !== movement.to.x
          });
        }
      });
      
      const consolidatedMovements = Array.from(blockMovements.values());
      const verticalMovements = consolidatedMovements.filter(m => m.hasVertical);
      const horizontalOnlyMovements = consolidatedMovements.filter(m => m.hasHorizontal && !m.hasVertical);
      
      // 横スライドが必要かどうかを判定
      const hasHorizontalMovement = consolidatedMovements.some(m => m.hasHorizontal);
      
      // ステップ1: 垂直移動（落下）を実行
      const verticalAnimations = verticalMovements.map(movement => {
        const sprite = this.blockSprites[movement.from.y][movement.from.x];
        if (sprite) {
          const targetY = startY + movement.to.y * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
          
          return new Promise<void>((animResolve) => {
            this.tweens.add({
              targets: sprite,
              y: targetY,
              // 横スライドがある場合は落下を高速化
              duration: hasHorizontalMovement ? 100 : 150,
              ease: 'Power2.easeOut',
              onComplete: () => {
                animResolve();
              }
            });
          });
        }
        return Promise.resolve();
      });
      
      // 垂直移動が完全に完了してから水平移動を開始
      Promise.all(verticalAnimations).then(() => {
        // 水平移動が必要なブロック（垂直移動したものと水平のみのもの）
        const horizontalMovements = consolidatedMovements.filter(m => m.hasHorizontal);
        
        if (horizontalMovements.length === 0) {
          // 水平移動がない場合はそのまま完了
          resolve();
          return;
        }
        
        // 水平移動を実行
        const horizontalAnimations = horizontalMovements.map(movement => {
          const sprite = this.blockSprites[movement.from.y][movement.from.x];
          if (sprite) {
            const targetX = startX + movement.to.x * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
            
            return new Promise<void>((animResolve) => {
              this.tweens.add({
                targets: sprite,
                x: targetX,
                duration: 180,
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
    
    // ブロックコンテナをクリア（スプライトは破棄せずに保持）
    this.blockContainer.removeAll(false);
    
    // 位置計算用の定数
    const boardPixelWidth = this.BOARD_WIDTH * this.BLOCK_SIZE;
    const startX = (this.scale.width - boardPixelWidth) / 2;
    const startY = this.BOARD_OFFSET_Y;
    
    // 現在のブロックデータに基づいて再配置
    this.currentBlocks.forEach(block => {
      const sprite = spriteMap.get(block.id);
      if (sprite && !sprite.destroyed) {
        try {
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
          
          // ブロックコンテナに追加
          this.blockContainer.add(sprite);
        } catch (error) {
          console.error(`Error updating sprite for block ${block.id}:`, error);
        }
      }
    });
    
    try {
      // 妨害ブロックの描画を更新
      if (this.blockContainer && this.blockContainer.scene && this.blockContainer.scene.sys) {
        this.obstacleBlockRenderer.renderObstacleBlocks(this.currentBlocks, this.blockContainer);
      } else {
        console.error('Invalid blockContainer when updating obstacle blocks');
      }
    } catch (error) {
      console.error('Error rendering obstacle blocks:', error);
    }
    
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

  private useItem(slotIndex: number) {
    // 処理中の場合は無視
    if (this.isProcessing) {
      console.log('🚫 Processing in progress, ignoring item use');
      return;
    }

    const itemManager = this.gameStateManager.getItemManager();
    const equipSlots = itemManager.getEquipSlots();
    const equipSlot = equipSlots[slotIndex];

    if (!equipSlot.item || equipSlot.used) {
      console.log('❌ No item equipped or already used');
      return;
    }

    console.log(`🎒 Using item: ${equipSlot.item.name} from slot ${slotIndex}`);

    // アイテムを使用済みにマーク
    const success = itemManager.useEquippedItem(slotIndex as 0 | 1);
    
    if (success) {
      // アイテム効果を実行
      this.executeItemEffect(equipSlot.item.type);
      
      // ゲーム状態を更新
      this.gameState = this.gameStateManager.getGameState();
      
      // アイテムボタンの表示を更新
      this.updateItemButtons();
      
      console.log(`✅ Item ${equipSlot.item.name} used successfully`);
    } else {
      console.log(`❌ Failed to use item ${equipSlot.item.name}`);
    }
  }

  private async executeItemEffect(itemType: string) {
    // 処理中フラグを設定
    this.setProcessingState(true);
    
    try {
      switch (itemType) {
        case 'swap':
        case 'changeOne':
        case 'miniBomb':
          // 対象選択が必要なアイテムは新しいAPIを使用
          this.isItemSelectionMode = true; // アイテム選択モードを有効化
          this.itemEffectManager.executeItemEffect(itemType).then(success => {
            if (!success) {
              // 選択モードに入らなかった場合は処理中フラグとアイテム選択モードを解除
              this.isItemSelectionMode = false;
              this.setProcessingState(false);
            }
          });
          break;
          
        case 'shuffle':
          // シャッフルは即時実行
          const shuffleSuccess = await this.itemEffectManager.executeItemEffect('shuffle');
          if (shuffleSuccess) {
            this.redrawBoard();
          }
          this.setProcessingState(false);
          break;
          
        case 'scoreBooster':
          // スコアブースターは即時実行
          this.executeScoreBoosterEffect();
          this.setProcessingState(false);
          break;
          
        default:
          console.log(`⚠️ Item effect not implemented: ${itemType}`);
          this.setProcessingState(false);
          break;
      }
    } catch (error) {
      console.error(`Error executing item effect ${itemType}:`, error);
      this.isItemSelectionMode = false;
      this.setProcessingState(false);
    }
  }

  private executeShuffleEffect() {
    console.log('🔀 Executing shuffle effect');
    // 通常ブロックのみをシャッフル
    const normalBlocks = this.currentBlocks.filter(block => block.type === 'normal');
    const positions = normalBlocks.map(block => ({ x: block.x, y: block.y }));
    
    // 位置をシャッフル
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // 新しい位置を適用
    normalBlocks.forEach((block, index) => {
      block.x = positions[index].x;
      block.y = positions[index].y;
    });
    
    // 盤面を再描画
    this.redrawBoard();
  }

  private executeMiniBoombEffect() {
    console.log('💣 Mini bomb effect - Click a block to destroy it');
    // ミニ爆弾は対象選択が必要なので、選択モードに入る
    this.enterTargetSelectionMode('miniBomb');
  }

  private executeScoreBoosterEffect() {
    console.log('⚡ Executing score booster effect');
    this.gameStateManager.activateScoreBooster();
    
    // 視覚的フィードバック
    const { width } = this.cameras.main;
    const boosterText = this.add.text(width / 2, 200, 'スコアブースター発動！\n獲得スコア1.5倍', {
      fontSize: '20px',
      color: '#FFD700',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    // 2秒後にテキストを消す
    this.time.delayedCall(2000, () => {
      boosterText.destroy();
    });
  }

  private enterTargetSelectionMode(itemType: string) {
    // 対象選択モードに入る
    this.isItemSelectionMode = true;
    this.selectedItemType = itemType;
    
    // 現在選択中のアイテムスロットを記録
    const equipSlots = this.itemManager.getEquipSlots();
    this.selectedItemSlotIndex = equipSlots[0].item?.type === itemType ? 0 : 1;
    
    console.log(`🎯 Enter target selection mode for ${itemType}`);
    
    // 選択モード表示
    const { width } = this.cameras.main;
    const selectionText = this.add.text(width / 2, 50, `${this.getItemNameByType(itemType)}：対象を選択`, {
      fontSize: '18px',
      color: '#FFFF00',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // キャンセルボタン
    const cancelButton = this.add.rectangle(width - 60, 50, 100, 30, 0xFF6347, 0.8);
    const cancelText = this.add.text(width - 85, 42, 'キャンセル', {
      fontSize: '14px',
      color: '#FFFFFF'
    });
    
    cancelButton.setInteractive();
    cancelButton.on('pointerdown', () => {
      // 選択モードをキャンセル
      this.exitTargetSelectionMode();
      // テキストとボタンを削除
      selectionText.destroy();
      cancelButton.destroy();
      cancelText.destroy();
      // 処理中フラグを解除
      this.setProcessingState(false);
    });
    
    // ブロックのホバー効果を強調
    this.currentBlocks.forEach(block => {
      const sprite = this.blockSprites[block.y][block.x];
      if (sprite) {
        // アイテムタイプに応じて選択可能なブロックを強調
        if (this.isBlockSelectableForItem(block, itemType)) {
          sprite.setTint(0x00FFFF);
        } else {
          sprite.setAlpha(0.5);
        }
      }
    });
  }

  private exitTargetSelectionMode() {
    // 選択モードを終了
    this.isItemSelectionMode = false;
    this.selectedItemType = null;
    this.selectedItemSlotIndex = null;
    
    // ブロックの表示を元に戻す
    this.currentBlocks.forEach(block => {
      const sprite = this.blockSprites[block.y][block.x];
      if (sprite) {
        sprite.clearTint();
        sprite.setAlpha(1.0);
      }
    });
  }

  private isBlockSelectableForItem(block: Block, itemType: string): boolean {
    switch (itemType) {
      case 'miniBomb':
        // ミニ爆弾は通常ブロックのみ選択可能
        return block.type === 'normal';
      case 'swap':
      case 'changeOne':
        // スワップとチェンジワンは岩ブロックと鋼鉄ブロック以外選択可能
        return block.type !== 'rock' && block.type !== 'steel';
      default:
        return false;
    }
  }

  private getItemNameByType(itemType: string): string {
    const itemNames: Record<string, string> = {
      'swap': 'スワップ',
      'changeOne': 'チェンジワン',
      'miniBomb': 'ミニ爆弾',
      'shuffle': 'シャッフル',
      'meltingAgent': '溶解剤',
      'changeArea': 'チェンジエリア',
      'counterReset': 'カウンター+リセット',
      'bomb': '爆弾',
      'addPlus': 'アドプラス',
      'scoreBooster': 'スコアブースター',
      'hammer': 'ハンマー',
      'steelHammer': '鋼鉄ハンマー',
      'specialHammer': 'スペシャルハンマー'
    };
    
    return itemNames[itemType] || itemType;
  }

  private updateItemButtons() {
    // 既存のアイテムボタンを削除
    this.itemButtons.forEach(button => button.destroy());
    this.itemButtons = [];
    
    // 新しいアイテムボタンを作成
    const { height } = this.cameras.main;
    const footerY = height - 37.5;
    this.createItemButtons(footerY);
  }

  private redrawBoard() {
    // 既存のスプライトを削除
    this.blockSprites.forEach(row => {
      row.forEach(sprite => {
        if (sprite) sprite.destroy();
      });
    });
    
    // ブロックコンテナをクリア
    this.blockContainer.removeAll(true);
    
    // 新しいスプライトを作成
    this.createBlockSprites();
    
    // 妨害ブロックを描画
    this.obstacleBlockRenderer.renderObstacleBlocks(this.currentBlocks, this.blockContainer);
  }

  private createBlockSprites() {
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
      this.blockContainer.add(sprite);
    });
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
      this.scene.start('MainScene', {
        gameStateManager: this.gameStateManager
      });
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
      this.gameStateManager.setScore(this.gameState.score);
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
    try {
      // ステージクリア処理
      this.gameStateManager.onStageClear();
      
      this.scene.start('ResultScene', {
        gameStateManager: this.gameStateManager,
        isAllClear: isAllClear
      });
    } catch (error) {
      console.error('Error in goToResultScene:', error);
      // フォールバック：メイン画面に戻る
      this.scene.start('MainScene', {
        gameStateManager: this.gameStateManager
      });
    }
  }

  private checkAllClear(): boolean {
    // 消去可能ブロック：通常ブロック、氷結ブロック、カウンターブロック、カウンター+ブロック
    // 消去不可能ブロック：岩ブロック、鋼鉄ブロック（全消し条件に含まれない）
    
    const removableBlocks = this.currentBlocks.filter(block => {
      // 消去可能なブロックタイプかどうかをチェック
      return block.type === 'normal' || 
             block.type === 'ice1' || 
             block.type === 'ice2' || 
             block.type === 'counter' || 
             block.type === 'counterPlus' ||
             block.type === 'iceCounter' ||
             block.type === 'iceCounterPlus';
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
        // ステージクリア処理（行き詰まりでもゴールドは獲得）
        this.gameStateManager.onStageClear();
        
        this.scene.start('ResultScene', {
          gameStateManager: this.gameStateManager,
          isAllClear: false
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
    const { width, height } = this.cameras.main;
    
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

  private setupDebugShortcut() {
    // Dキーでデバッグライン切り替え
    this.input.keyboard?.on('keydown-D', (event: KeyboardEvent) => {
      if (event.shiftKey) {
        // Shift+D: 詳細デバッグ情報出力
        this.logDetailedDebugInfo();
      } else {
        // D: デバッグライン切り替え
        this.toggleDebugLines();
      }
    });
    
    console.log('🔧 [GAME SCENE] Debug shortcut setup:');
    console.log('  - Press "D" to toggle debug lines');
    console.log('  - Press "Shift+D" to log detailed debug info');
  }

  private toggleDebugLines() {
    this.debugVisible = !this.debugVisible;
    
    // 全てのデバッグ要素の表示/非表示を切り替え
    this.debugElements.forEach(element => {
      element.setVisible(this.debugVisible);
    });
    
    console.log(`🔧 [GAME SCENE] Debug lines ${this.debugVisible ? 'SHOWN' : 'HIDDEN'} (Press D to toggle)`);
  }

  private addDebugLines() {
    const { width, height } = this.cameras.main;
    console.log('🔧 [GAME SCENE] Adding debug rectangles for area visualization...');
    
    // ヘッダーエリア（Y=0-75）- 赤色
    const headerRect = this.add.rectangle(width / 2, 37.5, width - 4, 71, 0x000000, 0)
      .setStrokeStyle(3, 0xFF0000);
    const headerText = this.add.text(10, 5, 'ヘッダーエリア Y=0-75', {
      fontSize: '12px',
      color: '#FF0000',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(headerRect, headerText);
    
    // ゲーム盤面エリア（Y=75-635）- 緑色
    const boardRect = this.add.rectangle(width / 2, 355, width - 4, 556, 0x000000, 0)
      .setStrokeStyle(4, 0x00FF00);
    const boardText = this.add.text(10, 80, 'ゲーム盤面エリア Y=75-635', {
      fontSize: '12px',
      color: '#00FF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(boardRect, boardText);
    
    // アイテム・ボタンエリア（Y=635-710）- 青色
    const buttonRect = this.add.rectangle(width / 2, 672.5, width - 4, 71, 0x000000, 0)
      .setStrokeStyle(3, 0x0000FF);
    const buttonText = this.add.text(10, 640, 'アイテム・ボタンエリア Y=635-710', {
      fontSize: '12px',
      color: '#0000FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(buttonRect, buttonText);
    
    console.log('🔧 [GAME SCENE] Debug elements count:', this.debugElements.length);
  }

  private logDetailedDebugInfo() {
    const { width, height } = this.cameras.main;
    console.log('🔍 === DETAILED DEBUG INFO [GAME SCENE] ===');
    console.log('📍 Current Screen:', {
      sceneName: 'GameScene',
      displayName: 'ゲーム画面',
      purpose: 'メインゲームプレイ画面',
      sceneKey: this.scene.key,
      isActive: this.scene.isActive(),
      isPaused: this.scene.isPaused(),
      isVisible: this.scene.isVisible()
    });
    console.log('📱 Screen Info:', {
      width: width,
      height: height,
      devicePixelRatio: window.devicePixelRatio
    });
    console.log('🎮 Game State:', {
      currentStage: this.gameState.currentStage,
      score: this.gameState.score,
      targetScore: this.gameState.targetScore,
      isProcessing: this.isProcessing
    });
    console.log('🎯 Board Info:', {
      boardWidth: this.BOARD_WIDTH,
      boardHeight: this.BOARD_HEIGHT,
      blockSize: this.BLOCK_SIZE,
      boardOffsetY: this.BOARD_OFFSET_Y,
      totalBlocks: this.currentBlocks.length
    });
    console.log('🧩 Current Blocks:', {
      totalCount: this.currentBlocks.length,
      blocksByColor: this.currentBlocks.reduce((acc, block) => {
        acc[block.color] = (acc[block.color] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      blocksByType: this.currentBlocks.reduce((acc, block) => {
        acc[block.type] = (acc[block.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });
    console.log('🎨 Sprites Info:', {
      spriteRows: this.blockSprites.length,
      totalSprites: this.blockSprites.flat().filter(s => s).length
    });
    console.log('🎨 Debug Elements:', {
      count: this.debugElements.length,
      visible: this.debugVisible
    });
    console.log('🔧 Performance:', {
      fps: this.game.loop.actualFps.toFixed(1),
      delta: this.game.loop.delta
    });
    console.log('=== END DEBUG INFO ===');
  }

  /**
   * ブロック位置の更新（スワップ用）
   */
  updateBlockPositions(block1: Block, block2: Block): void {
    console.log(`GameScene.updateBlockPositions: Updating block positions in currentBlocks array`);
    
    // ブロックの位置を更新
    const index1 = this.currentBlocks.findIndex(b => b.id === block1.id);
    const index2 = this.currentBlocks.findIndex(b => b.id === block2.id);
    
    if (index1 !== -1 && index2 !== -1) {
      console.log(`Found blocks at indices ${index1} and ${index2}`);
      this.currentBlocks[index1] = block1;
      this.currentBlocks[index2] = block2;
      console.log('Block positions updated in currentBlocks array');
    } else {
      console.error('Failed to find blocks in currentBlocks array:', {
        block1Id: block1.id,
        block2Id: block2.id,
        index1,
        index2,
        totalBlocks: this.currentBlocks.length
      });
    }
  }

  /**
   * ブロック色の更新（チェンジワン用）
   */
  async updateBlockColor(block: Block, oldColor: BlockColor, newColor: BlockColor): Promise<void> {
    console.log(`GameScene.updateBlockColor: Updating block color from ${oldColor} to ${newColor}`);
    
    // ブロックの色を更新
    const index = this.currentBlocks.findIndex(b => b.id === block.id);
    if (index !== -1) {
      this.currentBlocks[index].color = newColor;
      console.log('Block data updated in currentBlocks array');
      
      // スプライトの色も更新
      const sprite = this.blockSprites[block.y][block.x];
      if (sprite) {
        console.log('Found sprite to update:', sprite);
        
        // 色変更アニメーション
        return new Promise<void>((resolve) => {
          // 一旦フェードアウト
          this.tweens.add({
            targets: sprite,
            alpha: 0.3,
            duration: 150,
            onComplete: () => {
              console.log('Fade out complete, changing texture');
              // テクスチャ変更
              sprite.setTexture(this.getBlockTexture({ ...block, color: newColor }));
              
              // フェードイン
              this.tweens.add({
                targets: sprite,
                alpha: 1,
                duration: 150,
                onComplete: () => {
                  console.log('Color change animation complete');
                  resolve();
                }
              });
            }
          });
        });
      } else {
        console.error('No sprite found at position:', { x: block.x, y: block.y });
      }
    } else {
      console.error('Block not found in currentBlocks array:', block);
    }
    
    return Promise.resolve();
  }

  /**
   * ブロック消去（ミニ爆弾用）
   */
  async removeBlock(block: Block, addScore: boolean = true): Promise<void> {
    // ブロックを消去
    const index = this.currentBlocks.findIndex(b => b.id === block.id);
    if (index !== -1) {
      // ブロックデータから削除
      this.currentBlocks.splice(index, 1);
      
      // スプライトを消去
      const sprite = this.blockSprites[block.y][block.x];
      if (sprite) {
        // 消去アニメーション
        return new Promise<void>((resolve) => {
          this.tweens.add({
            targets: sprite,
            scaleX: 0.1,
            scaleY: 0.1,
            alpha: 0,
            duration: 200,
            onComplete: () => {
              sprite.destroy();
              this.blockSprites[block.y][block.x] = null as any;
              
              // スコア加算（オプション）
              if (addScore) {
                this.gameState.score += 1; // 1ブロックなので1点
                this.gameStateManager.setScore(this.gameState.score);
                this.updateScoreDisplay();
              }
              resolve();
            }
          });
        });
      }
    }
    
    return Promise.resolve();
  }

  /**
   * シャッフル後の盤面更新
   */
  async updateAfterShuffle(blocks: Block[]): Promise<void> {
    // 盤面を再描画
    this.redrawBoard();
    
    // シャッフルアニメーション
    return new Promise<void>((resolve) => {
      // 全ブロックを一旦透明に
      const sprites = this.blockSprites.flat().filter(Boolean);
      
      // フェードアウト
      this.tweens.add({
        targets: sprites,
        alpha: 0.3,
        duration: 200,
        onComplete: () => {
          // フェードイン
          this.tweens.add({
            targets: sprites,
            alpha: 1,
            duration: 200,
            onComplete: () => {
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   * スワップアニメーション
   */
  async animateSwap(block1: Block, block2: Block): Promise<void> {
    console.log(`GameScene.animateSwap: Animating swap between blocks at (${block1.x},${block1.y}) and (${block2.x},${block2.y})`);
    
    const sprite1 = this.blockSprites[block2.y][block2.x]; // 注意: 位置が既に入れ替わっているため
    const sprite2 = this.blockSprites[block1.y][block1.x]; // 注意: 位置が既に入れ替わっているため
    
    if (!sprite1 || !sprite2) {
      console.error('Cannot animate swap: sprites not found', {
        sprite1: !!sprite1,
        sprite2: !!sprite2,
        block1: `(${block1.x},${block1.y})`,
        block2: `(${block2.x},${block2.y})`
      });
      return Promise.resolve();
    }
    
    // スプライトの位置を入れ替え
    return new Promise<void>((resolve) => {
      const pos1 = { x: sprite1.x, y: sprite1.y };
      const pos2 = { x: sprite2.x, y: sprite2.y };
      
      console.log('Starting swap animation with positions:', {
        pos1: `(${pos1.x},${pos1.y})`,
        pos2: `(${pos2.x},${pos2.y})`
      });
      
      // 同時にアニメーション
      this.tweens.add({
        targets: sprite1,
        x: pos2.x,
        y: pos2.y,
        duration: 300,
        ease: 'Power2'
      });
      
      this.tweens.add({
        targets: sprite2,
        x: pos1.x,
        y: pos1.y,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // スプライト配列も更新
          this.blockSprites[block1.y][block1.x] = sprite1;
          this.blockSprites[block2.y][block2.x] = sprite2;
          
          // スプライトのデータも更新
          sprite1.setData('block', block1);
          sprite1.setData('row', block1.y);
          sprite1.setData('col', block1.x);
          
          sprite2.setData('block', block2);
          sprite2.setData('row', block2.y);
          sprite2.setData('col', block2.x);
          
          console.log('Swap animation completed');
          resolve();
        }
      });
    });
  }

  /**
   * 通常ブロックのみを取得
   */
  getNormalBlocks(): Block[] {
    return this.currentBlocks.filter(block => block.type === 'normal');
  }
  
  /**
   * 消去可能な妨害ブロックの処理
   */
  private async handleRemovableObstacleBlock(block: Block) {
    console.log('Processing removable obstacle block:', block);
    
    // 処理開始フラグを設定
    this.setProcessingState(true);
    
    try {
      // 消去対象のブロックを配列に格納
      const blocksToRemove = [block];
      
      // 視覚的な消去エフェクト
      await this.playRemovalAnimation(blocksToRemove);
      
      // 消去されたブロックのスプライトを削除
      const sprite = this.blockSprites[block.y][block.x];
      if (sprite) {
        sprite.destroy();
        this.blockSprites[block.y][block.x] = null as any;
      }
      
      // ブロックデータを更新（消去後）
      this.currentBlocks = this.currentBlocks.filter(b => b.id !== block.id);
      
      // 妨害ブロックマネージャーからも削除
      this.obstacleBlockManager.removeObstacleBlock(block.id);
      
      // 重力処理
      await this.applyGravity();
      
      // ステージクリア判定（UI更新のみ）
      this.checkStageComplete();
      
      // 行き詰まり判定
      this.checkGameOver();
    } finally {
      // 処理完了後にフラグをリセット
      this.setProcessingState(false);
    }
  }

  /**
   * アイテム選択モードを終了
   * ItemEffectManagerから呼び出される
   */
  exitItemSelectionMode(): void {
    this.isItemSelectionMode = false;
    this.setProcessingState(false);
    console.log('🔄 Exiting item selection mode');
  }

  /**
   * 重力処理を適用（ミニ爆弾用）
   */
  async applyGravityAfterRemoval(): Promise<void> {
    console.log('Applying gravity after block removal');
    return this.applyGravity();
  }
}
