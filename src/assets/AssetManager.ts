/**
 * 海洋テーマアセット管理クラス
 * プレースホルダーから本格的な海洋テーマアセットへの統一管理
 */
import { BlockAssets } from './BlockAssets';
import { ObstacleAssets } from './ObstacleAssets';
import { UIAssets } from './UIAssets';
import { ItemIconAssets } from './ItemIconAssets';

export class AssetManager {
  private static instance: AssetManager;
  private scene: Phaser.Scene;
  private assetsLoaded: boolean = false;
  
  private constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(scene: Phaser.Scene): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager(scene);
    }
    AssetManager.instance.scene = scene;
    return AssetManager.instance;
  }
  
  /**
   * 全アセットを生成・登録
   */
  loadAllAssets(): void {
    if (this.assetsLoaded) {
      return;
    }
    
    console.log('🎨 海洋テーマアセットを生成中...');
    
    // ブロックアセット
    this.loadBlockAssets();
    
    // 妨害ブロックアセット
    this.loadObstacleAssets();
    
    // UIアセット
    this.loadUIAssets();
    
    // アイテムアイコンアセット
    this.loadItemIconAssets();
    
    this.assetsLoaded = true;
    console.log('✅ 海洋テーマアセット生成完了');
  }
  
  /**
   * ブロックアセットを生成
   */
  private loadBlockAssets(): void {
    const colors = [
      '#1E5799', // 深い青
      '#7DB9E8', // 水色
      '#2E8B57', // 海緑
      '#FF6347', // 珊瑚赤
      '#F4D03F', // 砂金色
      '#F5F5F5'  // 真珠白
    ];
    
    colors.forEach(color => {
      // 通常ブロック
      BlockAssets.createOceanBlockTexture(this.scene, color);
      
      // 氷結ブロック Lv1
      BlockAssets.createOceanIceBlockTexture(this.scene, color, 1);
      
      // 氷結ブロック Lv2
      BlockAssets.createOceanIceBlockTexture(this.scene, color, 2);
    });
  }
  
  /**
   * 妨害ブロックアセットを生成
   */
  private loadObstacleAssets(): void {
    const colors = [
      '#1E5799', '#7DB9E8', '#2E8B57', '#FF6347', '#F4D03F', '#F5F5F5'
    ];
    
    colors.forEach(color => {
      // カウンター+ブロック（数値は動的に生成）
      for (let count = 2; count <= 10; count++) {
        ObstacleAssets.createCounterPlusTexture(this.scene, color, count);
      }
      
      // カウンター-ブロック（数値は動的に生成）
      for (let count = 2; count <= 10; count++) {
        ObstacleAssets.createCounterMinusTexture(this.scene, color, count);
      }
    });
    
    // 岩ブロック
    ObstacleAssets.createRockTexture(this.scene);
    
    // 鋼鉄ブロック
    ObstacleAssets.createSteelTexture(this.scene);
  }
  
  /**
   * UIアセットを生成
   */
  private loadUIAssets(): void {
    // ボタン各種
    const buttonSizes = [
      { width: 120, height: 40 },
      { width: 100, height: 35 },
      { width: 80, height: 30 }
    ];
    
    const buttonTypes: ('primary' | 'secondary' | 'danger' | 'success')[] = 
      ['primary', 'secondary', 'danger', 'success'];
    
    buttonSizes.forEach(size => {
      buttonTypes.forEach(type => {
        UIAssets.createOceanButton(this.scene, size.width, size.height, type);
      });
    });
    
    // 背景
    UIAssets.createOceanBackground(this.scene, 400, 710);
    
    // パネルとフレーム
    const panelSizes = [
      { width: 200, height: 150 },
      { width: 300, height: 200 },
      { width: 400, height: 300 }
    ];
    const panelStyles: ('light' | 'dark' | 'transparent')[] = ['light', 'dark', 'transparent'];
    
    panelSizes.forEach(size => {
      panelStyles.forEach(style => {
        UIAssets.createOceanPanel(this.scene, size.width, size.height, style);
      });
    });
    
    // 装飾枠
    const frameSizes = [
      { width: 100, height: 100 },
      { width: 200, height: 150 },
      { width: 300, height: 200 }
    ];
    frameSizes.forEach(size => {
      UIAssets.createOceanFrame(this.scene, size.width, size.height, 4);
    });
    
    // 背景
    UIAssets.createOceanBackground(this.scene, 400, 710);
  }
  
  /**
   * アイテムアイコンアセットを生成
   */
  private loadItemIconAssets(): void {
    const iconSize = 32;
    
    // 基本アイテム
    ItemIconAssets.createSwapIcon(this.scene, iconSize);
    ItemIconAssets.createChangeOneIcon(this.scene, iconSize);
    ItemIconAssets.createMiniBombIcon(this.scene, iconSize);
    ItemIconAssets.createShuffleIcon(this.scene, iconSize);
    
    // 高級アイテム
    ItemIconAssets.createBombIcon(this.scene, iconSize);
    ItemIconAssets.createHammerIcon(this.scene, iconSize);
    ItemIconAssets.createScoreBoosterIcon(this.scene, iconSize);
    
    // 未実装アイテム用の汎用アイコン
    const genericItems = [
      { name: 'melting_agent', color: 0x87CEEB, symbol: '❄' },
      { name: 'change_area', color: 0x32CD32, symbol: '🌊' },
      { name: 'counter_reset', color: 0xFF6347, symbol: '↻' },
      { name: 'add_plus', color: 0xFFD700, symbol: '+' },
      { name: 'steel_hammer', color: 0x696969, symbol: '🔨' },
      { name: 'special_hammer', color: 0xFF1493, symbol: '⚡' }
    ];
    
    genericItems.forEach(item => {
      ItemIconAssets.createGenericIcon(this.scene, iconSize, item.color, item.symbol);
    });
  }
  
  /**
   * 色名を取得
   */
  private getColorName(color: string): string {
    const colorMap: { [key: string]: string } = {
      '#1E5799': 'deep_blue',
      '#7DB9E8': 'light_blue',
      '#2E8B57': 'sea_green',
      '#FF6347': 'coral_red',
      '#F4D03F': 'sand_gold',
      '#F5F5F5': 'pearl_white'
    };
    
    return colorMap[color] || 'unknown';
  }
  
  /**
   * ブロックテクスチャキーを取得
   */
  getBlockTextureKey(color: string, type: string = 'normal', level?: number): string {
    const colorName = this.getColorName(color);
    
    switch (type) {
      case 'normal':
        return `ocean_block_${colorName}`;
      case 'ice':
        return `ocean_ice_${level}_${color.replace('#', '')}`;
      default:
        return `ocean_block_${colorName}`;
    }
  }
  
  /**
   * 妨害ブロックテクスチャキーを取得
   */
  getObstacleTextureKey(type: string, color?: string, count?: number): string {
    switch (type) {
      case 'counterPlus':
        return `counter_plus_${color?.replace('#', '')}_${count}`;
      case 'counterMinus':
        return `counter_minus_${color?.replace('#', '')}_${count}`;
      case 'rock':
        return 'rock_block';
      case 'steel':
        return 'steel_block';
      default:
        return 'rock_block';
    }
  }
  
  /**
   * UIテクスチャキーを取得
   */
  getUITextureKey(type: string, ...params: any[]): string {
    switch (type) {
      case 'button':
        const [buttonType, width, height] = params;
        return `ocean_button_${buttonType}_${width}x${height}`;
      case 'background':
        const [bgWidth, bgHeight] = params;
        return `ocean_background_${bgWidth}x${bgHeight}`;
      case 'itemFrame':
        const [frameType, size] = params;
        return `item_frame_${frameType}_${size}`;
      case 'treasureChest':
        const [chestSize, isOpen] = params;
        return `treasure_chest_${chestSize}_${isOpen ? 'open' : 'closed'}`;
      default:
        return '';
    }
  }
  
  /**
   * アイテムアイコンテクスチャキーを取得
   */
  getItemIconTextureKey(itemType: string, size: number = 32): string {
    return `${itemType}_icon_${size}`;
  }
  
  /**
   * アセットが読み込み済みかチェック
   */
  isLoaded(): boolean {
    return this.assetsLoaded;
  }
  
  /**
   * アセットをリロード
   */
  reload(): void {
    this.assetsLoaded = false;
    this.loadAllAssets();
  }
}
