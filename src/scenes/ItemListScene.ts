import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { DebugHelper } from '../utils/DebugHelper';
import { GameStateManager } from '../utils/GameStateManager';
import { AnimationManager, TransitionType } from '../utils/AnimationManager';
import { SoundManager } from '../utils/SoundManager';
import { ButtonFactory } from '../utils/ButtonStyles';

/**
 * アイテム一覧画面（モック版）
 */
export class ItemListScene extends Phaser.Scene {
  private debugHelper!: DebugHelper;
  private animationManager!: AnimationManager;
  private soundManager!: SoundManager;
  private gameStateManager: GameStateManager;

  constructor() {
    super({ key: 'ItemListScene' });
    this.gameStateManager = GameStateManager.getInstance();
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // デバッグヘルパーを初期化
    this.debugHelper = new DebugHelper(this);
    
    // アニメーションマネージャーを初期化
    this.animationManager = new AnimationManager(this);
    
    // サウンドマネージャーを初期化
    this.soundManager = new SoundManager(this);
    this.soundManager.preloadSounds();
    this.debugHelper = new DebugHelper(this);
    
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#1E5799');
    
    this.createUI();
    this.addDebugLines();
  }

  private createUI(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleY = 40;
    this.add.text(width / 2, titleY, 'アイテム一覧', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // メインコンテンツエリア
    this.createItemList();
    
    // ボタンエリア
    this.createButtons();
  }

  private createItemList(): void {
    const { width, height } = this.cameras.main;
    const contentStartY = 100;
    const lineHeight = 35;
    
    // モックアイテムデータ（レア度順に並べる）
    const mockItems = [
      { name: '爆弾', count: 3, rarity: 'S', color: '#FFD700' },
      { name: 'スコアブースター', count: 1, rarity: 'A', color: '#FF4500' },
      { name: 'ハンマー', count: 2, rarity: 'C', color: '#4169E1' },
      { name: 'チェンジワン', count: 4, rarity: 'D', color: '#32CD32' },
      { name: 'シャッフル', count: 5, rarity: 'E', color: '#FFFFFF' },
      { name: 'スワップ', count: 7, rarity: 'E', color: '#FFFFFF' },
      { name: 'ミニ爆弾', count: 8, rarity: 'F', color: '#C0C0C0' },
    ];

    let currentY = contentStartY;
    let totalItems = 0;

    // アイテムリストを表示
    mockItems.forEach(item => {
      // アイテム名とレア度
      const itemText = this.add.text(50, currentY, `${item.name} (${item.rarity})`, {
        fontSize: '16px',
        color: `#${parseInt(item.color.replace('#', ''), 16).toString(16).padStart(6, '0')}`,
        fontFamily: 'Arial'
      });

      // 所持数
      const countText = this.add.text(width - 50, currentY, `×${item.count}`, {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Arial'
      }).setOrigin(1, 0);

      // レア度に応じた背景色（薄く）
      const bgColor = this.getRarityBackgroundColor(item.rarity);
      if (bgColor) {
        this.add.rectangle(width / 2, currentY, width - 20, 30, bgColor, 0.1);
      }

      currentY += lineHeight;
      totalItems += item.count;
    });

    // 総アイテム数表示
    const totalY = height - 120;
    this.add.text(width / 2, totalY, `総アイテム数: ${totalItems}`, {
      fontSize: '18px',
      color: '#FFFF00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private getRarityBackgroundColor(rarity: string): number | null {
    switch (rarity) {
      case 'S': return 0xFFD700; // 金色
      case 'A': return 0xFF4500; // 赤橙色
      case 'B': return 0x9932CC; // 紫色
      case 'C': return 0x4169E1; // 青色
      case 'D': return 0x32CD32; // 緑色
      case 'E': return 0xFFFFFF; // 白色
      case 'F': return 0xC0C0C0; // 灰色
      default: return null;
    }
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height - 60;

    // 戻るボタン（ニュートラル・Sサイズ）
    const { button: backButton } = ButtonFactory.createNeutralButton(
      this,
      width / 2,
      buttonY,
      '戻る',
      'S',
      () => {
        this.soundManager.playButtonTap();
        
        this.animationManager.buttonClick(backButton, () => {
          this.soundManager.playScreenTransition();
          
          this.animationManager.screenTransition('ItemListScene', 'MainScene', TransitionType.BUBBLE).then(() => {
            this.scene.start('MainScene');
          });
        });
      }
    );
  }

  private addDebugLines(): void {
    const { width, height } = this.cameras.main;
    
    // タイトルエリア
    const titleHeight = 80;
    const titleCenterY = 40;
    this.debugHelper.addAreaBorder(width / 2, titleCenterY, width, titleHeight, 0xFF0000, 'タイトルエリア');
    
    // メインコンテンツエリア
    const contentHeight = 420;
    const contentCenterY = 310;
    this.debugHelper.addAreaBorder(width / 2, contentCenterY, width, contentHeight, 0x0000FF, 'メインコンテンツエリア');
    
    // ボタンエリア
    const buttonHeight = 80;
    const buttonCenterY = height - 40;
    this.debugHelper.addAreaBorder(width / 2, buttonCenterY, width, buttonHeight, 0xFF00FF, 'ボタンエリア');
  }
}
