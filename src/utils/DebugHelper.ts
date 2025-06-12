/**
 * デバッグ用のヘルパークラス
 */
export class DebugHelper {
  private scene: Phaser.Scene;
  private debugElements: Phaser.GameObjects.GameObject[] = [];
  private isVisible: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Dキーでデバッグ表示の切り替え
    this.scene.input.keyboard?.addKey('D').on('down', () => {
      this.toggleVisibility();
    });
    
    // Shift+Dキーでデバッグ情報をコンソール出力
    this.scene.input.keyboard?.addKey('SHIFT+D').on('down', () => {
      this.logDebugInfo();
    });
  }

  /**
   * エリア境界線を追加
   */
  addAreaBorder(x: number, y: number, width: number, height: number, color: number, name: string): Phaser.GameObjects.Rectangle {
    const rect = this.scene.add.rectangle(x, y, width, height, 0x000000, 0)
      .setStrokeStyle(2, color);
    
    const text = this.scene.add.text(x - width / 2 + 5, y - height / 2 + 5, name, {
      fontSize: '10px',
      color: '#FFFFFF',
      backgroundColor: '#000000'
    });
    
    this.debugElements.push(rect);
    this.debugElements.push(text);
    
    return rect;
  }

  /**
   * デバッグ表示の可視性を切り替え
   */
  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.debugElements.forEach(element => {
      element.setVisible(this.isVisible);
    });
    console.log(`Debug display: ${this.isVisible ? 'visible' : 'hidden'}`);
  }

  /**
   * デバッグ情報をコンソールに出力
   */
  logDebugInfo(): void {
    console.log('=== DEBUG INFO ===');
    console.log('Scene:', this.scene.scene.key);
    console.log('FPS:', this.scene.game.loop.actualFps);
    console.log('Objects count:', this.scene.children.length);
    console.log('==================');
  }
}
