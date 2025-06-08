import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../utils/GameStateManager';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    // シングルトンインスタンスをリセット
    GameStateManager.resetInstance();
    gameStateManager = GameStateManager.getInstance();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const state = gameStateManager.getGameState();
      expect(state.currentStage).toBe(1);
      expect(state.gold).toBe(0);
      expect(state.score).toBe(0);
      expect(state.targetScore).toBe(500);
      expect(state.items).toHaveLength(0);
      expect(state.isScoreBoosterActive).toBe(false);
    });
  });

  describe('ステージ管理', () => {
    it('次のステージに進むことができる', () => {
      gameStateManager.nextStage();
      expect(gameStateManager.getCurrentStage()).toBe(2);
      expect(gameStateManager.getTargetScore()).toBe(500);
      expect(gameStateManager.getScore()).toBe(0);
    });

    it('ステージをリトライできる', () => {
      gameStateManager.setScore(300);
      gameStateManager.activateScoreBooster();
      
      gameStateManager.retryStage();
      
      expect(gameStateManager.getScore()).toBe(0);
      expect(gameStateManager.isScoreBoosterActive()).toBe(false);
    });

    it('最終ステージを正しく判定する', () => {
      expect(gameStateManager.isFinalStage()).toBe(false);
      
      // ステージ100まで進める
      for (let i = 1; i < 100; i++) {
        gameStateManager.nextStage();
      }
      
      expect(gameStateManager.isFinalStage()).toBe(true);
    });
  });

  describe('ゴールド管理', () => {
    it('ゴールドを追加できる', () => {
      gameStateManager.addGold(1000);
      expect(gameStateManager.getGold()).toBe(1000);
    });

    it('ゴールドを使用できる', () => {
      gameStateManager.addGold(1000);
      const result = gameStateManager.useGold(300);
      expect(result).toBe(true);
      expect(gameStateManager.getGold()).toBe(700);
    });

    it('ゴールド不足の場合は使用に失敗する', () => {
      gameStateManager.addGold(100);
      const result = gameStateManager.useGold(300);
      expect(result).toBe(false);
      expect(gameStateManager.getGold()).toBe(100);
    });
  });

  describe('スコア管理', () => {
    it('スコアを設定・取得できる', () => {
      gameStateManager.setScore(750);
      expect(gameStateManager.getScore()).toBe(750);
    });

    it('目標スコア達成を正しく判定する', () => {
      gameStateManager.setScore(400);
      expect(gameStateManager.isTargetScoreAchieved()).toBe(false);
      
      gameStateManager.setScore(500);
      expect(gameStateManager.isTargetScoreAchieved()).toBe(true);
      
      gameStateManager.setScore(600);
      expect(gameStateManager.isTargetScoreAchieved()).toBe(true);
    });
  });

  describe('スコアブースター', () => {
    it('スコアブースターを有効化できる', () => {
      expect(gameStateManager.isScoreBoosterActive()).toBe(false);
      
      gameStateManager.activateScoreBooster();
      expect(gameStateManager.isScoreBoosterActive()).toBe(true);
    });

    it('ステージ終了時にスコアブースターがリセットされる', () => {
      gameStateManager.activateScoreBooster();
      gameStateManager.nextStage();
      expect(gameStateManager.isScoreBoosterActive()).toBe(false);
    });
  });

  describe('ステージクリア処理', () => {
    it('ステージクリア時にスコアと同じゴールドを獲得する', () => {
      gameStateManager.setScore(750);
      gameStateManager.onStageClear();
      expect(gameStateManager.getGold()).toBe(750);
    });
  });

  describe('ItemManagerとの連携', () => {
    it('ItemManagerのインスタンスを取得できる', () => {
      const itemManager = gameStateManager.getItemManager();
      expect(itemManager).toBeDefined();
    });

    it('アイテム情報がゲーム状態に反映される', () => {
      const itemManager = gameStateManager.getItemManager();
      itemManager.addItem('swap', 3);
      
      const state = gameStateManager.getGameState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].type).toBe('swap');
      expect(state.items[0].count).toBe(3);
    });

    it('装備情報がゲーム状態に反映される', () => {
      const itemManager = gameStateManager.getItemManager();
      itemManager.addItem('swap', 1);
      itemManager.equipItem('swap', 0);
      
      const state = gameStateManager.getGameState();
      expect(state.equipSlots[0].item?.type).toBe('swap');
    });
  });

  describe('ゲームリセット', () => {
    it('ゲーム全体をリセットできる', () => {
      // 状態を変更
      gameStateManager.addGold(1000);
      gameStateManager.setScore(500);
      gameStateManager.nextStage();
      gameStateManager.getItemManager().addItem('swap', 5);
      
      // リセット実行
      gameStateManager.resetGame();
      
      // 初期状態に戻ることを確認
      const state = gameStateManager.getGameState();
      expect(state.currentStage).toBe(1);
      expect(state.gold).toBe(0);
      expect(state.score).toBe(0);
      expect(state.items).toHaveLength(0);
    });
  });
});
