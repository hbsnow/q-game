/**
 * 海をテーマにしたアイテムアイコンアセット生成
 */
export class ItemIconAssets {
  /**
   * スワップアイテムのアイコン（海洋テーマ：渦潮）
   */
  static createSwapIcon(scene: Phaser.Scene, size: number): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    // 背景円
    graphics.fillStyle(0x4682B4, 0.8);
    graphics.fillCircle(size / 2, size / 2, size * 0.4);
    
    // 渦潮のパターン
    const centerX = size / 2;
    const centerY = size / 2;
    const spiralTurns = 3;
    const maxRadius = size * 0.3;
    
    graphics.lineStyle(2, 0x87CEEB, 1);
    graphics.beginPath();
    
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * spiralTurns * Math.PI * 2;
      const radius = (i / 100) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.strokePath();
    
    // 矢印（交換を示す）
    this.drawSwapArrows(graphics, centerX, centerY, size * 0.15);
    
    const key = `swap_icon_${size}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    return rt.texture;
  }
  
  /**
   * チェンジワンアイテムのアイコン（海洋テーマ：色変化する魚）
   */
  static createChangeOneIcon(scene: Phaser.Scene, size: number): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    // 魚の形
    const fishX = size / 2;
    const fishY = size / 2;
    const fishWidth = size * 0.6;
    const fishHeight = size * 0.4;
    
    // 魚の本体（グラデーション効果）
    graphics.fillStyle(0xFF6347, 0.8); // 珊瑚色
    graphics.fillEllipse(fishX, fishY, fishWidth, fishHeight);
    
    // 魚の尻尾
    graphics.fillTriangle(
      fishX - fishWidth * 0.4, fishY,
      fishX - fishWidth * 0.6, fishY - fishHeight * 0.3,
      fishX - fishWidth * 0.6, fishY + fishHeight * 0.3
    );
    
    // 魚の目
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(fishX + fishWidth * 0.15, fishY - fishHeight * 0.1, size * 0.08);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(fishX + fishWidth * 0.18, fishY - fishHeight * 0.1, size * 0.04);
    
    // 色変化エフェクト（虹色の輪）
    const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
    const ringRadius = size * 0.45;
    
    colors.forEach((color, index) => {
      const angle = (index / colors.length) * Math.PI * 2;
      const x = fishX + Math.cos(angle) * ringRadius;
      const y = fishY + Math.sin(angle) * ringRadius;
      
      graphics.fillStyle(color, 0.6);
      graphics.fillCircle(x, y, size * 0.05);
    });
    
    const key = `change_one_icon_${size}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    return rt.texture;
  }
  
  /**
   * ミニ爆弾アイテムのアイコン（海洋テーマ：小さな機雷）
   */
  static createMiniBombIcon(scene: Phaser.Scene, size: number): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    const centerX = size / 2;
    const centerY = size / 2;
    const bombRadius = size * 0.25;
    
    // 機雷の本体
    graphics.fillStyle(0x2F2F2F, 1);
    graphics.fillCircle(centerX, centerY, bombRadius);
    
    // 機雷のトゲ
    const spikes = 8;
    const spikeLength = size * 0.15;
    
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      const startX = centerX + Math.cos(angle) * bombRadius;
      const startY = centerY + Math.sin(angle) * bombRadius;
      const endX = centerX + Math.cos(angle) * (bombRadius + spikeLength);
      const endY = centerY + Math.sin(angle) * (bombRadius + spikeLength);
      
      graphics.lineStyle(3, 0x2F2F2F, 1);
      graphics.beginPath();
      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
      graphics.strokePath();
      
      // トゲの先端
      graphics.fillStyle(0x696969, 1);
      graphics.fillCircle(endX, endY, 2);
    }
    
    // 爆発エフェクト（小さな火花）
    const sparks = 6;
    for (let i = 0; i < sparks; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = bombRadius + spikeLength + Math.random() * size * 0.1;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      graphics.fillStyle(0xFFD700, 0.8);
      
      // 星形を手動で描画
      const starPoints = 5;
      const outerRadius = 4;
      const innerRadius = 2;
      
      graphics.beginPath();
      for (let i = 0; i < starPoints * 2; i++) {
        const angle = (i * Math.PI) / starPoints;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const pointX = x + Math.cos(angle - Math.PI / 2) * radius;
        const pointY = y + Math.sin(angle - Math.PI / 2) * radius;
        
        if (i === 0) {
          graphics.moveTo(pointX, pointY);
        } else {
          graphics.lineTo(pointX, pointY);
        }
      }
      graphics.closePath();
      graphics.fillPath();
    }
    
    const key = `mini_bomb_icon_${size}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    return rt.texture;
  }
  
  /**
   * シャッフルアイテムのアイコン（海洋テーマ：海流）
   */
  static createShuffleIcon(scene: Phaser.Scene, size: number): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    // 海流のパターン（複数の曲線）
    const currents = 4;
    const colors = [0x1E88E5, 0x42A5F5, 0x64B5F6, 0x90CAF9];
    
    for (let i = 0; i < currents; i++) {
      const offset = (i / currents) * Math.PI * 2;
      const radius = size * (0.15 + i * 0.05);
      
      graphics.lineStyle(2, colors[i], 0.8);
      graphics.beginPath();
      
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
        const x = centerX + Math.cos(angle + offset) * radius;
        const y = centerY + Math.sin(angle + offset) * radius * 0.6;
        
        if (angle === 0) {
          graphics.moveTo(x, y);
        } else {
          graphics.lineTo(x, y);
        }
      }
      graphics.strokePath();
    }
    
    // 中央の渦
    graphics.fillStyle(0x0D47A1, 0.6);
    graphics.fillCircle(centerX, centerY, size * 0.1);
    
    // 流れる粒子
    const particles = 8;
    for (let i = 0; i < particles; i++) {
      const angle = (i / particles) * Math.PI * 2;
      const distance = size * 0.3;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance * 0.6;
      
      graphics.fillStyle(0xFFFFFF, 0.8);
      graphics.fillCircle(x, y, 1.5);
    }
    
    const key = `shuffle_icon_${size}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    return rt.texture;
  }
  
  /**
   * 爆弾アイテムのアイコン（海洋テーマ：大型機雷）
   */
  static createBombIcon(scene: Phaser.Scene, size: number): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    const centerX = size / 2;
    const centerY = size / 2;
    const bombRadius = size * 0.3;
    
    // 機雷の本体（グラデーション）
    graphics.fillStyle(0x1C1C1C, 1);
    graphics.fillCircle(centerX, centerY, bombRadius);
    
    graphics.fillStyle(0x2F2F2F, 0.8);
    graphics.fillCircle(centerX - bombRadius * 0.2, centerY - bombRadius * 0.2, bombRadius * 0.8);
    
    // 機雷のトゲ（より多く、より長く）
    const spikes = 12;
    const spikeLength = size * 0.2;
    
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      const startX = centerX + Math.cos(angle) * bombRadius;
      const startY = centerY + Math.sin(angle) * bombRadius;
      const endX = centerX + Math.cos(angle) * (bombRadius + spikeLength);
      const endY = centerY + Math.sin(angle) * (bombRadius + spikeLength);
      
      graphics.lineStyle(4, 0x2F2F2F, 1);
      graphics.beginPath();
      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
      graphics.strokePath();
      
      // トゲの先端（より大きく）
      graphics.fillStyle(0x696969, 1);
      graphics.fillCircle(endX, endY, 3);
    }
    
    // 危険マーク
    graphics.fillStyle(0xFF0000, 0.8);
    graphics.fillCircle(centerX, centerY, bombRadius * 0.4);
    
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillTriangle(
      centerX, centerY - bombRadius * 0.2,
      centerX - bombRadius * 0.15, centerY + bombRadius * 0.1,
      centerX + bombRadius * 0.15, centerY + bombRadius * 0.1
    );
    
    graphics.fillCircle(centerX, centerY + bombRadius * 0.2, 2);
    
    const key = `bomb_icon_${size}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    return rt.texture;
  }
  
  /**
   * ハンマーアイテムのアイコン（海洋テーマ：海底ハンマー）
   */
  static createHammerIcon(scene: Phaser.Scene, size: number): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    // ハンマーの柄
    const handleWidth = size * 0.08;
    const handleHeight = size * 0.6;
    
    graphics.fillStyle(0x8B4513, 1); // 茶色
    graphics.fillRoundedRect(
      centerX - handleWidth / 2,
      centerY - handleHeight / 2,
      handleWidth,
      handleHeight,
      2
    );
    
    // ハンマーのヘッド
    const headWidth = size * 0.4;
    const headHeight = size * 0.2;
    
    graphics.fillStyle(0x696969, 1); // グレー
    graphics.fillRoundedRect(
      centerX - headWidth / 2,
      centerY - headHeight / 2 - handleHeight * 0.2,
      headWidth,
      headHeight,
      3
    );
    
    // 金属の光沢
    graphics.fillStyle(0xC0C0C0, 0.6);
    graphics.fillRoundedRect(
      centerX - headWidth / 2 + 2,
      centerY - headHeight / 2 - handleHeight * 0.2 + 2,
      headWidth - 4,
      headHeight * 0.4,
      2
    );
    
    // 海藻の装飾（海底感）
    graphics.lineStyle(2, 0x228B22, 0.7);
    graphics.beginPath();
    graphics.moveTo(centerX - size * 0.3, centerY + handleHeight * 0.3);
    
    // 曲線を複数の直線で近似
    const segments = 10;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const startX = centerX - size * 0.3;
      const startY = centerY + handleHeight * 0.3;
      const controlX = centerX - size * 0.2;
      const controlY = centerY + handleHeight * 0.1;
      const endX = centerX - size * 0.25;
      const endY = centerY - handleHeight * 0.1;
      
      // ベジェ曲線の計算
      const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
      const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
      
      graphics.lineTo(x, y);
    }
    graphics.strokePath();
    
    const key = `hammer_icon_${size}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    
    graphics.destroy();
    return rt.texture;
  }
  
  /**
   * スコアブースターアイテムのアイコン（海洋テーマ：光る真珠）
   */
  static createScoreBoosterIcon(scene: Phaser.Scene, size: number): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    const centerX = size / 2;
    const centerY = size / 2;
    const pearlRadius = size * 0.25;
    
    // 真珠の本体
    graphics.fillStyle(0xF5F5F5, 1);
    graphics.fillCircle(centerX, centerY, pearlRadius);
    
    // 真珠の光沢
    graphics.fillStyle(0xFFFFFF, 0.8);
    graphics.fillEllipse(centerX - pearlRadius * 0.3, centerY - pearlRadius * 0.3, pearlRadius * 0.6, pearlRadius * 0.4);
    
    // 虹色の光輪
    const rings = 3;
    const colors = [0xFF69B4, 0x00BFFF, 0x32CD32];
    
    for (let i = 0; i < rings; i++) {
      const ringRadius = pearlRadius + (i + 1) * size * 0.08;
      graphics.lineStyle(2, colors[i], 0.6);
      graphics.strokeCircle(centerX, centerY, ringRadius);
    }
    
    // スコア倍率表示
    const textStyle = {
      fontSize: `${size * 0.2}px`,
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    };
    
    const text = scene.add.text(centerX, centerY + size * 0.35, '×1.5', textStyle);
    text.setOrigin(0.5, 0.5);
    
    const key = `score_booster_icon_${size}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    rt.draw(text, 0, 0);
    
    graphics.destroy();
    text.destroy();
    
    return rt.texture;
  }
  
  /**
   * 交換矢印を描画
   */
  private static drawSwapArrows(graphics: Phaser.GameObjects.Graphics, centerX: number, centerY: number, size: number): void {
    graphics.fillStyle(0xFFFFFF, 1);
    
    // 上向き矢印
    graphics.fillTriangle(
      centerX - size * 0.3, centerY - size * 0.2,
      centerX - size * 0.1, centerY - size * 0.5,
      centerX + size * 0.1, centerY - size * 0.2
    );
    
    // 下向き矢印
    graphics.fillTriangle(
      centerX - size * 0.1, centerY + size * 0.2,
      centerX + size * 0.3, centerY + size * 0.2,
      centerX + size * 0.1, centerY + size * 0.5
    );
  }
  
  /**
   * 汎用アイテムアイコン生成（未実装アイテム用）
   */
  static createGenericIcon(scene: Phaser.Scene, size: number, color: number, symbol: string): Phaser.Textures.Texture {
    const graphics = scene.add.graphics();
    
    // 背景円
    graphics.fillStyle(color, 0.8);
    graphics.fillCircle(size / 2, size / 2, size * 0.4);
    
    // 枠線
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.strokeCircle(size / 2, size / 2, size * 0.4);
    
    // シンボル文字
    const textStyle = {
      fontSize: `${size * 0.4}px`,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    };
    
    const text = scene.add.text(size / 2, size / 2, symbol, textStyle);
    text.setOrigin(0.5, 0.5);
    
    const key = `generic_icon_${size}_${color.toString(16)}_${symbol}`;
    const rt = scene.add.renderTexture(0, 0, size, size);
    rt.draw(graphics, 0, 0);
    rt.draw(text, 0, 0);
    
    graphics.destroy();
    text.destroy();
    
    return rt.texture;
  }
}
