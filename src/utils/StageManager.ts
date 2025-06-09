import { StageConfig, BlockColor } from '../types';

/**
 * ステージ管理クラス
 * ステージの設定や進行を管理する
 */
export class StageManager {
  private static instance: StageManager;
  private stageConfigs: Map<number, StageConfig> = new Map();
  
  // 使用可能な色の定義
  private readonly availableColors: BlockColor[] = [
    'lightBlue',  // 水色
    'coralRed',   // 珊瑚赤
    'sandGold',   // 砂金色
    'seaGreen',   // 海緑
    'blue',       // 深い青
    'pearlWhite'  // 真珠白
  ];

  private constructor() {
    // 初期ステージ設定を生成
    this.generateInitialStageConfigs();
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): StageManager {
    if (!StageManager.instance) {
      StageManager.instance = new StageManager();
    }
    return StageManager.instance;
  }

  /**
   * 指定したステージの設定を取得
   */
  public getStageConfig(stageNumber: number): StageConfig {
    // 登録済みのステージ設定を取得
    const config = this.stageConfigs.get(stageNumber);
    
    if (config) {
      return config;
    }
    
    // 未登録の場合は動的に生成
    const newConfig = this.generateStageConfig(stageNumber);
    this.stageConfigs.set(stageNumber, newConfig);
    return newConfig;
  }

  /**
   * 初期ステージ設定（ステージ1-10）を生成
   */
  private generateInitialStageConfigs(): void {
    // ステージ1-3: 基本操作習得（3色、妨害ブロックなし）
    for (let i = 1; i <= 3; i++) {
      this.stageConfigs.set(i, {
        stage: i,
        colors: 3,
        targetScore: 500,
        obstacles: []
      });
    }
    
    // ステージ4-6: 色数増加（4色）
    for (let i = 4; i <= 6; i++) {
      this.stageConfigs.set(i, {
        stage: i,
        colors: 4,
        targetScore: 500,
        obstacles: []
      });
    }
    
    // ステージ7-10: さらに色数増加（5色）
    for (let i = 7; i <= 10; i++) {
      this.stageConfigs.set(i, {
        stage: i,
        colors: 5,
        targetScore: 500,
        obstacles: []
      });
    }
  }

  /**
   * ステージ設定を動的に生成
   */
  private generateStageConfig(stageNumber: number): StageConfig {
    // 基本設定
    const config: StageConfig = {
      stage: stageNumber,
      targetScore: 500,
      colors: 3, // デフォルト値
      obstacles: []
    };
    
    // ステージ番号に応じて色数を設定
    if (stageNumber <= 3) {
      config.colors = 3;
    } else if (stageNumber <= 6) {
      config.colors = 4;
    } else if (stageNumber <= 20) {
      config.colors = 5;
    } else {
      config.colors = 6;
    }
    
    // 新しい妨害ブロックが登場するステージでは色数を一時的に減らす
    if ([11, 21, 31, 41, 51, 61, 71, 81].includes(stageNumber)) {
      config.colors = Math.max(3, config.colors - 1);
    }
    
    // TODO: 妨害ブロックの配置を設定（Phase 7で実装）
    
    return config;
  }

  /**
   * 指定したステージで使用する色の配列を取得
   */
  public getStageColors(stageNumber: number): BlockColor[] {
    const config = this.getStageConfig(stageNumber);
    return this.availableColors.slice(0, config.colors);
  }

  /**
   * 目標スコアを取得
   */
  public getTargetScore(stageNumber: number): number {
    const config = this.getStageConfig(stageNumber);
    return config.targetScore;
  }
}
