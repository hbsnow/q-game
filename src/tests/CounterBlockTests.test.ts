import { describe, it, expect } from "vitest";
import { Block, BlockType } from "../types/Block";
import { BlockLogic } from "../utils/BlockLogic";
import { GameConfig } from "../config/GameConfig";

const RED = GameConfig.BLOCK_COLORS.CORAL_RED;
const BLUE = GameConfig.BLOCK_COLORS.DEEP_BLUE;
const YELLOW = GameConfig.BLOCK_COLORS.SAND_GOLD;

describe("カウンター+ブロック", () => {
  it("カウンター+ブロックは指定数以上のブロックグループで消去可能", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y _+R __R __Y  (カウンター+ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.COUNTER_PLUS,
          counterValue: 3,
        },
        { x: 2, y: 1, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // カウンター+ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);

    // 条件を満たしているはず（グループサイズ6 >= カウンター値3）
    expect(result).toBe(true);

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(6); // カウンター+ブロックを含む6つのブロック
  });

  it("カウンター+ブロックは指定数ちょうどのブロックグループで消去可能", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y _+R __R __Y  (カウンター+ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.COUNTER_PLUS,
          counterValue: 6,
        },
        { x: 2, y: 1, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // カウンター+ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);

    // 条件を満たしているはず（グループサイズ6 >= カウンター値6）
    expect(result).toBe(true);

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(6); // カウンター+ブロックを含む6つのブロック
  });

  it("カウンター+ブロックは指定数未満のブロックグループでは消去不可", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __B __R __Y
    // __Y _+R __B __Y  (カウンター+ブロックの値が5)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: BLUE, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.COUNTER_PLUS,
          counterValue: 5,
        },
        { x: 2, y: 1, color: BLUE, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // カウンター+ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);

    // 条件を満たしていないはず（グループサイズ2 < カウンター値5）
    expect(result).toBe(false);

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(2); // カウンター+ブロックを含む2つのブロック
  });
});

describe("カウンター-ブロック", () => {
  it("カウンター-ブロックは指定数以下のブロックグループで消去可能", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __B __R __Y
    // __Y _-R __B __Y  (カウンター-ブロックの値が5)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: BLUE, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.COUNTER_MINUS,
          counterValue: 5,
        },
        { x: 2, y: 1, color: BLUE, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // カウンター-ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);

    // 条件を満たしているはず（グループサイズ3 <= カウンター値5）
    expect(result).toBe(true);

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(2); // カウンター-ブロックを含む2つのブロック
  });

  it("カウンター-ブロックは指定数ちょうどのブロックグループで消去可能", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __B __R __Y
    // __Y _-R __B __Y  (カウンター-ブロックの値が2)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: BLUE, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.COUNTER_MINUS,
          counterValue: 2,
        },
        { x: 2, y: 1, color: BLUE, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // カウンター-ブロックの条件チェック
    const counterBlock = blocks[1][1];
    const result = blockLogic.checkCounterCondition(blocks, counterBlock);

    // 条件を満たしているはず（グループサイズ2 == カウンター値2）
    expect(result).toBe(true);

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 1, 1);
    expect(connectedBlocks.length).toBe(2); // カウンター-ブロックを含む2つのブロック
  });

  it("カウンター-ブロックは指定数より大きいブロックグループでは消去不可", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y _-R __R __Y  (カウンター-ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.COUNTER_MINUS,
          counterValue: 3,
        },
        { x: 2, y: 1, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

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

describe("氷結カウンターブロックの挙動", () => {
  it("氷結カウンター+ブロックはカウンターの条件を満たす隣接消去でカウンターと氷結が解除され通常ブロックになる", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y *+R __R __Y  (氷結カウンター+ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.ICE_COUNTER_PLUS,
          counterValue: 3,
        },
        { x: 2, y: 1, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);

    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);

    // 氷結カウンター+ブロックが通常ブロックになっているか確認
    expect(updatedBlocks[1][1]).not.toBeNull();
    expect(updatedBlocks[1][1]?.type).toBe(BlockType.NORMAL);
    expect(updatedBlocks[1][1]?.color).toBe(RED);
  });

  it("氷結カウンター+ブロックはカウンターの条件を満たさない隣接消去では何も起こらない", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y *+R __R __Y  (氷結カウンター+ブロックの値が6)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.ICE_COUNTER_PLUS,
          counterValue: 6,
        },
        { x: 2, y: 1, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);

    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);

    // 氷結カウンター+ブロックがそのままになっているか確認
    expect(updatedBlocks[1][1]).not.toBeNull();
    expect(updatedBlocks[1][1]?.type).toBe(BlockType.ICE_COUNTER_PLUS);
    expect(updatedBlocks[1][1]?.color).toBe(RED);
  });
});

describe("カウンター-ブロック", () => {
  it("氷結カウンター-ブロックは隣接消去で氷結が解除され通常ブロックになる", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y *-R __R __Y  (氷結カウンター-ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.ICE_COUNTER_MINUS,
          counterValue: 6,
        },
        { x: 2, y: 1, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);

    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);

    // 氷結カウンター-ブロックが通常ブロックになっているか確認
    expect(updatedBlocks[1][1]).not.toBeNull();
    expect(updatedBlocks[1][1]?.type).toBe(BlockType.NORMAL);
    expect(updatedBlocks[1][1]?.color).toBe(RED);
  });

  it("氷結カウンター-ブロックはカウンターの条件を満たさない隣接消去では何も起こらない", () => {
    const blockLogic = new BlockLogic();

    // テスト用の盤面を作成
    // __R __R __R __Y
    // __Y *-R __R __Y  (氷結カウンター-ブロックの値が3)
    // __B __R __Y __Y
    // __Y __Y __R __R
    const blocks: Block[][] = [
      [
        { x: 0, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 1, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 0, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 0, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 1, color: YELLOW, type: BlockType.NORMAL },
        {
          x: 1,
          y: 1,
          color: RED,
          type: BlockType.ICE_COUNTER_MINUS,
          counterValue: 3,
        },
        { x: 2, y: 1, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 1, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 2, color: BLUE, type: BlockType.NORMAL },
        { x: 1, y: 2, color: RED, type: BlockType.NORMAL },
        { x: 2, y: 2, color: YELLOW, type: BlockType.NORMAL },
        { x: 3, y: 2, color: YELLOW, type: BlockType.NORMAL },
      ],
      [
        { x: 0, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 1, y: 3, color: YELLOW, type: BlockType.NORMAL },
        { x: 2, y: 3, color: RED, type: BlockType.NORMAL },
        { x: 3, y: 3, color: RED, type: BlockType.NORMAL },
      ],
    ];

    // 隣接する同色ブロックを検索
    const connectedBlocks = blockLogic.findConnectedBlocks(blocks, 0, 0);

    // 氷結ブロックを更新
    const updatedBlocks = blockLogic.updateIceBlocks(blocks, connectedBlocks);

    // 氷結カウンター-ブロックがそのままになっているか確認
    expect(updatedBlocks[1][1]).not.toBeNull();
    expect(updatedBlocks[1][1]?.type).toBe(BlockType.ICE_COUNTER_MINUS);
    expect(updatedBlocks[1][1]?.color).toBe(RED);
  });
});
