import { describe, it, expect, beforeEach } from "vitest";
import { BlockLogic } from "../utils/BlockLogic";
import { Block } from "../types/Block";

describe("BlockLogic", () => {
  // テスト用の色定数
  const RED = "#FF0000";
  const BLUE = "#0000FF";
  const GREEN = "#00FF00";
  const YELLOW = "#FFFF00";

  describe("findConnectedBlocks", () => {
    it("同じ色の隣接ブロックを正しく検出する", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R R B
      // R B B
      // G Y G
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: RED, type: "normal" },
          { x: 2, y: 0, color: BLUE, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: RED, type: "normal" },
          { x: 1, y: 1, color: BLUE, type: "normal" },
          { x: 2, y: 1, color: BLUE, type: "normal" },
        ],
        [
          { x: 0, y: 2, color: GREEN, type: "normal" },
          { x: 1, y: 2, color: YELLOW, type: "normal" },
          { x: 2, y: 2, color: GREEN, type: "normal" },
        ],
      ];

      // 赤ブロック(0,0)をクリックした場合、隣接する赤ブロックが検出される
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      expect(connectedBlocks.length).toBe(3);

      // 座標の確認
      const positions = connectedBlocks.map((block) => ({
        x: block.x,
        y: block.y,
      }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 0, y: 1 });
    });

    it("斜めのブロックは隣接と見なさない", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R B
      // B R
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: BLUE, type: "normal" },
          { x: 1, y: 1, color: RED, type: "normal" },
        ],
      ];

      // 赤ブロック(0,0)をクリックした場合、斜めの赤ブロック(1,1)は検出されない
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      expect(connectedBlocks.length).toBe(1); // (0,0)のみ

      const positions = connectedBlocks.map((block) => ({
        x: block.x,
        y: block.y,
      }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).not.toContainEqual({ x: 1, y: 1 });
    });

    it("2つ以上の隣接ブロックがない場合は自分自身のみ返す", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R B
      // G Y
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: GREEN, type: "normal" },
          { x: 1, y: 1, color: YELLOW, type: "normal" },
        ],
      ];

      // 赤ブロック(0,0)をクリックした場合、隣接する同色ブロックがないので自分自身のみ
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      expect(connectedBlocks.length).toBe(1); // (0,0)のみ

      const positions = connectedBlocks.map((block) => ({
        x: block.x,
        y: block.y,
      }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
    });

    it("複雑な形状の隣接ブロックも正しく検出する", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置 (L字型の赤ブロック)
      // R B G
      // R B G
      // R R R
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
          { x: 2, y: 0, color: GREEN, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: RED, type: "normal" },
          { x: 1, y: 1, color: BLUE, type: "normal" },
          { x: 2, y: 1, color: GREEN, type: "normal" },
        ],
        [
          { x: 0, y: 2, color: RED, type: "normal" },
          { x: 1, y: 2, color: RED, type: "normal" },
          { x: 2, y: 2, color: RED, type: "normal" },
        ],
      ];

      // 赤ブロック(0,0)をクリックした場合、L字型の赤ブロックが全て検出される
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);
      expect(connectedBlocks.length).toBe(5); // L字型の赤ブロック5つ

      const positions = connectedBlocks.map((block) => ({
        x: block.x,
        y: block.y,
      }));
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).toContainEqual({ x: 0, y: 1 });
      expect(positions).toContainEqual({ x: 0, y: 2 });
      expect(positions).toContainEqual({ x: 1, y: 2 });
      expect(positions).toContainEqual({ x: 2, y: 2 });
    });
  });

  describe("canRemoveBlocks", () => {
    it("2つ以上の隣接ブロックがある場合はtrueを返す", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R R
      // R B
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: RED, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: RED, type: "normal" },
          { x: 1, y: 1, color: BLUE, type: "normal" },
        ],
      ];

      // 赤ブロック(0,0)をクリックした場合、隣接する赤ブロックが2つあるのでtrue
      const canRemove = blockLogic.canRemoveBlocks(blocks, 0, 0);
      expect(canRemove).toBe(true);
    });

    it("隣接ブロックが1つしかない場合はfalseを返す", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R B
      // G Y
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: GREEN, type: "normal" },
          { x: 1, y: 1, color: YELLOW, type: "normal" },
        ],
      ];

      // 赤ブロック(0,0)をクリックした場合、隣接する同色ブロックがないのでfalse
      const canRemove = blockLogic.canRemoveBlocks(blocks, 0, 0);
      expect(canRemove).toBe(false); // 自分自身のみなのでfalse
    });

    it("隣接ブロックがない場合はfalseを返す", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R B
      // G Y
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: GREEN, type: "normal" },
          { x: 1, y: 1, color: YELLOW, type: "normal" },
        ],
      ];

      // 赤ブロック(0,0)をクリックした場合、隣接する赤ブロックがないのでfalse
      const canRemove = blockLogic.canRemoveBlocks(blocks, 0, 0);
      expect(canRemove).toBe(false);
    });
  });

  describe("calculateScore", () => {
    it("消去ブロック数の二乗がスコアになる", () => {
      const blockLogic = new BlockLogic();
      // 2ブロック消去
      expect(blockLogic.calculateScore(2)).toBe(4); // 2² = 4

      // 3ブロック消去
      expect(blockLogic.calculateScore(3)).toBe(9); // 3² = 9

      // 5ブロック消去
      expect(blockLogic.calculateScore(5)).toBe(25); // 5² = 25

      // 10ブロック消去
      expect(blockLogic.calculateScore(10)).toBe(100); // 10² = 100
    });
  });

  describe("hasRemovableBlocks", () => {
    it("消去可能なブロックがある場合はtrueを返す", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R R B
      // G B B
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: RED, type: "normal" },
          { x: 2, y: 0, color: BLUE, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: GREEN, type: "normal" },
          { x: 1, y: 1, color: BLUE, type: "normal" },
          { x: 2, y: 1, color: BLUE, type: "normal" },
        ],
      ];

      // 赤ブロック2つ、青ブロック3つが隣接しているので消去可能
      const hasRemovable = blockLogic.hasRemovableBlocks(blocks);
      expect(hasRemovable).toBe(true);
    });

    it("消去可能なブロックがない場合はfalseを返す", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R B R
      // G Y G
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
          { x: 2, y: 0, color: RED, type: "normal" },
        ],
        [
          { x: 0, y: 1, color: GREEN, type: "normal" },
          { x: 1, y: 1, color: YELLOW, type: "normal" },
          { x: 2, y: 1, color: GREEN, type: "normal" },
        ],
      ];

      // どの色も隣接していないので消去不可能
      const hasRemovable = blockLogic.hasRemovableBlocks(blocks);
      expect(hasRemovable).toBe(false);
    });
  });

  describe("applyGravity", () => {
    it("ブロックが消去された後、上のブロックが落下する", () => {
      const blockLogic = new BlockLogic();

      // テスト用のブロック配置
      // R R
      // G
      // Y Y G
      const blocks = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: RED, type: "normal" },
          null,
        ],
        [{ x: 0, y: 1, color: GREEN, type: "normal" }, null, null],
        [
          { x: 0, y: 2, color: YELLOW, type: "normal" },
          { x: 1, y: 2, color: YELLOW, type: "normal" },
          { x: 2, y: 2, color: GREEN, type: "normal" },
        ],
      ];

      const result = blockLogic.applyGravity(blocks);

      // 結果確認
      // R
      // G R
      // Y Y G
      expect(result).toEqual([
        [{ x: 0, y: 0, color: RED, type: "normal" }, null, null],
        [
          { x: 0, y: 1, color: GREEN, type: "normal" },
          { x: 1, y: 1, color: RED, type: "normal" },
          null,
        ],
        [
          { x: 0, y: 2, color: YELLOW, type: "normal" },
          { x: 1, y: 2, color: YELLOW, type: "normal" },
          { x: 2, y: 2, color: GREEN, type: "normal" },
        ],
      ]);
    });

    it("複数列の落下が正しく処理される", () => {
      const blockLogic = new BlockLogic();
      // テスト用のブロック配置
      // R B G
      // _ R B
      // _ _ G
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: RED, type: "normal" },
          { x: 1, y: 0, color: BLUE, type: "normal" },
          { x: 2, y: 0, color: GREEN, type: "normal" },
        ],
        [
          null,
          { x: 1, y: 1, color: RED, type: "normal" },
          { x: 2, y: 1, color: BLUE, type: "normal" },
        ],
        [null, null, { x: 2, y: 2, color: GREEN, type: "normal" }],
      ];

      // 重力適用
      const result = blockLogic.applyGravity(blocks);

      // 結果確認
      // _ _ G
      // _ B B
      // R R G
      expect(result).toEqual([
        [null, null, { x: 2, y: 0, color: GREEN, type: "normal" }],
        [
          null,
          { x: 1, y: 1, color: BLUE, type: "normal" },
          { x: 2, y: 1, color: BLUE, type: "normal" },
        ],
        [
          { x: 0, y: 2, color: RED, type: "normal" },
          { x: 1, y: 2, color: RED, type: "normal" },
          { x: 2, y: 2, color: GREEN, type: "normal" },
        ],
      ]);
    });
  });

  describe("isAllCleared", () => {
    it("全てのブロックが消去された場合はtrueを返す", () => {
      const blockLogic = new BlockLogic();
      // 全てnull
      const emptyBlocks: Block[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ];

      const isAllCleared = blockLogic.isAllCleared(emptyBlocks);
      expect(isAllCleared).toBe(true);
    });

    it("ブロックが残っている場合はfalseを返す", () => {
      const blockLogic = new BlockLogic();
      // 1つだけブロックが残っている
      const blocks: Block[][] = [
        [null, null, null],
        [null, { x: 1, y: 1, color: RED, type: "normal" }, null],
        [null, null, null],
      ];

      const isAllCleared = blockLogic.isAllCleared(blocks);
      expect(isAllCleared).toBe(false);
    });
  });
});
