import { Block, BlockType } from "../types/Block";
import { BlockDebugger } from "../utils/BlockDebugger";

/**
 * BlockDebuggerの使用例を示すサンプルコード
 */
export function runBlockDebuggerExample(): void {
  // サンプルのブロック配列を作成
  const blocks: (Block | null)[][] = [
    [
      { x: 0, y: 0, color: "blue", type: BlockType.NORMAL, sprite: null },
      { x: 1, y: 0, color: "green", type: BlockType.NORMAL, sprite: null },
      { x: 2, y: 0, color: "red", type: BlockType.NORMAL, sprite: null },
      { x: 3, y: 0, color: "yellow", type: BlockType.NORMAL, sprite: null },
    ],
    [
      { x: 0, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
      { x: 1, y: 1, color: "blue", type: BlockType.STEEL, sprite: null },
      { x: 2, y: 1, color: "red", type: BlockType.NORMAL, sprite: null },
      { x: 3, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
    ],
    [
      { x: 0, y: 2, color: "blue", type: BlockType.NORMAL, sprite: null },
      { x: 1, y: 2, color: "red", type: BlockType.NORMAL, sprite: null },
      { x: 2, y: 2, color: "red", type: BlockType.NORMAL, sprite: null },
      { x: 3, y: 2, color: "yellow", type: BlockType.NORMAL, sprite: null },
    ],
    [
      { x: 0, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
      { x: 1, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
      { x: 2, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
      { x: 3, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
    ],
  ];

  // 一度のconsole.logで全ゲーム画面を出力
  BlockDebugger.logGameScreen(blocks);
}
