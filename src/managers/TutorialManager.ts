/**
 * チュートリアル管理クラス
 */
export class TutorialManager {
  private static instance: TutorialManager;
  private completedTutorials: Set<string> = new Set();

  private constructor() {
    // シングルトンパターン
  }

  static getInstance(): TutorialManager {
    if (!TutorialManager.instance) {
      TutorialManager.instance = new TutorialManager();
    }
    return TutorialManager.instance;
  }

  /**
   * チュートリアルが完了済みかチェック
   */
  isCompleted(tutorialId: string): boolean {
    return this.completedTutorials.has(tutorialId);
  }

  /**
   * チュートリアルを完了としてマーク
   */
  markCompleted(tutorialId: string): void {
    this.completedTutorials.add(tutorialId);
  }

  /**
   * 基本操作チュートリアルが必要かチェック
   */
  needsBasicTutorial(): boolean {
    return !this.isCompleted('basic_controls');
  }

  /**
   * アイテム装備チュートリアルが必要かチェック
   */
  needsItemTutorial(): boolean {
    return !this.isCompleted('item_equipment');
  }

  /**
   * ガチャチュートリアルが必要かチェック
   */
  needsGachaTutorial(): boolean {
    return !this.isCompleted('gacha_system');
  }

  /**
   * 全チュートリアルをリセット（デバッグ用）
   */
  reset(): void {
    this.completedTutorials.clear();
  }

  /**
   * チュートリアルメッセージを取得
   */
  getTutorialMessage(tutorialId: string): string {
    const messages: { [key: string]: string } = {
      'basic_controls': '同じ色のブロックを2個以上タップして消去しよう！\n大きな塊を作ると高得点が狙えます。',
      'item_equipment': 'アイテムを装備してステージに挑戦しよう！\n特殊枠にはS・Aレアアイテムを装備できます。',
      'gacha_system': 'ゴールドを使ってガチャを引こう！\nステージが進むとより強力なアイテムが出現します。',
      'first_stage_clear': 'ステージクリア！\n獲得したゴールドでガチャを引いてみましょう。',
      'obstacle_blocks': '妨害ブロックが登場！\n隣接する同色ブロックを消去すると解除できます。'
    };

    return messages[tutorialId] || '';
  }
}
