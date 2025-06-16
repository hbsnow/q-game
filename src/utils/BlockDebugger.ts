import { Block } from '../types/Block';
import { BlockAsciiRenderer } from './BlockAsciiRenderer';

/**
 * ブロックのデバッグ用ユーティリティクラス
 */
export class BlockDebugger {
  /**
   * ゲーム画面全体を一度のconsole.logで出力する
   * @param blocks ブロック配列
   * @param title タイトル（オプション）
   */
  static logGameScreen(blocks: (Block | null)[][], title: string = 'Game Screen'): void {
    // アスキーアートを文字列として生成
    const output = this.generateGameScreenString(blocks, title);
    
    // 一度のconsole.logで出力
    console.log(output);
  }

  /**
   * ゲーム画面をアスキーアートの文字列として生成
   * @param blocks ブロック配列
   * @param title タイトル
   * @returns アスキーアート文字列
   */
  private static generateGameScreenString(blocks: (Block | null)[][], title: string): string {
    const lines: string[] = [];
    
    // タイトル
    lines.push(`=== ${title} ===`);
    
    // 列のラベル（a, b, c, ...）
    let header = '     ';
    for (let x = 0; x < blocks[0].length; x++) {
      header += String.fromCharCode(97 + x) + '   ';
    }
    lines.push(header);
    
    // 上部の枠線
    let topBorder = '  +-';
    for (let x = 0; x < blocks[0].length; x++) {
      topBorder += '----';
    }
    topBorder += '-+';
    lines.push(topBorder);
    
    // 各行のブロック
    for (let y = 0; y < blocks.length; y++) {
      let row = y.toString().padStart(1) + ' |';
      
      for (let x = 0; x < blocks[y].length; x++) {
        const block = blocks[y][x];
        row += ' ' + BlockAsciiRenderer.blockToAscii(block) + ' ';
      }
      
      row += '|';
      lines.push(row);
    }
    
    // 下部の枠線
    let bottomBorder = '  +-';
    for (let x = 0; x < blocks[0].length; x++) {
      bottomBorder += '----';
    }
    bottomBorder += '-+';
    lines.push(bottomBorder);
    
    return lines.join('\n');
  }
}
