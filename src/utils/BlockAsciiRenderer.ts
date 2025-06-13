import { Block } from '../types/Block';

/**
 * ブロックの状態をアスキーアートで表示するクラス
 */
export class BlockAsciiRenderer {
  /**
   * ブロック配列をアスキーアートとして文字列化
   * @param blocks ブロック配列
   * @param clickPosition クリック位置（オプション）
   * @returns アスキーアート文字列
   */
  static renderBlocks(blocks: Block[][], clickPosition?: {x: number, y: number}): string {
    if (!blocks || blocks.length === 0) {
      return 'Empty blocks array';
    }

    const height = blocks.length;
    const width = blocks[0]?.length || 0;
    
    // 列のヘッダー（a, b, c, ...）を作成
    let header = '     ';
    for (let x = 0; x < width; x++) {
      const columnLabel = String.fromCharCode(97 + x); // 97は'a'のUnicode
      header += columnLabel + '   ';
    }
    
    // 上部の枠線
    let border = '  +';
    for (let x = 0; x < width; x++) {
      border += '----';
    }
    border += '-+';
    
    // 結果の文字列を構築
    let result = header + '\n' + border + '\n';
    
    // 各行のブロックを描画
    for (let y = 0; y < height; y++) {
      let row = y + ' |';
      
      for (let x = 0; x < width; x++) {
        const block = blocks[y][x];
        let blockStr = this.blockToAscii(block);
        
        // クリック位置がある場合、その位置を強調表示
        if (clickPosition && clickPosition.x === x && clickPosition.y === y) {
          blockStr = `[${blockStr}]`;
        } else {
          blockStr = ` ${blockStr} `;
        }
        
        row += blockStr;
      }
      
      row += '|';
      result += row + '\n';
    }
    
    // 下部の枠線
    result += border;
    
    return result;
  }
  
  /**
   * 単一ブロックをアスキー表現に変換
   * @param block ブロック
   * @returns アスキー表現
   */
  private static blockToAscii(block: Block | null): string {
    if (!block) {
      return '   '; // 空白ブロック
    }
    
    // 色のマッピング
    const colorMap: Record<string, string> = {
      '#1E5799': 'B', // 深い青
      '#7DB9E8': 'L', // 水色
      '#2E8B57': 'G', // 海緑
      '#FF6347': 'R', // 珊瑚赤
      '#F4D03F': 'Y', // 砂金色
      '#F5F5F5': 'W'  // 真珠白
    };
    
    // 色コードを短縮表記に変換
    const colorCode = colorMap[block.color] || '?';
    
    // ブロックタイプに基づいて表現を決定
    switch (block.type) {
      case 'normal':
        return `__${colorCode}`;
      case 'iceLv1':
        return `_*${colorCode}`;
      case 'iceLv2':
        return `**${colorCode}`;
      case 'counterPlus':
        return `_+${colorCode}`;
      case 'counterMinus':
        return `_-${colorCode}`;
      case 'iceCounterPlus':
        return `*+${colorCode}`;
      case 'iceCounterMinus':
        return `*-${colorCode}`;
      case 'rock':
        return `[_]`;
      case 'steel':
        return `[-]`;
      default:
        return `??${colorCode}`;
    }
  }
  
  /**
   * ブロック配列をコンソールに出力
   * @param blocks ブロック配列
   * @param label 出力時のラベル（オプション）
   * @param clickPosition クリック位置（オプション）
   */
  static logBlocks(blocks: Block[][], label?: string, clickPosition?: {x: number, y: number}): void {
    const asciiArt = this.renderBlocks(blocks, clickPosition);
    if (label) {
      console.log(`=== ${label} ===`);
    } else {
      console.log('=== BLOCK STATE ===');
    }
    console.log(asciiArt);
    console.log('==================');
  }
  
  /**
   * ブロック配列の変化を前後で比較してコンソールに出力
   * @param beforeBlocks 変化前のブロック配列
   * @param afterBlocks 変化後のブロック配列
   * @param label 出力時のラベル（オプション）
   * @param clickPosition クリック位置（オプション）
   */
  static logBlocksComparison(beforeBlocks: Block[][], afterBlocks: Block[][], label?: string, clickPosition?: {x: number, y: number}): void {
    const beforeAscii = this.renderBlocks(beforeBlocks, clickPosition);
    const afterAscii = this.renderBlocks(afterBlocks, clickPosition);
    
    if (label) {
      console.log(`=== ${label} ===`);
    } else {
      console.log('=== BLOCKS COMPARISON ===');
    }
    
    console.log('BEFORE:');
    console.log(beforeAscii);
    console.log('\nAFTER:');
    console.log(afterAscii);
    console.log('========================');
  }
}
