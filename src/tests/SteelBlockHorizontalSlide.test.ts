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
    const afterGravity = blockLogic.applyGravity(blocks);
    const result = blockLogic.applyHorizontalSlide(afterGravity);
    expect(result).toEqual(blocks);
  });

  it("鋼鉄ブロックの右にブロックがある場合、スライドせず何も起こらないが、鋼鉄ブロックより下にあるブロックはスライドする", () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B         __Y |
    // 1 | __Y     <-> __Y |
    // 2 | __B         __Y |
    // 3 | __Y     __R __R |
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
        { x: 2, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
      ],
    ];

    // 横スライド適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B         __Y |
    // 1 | __Y     <-> __Y |
    // 2 | __B         __Y |
    // 3 | __Y __R     __R |
    //   +-----------------+
    // ポイント: 鋼鉄ブロックは重力の影響を受けず、元の位置に留まる
    // 鋼鉄ブロックの右にブロックがある場合にはその列より右にあるブロックは左側にスライドされない
    // 鋼鉄ブロックより下にあるブロックはスライドする
    const afterGravity = blockLogic.applyGravity(blocks);
    const result = blockLogic.applyHorizontalSlide(afterGravity);

    expect(result).toEqual([
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
        { x: 1, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
        null,
        { x: 3, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
      ],
    ]);
  });

  it("複数の鋼鉄ブロックがあっても、それぞれが固定位置に留まる", () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B         __Y |
    // 1 | <->     <-> __Y |
    // 2 | __B     __Y __Y |
    // 3 |             __R |
    //   +-----------------+
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: "blue", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        { x: 3, y: 0, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 1, color: "blue", type: BlockType.STEEL, sprite: null },
        null,
        { x: 2, y: 1, color: "blue", type: BlockType.STEEL, sprite: null },
        { x: 3, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 2, color: "blue", type: BlockType.NORMAL, sprite: null },
        null,
        { x: 2, y: 2, color: "yellow", type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 2, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        null,
        null,
        null,
        { x: 3, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
      ],
    ];

    // 横スライド適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B         __Y |
    // 1 | <->     <-> __Y |
    // 2 |             __Y |
    // 3 | __B __Y     __R |
    //   +-----------------+
    // ポイント: 複数の鋼鉄ブロックがあっても、それぞれが固定位置に留まります。
    const afterGravity = blockLogic.applyGravity(blocks);
    const result = blockLogic.applyHorizontalSlide(afterGravity);

    expect(result).toEqual([
      [
        { x: 0, y: 0, color: "blue", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        { x: 3, y: 0, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 1, color: "blue", type: BlockType.STEEL, sprite: null },
        null,
        { x: 2, y: 1, color: "blue", type: BlockType.STEEL, sprite: null },
        { x: 3, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        null,
        null,
        null,
        { x: 3, y: 2, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 3, color: "blue", type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null,
        { x: 3, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
      ],
    ]);
  });

  it("鋼鉄ブロックは上に乗っているブロックを貫通させない", () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B __G __R __Y |
    // 1 | __Y         __Y |
    // 2 | __B <->     __Y |
    // 3 | __Y     __Y __R |
    //   +-----------------+
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: "blue", type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: "green", type: BlockType.NORMAL, sprite: null },
        { x: 2, y: 0, color: "red", type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 0, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        { x: 3, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 2, color: "blue", type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: "blue", type: BlockType.STEEL, sprite: null },
        null,
        { x: 3, y: 2, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null, // b3は最初からnull
        { x: 2, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
      ],
    ];

    // 重力適用
    const afterGravity = blockLogic.applyGravity(blocks);
    const result = blockLogic.applyHorizontalSlide(afterGravity);

    // 重力適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B         __Y |
    // 1 | __Y __G     __Y |
    // 2 | __B <-> __R __Y |
    // 3 | __Y     __Y __R |
    //   +-----------------+
    // 鋼鉄はいかなる場合でも上に乗っているブロックを貫通させることはない

    // 鋼鉄ブロックは元の位置に留まるべき
    expect(result).toEqual([
      [
        { x: 0, y: 0, color: "blue", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        { x: 3, y: 0, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 0, color: "green", type: BlockType.NORMAL, sprite: null },
        null,
        { x: 3, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 2, color: "blue", type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: "blue", type: BlockType.STEEL, sprite: null },
        { x: 2, y: 2, color: "red", type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 2, color: "yellow", type: BlockType.NORMAL, sprite: null },
      ],
      [
        { x: 0, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null, // b3は最初からnull
        { x: 2, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
        { x: 3, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
      ],
    ]);
  });

  it("鋼鉄ブロックの右にブロックがない場合、スライドする", () => {
    // 初期状態:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B             |
    // 1 | __Y     <->     |
    // 2 | __B         __Y |
    // 3 | __Y         __R |
    //   +-----------------+
    const blocks: (Block | null)[][] = [
      [
        { x: 0, y: 0, color: "blue", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        null,
      ],
      [
        { x: 0, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null,
        { x: 2, y: 1, color: "blue", type: BlockType.STEEL, sprite: null },
        null,
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

    // 横スライド適用後:
    //      a   b   c   d
    //   +-----------------+
    // 0 | __B             |
    // 1 | __Y     <->     |
    // 2 | __B __Y         |
    // 3 | __Y __R         |
    //   +-----------------+
    // ポイント: 鋼鉄ブロックの右にブロックがなければ鋼鉄ブロックの下の空白を素通りする
    const afterGravity = blockLogic.applyGravity(blocks);
    const result = blockLogic.applyHorizontalSlide(afterGravity);

    expect(result).toEqual([
      [
        { x: 0, y: 0, color: "blue", type: BlockType.NORMAL, sprite: null },
        null,
        null,
        null,
      ],
      [
        { x: 0, y: 1, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null,
        { x: 2, y: 1, color: "blue", type: BlockType.STEEL, sprite: null },
        null,
      ],
      [
        { x: 0, y: 2, color: "blue", type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 2, color: "yellow", type: BlockType.NORMAL, sprite: null },
        null,
        null,
      ],
      [
        { x: 0, y: 3, color: "yellow", type: BlockType.NORMAL, sprite: null },
        { x: 1, y: 3, color: "red", type: BlockType.NORMAL, sprite: null },
        null,
        null,
      ],
    ]);
  });
});
