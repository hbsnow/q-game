import { Block, BlockType } from '../types/Block';

/**
 * ブロックの状態をアスキーアートで表示するユーティリティクラス
 */
export class BlockAsciiRenderer {
  /**
   * ブロック配列をアスキーアートとしてコンソールに出力
   * @param blocks ブロック配列
   * @param title タイトル（オプション）
   */
  static logBlocks(blocks: (Block | null)[][], title?: string): void {
    // JSON形式で出力
    console.log(`=== ${title || 'BLOCKS'} ===`);
    
    // ブロックの状態をJSON形式に変換
    const blocksJson = blocks.map(row => 
      row.map(block => {
        if (!block) return null;
        
        // 必要なプロパティのみを抽出
        return {
          x: block.x,
          y: block.y,
          color: block.color,
          type: block.type,
          ...(block.counterValue !== undefined ? { counterValue: block.counterValue } : {})
        };
      })
    );
    
    // 整形されたJSONとして出力
    console.log(JSON.stringify(blocksJson, null, 2));
  }
  
  /**
   * ブロックをアスキー文字に変換
   * @param block ブロック
   * @returns アスキー表現
   */
  static blockToAscii(block: Block | null): string {
    if (!block) {
      return '   ';
    }
    
    // 色の頭文字を取得
    let colorChar = '';
    switch (block.color) {
      case '#1E5799': colorChar = 'B'; break; // 深い青
      case '#7DB9E8': colorChar = 'L'; break; // 水色
      case '#2E8B57': colorChar = 'G'; break; // 海緑
      case '#FF6347': colorChar = 'R'; break; // 珊瑚赤
      case '#F4D03F': colorChar = 'Y'; break; // 砂金色
      case '#F5F5F5': colorChar = 'W'; break; // 真珠白
      case '#808080': colorChar = 'K'; break; // 岩ブロック（灰色）
      case '#C0C0C0': colorChar = 'S'; break; // 鋼鉄ブロック（シルバー）
      default: colorChar = '?'; break;
    }
    
    // ブロックタイプに応じた表現
    switch (block.type) {
      case BlockType.NORMAL:
        return `__${colorChar}`;
      case BlockType.ICE_LV1:
        return `_*${colorChar}`;
      case BlockType.ICE_LV2:
        return `**${colorChar}`;
      case BlockType.COUNTER_PLUS:
        return `_+${colorChar}`;
      case BlockType.COUNTER_MINUS:
        return `_-${colorChar}`;
      case BlockType.ICE_COUNTER_PLUS:
        return `*+${colorChar}`;
      case BlockType.ICE_COUNTER_MINUS:
        return `*-${colorChar}`;
      case BlockType.ROCK:
        return `<_>`;
      case BlockType.STEEL:
        return `<->`; // 鋼鉄ブロック
      default:
        return `??${colorChar}`;
    }
  }
  
  /**
   * 適用後のブロック配列を表示
   * @param before 変更前のブロック配列（比較用）
   * @param after 変更後のブロック配列（表示対象）
   * @param title タイトル（オプション）
   * @param highlight ハイライトする座標（オプション）
   */
  static logBlocksComparison(
    before: (Block | null)[][], 
    after: (Block | null)[][], 
    title?: string,
    highlight?: {x: number, y: number}
  ): void {
    console.log(`=== ${title || 'BLOCKS COMPARISON'} ===`);
    
    // ブロックの状態をJSON形式に変換
    const afterJson = after.map(row => 
      row.map(block => {
        if (!block) return null;
        
        // 必要なプロパティのみを抽出
        const blockData = {
          x: block.x,
          y: block.y,
          color: block.color,
          type: block.type,
          ...(block.counterValue !== undefined ? { counterValue: block.counterValue } : {})
        };
        
        // ハイライト情報を追加
        if (highlight && highlight.x === block.x && highlight.y === block.y) {
          return { ...blockData, highlighted: true };
        }
        
        return blockData;
      })
    );
    
    // 整形されたJSONとして出力
    console.log(JSON.stringify(afterJson, null, 2));
  }
}
