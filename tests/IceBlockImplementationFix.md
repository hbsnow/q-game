# 氷結ブロックの実装修正

## 問題点

氷結ブロックの挙動に関する仕様と実装に不一致がありました。

### 仕様
- 氷結ブロックLv1は消去されずに通常ブロックになる
- 氷結ブロックLv2は消去されずに氷結ブロックLv1になる
- 通常ブロックのみが消去される

### 実装の問題
現在の実装では、氷結ブロックも含めて全てのブロックが消去されてしまっていました。

## 修正内容

1. `GameScene.ts`の`onBlockClick`メソッドを修正
   - 氷結ブロックはレベルダウンするだけで、通常ブロックのみを消去するように修正
   - 処理の流れ:
     1. 氷結ブロックを更新（レベルダウン）
     2. 通常ブロックのみをフィルタリング
     3. 通常ブロックのみを消去

2. 修正のポイント
   - `BlockLogic.updateIceBlocks`メソッドを使用して氷結ブロックをレベルダウン
   - 通常ブロックのみをフィルタリングして消去対象とする
   - 元々の`updateIceBlocks`メソッドは使用しない

## 修正のコード

```typescript
// 氷結ブロックの状態更新
this.blocks = blockLogic.updateIceBlocks(this.blocks, connectedBlocks);

// 通常ブロックのみを消去
const normalBlocks = connectedBlocks.filter(block => {
  const updatedBlock = this.blocks[block.y][block.x];
  return updatedBlock && updatedBlock.type === 'normal';
});

// ブロックを消去
this.removeBlocks(normalBlocks);
```

## 結論

氷結ブロックの挙動が仕様通りになりました。氷結ブロックはレベルダウンするだけで、通常ブロックのみが消去されるようになりました。
