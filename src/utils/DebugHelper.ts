/**
 * デバッグ機能のヘルパークラス
 * 各シーンで共通して使えるデバッグ機能を提供
 */
export class DebugHelper {
  private scene: Phaser.Scene;
  private debugContainer: Phaser.GameObjects.Container;
  private debugVisible: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.debugContainer = scene.add.container(0, 0);
    this.setupShortcuts();
  }

  /**
   * デバッグショートカットキーを設定
   */
  private setupShortcuts() {
    // Dキー: デバッグライン切り替え
    this.scene.input.keyboard?.on('keydown-D', () => {
      this.toggleDebugLines();
    });

    // Shift+Dキー: デバッグ情報をコンソール出力
    this.scene.input.keyboard?.on('keydown-D', (event: KeyboardEvent) => {
      if (event.shiftKey) {
        this.logDebugInfo();
      }
    });

    console.log('🔧 Debug shortcuts setup:');
    console.log('  - Press "D" to toggle debug lines');
    console.log('  - Press "Shift+D" to log debug info');
  }

  /**
   * デバッグラインの表示/非表示を切り替え
   */
  toggleDebugLines() {
    this.debugVisible = !this.debugVisible;
    this.debugContainer.setVisible(this.debugVisible);
    
    console.log(`🔧 Debug lines ${this.debugVisible ? 'SHOWN' : 'HIDDEN'}`);
  }

  /**
   * デバッグ情報をコンソールに出力
   */
  private logDebugInfo() {
    const { width, height } = this.scene.cameras.main;
    console.log('🔍 === DEBUG INFO ===');
    console.log('Scene:', this.scene.scene.key);
    console.log('Screen size:', { width, height });
    console.log('Debug container children:', this.debugContainer.list.length);
    console.log('Debug visible:', this.debugVisible);
  }

  /**
   * エリア境界線を追加
   */
  addAreaBorder(x: number, y: number, width: number, height: number, color: number, label: string) {
    const rect = this.scene.add.rectangle(x, y, width, height, 0x000000, 0)
      .setStrokeStyle(2, color);
    
    const text = this.scene.add.text(x - width/2 + 10, y - height/2 + 5, label, {
      fontSize: '10px',
      color: `#${color.toString(16).padStart(6, '0').toUpperCase()}`,
      backgroundColor: '#000000'
    });

    this.debugContainer.add([rect, text]);
  }

  /**
   * 座標情報テキストを追加
   */
  addCoordinateText(x: number, y: number, info: string, color: number = 0xFFFFFF) {
    const text = this.scene.add.text(x, y, info, {
      fontSize: '9px',
      color: `#${color.toString(16).padStart(6, '0').toUpperCase()}`,
      backgroundColor: '#000000'
    });

    this.debugContainer.add(text);
  }

  /**
   * デバッグコンテナを取得
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.debugContainer;
  }

  /**
   * デバッグラインの表示状態を取得
   */
  isVisible(): boolean {
    return this.debugVisible;
  }

  /**
   * デバッグ機能を破棄
   */
  destroy() {
    this.debugContainer.destroy();
  }
}
