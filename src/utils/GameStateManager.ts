import { GameState, Item, EquipSlot } from '../types';
import { ItemManager } from './ItemManager';
import { mockItems } from '../data/mockItems';

/**
 * ゲーム状態管理クラス
 * シングルトンパターンで実装
 */
export class GameStateManager {
  private static instance: GameStateManager;
  private gameState: GameState;
  private itemManager: ItemManager;

  private constructor() {
    // 初期ゲーム状態
    this.gameState = {
      currentStage: 1,
      gold: 0,
      score: 0,
      targetScore: 500,
      items: [],
      equipSlots: [
        { type: 'special', item: null, used: false },
        { type: 'normal', item: null, used: false }
      ],
      isScoreBoosterActive: false
    };

    // アイテム管理システムを初期化
    this.itemManager = new ItemManager();
    
    // 開発用：モックアイテムを追加
    this.initializeWithMockItems();
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * ゲーム状態を取得
   */
  public getGameState(): GameState {
    // 最新のアイテム情報と装備状態を反映
    this.gameState.items = this.itemManager.getAllItems();
    this.gameState.equipSlots = this.itemManager.getEquipSlots();
    
    return this.gameState;
  }

  /**
   * アイテム管理システムを取得
   */
  public getItemManager(): ItemManager {
    return this.itemManager;
  }

  /**
   * スコアを設定
   */
  public setScore(score: number): void {
    this.gameState.score = score;
  }

  /**
   * ステージをクリアした時の処理
   */
  public onStageClear(): void {
    // ゴールドを獲得（スコアと同じ量）
    this.gameState.gold += this.gameState.score;
    
    // アイテム使用状態をリセット
    this.itemManager.onStageEnd();
    
    // スコアブースター状態をリセット
    this.gameState.isScoreBoosterActive = false;
    
    console.log(`Stage ${this.gameState.currentStage} cleared! Gold: ${this.gameState.gold}`);
  }

  /**
   * 次のステージに進む
   */
  public goToNextStage(): void {
    // 現在のステージをクリア
    this.gameState.currentStage++;
    
    // スコアをリセット
    this.gameState.score = 0;
    
    console.log(`Advanced to stage ${this.gameState.currentStage}`);
  }

  /**
   * 現在のステージをリトライ
   */
  public retryCurrentStage(): void {
    // スコアをリセット
    this.gameState.score = 0;
    
    console.log(`Retrying stage ${this.gameState.currentStage}`);
  }

  /**
   * スコアブースターを有効化
   */
  public activateScoreBooster(): void {
    this.gameState.isScoreBoosterActive = true;
    console.log('Score booster activated!');
  }

  /**
   * 開発用：モックアイテムを追加
   */
  private initializeWithMockItems(): void {
    // モックアイテムを追加
    mockItems.forEach(item => {
      this.itemManager.addItem(item.type, item.count);
    });
    
    // 開発用：デフォルトで装備
    this.itemManager.equipItem('bomb', 0);
    this.itemManager.equipItem('swap', 1);
    
    console.log('Initialized with mock items');
  }

  /**
   * デバッグ用：ゲーム状態をコンソール出力
   */
  public debugLog(): void {
    console.log('=== GameStateManager Debug Info ===');
    console.log('Stage:', this.gameState.currentStage);
    console.log('Score:', this.gameState.score);
    console.log('Gold:', this.gameState.gold);
    console.log('Items:', this.gameState.items);
    console.log('Equip Slots:', this.gameState.equipSlots);
    console.log('Score Booster Active:', this.gameState.isScoreBoosterActive);
    console.log('==============================');
    
    // アイテム管理システムのデバッグ情報も出力
    this.itemManager.debugLog();
  }

  /**
   * デバッグ用：テストアイテムを追加
   */
  public debugAddTestItems(): void {
    // すでにモックアイテムを追加済みなので何もしない
    console.log('Debug items already added in constructor');
  }

  /**
   * 現在のステージ番号を取得
   */
  public getCurrentStage(): number {
    return this.gameState.currentStage;
  }

  /**
   * 所持ゴールドを取得
   */
  public getGold(): number {
    return this.gameState.gold;
  }
}
