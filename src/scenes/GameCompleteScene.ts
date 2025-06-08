import { Scene } from 'phaser';

interface GameCompleteData {
  totalScore: number;
  totalGold: number;
}

export class GameCompleteScene extends Scene {
  private gameCompleteData!: GameCompleteData;

  constructor() {
    super({ key: 'GameCompleteScene' });
  }

  init(data: GameCompleteData) {
    this.gameCompleteData = data;
  }

  create() {
    const { width, height } = this.scale;
    
    // 背景（海のテーマに合わせた深い青）
    this.add.rectangle(width / 2, height / 2, width, height, 0x001133, 1.0);
    
    // 祝福メッセージ
    this.add.text(width / 2, 80, 'ゲームクリア！', {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // おめでとうメッセージ
    this.add.text(width / 2, 140, 'おめでとう！', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 180, '全てのステージを', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 210, 'クリアしました！', {
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // 成績表示
    this.add.text(width / 2, 280, '総獲得スコア:', {
      fontSize: '16px',
      color: '#CCCCCC'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 310, this.gameCompleteData.totalScore.toLocaleString(), {
      fontSize: '20px',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 360, '総獲得ゴールド:', {
      fontSize: '16px',
      color: '#CCCCCC'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 390, `${this.gameCompleteData.totalGold.toLocaleString()} G`, {
      fontSize: '20px',
      color: '#FFFF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // タイトルへ戻るボタン
    const titleButton = this.add.rectangle(width / 2, 480, 200, 50, 0x4CAF50, 0.8);
    titleButton.setInteractive();
    titleButton.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });
    
    this.add.text(width / 2, 480, 'タイトルへ戻る', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 祝福エフェクト
    this.createCelebrationEffect();
  }
  
  private createCelebrationEffect() {
    // 簡単な祝福エフェクト（星のパーティクル風）
    const { width, height } = this.scale;
    
    // 複数の星を生成
    for (let i = 0; i < 20; i++) {
      const star = this.add.text(
        Math.random() * width,
        Math.random() * height,
        '⭐',
        { fontSize: '16px' }
      );
      
      // ランダムなアニメーション
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000
      });
      
      // 回転アニメーション
      this.tweens.add({
        targets: star,
        rotation: Math.PI * 2,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        delay: Math.random() * 1000
      });
    }
  }
}
