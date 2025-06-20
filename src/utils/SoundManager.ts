import { AudioGenerator } from './AudioGenerator';

/**
 * 海洋テーマ音響システムの統一管理クラス
 * プロシージャル音響生成と従来の効果音を組み合わせた高品質な音響体験
 */
export class SoundManager {
  private scene: Phaser.Scene;
  private audioGenerator: AudioGenerator;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private bgm: Phaser.Sound.BaseSound | null = null;
  
  // Web Audio API用
  private audioContext: AudioContext | null = null;
  
  // 音量設定（0.0 - 1.0）
  private masterVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.5;
  
  // 実際の音声ファイル使用フラグ
  private useRealAudio: boolean = false;
  
  // 音声ファイルの定義
  private readonly soundAssets = {
    // UI効果音
    buttonTap: 'button-tap',
    buttonHover: 'button-hover',
    screenTransition: 'screen-transition',
    
    // ゲーム効果音
    blockSelect: 'block-select',
    blockRemove: 'block-remove',
    blockFall: 'block-fall',
    blockLand: 'block-land',
    
    // 特別効果音
    allClear: 'all-clear',
    stageComplete: 'stage-complete',
    scoreGain: 'score-gain',
    greatScore: 'great-score',
    
    // アイテム効果音
    itemUse: 'item-use',
    bombExplode: 'bomb-explode',
    hammerHit: 'hammer-hit',
    shuffle: 'shuffle',
    
    // ガチャ効果音
    gachaOpen: 'gacha-open',
    rareItem: 'rare-item',
    commonItem: 'common-item',
    
    // BGM
    titleBgm: 'title-bgm',
    gameBgm: 'game-bgm',
    gachaBgm: 'gacha-bgm',
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioGenerator = new AudioGenerator();
    this.initializeOceanAudio();
  }

  /**
   * 海洋テーマ音響システムを初期化
   */
  private initializeOceanAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🌊 海洋テーマ音響システム初期化完了');
    } catch (error) {
      console.warn('🔊 AudioContext初期化に失敗:', error);
    }
  }

  /**
   * 音声アセットをプリロード
   */
  preloadSounds(): void {
    if (this.useRealAudio) {
      // 実際の音声ファイルを使用する場合のプリロード処理
      // 音声ファイルが用意されたら実装
      console.log('🎵 実際の音声ファイルをプリロード中...');
    } else {
      // AudioGeneratorを使用する場合は特別な処理は不要
      console.log('🎵 AudioGenerator準備完了');
    }
  }

  /**
   * 効果音を再生
   */
  playSfx(soundKey: string, volume: number = 1.0): void {
    try {
      if (this.useRealAudio) {
        // 実際の音声ファイルを使用する場合
        const finalVolume = this.masterVolume * this.sfxVolume * volume;
        const sound = this.scene.sound.add(soundKey, { volume: finalVolume });
        sound.play();
        this.sounds.set(soundKey + '_' + Date.now(), sound);
      } else {
        // AudioGeneratorを使用する場合
        console.log(`🔊 効果音再生: ${soundKey} (音量: ${(this.masterVolume * this.sfxVolume * volume).toFixed(2)})`);
        // 実際の音声生成は個別メソッドで処理
      }
    } catch (error) {
      console.warn(`効果音再生エラー: ${soundKey}`, error);
    }
  }

  /**
   * BGMを再生
   */
  playBgm(bgmKey: string, loop: boolean = true): void {
    try {
      // 既存のBGMを停止
      this.stopBgm();
      
      if (this.useRealAudio) {
        // 実際の音声ファイルを使用する場合
        const finalVolume = this.masterVolume * this.bgmVolume;
        this.bgm = this.scene.sound.add(bgmKey, { 
          volume: finalVolume, 
          loop: loop 
        });
        this.bgm.play();
      } else {
        // AudioGeneratorを使用する場合
        const finalVolume = this.masterVolume * this.bgmVolume;
        console.log(`🎵 BGM再生: ${bgmKey} (音量: ${finalVolume.toFixed(2)}, ループ: ${loop})`);
        // 実際の音声生成は個別メソッドで処理
      }
    } catch (error) {
      console.warn(`BGM再生エラー: ${bgmKey}`, error);
    }
  }

  /**
   * 海洋テーマの効果音を生成・再生
   */
  private playOceanSFX(type: 'bubble' | 'wave' | 'splash' | 'drop' | 'chime' | 'success' | 'error', volume: number = 1.0): void {
    if (!this.audioContext) return;
    
    const finalVolume = this.masterVolume * this.sfxVolume * volume;
    
    switch (type) {
      case 'bubble':
        this.generateBubbleSound(finalVolume);
        break;
      case 'wave':
        this.generateWaveSound(finalVolume);
        break;
      case 'splash':
        this.generateSplashSound(finalVolume);
        break;
      case 'drop':
        this.generateDropSound(finalVolume);
        break;
      case 'chime':
        this.generateChimeSound(finalVolume);
        break;
      case 'success':
        this.generateSuccessSound(finalVolume);
        break;
      case 'error':
        this.generateErrorSound(finalVolume);
        break;
    }
  }

  /**
   * 泡の音を生成
   */
  private generateBubbleSound(volume: number): void {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 泡の特徴的な音（高周波数の短い音）
    oscillator.frequency.setValueAtTime(800 + Math.random() * 400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
    
    oscillator.type = 'sine';
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  /**
   * 水滴の音を生成
   */
  private generateDropSound(volume: number): void {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 水滴の特徴的な音（短い高音から低音への変化）
    oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);
    
    oscillator.type = 'sine';
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.12);
  }

  /**
   * チャイム音を生成
   */
  private generateChimeSound(volume: number): void {
    if (!this.audioContext) return;
    
    // 複数の周波数を重ねた美しいチャイム音
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
      
      const delay = index * 0.1;
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext!.currentTime + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + delay + 1.0);
      
      oscillator.type = 'sine';
      oscillator.start(this.audioContext!.currentTime + delay);
      oscillator.stop(this.audioContext!.currentTime + delay + 1.0);
    });
  }

  /**
   * 成功音を生成
   */
  private generateSuccessSound(volume: number): void {
    if (!this.audioContext) return;
    
    // 上昇する音階で成功感を演出
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
      
      const delay = index * 0.15;
      gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext!.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + delay + 0.3);
      
      oscillator.type = 'triangle';
      oscillator.start(this.audioContext!.currentTime + delay);
      oscillator.stop(this.audioContext!.currentTime + delay + 0.3);
    });
  }

  /**
   * エラー音を生成
   */
  private generateErrorSound(volume: number): void {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 不協和音でエラー感を演出
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    oscillator.type = 'square';
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * 水しぶきの音を生成
   */
  private generateSplashSound(volume: number): void {
    if (!this.audioContext) return;
    
    // ホワイトノイズを使用した水しぶき音
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    source.start(this.audioContext.currentTime);
  }

  /**
   * 波の音を生成
   */
  private generateWaveSound(volume: number): void {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 波の音（低周波数のノイズ的な音）
    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.8);
    
    oscillator.type = 'sawtooth';
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.8);
  }

  /**
   * BGMを停止
   */
  stopBgm(): void {
    if (this.bgm) {
      console.log('🎵 BGM停止');
      this.bgm.stop();
      this.bgm = null;
    }
  }

  /**
   * 全ての音声を停止
   */
  stopAllSounds(): void {
    console.log('🔇 全音声停止');
    this.stopBgm();
    this.sounds.forEach(sound => sound.stop());
    this.sounds.clear();
  }

  /**
   * マスター音量を設定
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 マスター音量設定: ${this.masterVolume.toFixed(2)}`);
    
    // BGMの音量も更新
    if (this.bgm) {
      const newVolume = this.masterVolume * this.bgmVolume;
      // this.bgm.setVolume(newVolume);
    }
  }

  /**
   * 効果音音量を設定
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 効果音音量設定: ${this.sfxVolume.toFixed(2)}`);
  }

  /**
   * BGM音量を設定
   */
  setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    console.log(`🎵 BGM音量設定: ${this.bgmVolume.toFixed(2)}`);
    
    // 現在再生中のBGMの音量も更新
    if (this.bgm) {
      const newVolume = this.masterVolume * this.bgmVolume;
      // this.bgm.setVolume(newVolume);
    }
  }

  /**
   * 音量設定を取得
   */
  getVolumeSettings(): { master: number; sfx: number; bgm: number } {
    return {
      master: this.masterVolume,
      sfx: this.sfxVolume,
      bgm: this.bgmVolume,
    };
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    console.log('🗑️ SoundManager クリーンアップ');
    this.stopAllSounds();
    
    // AudioGeneratorをクリーンアップ
    if (this.audioGenerator) {
      this.audioGenerator.destroy();
    }
  }

  // === 海洋テーマ効果音メソッド（既存メソッドを置き換え） ===

  /**
   * UI操作音を再生
   */
  playButtonTap(): void {
    this.playOceanSFX('drop', 0.8);
  }

  playButtonHover(): void {
    this.playOceanSFX('bubble', 0.4);
  }

  playScreenTransition(): void {
    this.playOceanSFX('wave', 0.6);
  }

  /**
   * ゲーム操作音を再生
   */
  playBlockSelect(): void {
    this.playOceanSFX('bubble', 0.6);
  }

  playBlockRemove(blockCount: number): void {
    const volume = Math.min(1.0, 0.4 + (blockCount * 0.1));
    if (blockCount >= 10) {
      this.playOceanSFX('splash', volume);
    } else {
      this.playOceanSFX('bubble', volume);
    }
  }

  playBlockFall(): void {
    this.playOceanSFX('drop', 0.3);
  }

  playBlockLand(): void {
    this.playOceanSFX('drop', 0.2);
  }

  /**
   * 特別演出音を再生
   */
  playAllClear(): void {
    this.playOceanSFX('success', 1.0);
  }

  playStageComplete(): void {
    this.playOceanSFX('success', 1.0);
  }

  playScoreGain(isGreat: boolean = false): void {
    if (isGreat) {
      this.playOceanSFX('chime', 0.9);
    } else {
      this.playOceanSFX('drop', 0.7);
    }
  }

  /**
   * アイテム効果音を再生
   */
  playItemUse(): void {
    this.playOceanSFX('chime', 0.8);
  }

  playBombExplode(): void {
    this.playOceanSFX('splash', 1.0);
  }

  playHammerHit(): void {
    this.playOceanSFX('drop', 0.9);
  }

  playShuffle(): void {
    this.playOceanSFX('wave', 0.8);
  }

  /**
   * ガチャ効果音を再生
   */
  playGachaOpen(): void {
    this.playOceanSFX('chime', 0.9);
  }

  playRareItem(): void {
    this.playOceanSFX('success', 1.0);
  }

  playCommonItem(): void {
    this.playOceanSFX('drop', 0.7);
  }

  /**
   * エラー音
   */
  playError(): void {
    this.playOceanSFX('error', 0.8);
  }

  /**
   * BGM再生の便利メソッド
   */
  playTitleBgm(): void {
    console.log('🎵 タイトルBGM再生（海洋テーマ）');
    // 実際のBGM実装は複雑になるため、現在はログのみ
  }

  playGameBgm(): void {
    console.log('🎵 ゲームBGM再生（海洋テーマ）');
    // 実際のBGM実装は複雑になるため、現在はログのみ
  }

  playGachaBgm(): void {
    console.log('🎵 ガチャBGM再生（海洋テーマ）');
    // 実際のBGM実装は複雑になるため、現在はログのみ
  }

  /**
   * AudioContextを再開（ユーザーインタラクション後）
   */
  resumeAudioContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      console.log('🔊 AudioContext再開');
    }
  }
}
