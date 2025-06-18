/**
 * StageManager のユニットテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StageManager } from './StageManager';

describe('StageManager', () => {
  let stageManager: StageManager;

  beforeEach(() => {
    stageManager = new StageManager();
  });

  describe('初期化', () => {
    it('初期ステージは1である', () => {
      expect(stageManager.getCurrentStage()).toBe(1);
    });

    it('初期ゴールドは0である', () => {
      expect(stageManager.getCurrentGold()).toBe(0);
    });

    it('初期総スコアは0である', () => {
      expect(stageManager.getTotalScore()).toBe(0);
    });

    it('初期状態では全ステージ未クリア', () => {
      expect(stageManager.isStageCleared(1)).toBe(false);
      expect(stageManager.isAllStagesCleared()).toBe(false);
    });
  });

  describe('ステージ設定取得', () => {
    it('ステージ1の設定を正しく取得できる', () => {
      const config = stageManager.getCurrentStageConfig();
      expect(config).not.toBeNull();
      expect(config?.stage).toBe(1);
      expect(config?.colors).toBe(3);
      expect(config?.targetScore).toBe(500);
      expect(config?.obstacles).toEqual([]);
    });

    it('存在しないステージの設定はnullを返す', () => {
      const config = stageManager.getStageConfig(999);
      expect(config).toBeNull();
    });

    it('ステージ11の氷結ブロック設定を正しく取得できる', () => {
      const config = stageManager.getStageConfig(11);
      expect(config).not.toBeNull();
      expect(config?.obstacles).toHaveLength(2);
      expect(config?.obstacles[0].type).toBe('iceLv1');
    });
  });

  describe('ステージクリア', () => {
    it('ステージクリア時にスコアとゴールドが更新される', () => {
      const success = stageManager.clearStage(1, 800);
      
      expect(success).toBe(true);
      expect(stageManager.isStageCleared(1)).toBe(true);
      expect(stageManager.getBestScore(1)).toBe(800);
      expect(stageManager.getTotalScore()).toBe(800);
      expect(stageManager.getCurrentGold()).toBe(800);
    });

    it('同じステージを複数回クリアした場合、最高スコアが更新される', () => {
      stageManager.clearStage(1, 600);
      stageManager.clearStage(1, 900); // より高いスコア
      stageManager.clearStage(1, 700); // より低いスコア
      
      expect(stageManager.getBestScore(1)).toBe(900);
      expect(stageManager.getTotalScore()).toBe(600 + 900 + 700); // 総スコアは累積
    });

    it('存在しないステージのクリアは失敗する', () => {
      const success = stageManager.clearStage(999, 500);
      expect(success).toBe(false);
    });
  });

  describe('ステージ進行', () => {
    it('次のステージに正しく進める', () => {
      const success = stageManager.advanceToNextStage();
      
      expect(success).toBe(true);
      expect(stageManager.getCurrentStage()).toBe(2);
    });

    it('指定されたステージに移動できる', () => {
      const success = stageManager.goToStage(5);
      
      expect(success).toBe(true);
      expect(stageManager.getCurrentStage()).toBe(5);
    });

    it('存在しないステージへの移動は失敗する', () => {
      const success = stageManager.goToStage(999);
      expect(success).toBe(false);
      expect(stageManager.getCurrentStage()).toBe(1); // 変更されない
    });

    it('最終ステージの判定が正しく動作する', () => {
      stageManager.goToStage(20); // 最終ステージ
      expect(stageManager.isCurrentStageFinal()).toBe(true);
      
      stageManager.goToStage(19);
      expect(stageManager.isCurrentStageFinal()).toBe(false);
    });

    it('最終ステージからは次に進めない', () => {
      stageManager.goToStage(20); // 最終ステージ
      const success = stageManager.advanceToNextStage();
      
      expect(success).toBe(false);
      expect(stageManager.getCurrentStage()).toBe(20);
    });
  });

  describe('ゴールド管理', () => {
    beforeEach(() => {
      // テスト用にゴールドを追加
      stageManager.addGold(1000);
    });

    it('ゴールドを正しく消費できる', () => {
      const success = stageManager.spendGold(300);
      
      expect(success).toBe(true);
      expect(stageManager.getCurrentGold()).toBe(700);
    });

    it('所持金不足の場合は消費できない', () => {
      const success = stageManager.spendGold(1500);
      
      expect(success).toBe(false);
      expect(stageManager.getCurrentGold()).toBe(1000); // 変更されない
    });

    it('ゴールドを追加できる', () => {
      stageManager.addGold(500);
      expect(stageManager.getCurrentGold()).toBe(1500);
    });
  });

  describe('進行状況リセット', () => {
    it('リセット後は初期状態に戻る', () => {
      // 状態を変更
      stageManager.clearStage(1, 800);
      stageManager.advanceToNextStage();
      stageManager.addGold(500);
      
      // リセット
      stageManager.resetProgress();
      
      // 初期状態に戻っていることを確認
      expect(stageManager.getCurrentStage()).toBe(1);
      expect(stageManager.getCurrentGold()).toBe(0);
      expect(stageManager.getTotalScore()).toBe(0);
      expect(stageManager.isStageCleared(1)).toBe(false);
    });
  });

  describe('デバッグ機能', () => {
    it('ステージ情報の文字列表現を取得できる', () => {
      const info = stageManager.getStageInfo();
      expect(info).toContain('ステージ 1');
      expect(info).toContain('はじめの一歩');
      expect(info).toContain('3色');
      expect(info).toContain('500点');
    });

    it('進行状況を取得できる', () => {
      stageManager.clearStage(1, 600);
      const progress = stageManager.getProgress();
      
      expect(progress.currentStage).toBe(1);
      expect(progress.totalScore).toBe(600);
      expect(progress.clearedStages[0]).toBe(true);
    });
  });
});
