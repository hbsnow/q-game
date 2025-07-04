import { describe, it, expect } from "vitest";
import { BlockLogic } from "../utils/BlockLogic";
import { Block } from "../types/Block";

describe("GravityBug", () => {
  // テスト用の色定数
  const RED = "#FF0000";
  const BLUE = "#0000FF";
  const GREEN = "#00FF00";
  const YELLOW = "#FFFF00";

  describe("applyGravity bugs", () => {
    it("複数の空きマスがある場合、ブロックが正しく落下する", () => {
      const blockLogic = new BlockLogic();

      // テスト用のブロック配置
      // R _ B
      // _ _ _
      // G _ Y
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          null,
          { x: 2, y: 0, color: BLUE, type: "normal" },
        ],
        [null, null, null],
        [
          { x: 0, y: 2, color: GREEN, type: "normal" },
          null,
          { x: 2, y: 2, color: YELLOW, type: "normal" },
        ],
      ];

      // 重力適用
      const fallenBlocks = blockLogic.applyGravity(blocks);

      // 期待される結果:
      // _ _ _
      // R _ B
      // G _ Y
      expect(fallenBlocks[0][0]).toBeNull();
      expect(fallenBlocks[0][1]).toBeNull();
      expect(fallenBlocks[0][2]).toBeNull();

      expect(fallenBlocks[1][0]?.color).toBe(RED);
      expect(fallenBlocks[1][1]).toBeNull();
      expect(fallenBlocks[1][2]?.color).toBe(BLUE);

      expect(fallenBlocks[2][0]?.color).toBe(GREEN);
      expect(fallenBlocks[2][1]).toBeNull(); // 中央列は空のまま
      expect(fallenBlocks[2][2]?.color).toBe(YELLOW);

      // 座標が正しく更新されていることを確認
      expect(fallenBlocks[1][0]?.x).toBe(0);
      expect(fallenBlocks[1][0]?.y).toBe(1);
      expect(fallenBlocks[1][2]?.x).toBe(2);
      expect(fallenBlocks[1][2]?.y).toBe(1);
      expect(fallenBlocks[2][0]?.x).toBe(0);
      expect(fallenBlocks[2][0]?.y).toBe(2);
      expect(fallenBlocks[2][2]?.x).toBe(2);
      expect(fallenBlocks[2][2]?.y).toBe(2);
    });

    it("複数列に空きマスがある場合、各列が独立して落下する", () => {
      const blockLogic = new BlockLogic();

      // テスト用のブロック配置
      // R B G
      // _ _ _
      // _ Y _
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
          { x: 2, y: 0, color: GREEN, type: "normal" },
        ],
        [null, null, null],
        [null, { x: 1, y: 2, color: YELLOW, type: "normal" }, null],
      ];

      // 重力適用
      const fallenBlocks = blockLogic.applyGravity(blocks);

      // 期待される結果:
      // _ _ _
      // _ B _
      // R Y G
      expect(fallenBlocks[0][0]).toBeNull();
      expect(fallenBlocks[0][1]).toBeNull();
      expect(fallenBlocks[0][2]).toBeNull();

      expect(fallenBlocks[1][0]).toBeNull();
      expect(fallenBlocks[1][1]?.color).toBe(BLUE);
      expect(fallenBlocks[1][2]).toBeNull();

      expect(fallenBlocks[2][0]?.color).toBe(RED);
      expect(fallenBlocks[2][1]?.color).toBe(YELLOW);
      expect(fallenBlocks[2][2]?.color).toBe(GREEN);

      // 座標が正しく更新されていることを確認
      expect(fallenBlocks[1][1]?.x).toBe(1);
      expect(fallenBlocks[1][1]?.y).toBe(1);
      expect(fallenBlocks[2][0]?.x).toBe(0);
      expect(fallenBlocks[2][0]?.y).toBe(2);
      expect(fallenBlocks[2][1]?.x).toBe(1);
      expect(fallenBlocks[2][1]?.y).toBe(2);
      expect(fallenBlocks[2][2]?.x).toBe(2);
      expect(fallenBlocks[2][2]?.y).toBe(2);
    });

    it("複数の空きマスが連続している場合、ブロックが最下部まで落下する", () => {
      const blockLogic = new BlockLogic();

      // テスト用のブロック配置
      // R _ _
      // _ B _
      // _ _ G
      // _ _ _
      const blocks: Block[][] = [
        [{ x: 0, y: 0, color: RED, type: "normal" }, null, null],
        [null, { x: 1, y: 1, color: BLUE, type: "normal" }, null],
        [null, null, { x: 2, y: 2, color: GREEN, type: "normal" }],
        [null, null, null],
      ];

      // 重力適用
      const fallenBlocks = blockLogic.applyGravity(blocks);

      // 期待される結果:
      // _ _ _
      // _ _ _
      // _ _ _
      // R B G
      expect(fallenBlocks[0][0]).toBeNull();
      expect(fallenBlocks[0][1]).toBeNull();
      expect(fallenBlocks[0][2]).toBeNull();

      expect(fallenBlocks[1][0]).toBeNull();
      expect(fallenBlocks[1][1]).toBeNull();
      expect(fallenBlocks[1][2]).toBeNull();

      expect(fallenBlocks[2][0]).toBeNull();
      expect(fallenBlocks[2][1]).toBeNull();
      expect(fallenBlocks[2][2]).toBeNull();

      expect(fallenBlocks[3][0]?.color).toBe(RED);
      expect(fallenBlocks[3][1]?.color).toBe(BLUE);
      expect(fallenBlocks[3][2]?.color).toBe(GREEN);

      // 座標が正しく更新されていることを確認
      expect(fallenBlocks[3][0]?.x).toBe(0);
      expect(fallenBlocks[3][0]?.y).toBe(3);
      expect(fallenBlocks[3][1]?.x).toBe(1);
      expect(fallenBlocks[3][1]?.y).toBe(3);
      expect(fallenBlocks[3][2]?.x).toBe(2);
      expect(fallenBlocks[3][2]?.y).toBe(3);
    });

    it("複雑なパターンでも正しく落下する", () => {
      const blockLogic = new BlockLogic();

      // テスト用のブロック配置
      // R B G Y
      // _ R _ G
      // B _ Y _
      // _ G _ R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
          { x: 2, y: 0, color: GREEN, type: "normal" },
          { x: 3, y: 0, color: YELLOW, type: "normal" },
        ],
        [
          null,
          { x: 1, y: 1, color: RED, type: "normal" },
          null,
          { x: 3, y: 1, color: GREEN, type: "normal" },
        ],
        [
          { x: 0, y: 2, color: BLUE, type: "normal" },
          null,
          { x: 2, y: 2, color: YELLOW, type: "normal" },
          null,
        ],
        [
          null,
          { x: 1, y: 3, color: GREEN, type: "normal" },
          null,
          { x: 3, y: 3, color: RED, type: "normal" },
        ],
      ];

      // 重力適用
      const result = blockLogic.applyGravity(blocks);

      // 期待される結果:
      // _ _ _ _
      // _ B _ Y
      // R R G G
      // B G Y R
      expect(result).toMatchObject([
        [null, null, null, null],
        [
          null,
          { x: 1, y: 1, color: BLUE, type: "normal" },
          null,
          { x: 3, y: 1, color: YELLOW, type: "normal" },
        ],
        [
          { x: 0, y: 2, color: RED, type: "normal" },
          { x: 1, y: 2, color: RED, type: "normal" },
          { x: 2, y: 2, color: GREEN, type: "normal" },
          { x: 3, y: 2, color: GREEN, type: "normal" },
        ],
        [
          { x: 0, y: 3, color: BLUE, type: "normal" },
          { x: 1, y: 3, color: GREEN, type: "normal" },
          { x: 2, y: 3, color: YELLOW, type: "normal" },
          { x: 3, y: 3, color: RED, type: "normal" },
        ],
      ]);
    });
  });
});
