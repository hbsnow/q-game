import { Block, BlockType } from '../types/Block';

/**
 * ブロックのアスキーアート表示を行うユーティリティクラス
 */
export class BlockAsciiRenderer {
  /**
   * ブロック配列をアスキーアートとしてコンソールに出力
   * @param blocks ブロック配列
   * @param title タイトル（省略可）
   */
  static logBlocks(blocks: (Block | null)[][], title?: string): void {
    if (title) {
      console.log(`=== ${title} ===`);
    }
    
    // 列ヘッダーを出力
    let header = '     ';
    for (let x = 0; x < blocks[0]?.length || 0; x++) {
      const colName = String.fromCharCode(97 + x); // a, b, c, ...
      header += colName + '   ';
    }
    console.log(header);
    
    // 上部の枠線
    let topBorder = '  +';
    for (let x = 0; x < blocks[0]?.length || 0; x++) {
      topBorder += '---';
    }
    topBorder += '-+';
    console.log(topBorder);
    
    // 各行を出力
    for (let y = 0; y < blocks.length; y++) {
      let line = y + ' |';
      for (let x = 0; x < blocks[y].length; x++) {
        const block = blocks[y][x];
        if (block === null) {
          line += '   ';
        } else {
          line += ' ' + this.getBlockSymbol(block) + ' ';
        }
      }
      line += ' |';
      console.log(line);
    }
    
    // 下部の枠線
    let bottomBorder = '  +';
    for (let x = 0; x < blocks[0]?.length || 0; x++) {
      bottomBorder += '---';
    }
    bottomBorder += '-+';
    console.log(bottomBorder);
  }
  
  /**
   * ブロック配列の比較をアスキーアートとしてコンソールに出力
   * @param beforeBlocks 変更前のブロック配列
   * @param afterBlocks 変更後のブロック配列
   * @param title タイトル（省略可）
   * @param clickPosition クリック位置（省略可）
   */
  static logBlocksComparison(
    beforeBlocks: (Block | null)[][],
    afterBlocks: (Block | null)[][],
    title?: string,
    clickPosition?: { x: number, y: number }
  ): void {
    console.log(title ? `=== ${title} ===` : '=== BLOCKS COMPARISON ===');
    
    console.log('BEFORE:');
    this.logBlocks(beforeBlocks);
    
    console.log('AFTER:');
    this.logBlocks(afterBlocks);
    
    console.log('========================');
  }
  
  /**
   * ブロックを表すシンボルを取得
   * @param block ブロック
   * @returns シンボル文字列
   */
  private static getBlockSymbol(block: Block): string {
    // 色のシンボル
    const colorSymbol = this.getColorSymbol(block.color);
    
    // ブロックタイプに応じたプレフィックス
    let prefix = '';
    switch (block.type) {
      case BlockType.NORMAL:
        prefix = '__';
        break;
      case BlockType.ICE_LV1:
        prefix = '_*';
        break;
      case BlockType.ICE_LV2:
        prefix = '**';
        break;
      case BlockType.COUNTER_PLUS:
        prefix = '_+';
        break;
      case BlockType.COUNTER_MINUS:
        prefix = '_-';
        break;
      case BlockType.ICE_COUNTER_PLUS:
        prefix = '*+';
        break;
      case BlockType.ICE_COUNTER_MINUS:
        prefix = '*-';
        break;
      case BlockType.ROCK:
        return '<_>';
      case BlockType.STEEL:
        return '<->';
      default:
        prefix = '??';
    }
    
    return prefix + colorSymbol;
  }
  
  /**
   * 色を表すシンボルを取得
   * @param color 色（HEX形式）
   * @returns 色のシンボル
   */
  private static getColorSymbol(color: string): string {
    switch (color.toUpperCase()) {
      case '#1E5799': // 深い青
        return 'B';
      case '#7DB9E8': // 水色
        return 'L';
      case '#2E8B57': // 海緑
        return 'G';
      case '#FF6347': // 珊瑚赤
        return 'R';
      case '#F4D03F': // 砂金色
        return 'Y';
      case '#F5F5F5': // 真珠白
        return 'W';
      default:
        return '?';
    }
  }
}
