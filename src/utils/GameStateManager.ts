import { GameState } from '../types/GameState';
import { GameConfig } from '../config/GameConfig';

/**
 * ゲーム状態を管理するシングルトンクラス
 */
export class GameStateManager {
  private static instance: GameStateManager;
  private gameState: GameState;
  
  private constructor() {
    // 初期状態
    this.gameState = {
      currentStage: 1,
      gold: 0,
      score: 0,
      targetScore: GameConfig.TARGET_SCORE,
      usedItems: []
    };
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
   * 現在のステージを取得
   */
  public getCurrentStage(): number {
    return this.gameState.currentStage;
  }
  
  /**
   * 現在のステージを設定
   */
  public setCurrentStage(stage: number): void {
    if (stage < 1) {
      stage = 1;
    } else if (stage > GameConfig.MAX_STAGE) {
      stage = GameConfig.MAX_STAGE;
    }
    this.gameState.currentStage = stage;
  }
  
  /**
   * 次のステージに進む
   */
  public goToNextStage(): void {
    if (this.gameState.currentStage < GameConfig.MAX_STAGE) {
      this.gameState.currentStage++;
    }
  }
  
  /**
   * 所持ゴールドを取得
   */
  public getGold(): number {
    return this.gameState.gold;
  }
  
  /**
   * ゴールドを追加
   */
  public addGold(amount: number): void {
    this.gameState.gold += amount;
  }
  
  /**
   * ゴールドを消費
   */
  public useGold(amount: number): boolean {
    if (this.gameState.gold >= amount) {
      this.gameState.gold -= amount;
      return true;
    }
    return false;
  }
  
  /**
   * 現在のスコアを取得
   */
  public getScore(): number {
    return this.gameState.score;
  }
  
  /**
   * スコアを設定
   */
  public setScore(score: number): void {
    this.gameState.score = score;
  }
  
  /**
   * スコアを追加
   */
  public addScore(points: number): void {
    this.gameState.score += points;
  }
  
  /**
   * 目標スコアを取得
   */
  public getTargetScore(): number {
    return this.gameState.targetScore;
  }
  
  /**
   * 使用済みアイテムを追加
   */
  public addUsedItem(itemId: string): void {
    this.gameState.usedItems.push(itemId);
  }
  
  /**
   * アイテムが使用済みかどうか確認
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
   * ステージクリア時の処理
   */
  public onStageClear(): void {
    // スコアに応じたゴールドを獲得
    this.addGold(this.gameState.score);
    
    // 使用済みアイテムリストをリセット
    this.resetUsedItems();
    
    // スコアをリセット
    this.setScore(0);
  }
  
  /**
   * ステージリトライ時の処理
   */
  public onStageRetry(): void {
    // 使用済みアイテムリストをリセット
    this.resetUsedItems();
    
    // スコアをリセット
    this.setScore(0);
  }
  
  /**
   * ゲーム状態をリセット
   */
  public resetGameState(): void {
    this.gameState = {
      currentStage: 1,
      gold: 0,
      score: 0,
      targetScore: GameConfig.TARGET_SCORE,
      usedItems: []
    };
  }
}
