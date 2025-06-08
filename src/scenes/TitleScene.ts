import { Scene } from 'phaser';

export class TitleScene extends Scene {
  // デバッグライン管理
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private debugVisible = true; // 初期表示ON

  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 🏷️ 画面名をコンソールに表示
    console.log('🎬 === TITLE SCENE ===');
    console.log('📍 Current Scene: タイトル画面');
    console.log('🎯 Purpose: ゲーム開始画面');

    // デバッグショートカットキーを設定
    this.setupDebugShortcut();

    // 背景色設定（深い海のイメージ）
    this.cameras.main.setBackgroundColor('#0F3460');

    // タイトルロゴ
    this.add.text(width / 2, height / 2 - 100, '🌊 さめがめ', {
      fontSize: '32px',
      color: '#7DB9E8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 60, 'オーシャン 🌊', {
      fontSize: '32px',
      color: '#7DB9E8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ゲーム開始ボタン
    const startButton = this.add.rectangle(width / 2, height / 2 + 50, 200, 60, 0x2E8B57, 0.9);
    startButton.setInteractive();
    startButton.on('pointerdown', () => {
      this.scene.start('MainScene', {
        currentStage: 1,
        gold: 1250 // モックデータ
      });
    });
    
    // ボタンのホバーエフェクト
    startButton.on('pointerover', () => {
      startButton.setAlpha(0.8);
    });
    startButton.on('pointerout', () => {
      startButton.setAlpha(1.0);
    });

    this.add.text(width / 2, height / 2 + 50, 'ゲーム開始', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // バージョン表示
    this.add.text(width / 2, height - 50, 'Ver 1.0.0', {
      fontSize: '14px',
      color: '#CCCCCC'
    }).setOrigin(0.5);

    // 開発情報（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      this.add.text(10, 10, 'Phase 3: UI/画面システム実装中', {
        fontSize: '12px',
        color: '#CCCCCC'
      });
    }

    // デバッグライン追加
    this.addDebugLines(width, height);
  }

  private setupDebugShortcut() {
    // Dキーでデバッグライン切り替え
    this.input.keyboard?.on('keydown-D', (event: KeyboardEvent) => {
      if (event.shiftKey) {
        // Shift+D: 詳細デバッグ情報出力
        this.logDetailedDebugInfo();
      } else {
        // D: デバッグライン切り替え
        this.toggleDebugLines();
      }
    });
    
    console.log('🔧 [TITLE SCENE] Debug shortcut setup:');
    console.log('  - Press "D" to toggle debug lines');
    console.log('  - Press "Shift+D" to log detailed debug info');
  }

  private toggleDebugLines() {
    this.debugVisible = !this.debugVisible;
    
    // 全てのデバッグ要素の表示/非表示を切り替え
    this.debugElements.forEach(element => {
      element.setVisible(this.debugVisible);
    });
    
    console.log(`🔧 [TITLE SCENE] Debug lines ${this.debugVisible ? 'SHOWN' : 'HIDDEN'} (Press D to toggle)`);
  }

  private addDebugLines(width: number, height: number) {
    console.log('🔧 [TITLE SCENE] Adding debug rectangles for area visualization...');
    
    // ヘッダーエリア（Y=0-100）- 赤色
    const headerRect = this.add.rectangle(width / 2, 50, width - 4, 96, 0x000000, 0)
      .setStrokeStyle(3, 0xFF0000);
    const headerText = this.add.text(10, 5, 'ヘッダーエリア Y=0-100', {
      fontSize: '12px',
      color: '#FF0000',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(headerRect, headerText);
    
    // タイトルエリア（Y=100-400）- 緑色
    const titleRect = this.add.rectangle(width / 2, 250, width - 4, 296, 0x000000, 0)
      .setStrokeStyle(3, 0x00FF00);
    const titleText = this.add.text(10, 105, 'タイトルエリア Y=100-400', {
      fontSize: '12px',
      color: '#00FF00',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(titleRect, titleText);
    
    // ボタンエリア（Y=400-600）- 青色
    const buttonRect = this.add.rectangle(width / 2, 500, width - 4, 196, 0x000000, 0)
      .setStrokeStyle(3, 0x0000FF);
    const buttonText = this.add.text(10, 405, 'ボタンエリア Y=400-600', {
      fontSize: '12px',
      color: '#0000FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(buttonRect, buttonText);
    
    // フッターエリア（Y=600-710）- 紫色
    const footerRect = this.add.rectangle(width / 2, 655, width - 4, 106, 0x000000, 0)
      .setStrokeStyle(3, 0xFF00FF);
    const footerText = this.add.text(10, 605, 'フッターエリア Y=600-710', {
      fontSize: '12px',
      color: '#FF00FF',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    this.debugElements.push(footerRect, footerText);
    
    console.log('🔧 [TITLE SCENE] Debug elements count:', this.debugElements.length);
  }

  private logDetailedDebugInfo() {
    const { width, height } = this.scale;
    console.log('🔍 === DETAILED DEBUG INFO [TITLE SCENE] ===');
    console.log('📍 Current Screen:', {
      sceneName: 'TitleScene',
      displayName: 'タイトル画面',
      purpose: 'ゲーム開始画面',
      sceneKey: this.scene.key,
      isActive: this.scene.isActive(),
      isPaused: this.scene.isPaused(),
      isVisible: this.scene.isVisible()
    });
    console.log('📱 Screen Info:', {
      width: width,
      height: height,
      devicePixelRatio: window.devicePixelRatio
    });
    console.log('🎨 Debug Elements:', {
      count: this.debugElements.length,
      visible: this.debugVisible,
      types: this.debugElements.map(el => el.type)
    });
    console.log('⌨️ Input Info:', {
      hasKeyboard: !!this.input.keyboard,
      activePointers: this.input.activePointer ? 1 : 0
    });
    console.log('🔧 Performance:', {
      fps: this.game.loop.actualFps.toFixed(1),
      delta: this.game.loop.delta
    });
    console.log('=== END DEBUG INFO ===');
  }
}
