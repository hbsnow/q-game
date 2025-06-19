import { AudioGenerator } from './AudioGenerator';

/**
 * 音響システムの統一管理クラス
 * 効果音とBGMを一元管理し、音量調整やプリロード機能を提供
 */
export class SoundManager {
  private scene: Phaser.Scene;
  private audioGenerator: AudioGenerator;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private bgm: Phaser.Sound.BaseSound | null = null;
  
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

  // === 便利メソッド ===

  /**
   * UI操作音を再生
   */
  playButtonTap(): void {
    this.audioGenerator.playButtonTap();
  }

  playButtonHover(): void {
    this.audioGenerator.playButtonHover();
  }

  playScreenTransition(): void {
    this.audioGenerator.playScreenTransition();
  }

  /**
   * ゲーム操作音を再生
   */
  playBlockSelect(): void {
    this.audioGenerator.playBlockSelect();
  }

  playBlockRemove(blockCount: number): void {
    this.audioGenerator.playBlockRemove(blockCount);
  }

  playBlockFall(): void {
    this.audioGenerator.playBlockFall();
  }

  playBlockLand(): void {
    this.audioGenerator.playBlockLand();
  }

  /**
   * 特別演出音を再生
   */
  playAllClear(): void {
    this.audioGenerator.playAllClear();
  }

  playStageComplete(): void {
    this.audioGenerator.playStageComplete();
  }

  playScoreGain(isGreat: boolean = false): void {
    this.audioGenerator.playScoreGain(isGreat);
  }

  /**
   * アイテム効果音を再生
   */
  playItemUse(): void {
    this.audioGenerator.playItemUse();
  }

  playBombExplode(): void {
    this.audioGenerator.playBombExplode();
  }

  playHammerHit(): void {
    this.audioGenerator.playHammerHit();
  }

  playShuffle(): void {
    this.audioGenerator.playShuffle();
  }

  /**
   * ガチャ効果音を再生
   */
  playGachaOpen(): void {
    this.audioGenerator.playGachaOpen();
  }

  playRareItem(): void {
    this.audioGenerator.playRareItem();
  }

  playCommonItem(): void {
    this.audioGenerator.playCommonItem();
  }

  /**
   * BGM再生の便利メソッド
   */
  playTitleBgm(): void {
    this.audioGenerator.playTitleBgm();
  }

  playGameBgm(): void {
    this.audioGenerator.playGameBgm();
  }

  playGachaBgm(): void {
    this.audioGenerator.playGachaBgm();
  }
}
