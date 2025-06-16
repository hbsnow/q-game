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
    // 出力を一つの文字列にまとめる
    let output = '';
    
    if (title) {
      output += `=== ${title} ===\n`;
    }
    
    // 列のラベル（a, b, c, ...）
    let header = '     ';
    for (let x = 0; x < blocks[0].length; x++) {
      header += String.fromCharCode(97 + x) + '   ';
    }
    output += header + '\n';
    
    // 上部の枠線
    let topBorder = '  +-';
    for (let x = 0; x < blocks[0].length; x++) {
      topBorder += '----';
    }
    topBorder += '-+';
    output += topBorder + '\n';
    
    // 各行のブロック
    for (let y = 0; y < blocks.length; y++) {
      let row = y.toString().padStart(1) + ' |';
      
      for (let x = 0; x < blocks[y].length; x++) {
        const block = blocks[y][x];
        row += ' ' + this.blockToAscii(block) + ' ';
      }
      
      row += '|';
      output += row + '\n';
    }
    
    // 下部の枠線
    let bottomBorder = '  +-';
    for (let x = 0; x < blocks[0].length; x++) {
      bottomBorder += '----';
    }
    bottomBorder += '-+';
    output += bottomBorder;
    
    // まとめた出力を一度に表示
    console.log(output);
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
    // 出力を一つの文字列にまとめる
    let output = '';
    
    if (title) {
      output += `=== ${title} ===\n`;
    }
    
    // 列のラベル（a, b, c, ...）
    let header = '     ';
    for (let x = 0; x < Math.max(before[0]?.length || 0, after[0]?.length || 0); x++) {
      header += String.fromCharCode(97 + x) + '   ';
    }
    output += header + '\n';
    
    // 上部の枠線
    let topBorder = '  +-';
    for (let x = 0; x < Math.max(before[0]?.length || 0, after[0]?.length || 0); x++) {
      topBorder += '----';
    }
    topBorder += '-+';
    output += topBorder + '\n';
    
    // 各行のブロック
    const maxHeight = Math.max(before.length, after.length);
    for (let y = 0; y < maxHeight; y++) {
      let afterRow = y.toString().padStart(1) + ' |';
      
      const maxWidth = Math.max(before[0]?.length || 0, after[0]?.length || 0);
      for (let x = 0; x < maxWidth; x++) {
        const afterBlock = after[y]?.[x] || null;
        const afterAscii = this.blockToAscii(afterBlock);
        
        // ハイライト表示
        const isHighlighted = highlight && highlight.x === x && highlight.y === y;
        
        if (isHighlighted) {
          // ハイライト表示の場合は[]で囲む
          afterRow += ' [' + afterAscii + ']';
        } else {
          // 通常表示
          afterRow += '  ' + afterAscii + ' ';
        }
      }
      
      afterRow += '|';
      
      output += afterRow + '\n';
    }
    
    // 下部の枠線
    let bottomBorder = '  +-';
    for (let x = 0; x < Math.max(before[0]?.length || 0, after[0]?.length || 0); x++) {
      bottomBorder += '----';
    }
    bottomBorder += '-+';
    output += bottomBorder;
    
    // まとめた出力を一度に表示
    console.log(output);
  }
}
