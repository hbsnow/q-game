/**
 * 音響管理システム
 */

import Phaser from 'phaser';

/**
 * 音響の種類
 */
export enum AudioType {
  BGM = 'BGM',
  SFX = 'SFX',
  VOICE = 'VOICE'
}

/**
 * 音響設定
 */
interface AudioConfig {
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

/**
 * 音響管理クラス
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private bgmVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private voiceVolume: number = 0.8;
  private isMuted: boolean = false;
  private currentBGM: Phaser.Sound.BaseSound | null = null;
  private activeSounds: Map<string, Phaser.Sound.BaseSound> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadAudioSettings();
  }

  /**
   * 音響設定の読み込み
   */
  private loadAudioSettings(): void {
    // LocalStorageから設定を読み込み（実際の実装では使用しない）
    // この実装では基本設定のみ
    this.bgmVolume = 0.3; // 控えめに設定
    this.sfxVolume = 0.5;
    this.voiceVolume = 0.6;
    this.isMuted = false;
  }

  /**
   * BGMの再生
   */
  playBGM(key: string, config?: Partial<AudioConfig>): void {
    // 現在のBGMを停止
    if (this.currentBGM) {
      this.stopBGM();
    }

    // 新しいBGMを再生
    try {
      const defaultConfig: AudioConfig = {
        volume: this.bgmVolume,
        loop: true,
        fadeIn: 1000
      };

      const finalConfig = { ...defaultConfig, ...config };
      
      this.currentBGM = this.scene.sound.add(key, {
        volume: this.isMuted ? 0 : finalConfig.volume,
        loop: finalConfig.loop
      });

      this.currentBGM.play();

      // フェードイン
      if (finalConfig.fadeIn && finalConfig.fadeIn > 0) {
        (this.currentBGM as any).setVolume?.(0);
        this.scene.tweens.add({
          targets: this.currentBGM,
          volume: this.isMuted ? 0 : finalConfig.volume,
          duration: finalConfig.fadeIn,
          ease: 'Power2'
        });
      }
    } catch (error) {
      console.warn(`BGM key "${key}" not found. Playing placeholder sound.`);
      this.playPlaceholderBGM();
    }
  }

  /**
   * BGMの停止
   */
  stopBGM(fadeOut?: number): void {
    if (!this.currentBGM) return;

    if (fadeOut && fadeOut > 0) {
      this.scene.tweens.add({
        targets: this.currentBGM,
        volume: 0,
        duration: fadeOut,
        ease: 'Power2',
        onComplete: () => {
          this.currentBGM?.stop();
          this.currentBGM = null;
        }
      });
    } else {
      this.currentBGM.stop();
      this.currentBGM = null;
    }
  }

  /**
   * 効果音の再生
   */
  playSFX(key: string, config?: Partial<AudioConfig>): void {
    try {
      const defaultConfig: AudioConfig = {
        volume: this.sfxVolume,
        loop: false
      };

      const finalConfig = { ...defaultConfig, ...config };
      
      const sound = this.scene.sound.add(key, {
        volume: this.isMuted ? 0 : finalConfig.volume,
        loop: finalConfig.loop
      });

      sound.play();
      
      // 一回限りの音は自動削除
      if (!finalConfig.loop) {
        sound.once('complete', () => {
          sound.destroy();
        });
      } else {
        this.activeSounds.set(key, sound);
      }
    } catch (error) {
      console.warn(`SFX key "${key}" not found. Playing placeholder sound.`);
      this.playPlaceholderSFX();
    }
  }

  /**
   * プレースホルダーBGMの再生
   */
  private playPlaceholderBGM(): void {
    // Web Audio APIを使用してシンプルな音を生成
    try {
      const context = (this.scene.sound as any).context;
      if (!context) return;

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // 穏やかな海の音をイメージした低い周波数
      oscillator.frequency.setValueAtTime(220, context.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.1, context.currentTime + 0.5);

      oscillator.start();

      // 5秒後に停止
      this.scene.time.delayedCall(5000, () => {
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);
        oscillator.stop(context.currentTime + 0.5);
      });
    } catch (error) {
      console.warn('Could not play placeholder BGM');
    }
  }

  /**
   * プレースホルダー効果音の再生
   */
  private playPlaceholderSFX(): void {
    try {
      const context = (this.scene.sound as any).context;
      if (!context) return;

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // 短いビープ音
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    } catch (error) {
      console.warn('Could not play placeholder SFX');
    }
  }

  /**
   * 特定の効果音セット
   */
  
  // ブロック操作音
  playBlockClick(): void {
    this.playSFX('blockClick');
  }

  playBlockRemove(blockCount: number): void {
    // ブロック数に応じて音の高さを変える
    const pitch = Math.min(1.5, 1 + (blockCount - 2) * 0.1);
    this.playSFX('blockRemove', { volume: this.sfxVolume * pitch });
  }

  playBlockFall(): void {
    this.playSFX('blockFall');
  }

  // UI操作音
  playButtonClick(): void {
    this.playSFX('buttonClick');
  }

  playButtonHover(): void {
    this.playSFX('buttonHover', { volume: this.sfxVolume * 0.5 });
  }

  // ゲーム状態音
  playStageComplete(): void {
    this.playSFX('stageComplete');
  }

  playAllClear(): void {
    this.playSFX('allClear');
  }

  playGameOver(): void {
    this.playSFX('gameOver');
  }

  // ガチャ音
  playGachaStart(): void {
    this.playSFX('gachaStart');
  }

  playGachaResult(rarity: string): void {
    const rarityVolume = rarity === 'S' || rarity === 'A' ? 1.2 : 1.0;
    this.playSFX('gachaResult', { volume: this.sfxVolume * rarityVolume });
  }

  // アイテム使用音
  playItemUse(itemType: string): void {
    switch (itemType) {
      case 'bomb':
        this.playSFX('explosion');
        break;
      case 'hammer':
        this.playSFX('hammer');
        break;
      case 'shuffle':
        this.playSFX('shuffle');
        break;
      default:
        this.playSFX('itemUse');
    }
  }

  /**
   * 音量設定
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.currentBGM) {
      (this.currentBGM as any).setVolume?.(this.isMuted ? 0 : this.bgmVolume);
    }
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setVoiceVolume(volume: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * ミュート切り替え
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    
    if (this.currentBGM) {
      (this.currentBGM as any).setVolume?.(this.isMuted ? 0 : this.bgmVolume);
    }
    
    this.activeSounds.forEach(sound => {
      (sound as any).setVolume?.(this.isMuted ? 0 : this.sfxVolume);
    });
  }

  /**
   * 全ての音を停止
   */
  stopAllSounds(): void {
    this.stopBGM();
    this.activeSounds.forEach(sound => {
      sound.stop();
    });
    this.activeSounds.clear();
  }

  /**
   * 音量レベルの取得
   */
  getBGMVolume(): number {
    return this.bgmVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  getVoiceVolume(): number {
    return this.voiceVolume;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * 現在再生中のBGMキーを取得
   */
  getCurrentBGMKey(): string | null {
    return this.currentBGM ? (this.currentBGM as any).key : null;
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.stopAllSounds();
  }
}
