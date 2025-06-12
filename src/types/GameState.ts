/**
 * ゲーム状態を管理するインターフェース
 */
export interface GameState {
  currentStage: number;
  gold: number;
  score: number;
  targetScore: number;
  usedItems: string[];
}
