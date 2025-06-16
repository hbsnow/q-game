import { describe, it, expect, test, beforeEach } from "vitest";
import { Block, BlockType } from "../types/Block";
import { BlockLogic } from "../utils/BlockLogic";
import { BlockAsciiRenderer } from "../utils/BlockAsciiRenderer";
import { GameScene } from "../utils/GameScene";
import { GameConfig } from "../config/GameConfig";

/**
 * カウンターブロックの機能テスト
 * 複数のテストファイルを統合したもの
 */
describe("カウンターブロックの機能", () => {
  // 共通セットアップ
  let blockLogic: BlockLogic;

  beforeEach(() => {
    blockLogic = new BlockLogic();
  });

  describe("基本的なカウンターブロックの挙動", () => {
    test("カウンター+ブロックは指定数以上のブロックグループで消去可能", () => {
      // テスト用の盤面を作成
      // __R __R __R __Y
      // __Y _+R __R __Y  (カウンター+ブロックの値が3)
      // __B __R __Y __Y
      // __Y __Y __R __R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 1, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 0, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          {
            x: 1,
            y: 1,
            color: GameConfig.BLOCK_COLORS.CORAL_RED,
            type: BlockType.COUNTER_PLUS,
            counterValue: 3,
          },
          { x: 2, y: 1, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 2, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 1, y: 2, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 3, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 1, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 2, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
        ],
      ];

      // カウンター+ブロックの条件チェック
      const counterBlock = blocks[1][1];
      const result = blockLogic.checkCounterCondition(blocks, counterBlock);

      // 条件を満たしているはず（グループサイズ5 >= カウンター値3）
      expect(result).toBe(true);

      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
      expect(connectedBlocks.length).toBe(6); // カウンター+ブロックを含む6つのブロック
    });

    test("カウンター+ブロックは指定数未満のブロックグループでは消去不可", () => {
      // テスト用の盤面を作成
      // __R __B __R __Y
      // __Y _+R __B __Y  (カウンター+ブロックの値が5)
      // __B __R __Y __Y
      // __Y __Y __R __R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 1, y: 0, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 2, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 0, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          {
            x: 1,
            y: 1,
            color: GameConfig.BLOCK_COLORS.CORAL_RED,
            type: BlockType.COUNTER_PLUS,
            counterValue: 5,
          },
          { x: 2, y: 1, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 3, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 2, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 1, y: 2, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 3, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 1, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 2, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
        ],
      ];

      // デバッグ用に盤面を表示
      BlockAsciiRenderer.logBlocks(
        blocks,
        "カウンター+ブロック条件未達テスト初期状態"
      );

      // カウンター+ブロックの条件チェック
      const counterBlock = blocks[1][1];
      const result = blockLogic.checkCounterCondition(blocks, counterBlock);

      // 条件を満たしていないはず（グループサイズ3 < カウンター値5）
      expect(result).toBe(false);

      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
      expect(connectedBlocks.length).toBe(2); // カウンター+ブロックを含む2つのブロック
    });

    test("カウンター-ブロックは指定数以下のブロックグループで消去可能", () => {
      // テスト用の盤面を作成
      // __R __B __R __Y
      // __Y _-R __B __Y  (カウンター-ブロックの値が5)
      // __B __R __Y __Y
      // __Y __Y __R __R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 1, y: 0, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 2, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 0, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          {
            x: 1,
            y: 1,
            color: GameConfig.BLOCK_COLORS.CORAL_RED,
            type: BlockType.COUNTER_MINUS,
            counterValue: 5,
          },
          { x: 2, y: 1, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 3, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 2, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 1, y: 2, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 3, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 1, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 2, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
        ],
      ];

      // デバッグ用に盤面を表示
      BlockAsciiRenderer.logBlocks(blocks, "カウンター-ブロックテスト初期状態");

      // カウンター-ブロックの条件チェック
      const counterBlock = blocks[1][1];
      const result = blockLogic.checkCounterCondition(blocks, counterBlock);

      // 条件を満たしているはず（グループサイズ3 <= カウンター値5）
      expect(result).toBe(true);

      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
      expect(connectedBlocks.length).toBe(2); // カウンター-ブロックを含む2つのブロック
    });

    test("カウンター-ブロックは指定数より大きいブロックグループでは消去不可", () => {
      // テスト用の盤面を作成
      // __R __R __R __Y
      // __Y _-R __R __Y  (カウンター-ブロックの値が3)
      // __B __R __Y __Y
      // __Y __Y __R __R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 1, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 0, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          {
            x: 1,
            y: 1,
            color: GameConfig.BLOCK_COLORS.CORAL_RED,
            type: BlockType.COUNTER_MINUS,
            counterValue: 3,
          },
          { x: 2, y: 1, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 2, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 1, y: 2, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 3, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 1, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 2, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
        ],
      ];

      // デバッグ用に盤面を表示
      BlockAsciiRenderer.logBlocks(
        blocks,
        "カウンター-ブロック条件超過テスト初期状態"
      );

      // カウンター-ブロックの条件チェック
      const counterBlock = blocks[1][1];
      const result = blockLogic.checkCounterCondition(blocks, counterBlock);

      // 条件を満たしていないはず（グループサイズ5 > カウンター値3）
      expect(result).toBe(false);

      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
      expect(connectedBlocks.length).toBe(6); // カウンター-ブロックを含む6つのブロック
    });
  });

  describe("カウンターブロックの正しい動作", () => {
    test("カウンター+ブロックは条件を満たさない場合、カウンターブロックだけが残る", () => {
      // テスト用の盤面を作成
      // __R __R __R __Y
      // __Y _+R __R __Y  (カウンター+ブロックの値が7 - 条件を満たさない)
      // __B __R __Y __Y
      // __Y __Y __R __R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 1, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 0, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          {
            x: 1,
            y: 1,
            color: GameConfig.BLOCK_COLORS.CORAL_RED,
            type: BlockType.COUNTER_PLUS,
            counterValue: 7,
          },
          { x: 2, y: 1, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 2, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 1, y: 2, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 3, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 1, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 2, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
        ],
      ];

      // デバッグ用に盤面を表示
      BlockAsciiRenderer.logBlocks(
        blocks,
        "カウンター+ブロック条件未達テスト初期状態"
      );

      // カウンター+ブロックの条件チェック
      const counterBlock = blocks[1][1];
      const result = blockLogic.checkCounterCondition(blocks, counterBlock);

      // 条件を満たしていないはず（グループサイズ5 < カウンター値7）
      expect(result).toBe(false);

      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
      expect(connectedBlocks.length).toBe(6); // カウンター+ブロックを含む6つのブロック

      // 消去可能なブロックと消去不可能なブロックを分ける
      const removableBlocks = connectedBlocks.filter(
        (block) =>
          block.type === BlockType.NORMAL ||
          (block.type === BlockType.COUNTER_PLUS &&
            blockLogic.checkCounterCondition(blocks, block)) ||
          (block.type === BlockType.COUNTER_MINUS &&
            blockLogic.checkCounterCondition(blocks, block))
      );

      // 通常ブロックのみが消去可能なはず
      expect(removableBlocks.length).toBe(5); // カウンターブロックを除く5つの通常ブロック

      // カウンターブロックは消去不可能なはず
      const nonRemovableBlocks = connectedBlocks.filter(
        (block) => !removableBlocks.includes(block)
      );
      expect(nonRemovableBlocks.length).toBe(1); // カウンターブロック1つ
      expect(nonRemovableBlocks[0].type).toBe(BlockType.COUNTER_PLUS);
    });

    test("カウンター-ブロックは条件を満たさない場合、カウンターブロックだけが残る", () => {
      // テスト用の盤面を作成
      // __R __R __R __Y
      // __Y _-R __R __Y  (カウンター-ブロックの値が2 - 条件を満たさない)
      // __B __R __Y __Y
      // __Y __Y __R __R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 1, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 0, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          {
            x: 1,
            y: 1,
            color: GameConfig.BLOCK_COLORS.CORAL_RED,
            type: BlockType.COUNTER_MINUS,
            counterValue: 2,
          },
          { x: 2, y: 1, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 2, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 1, y: 2, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 3, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 1, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 2, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
        ],
      ];

      // デバッグ用に盤面を表示
      BlockAsciiRenderer.logBlocks(
        blocks,
        "カウンター-ブロック条件未達テスト初期状態"
      );

      // カウンター-ブロックの条件チェック
      const counterBlock = blocks[1][1];
      const result = blockLogic.checkCounterCondition(blocks, counterBlock);

      // 条件を満たしていないはず（グループサイズ5 > カウンター値2）
      expect(result).toBe(false);

      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
      expect(connectedBlocks.length).toBe(6); // カウンター-ブロックを含む6つのブロック

      // 消去可能なブロックと消去不可能なブロックを分ける
      const removableBlocks = connectedBlocks.filter(
        (block) =>
          block.type === BlockType.NORMAL ||
          (block.type === BlockType.COUNTER_PLUS &&
            blockLogic.checkCounterCondition(blocks, block)) ||
          (block.type === BlockType.COUNTER_MINUS &&
            blockLogic.checkCounterCondition(blocks, block))
      );

      // 通常ブロックのみが消去可能なはず
      expect(removableBlocks.length).toBe(5); // カウンターブロックを除く5つの通常ブロック

      // カウンターブロックは消去不可能なはず
      const nonRemovableBlocks = connectedBlocks.filter(
        (block) => !removableBlocks.includes(block)
      );
      expect(nonRemovableBlocks.length).toBe(1); // カウンターブロック1つ
      expect(nonRemovableBlocks[0].type).toBe(BlockType.COUNTER_MINUS);
    });
  });

  describe("氷結カウンターブロックの挙動", () => {
    let gameScene: GameScene;

    beforeEach(() => {
      gameScene = new GameScene();
    });

    test("氷結カウンター+ブロックは隣接消去で氷結が解除され通常ブロックになる", () => {
      // テスト用の盤面を作成
      // __R __R __R __Y
      // __Y *+R __R __Y  (氷結カウンター+ブロックの値が3)
      // __B __R __Y __Y
      // __Y __Y __R __R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 1, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 0, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          {
            x: 1,
            y: 1,
            color: GameConfig.BLOCK_COLORS.CORAL_RED,
            type: BlockType.ICE_COUNTER_PLUS,
            counterValue: 3,
          },
          { x: 2, y: 1, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 2, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 1, y: 2, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 3, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 1, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 2, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
        ],
      ];

      // デバッグ用に盤面を表示
      BlockAsciiRenderer.logBlocks(
        blocks,
        "氷結カウンター+ブロックテスト初期状態"
      );

      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);

      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);

      // 氷結カウンター+ブロックが通常ブロックになっているか確認
      expect(updatedBlocks[1][1]).not.toBeNull();
      expect(updatedBlocks[1][1]?.type).toBe(BlockType.NORMAL);
      expect(updatedBlocks[1][1]?.color).toBe(GameConfig.BLOCK_COLORS.CORAL_RED);
    });

    test("氷結カウンター-ブロックは隣接消去で氷結が解除され通常ブロックになる", () => {
      // テスト用の盤面を作成
      // __R __R __R __Y
      // __Y *-R __R __Y  (氷結カウンター-ブロックの値が3)
      // __B __R __Y __Y
      // __Y __Y __R __R
      const blocks: Block[][] = [
        [
          { x: 0, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 1, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 0, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 0, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          {
            x: 1,
            y: 1,
            color: GameConfig.BLOCK_COLORS.CORAL_RED,
            type: BlockType.ICE_COUNTER_MINUS,
            counterValue: 3,
          },
          { x: 2, y: 1, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 1, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 2, color: GameConfig.BLOCK_COLORS.DEEP_BLUE, type: BlockType.NORMAL },
          { x: 1, y: 2, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 2, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 3, y: 2, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
        ],
        [
          { x: 0, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 1, y: 3, color: GameConfig.BLOCK_COLORS.SAND_GOLD, type: BlockType.NORMAL },
          { x: 2, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
          { x: 3, y: 3, color: GameConfig.BLOCK_COLORS.CORAL_RED, type: BlockType.NORMAL },
        ],
      ];

      // デバッグ用に盤面を表示
      BlockAsciiRenderer.logBlocks(
        blocks,
        "氷結カウンター-ブロックテスト初期状態"
      );

      // 隣接する同色ブロックを検索
      const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);

      // 氷結ブロックを更新
      const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);

      // 氷結カウンター-ブロックが通常ブロックになっているか確認
      expect(updatedBlocks[1][1]).not.toBeNull();
      expect(updatedBlocks[1][1]?.type).toBe(BlockType.NORMAL);
      expect(updatedBlocks[1][1]?.color).toBe(GameConfig.BLOCK_COLORS.CORAL_RED);
    });
  });
});
