import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';

/**
 * メイン画面（ステージ選択画面）
 */
export class MainScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private currentStage: number = 1;
  private gold: number = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // ヘッダー（ゴールド表示）
    const goldText = this.add.text(width - 10, 30, `ゴールド: ${this.gold}`, {
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0.5);
    
    // ステージ情報
    const stageText = this.add.text(width / 2, height / 4, `ステージ ${this.currentStage}`, {
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // プレイボタン
    const playButton = this.add.rectangle(width / 2, height / 2, 200, 60, 0x0088FF)
      .setInteractive({ useHandCursor: true });
    
    const playText = this.add.text(width / 2, height / 2, 'プレイ', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // アイテムボタン
    const itemButton = this.add.rectangle(width / 4, height * 0.75, 120, 50, 0x22AA22)
      .setInteractive({ useHandCursor: true });
    
    const itemText = this.add.text(width / 4, height * 0.75, 'アイテム', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // ガチャボタン
    const gachaButton = this.add.rectangle(width * 0.75, height * 0.75, 120, 50, 0xAA2222)
      .setInteractive({ useHandCursor: true });
    
    const gachaText = this.add.text(width * 0.75, height * 0.75, 'ガチャ', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // ボタンクリックイベント
    playButton.on('pointerdown', () => {
      this.scene.start('GameScene', { stage: this.currentStage });
    });
    
    // ボタンホバーエフェクト
    playButton.on('pointerover', () => {
      playButton.setFillStyle(0x00AAFF);
    });
    
    playButton.on('pointerout', () => {
      playButton.setFillStyle(0x0088FF);
    });
    
    // デバッグライン
    if (GameConfig.DEBUG_MODE) {
      this.addDebugLines();
    }
  }
  
  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // ヘッダーエリア
    this.debugHelper.addAreaBorder(width / 2, 30, width - 4, 60, 0xFF0000, 'ヘッダーエリア');
    
    // ステージ情報エリア
    this.debugHelper.addAreaBorder(width / 2, height / 4, width - 4, 80, 0x0000FF, 'ステージ情報エリア');
    
    // プレイボタンエリア
    this.debugHelper.addAreaBorder(width / 2, height / 2, 200, 60, 0xFF00FF, 'プレイボタンエリア');
    
    // メニューボタンエリア
    this.debugHelper.addAreaBorder(width / 2, height * 0.75, width - 4, 50, 0x00FFFF, 'メニューボタンエリア');
  }
}
