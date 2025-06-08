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
      isScoreBoosterActive: false,
      usedItems: [], // 使用済みアイテムのID
      equippedItems: {
        special: null,
        normal: null
      }
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
   * 現在のスコアを取得
   */
  public getScore(): number {
    return this.gameState.score;
  }
  
  /**
   * 目標スコアを取得
   */
  public getTargetScore(): number {
    return this.gameState.targetScore;
  }
  
  /**
   * 目標スコアを達成しているかチェック
   */
  public isTargetScoreAchieved(): boolean {
    return this.gameState.score >= this.gameState.targetScore;
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
    
    // 使用済みアイテムリストをリセット
    this.resetUsedItems();
    
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
    
    // 使用済みアイテムリストをリセット
    this.resetUsedItems();
    
    console.log(`Advanced to stage ${this.gameState.currentStage}`);
  }
  
  /**
   * 現在のステージをリトライ
   */
  public retryCurrentStage(): void {
    // スコアをリセット
    this.gameState.score = 0;
    
    // 使用済みアイテムリストをリセット
    this.resetUsedItems();
    
    console.log(`Retrying stage ${this.gameState.currentStage}`);
  }
  
  /**
   * 次のステージに進む（ResultScene用のエイリアス）
   */
  public nextStage(): void {
    this.goToNextStage();
  }
  
  /**
   * ステージをリトライする（ResultScene用のエイリアス）
   */
  public retryStage(): void {
    this.retryCurrentStage();
  }

  /**
   * スコアブースターを有効化
   */
  public activateScoreBooster(): void {
    this.gameState.isScoreBoosterActive = true;
    console.log('Score booster activated!');
  }

  /**
   * 特殊枠にアイテムを装備
   */
  public equipSpecialItem(itemId: string): void {
    this.gameState.equippedItems.special = itemId;
  }
  
  /**
   * 通常枠にアイテムを装備
   */
  public equipNormalItem(itemId: string): void {
    this.gameState.equippedItems.normal = itemId;
  }
  
  /**
   * 装備中のアイテムを取得
   */
  public getEquippedItems(): { special: string | null, normal: string | null } {
    return this.gameState.equippedItems;
  }
  
  /**
   * アイテムが装備されているかチェック
   */
  public isItemEquipped(itemId: string): boolean {
    return this.gameState.equippedItems.special === itemId || 
           this.gameState.equippedItems.normal === itemId;
  }
  
  /**
   * アイテムを使用済みとしてマーク
   */
  public markItemAsUsed(itemId: string): void {
    if (!this.gameState.usedItems.includes(itemId)) {
      this.gameState.usedItems.push(itemId);
    }
  }
  
  /**
   * アイテムが使用済みかチェック
   */
  public isItemUsed(itemId: string): boolean {
    return this.gameState.usedItems.includes(itemId);
  }
  
  /**
   * 使用済みアイテムリストをリセット
   */
  public resetUsedItems(): void {
    this.gameState.usedItems = [];
  }

  /**
   * 特殊枠にアイテムを装備
   */
  public equipSpecialItem(itemId: string): void {
    this.gameState.equippedItems.special = itemId;
  }
  
  /**
   * 通常枠にアイテムを装備
   */
  public equipNormalItem(itemId: string): void {
    this.gameState.equippedItems.normal = itemId;
  }
  
  /**
   * 装備中のアイテムを取得
   */
  public getEquippedItems(): { special: string | null, normal: string | null } {
    return this.gameState.equippedItems;
  }
  
  /**
   * アイテムが装備されているかチェック
   */
  public isItemEquipped(itemId: string): boolean {
    return this.gameState.equippedItems.special === itemId || 
           this.gameState.equippedItems.normal === itemId;
  }
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
    console.log('Used Items:', this.gameState.usedItems);
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
