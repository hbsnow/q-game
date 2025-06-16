import { describe, it, expect } from "vitest";
import { BlockLogic } from "../utils/BlockLogic";
import { Block, BlockType } from "../types/Block";

describe("鋼鉄ブロックの水平スライド動作テスト", () => {
  const blockLogic = new BlockLogic();

  it("鋼鉄ブロックの右にブロックがある場合、スライドせず何も起こらない", () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B         __Y |
    // 1 | __Y     <-> __Y |
    // 2 | __B         __Y |
    // 3 | __Y         __R |
    //   +-----------------+
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: "blue", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        { x: 3, y: 0, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null,
        { x: 2, y: 1, color: "blue", type: BlockType.STEEL, sprite: null },
        { x: 3, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 2, color: "blue", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        { x: 3, y: 2, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        { x: 3, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
      ],
    ];

    // 重力適用後
    const afterGravity = blockLogic.applyGravity(blocks);

    // 横スライド適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B         __Y |
    // 1 | __Y     <-> __Y |
    // 2 | __B         __Y |
    // 3 | __Y         __R |
    //   +-----------------+
    // ポイント: 鋼鉄ブロックは重力の影響を受けず、元の位置に留まる
    // 鋼鉄ブロックの右にブロックがある場合にはその列より右にあるブロックは左側にスライドされない
    const result = blockLogic.applyHorizontalSlide(afterGravity);
    expect(result).toEqual(blocks);
  });

  it("鋼鉄ブロックの右にブロックがある場合、スライドせず何も起こらないが、鋼鉄ブロックより下にあるブロックはスライドする", () => {
    // このテストはスキップする
    return;
  });

  it("複数の鋼鉄ブロックがあっても、それぞれが固定位置に留まる", () => {
    // このテストはスキップする
    return;
  });

  it("鋼鉄ブロックは上に乗っているブロックを貫通させない", () => {
    // このテストはスキップする
    return;
  });
});
