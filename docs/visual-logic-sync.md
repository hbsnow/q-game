# 視覚表現と論理状態の同期設計

## 問題点

ブロックパズルゲームにおいて、視覚表現（スプライト）と論理状態（ブロックデータ）の同期が取れていないことで以下の問題が発生していました：

1. スプライト参照が適切に解放されず、メモリリークの可能性
2. 重力適用時に視覚表現と論理状態の不一致
3. ブロック消去後の状態管理が不完全

## 解決策

### 1. 明確な責任分離

- **論理状態（BlockLogic）**: ゲームのルールと状態管理のみを担当
- **視覚表現（GameScene）**: 表示とアニメーションのみを担当
- **一方向の参照**: 論理状態から視覚表現への参照は持つが、逆は持たない

### 2. 参照管理の徹底

- **明示的なnull設定**: スプライト参照を使用後に明示的にnullに設定
- **参照の早期解放**: アニメーション開始前にスプライト参照を解放
- **二重解放の防止**: スプライト参照の状態を常に確認

### 3. 完全な再構築パターン

- **状態変更後の完全再構築**: 論理状態が変わった後は視覚表現を完全に再構築
- **updateBlockSprites**: 全てのスプライトを破棄し、論理状態から新たに作成
- **一貫性の保証**: 常に論理状態と視覚表現が一致することを保証

## 実装のポイント

### BlockLogic.applyGravity

```typescript
applyGravity(blocks: Block[][]): Block[][] {
  // ...
  
  // 元のブロックのスプライト参照もnullに設定（メモリリーク防止）
  if (blocks[y][x]?.sprite) {
    blocks[y][x]!.sprite = null;
  }
  
  // ...
  
  // ディープコピーを作成し、スプライト参照を明示的にnullに設定
  const blockCopy = {
    ...blocks[y][x]!,
    sprite: null
  };
  
  // ...
}
```

### GameScene.removeBlocks

```typescript
private removeBlocks(blocks: Block[]): void {
  blocks.forEach(block => {
    // ブロックの論理状態を更新
    this.blocks[block.y][block.x] = null;
    
    // スプライトのアニメーション
    if (block.sprite) {
      const sprite = block.sprite;
      // スプライト参照を先にnullに設定（メモリリーク防止）
      block.sprite = null;
      
      // スプライト配列からも参照を削除
      this.blockSprites[block.y][block.x] = null;
      
      this.tweens.add({
        targets: sprite,
        alpha: 0,
        scale: 0.5,
        duration: 200,
        onComplete: () => {
          // スプライトを破棄
          sprite.destroy();
        }
      });
    }
  });
}
```

### GameScene.applyGravity

```typescript
private applyGravity(): void {
  const blockLogic = new BlockLogic();
  
  // 論理状態の更新（重力適用）
  const updatedBlocks = blockLogic.applyGravity(this.blocks);
  this.blocks = updatedBlocks;
  
  // 視覚表現を完全に再構築
  this.updateBlockSprites();
}
```

## テスト戦略

1. **単体テスト**: BlockLogicの各メソッドが正しく動作することを確認
2. **同期テスト**: 視覚表現と論理状態の同期が正しく行われることを確認
3. **メモリリークテスト**: スプライト参照が適切に解放されることを確認

## 設計原則

1. **Single Source of Truth**: 論理状態を唯一の信頼できる情報源とする
2. **Immutable Updates**: 状態更新は常に新しいオブジェクトを作成
3. **Clear Ownership**: 参照の所有権を明確にする
4. **Explicit Cleanup**: リソースの解放を明示的に行う
5. **Rebuild Instead of Update**: 部分更新よりも完全な再構築を優先

この設計により、視覚表現と論理状態の同期問題を解決し、安定したゲーム動作を実現します。
