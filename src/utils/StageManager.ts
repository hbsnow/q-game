import { StageConfig, BlockColor, ObstacleConfig, BlockType } from '../types';
import { GAME_CONFIG, SCORE_CONFIG } from '../config/gameConfig';

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

  // 最大ステージ数
  private readonly MAX_STAGE = 100;

  // 妨害ブロック登場ステージ
  private readonly OBSTACLE_STAGES = {
    ICE1: 11,         // 氷結 Lv1
    COUNTER_PLUS: 21, // カウンター+
    ICE2: 31,         // 氷結 Lv2
    COUNTER: 41,      // カウンター
    ICE_COUNTER_PLUS: 51, // 氷結カウンター+
    ROCK: 61,         // 岩ブロック
    ICE_COUNTER: 71,  // 氷結カウンター
    STEEL: 81         // 鋼鉄ブロック
  };

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
    // 範囲外のステージ番号を修正
    const validStageNumber = Math.max(1, Math.min(this.MAX_STAGE, stageNumber));
    
    // 登録済みのステージ設定を取得
    const config = this.stageConfigs.get(validStageNumber);
    
    if (config) {
      return config;
    }
    
    // 未登録の場合は動的に生成
    const newConfig = this.generateStageConfig(validStageNumber);
    this.stageConfigs.set(validStageNumber, newConfig);
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
        targetScore: SCORE_CONFIG.TARGET_SCORE,
        obstacles: []
      });
    }
    
    // ステージ4-6: 色数増加（4色）
    for (let i = 4; i <= 6; i++) {
      this.stageConfigs.set(i, {
        stage: i,
        colors: 4,
        targetScore: SCORE_CONFIG.TARGET_SCORE,
        obstacles: []
      });
    }
    
    // ステージ7-10: さらに色数増加（5色）
    for (let i = 7; i <= 10; i++) {
      this.stageConfigs.set(i, {
        stage: i,
        colors: 5,
        targetScore: SCORE_CONFIG.TARGET_SCORE,
        obstacles: []
      });
    }
    
    // 妨害ブロック登場ステージの設定
    this.setupObstacleStages();
  }

  /**
   * 妨害ブロック登場ステージの設定
   */
  private setupObstacleStages(): void {
    // 氷結 Lv1 登場ステージ
    this.stageConfigs.set(this.OBSTACLE_STAGES.ICE1, {
      stage: this.OBSTACLE_STAGES.ICE1,
      colors: 3, // 新要素登場時は色数を減らす
      targetScore: SCORE_CONFIG.TARGET_SCORE,
      obstacles: this.generateIce1Obstacles()
    });

    // カウンター+ 登場ステージ
    this.stageConfigs.set(this.OBSTACLE_STAGES.COUNTER_PLUS, {
      stage: this.OBSTACLE_STAGES.COUNTER_PLUS,
      colors: 3,
      targetScore: SCORE_CONFIG.TARGET_SCORE,
      obstacles: this.generateCounterPlusObstacles()
    });

    // 氷結 Lv2 登場ステージ
    this.stageConfigs.set(this.OBSTACLE_STAGES.ICE2, {
      stage: this.OBSTACLE_STAGES.ICE2,
      colors: 4,
      targetScore: SCORE_CONFIG.TARGET_SCORE,
      obstacles: this.generateIce2Obstacles()
    });

    // カウンター 登場ステージ
    this.stageConfigs.set(this.OBSTACLE_STAGES.COUNTER, {
      stage: this.OBSTACLE_STAGES.COUNTER,
      colors: 4,
      targetScore: SCORE_CONFIG.TARGET_SCORE,
      obstacles: this.generateCounterObstacles()
    });

    // 氷結カウンター+ 登場ステージ
    this.stageConfigs.set(this.OBSTACLE_STAGES.ICE_COUNTER_PLUS, {
      stage: this.OBSTACLE_STAGES.ICE_COUNTER_PLUS,
      colors: 4,
      targetScore: SCORE_CONFIG.TARGET_SCORE,
      obstacles: this.generateIceCounterPlusObstacles()
    });

    // 岩ブロック 登場ステージ
    this.stageConfigs.set(this.OBSTACLE_STAGES.ROCK, {
      stage: this.OBSTACLE_STAGES.ROCK,
      colors: 5,
      targetScore: SCORE_CONFIG.TARGET_SCORE,
      obstacles: this.generateRockObstacles()
    });

    // 氷結カウンター 登場ステージ
    this.stageConfigs.set(this.OBSTACLE_STAGES.ICE_COUNTER, {
      stage: this.OBSTACLE_STAGES.ICE_COUNTER,
      colors: 5,
      targetScore: SCORE_CONFIG.TARGET_SCORE,
      obstacles: this.generateIceCounterObstacles()
    });

    // 鋼鉄ブロック 登場ステージ
    this.stageConfigs.set(this.OBSTACLE_STAGES.STEEL, {
      stage: this.OBSTACLE_STAGES.STEEL,
      colors: 5,
      targetScore: SCORE_CONFIG.TARGET_SCORE,
      obstacles: this.generateSteelObstacles()
    });
  }

  /**
   * 氷結 Lv1 の妨害ブロック配置を生成
   */
  private generateIce1Obstacles(): ObstacleConfig[] {
    return [{
      type: 'ice1',
      positions: [
        { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 },
        { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }
      ],
      iceLevel: 1
    }];
  }

  /**
   * カウンター+ の妨害ブロック配置を生成
   */
  private generateCounterPlusObstacles(): ObstacleConfig[] {
    return [{
      type: 'counterPlus',
      positions: [
        { x: 3, y: 4 }, { x: 6, y: 4 },
        { x: 3, y: 9 }, { x: 6, y: 9 }
      ],
      counterValue: 3,
      isCounterPlus: true
    }];
  }

  /**
   * 氷結 Lv2 の妨害ブロック配置を生成
   */
  private generateIce2Obstacles(): ObstacleConfig[] {
    return [{
      type: 'ice2',
      positions: [
        { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
        { x: 4, y: 7 }, { x: 5, y: 7 }
      ],
      iceLevel: 2
    }];
  }

  /**
   * カウンター の妨害ブロック配置を生成
   */
  private generateCounterObstacles(): ObstacleConfig[] {
    return [{
      type: 'counter',
      positions: [
        { x: 2, y: 5 }, { x: 7, y: 5 },
        { x: 4, y: 9 }, { x: 5, y: 9 }
      ],
      counterValue: 3,
      isCounterPlus: false
    }];
  }

  /**
   * 氷結カウンター+ の妨害ブロック配置を生成
   */
  private generateIceCounterPlusObstacles(): ObstacleConfig[] {
    return [{
      type: 'iceCounterPlus',
      positions: [
        { x: 3, y: 4 }, { x: 6, y: 4 },
        { x: 4, y: 8 }, { x: 5, y: 8 }
      ],
      iceLevel: 1,
      counterValue: 3,
      isCounterPlus: true
    }];
  }

  /**
   * 岩ブロック の妨害ブロック配置を生成
   */
  private generateRockObstacles(): ObstacleConfig[] {
    return [{
      type: 'rock',
      positions: [
        { x: 2, y: 3 }, { x: 7, y: 3 },
        { x: 2, y: 7 }, { x: 7, y: 7 },
        { x: 2, y: 11 }, { x: 7, y: 11 }
      ]
    }];
  }

  /**
   * 氷結カウンター の妨害ブロック配置を生成
   */
  private generateIceCounterObstacles(): ObstacleConfig[] {
    return [{
      type: 'iceCounter',
      positions: [
        { x: 3, y: 5 }, { x: 6, y: 5 },
        { x: 4, y: 9 }, { x: 5, y: 9 }
      ],
      iceLevel: 1,
      counterValue: 3,
      isCounterPlus: false
    }];
  }

  /**
   * 鋼鉄ブロック の妨害ブロック配置を生成
   */
  private generateSteelObstacles(): ObstacleConfig[] {
    return [{
      type: 'steel',
      positions: [
        { x: 0, y: 5 }, { x: 9, y: 5 },
        { x: 4, y: 3 }, { x: 5, y: 3 },
        { x: 4, y: 10 }, { x: 5, y: 10 }
      ]
    }];
  }

  /**
   * ステージ設定を動的に生成
   */
  private generateStageConfig(stageNumber: number): StageConfig {
    // 基本設定
    const config: StageConfig = {
      stage: stageNumber,
      targetScore: SCORE_CONFIG.TARGET_SCORE,
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
    } else if (stageNumber <= 40) {
      config.colors = 5;
    } else if (stageNumber <= 60) {
      config.colors = 5;
    } else {
      config.colors = 6;
    }
    
    // 新しい妨害ブロックが登場するステージでは色数を一時的に減らす
    if ([
      this.OBSTACLE_STAGES.ICE1,
      this.OBSTACLE_STAGES.COUNTER_PLUS,
      this.OBSTACLE_STAGES.ICE2,
      this.OBSTACLE_STAGES.COUNTER,
      this.OBSTACLE_STAGES.ICE_COUNTER_PLUS,
      this.OBSTACLE_STAGES.ROCK,
      this.OBSTACLE_STAGES.ICE_COUNTER,
      this.OBSTACLE_STAGES.STEEL
    ].includes(stageNumber)) {
      config.colors = Math.max(3, config.colors - 1);
    }
    
    // 妨害ブロックの配置を設定
    config.obstacles = this.generateObstaclesForStage(stageNumber);
    
    return config;
  }

  /**
   * 指定したステージの妨害ブロック配置を生成
   */
  private generateObstaclesForStage(stageNumber: number): ObstacleConfig[] {
    const obstacles: ObstacleConfig[] = [];
    
    // 各妨害ブロックの登場ステージ以降で配置
    if (stageNumber >= this.OBSTACLE_STAGES.ICE1) {
      obstacles.push(...this.generateRandomObstacles('ice1', stageNumber));
    }
    
    if (stageNumber >= this.OBSTACLE_STAGES.COUNTER_PLUS) {
      obstacles.push(...this.generateRandomObstacles('counterPlus', stageNumber));
    }
    
    if (stageNumber >= this.OBSTACLE_STAGES.ICE2) {
      obstacles.push(...this.generateRandomObstacles('ice2', stageNumber));
    }
    
    if (stageNumber >= this.OBSTACLE_STAGES.COUNTER) {
      obstacles.push(...this.generateRandomObstacles('counter', stageNumber));
    }
    
    if (stageNumber >= this.OBSTACLE_STAGES.ICE_COUNTER_PLUS) {
      obstacles.push(...this.generateRandomObstacles('iceCounterPlus', stageNumber));
    }
    
    if (stageNumber >= this.OBSTACLE_STAGES.ROCK) {
      obstacles.push(...this.generateRandomObstacles('rock', stageNumber));
    }
    
    if (stageNumber >= this.OBSTACLE_STAGES.ICE_COUNTER) {
      obstacles.push(...this.generateRandomObstacles('iceCounter', stageNumber));
    }
    
    if (stageNumber >= this.OBSTACLE_STAGES.STEEL) {
      obstacles.push(...this.generateRandomObstacles('steel', stageNumber));
    }
    
    return obstacles;
  }

  /**
   * 指定した種類の妨害ブロックをランダムに生成
   */
  private generateRandomObstacles(type: BlockType, stageNumber: number): ObstacleConfig[] {
    // 登場ステージでは専用の配置を使用
    const obstacleStage = Object.values(this.OBSTACLE_STAGES).find(stage => stage === stageNumber);
    if (obstacleStage) {
      return []; // 登場ステージの場合は専用配置を使用するため、ここでは空配列を返す
    }
    
    // 妨害ブロックの数を決定（ステージが進むほど増加）
    const count = this.calculateObstacleCount(type, stageNumber);
    if (count <= 0) return [];
    
    // 配置位置を決定
    const positions = this.generateRandomPositions(count, stageNumber);
    
    // 妨害ブロック設定を生成
    const obstacle: ObstacleConfig = {
      type,
      positions
    };
    
    // 妨害ブロック固有のパラメータを設定
    switch (type) {
      case 'ice1':
        obstacle.iceLevel = 1;
        break;
      case 'ice2':
        obstacle.iceLevel = 2;
        break;
      case 'counter':
        obstacle.counterValue = this.calculateCounterValue(stageNumber);
        obstacle.isCounterPlus = false;
        break;
      case 'counterPlus':
        obstacle.counterValue = this.calculateCounterValue(stageNumber);
        obstacle.isCounterPlus = true;
        break;
      case 'iceCounter':
        obstacle.iceLevel = 1;
        obstacle.counterValue = this.calculateCounterValue(stageNumber);
        obstacle.isCounterPlus = false;
        break;
      case 'iceCounterPlus':
        obstacle.iceLevel = 1;
        obstacle.counterValue = this.calculateCounterValue(stageNumber);
        obstacle.isCounterPlus = true;
        break;
    }
    
    return [obstacle];
  }

  /**
   * 妨害ブロックの数を計算
   */
  private calculateObstacleCount(type: BlockType, stageNumber: number): number {
    // 登場ステージからの経過ステージ数
    let stagesSinceIntroduction = 0;
    
    switch (type) {
      case 'ice1':
        stagesSinceIntroduction = stageNumber - this.OBSTACLE_STAGES.ICE1;
        break;
      case 'counterPlus':
        stagesSinceIntroduction = stageNumber - this.OBSTACLE_STAGES.COUNTER_PLUS;
        break;
      case 'ice2':
        stagesSinceIntroduction = stageNumber - this.OBSTACLE_STAGES.ICE2;
        break;
      case 'counter':
        stagesSinceIntroduction = stageNumber - this.OBSTACLE_STAGES.COUNTER;
        break;
      case 'iceCounterPlus':
        stagesSinceIntroduction = stageNumber - this.OBSTACLE_STAGES.ICE_COUNTER_PLUS;
        break;
      case 'rock':
        stagesSinceIntroduction = stageNumber - this.OBSTACLE_STAGES.ROCK;
        break;
      case 'iceCounter':
        stagesSinceIntroduction = stageNumber - this.OBSTACLE_STAGES.ICE_COUNTER;
        break;
      case 'steel':
        stagesSinceIntroduction = stageNumber - this.OBSTACLE_STAGES.STEEL;
        break;
      default:
        return 0;
    }
    
    // 登場ステージより前なら0
    if (stagesSinceIntroduction < 0) return 0;
    
    // 登場ステージなら専用配置を使用するため0
    if (stagesSinceIntroduction === 0) return 0;
    
    // 基本数（妨害ブロックの種類によって異なる）
    let baseCount = 0;
    switch (type) {
      case 'ice1':
      case 'ice2':
        baseCount = 2 + Math.floor(stagesSinceIntroduction / 5);
        break;
      case 'counter':
      case 'counterPlus':
        baseCount = 1 + Math.floor(stagesSinceIntroduction / 7);
        break;
      case 'iceCounter':
      case 'iceCounterPlus':
        baseCount = 1 + Math.floor(stagesSinceIntroduction / 8);
        break;
      case 'rock':
        baseCount = 1 + Math.floor(stagesSinceIntroduction / 6);
        break;
      case 'steel':
        baseCount = 1 + Math.floor(stagesSinceIntroduction / 10);
        break;
    }
    
    // 上限を設定
    const maxCount = {
      'ice1': 8,
      'ice2': 6,
      'counter': 4,
      'counterPlus': 4,
      'iceCounter': 3,
      'iceCounterPlus': 3,
      'rock': 6,
      'steel': 4
    }[type] || 4;
    
    return Math.min(baseCount, maxCount);
  }

  /**
   * カウンター値を計算
   */
  private calculateCounterValue(stageNumber: number): number {
    // ステージが進むほど難しくなる
    if (stageNumber < 30) {
      return 3; // 簡単
    } else if (stageNumber < 60) {
      return 4; // 普通
    } else if (stageNumber < 80) {
      return 5; // 難しい
    } else {
      return 6; // 非常に難しい
    }
  }

  /**
   * ランダムな配置位置を生成
   */
  private generateRandomPositions(count: number, stageNumber: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    const boardWidth = GAME_CONFIG.boardWidth;
    const boardHeight = GAME_CONFIG.boardHeight;
    
    // 配置候補位置
    const candidates: { x: number; y: number }[] = [];
    
    // 盤面の中央部分を優先して配置
    for (let y = 3; y < boardHeight - 3; y++) {
      for (let x = 1; x < boardWidth - 1; x++) {
        candidates.push({ x, y });
      }
    }
    
    // ランダムにシャッフル
    this.shuffleArray(candidates);
    
    // 必要な数だけ取得
    for (let i = 0; i < Math.min(count, candidates.length); i++) {
      positions.push(candidates[i]);
    }
    
    return positions;
  }

  /**
   * 配列をランダムにシャッフル
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
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

  /**
   * 最大ステージ数を取得
   */
  public getMaxStage(): number {
    return this.MAX_STAGE;
  }

  /**
   * ステージがゲームの最終ステージかどうかを判定
   */
  public isFinalStage(stageNumber: number): boolean {
    return stageNumber >= this.MAX_STAGE;
  }

  /**
   * 妨害ブロック登場ステージかどうかを判定
   */
  public isObstacleIntroductionStage(stageNumber: number): boolean {
    return Object.values(this.OBSTACLE_STAGES).includes(stageNumber);
  }

  /**
   * 妨害ブロックの登場ステージ番号を取得
   */
  public getObstacleStages(): Record<string, number> {
    return this.OBSTACLE_STAGES;
  }

  /**
   * デバッグ用：ステージ設定をコンソール出力
   */
  public debugLog(stageNumber?: number): void {
    if (stageNumber) {
      console.log(`=== Stage ${stageNumber} Config ===`);
      console.log(this.getStageConfig(stageNumber));
    } else {
      console.log('=== All Stage Configs ===');
      this.stageConfigs.forEach((config, stage) => {
        console.log(`Stage ${stage}:`, config);
      });
    }
  }
}
