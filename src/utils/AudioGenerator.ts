/**
 * Web Audio APIを使用した音声生成クラス
 * 海をテーマにした音響効果をプログラマティックに生成
 */
export class AudioGenerator {
  private audioContext: AudioContext;
  private masterGain: GainNode;

  constructor() {
    // AudioContextを初期化
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // マスターゲインノードを作成
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
  }

  /**
   * AudioContextを再開（ユーザーインタラクション後に必要）
   */
  async resumeContext(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * UI操作音を生成・再生
   */
  playButtonTap(): void {
    this.resumeContext().then(() => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // 短いクリック音（高音）
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    });
  }

  playButtonHover(): void {
    this.resumeContext().then(() => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // 柔らかいホバー音
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    });
  }

  playScreenTransition(): void {
    this.resumeContext().then(() => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // 上昇する遷移音
      oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    });
  }

  /**
   * ゲーム操作音を生成・再生
   */
  playBlockSelect(): void {
    this.resumeContext().then(() => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // 水滴のような選択音
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.08);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.08);
    });
  }

  playBlockRemove(blockCount: number): void {
    this.resumeContext().then(() => {
      // ブロック数に応じて音の複雑さを調整
      const baseFreq = 500;
      const volume = Math.min(0.5, 0.2 + (blockCount * 0.05));
      
      for (let i = 0; i < Math.min(blockCount, 5); i++) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // 泡がはじける音
        const freq = baseFreq + (i * 100) + (Math.random() * 50);
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, this.audioContext.currentTime + 0.15);
        oscillator.type = 'triangle';
        
        const delay = i * 0.02;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.15);
        
        oscillator.start(this.audioContext.currentTime + delay);
        oscillator.stop(this.audioContext.currentTime + delay + 0.15);
      }
    });
  }

  playBlockFall(): void {
    this.resumeContext().then(() => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // 下降する落下音
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    });
  }

  playBlockLand(): void {
    this.resumeContext().then(() => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // 着地音（短く低い音）
      oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    });
  }

  /**
   * 特別演出音を生成・再生
   */
  playScoreGain(isGreat: boolean = false): void {
    this.resumeContext().then(() => {
      if (isGreat) {
        // GREAT時の特別音
        this.playChord([523, 659, 784], 0.4, 0.3); // C-E-G chord
      } else {
        // 通常スコア音
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(700, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
      }
    });
  }

  playAllClear(): void {
    this.resumeContext().then(() => {
      // 全消し時の華やかな音
      const frequencies = [523, 659, 784, 1047]; // C-E-G-C octave
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        const delay = index * 0.1;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.5);
        
        oscillator.start(this.audioContext.currentTime + delay);
        oscillator.stop(this.audioContext.currentTime + delay + 0.5);
      });
    });
  }

  playStageComplete(): void {
    this.resumeContext().then(() => {
      // ステージクリア時のファンファーレ
      const melody = [523, 659, 784, 1047, 1319]; // C-E-G-C-E
      melody.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'triangle';
        
        const delay = index * 0.15;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.4);
        
        oscillator.start(this.audioContext.currentTime + delay);
        oscillator.stop(this.audioContext.currentTime + delay + 0.4);
      });
    });
  }

  /**
   * アイテム効果音を生成・再生
   */
  playItemUse(): void {
    this.resumeContext().then(() => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // 魔法のような使用音
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    });
  }

  playBombExplode(): void {
    this.resumeContext().then(() => {
      // 爆発音（ノイズ + 低音）
      const noiseBuffer = this.createNoiseBuffer(0.3);
      const noiseSource = this.audioContext.createBufferSource();
      const noiseGain = this.audioContext.createGain();
      
      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      
      noiseGain.gain.setValueAtTime(0.6, this.audioContext.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      noiseSource.start(this.audioContext.currentTime);
      
      // 低音の振動も追加
      const bassOsc = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      
      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      
      bassOsc.frequency.setValueAtTime(60, this.audioContext.currentTime);
      bassOsc.type = 'square';
      
      bassGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      bassOsc.start(this.audioContext.currentTime);
      bassOsc.stop(this.audioContext.currentTime + 0.2);
    });
  }

  playHammerHit(): void {
    this.resumeContext().then(() => {
      // ハンマー音（短い衝撃音）
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    });
  }

  playShuffle(): void {
    this.resumeContext().then(() => {
      // シャッフル音（複数の音が混ざる）
      for (let i = 0; i < 8; i++) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const freq = 300 + (Math.random() * 400);
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'triangle';
        
        const delay = i * 0.1;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.15);
        
        oscillator.start(this.audioContext.currentTime + delay);
        oscillator.stop(this.audioContext.currentTime + delay + 0.15);
      }
    });
  }

  /**
   * ガチャ効果音を生成・再生
   */
  playGachaOpen(): void {
    this.resumeContext().then(() => {
      // 宝箱を開ける音
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.6);
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.6);
    });
  }

  playRareItem(): void {
    this.resumeContext().then(() => {
      // レアアイテム獲得音（キラキラ音）
      const frequencies = [1047, 1319, 1568, 2093]; // C-E-G-C (high octave)
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        const delay = index * 0.05;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.8);
        
        oscillator.start(this.audioContext.currentTime + delay);
        oscillator.stop(this.audioContext.currentTime + delay + 0.8);
      });
    });
  }

  playCommonItem(): void {
    this.resumeContext().then(() => {
      // 通常アイテム獲得音
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(659, this.audioContext.currentTime + 0.3);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    });
  }

  /**
   * BGM生成・再生
   */
  playTitleBgm(): void {
    // タイトルBGM（穏やかな海の音）
    this.resumeContext().then(() => {
      this.playAmbientOceanSound();
    });
  }

  playGameBgm(): void {
    // ゲームBGM（集中できる環境音）
    this.resumeContext().then(() => {
      this.playSubtleWaterSound();
    });
  }

  playGachaBgm(): void {
    // ガチャBGM（期待感のある音）
    this.resumeContext().then(() => {
      this.playMysteriousOceanSound();
    });
  }

  /**
   * ヘルパーメソッド
   */
  private playChord(frequencies: number[], volume: number, duration: number): void {
    frequencies.forEach(freq => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    });
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  private playAmbientOceanSound(): void {
    // 穏やかな海の環境音（低周波ノイズ）
    const noiseBuffer = this.createFilteredNoise(10, 200); // 10秒間、200Hz以下
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = noiseBuffer;
    source.loop = true;
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    
    source.start(this.audioContext.currentTime);
    
    // 10秒後に停止
    setTimeout(() => {
      source.stop();
    }, 10000);
  }

  private playSubtleWaterSound(): void {
    // 微細な水音（集中を妨げない）
    const noiseBuffer = this.createFilteredNoise(15, 150);
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = noiseBuffer;
    source.loop = true;
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    
    source.start(this.audioContext.currentTime);
    
    setTimeout(() => {
      source.stop();
    }, 15000);
  }

  private playMysteriousOceanSound(): void {
    // 神秘的な海の音
    const noiseBuffer = this.createFilteredNoise(8, 300);
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = noiseBuffer;
    source.loop = true;
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    
    source.start(this.audioContext.currentTime);
    
    setTimeout(() => {
      source.stop();
    }, 8000);
  }

  private createFilteredNoise(duration: number, cutoffFreq: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    // ホワイトノイズを生成
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    // 簡単なローパスフィルター（海の音らしく）
    const alpha = cutoffFreq / sampleRate;
    let prev = 0;
    for (let i = 0; i < bufferSize; i++) {
      data[i] = prev + alpha * (data[i] - prev);
      prev = data[i];
    }
    
    return buffer;
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
