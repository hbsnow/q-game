# さめがめオーシャン コード仕様

- 言語: Typescript
- 利用ライブラリ: Phaser

## アーキテクチャ設計

### シーン管理の明確化

- ゲームの状態（メニュー、ゲーム画面、設定など）をシーンで適切に分離
- シーン間のデータ受け渡し方法を統一

### 状態管理の統一

- ゲームの状態管理方法を統一し、データの流れを明確にする

### コンポーネント指向

- 機能を小さなコンポーネントに分割して再利用性を高める

## コード品質

### TypeScript の活用

```typescript
// 型安全性を確保してバグを減らす
interface GameConfig {
  width: number;
  height: number;
  backgroundColor: string;
}
```

### 設定の外部化

```typescript
// マジックナンバーを避け、設定値は定数で管理
const GAME_CONFIG = {
  PLAYER_SPEED: 200,
  BULLET_SPEED: 300,
  ENEMY_SPAWN_RATE: 1000,
};
```

## 画面

- スマホ縦画面を基準とした設計
- タッチ入力に最適化された UI 配置
- ボタンサイズは指で押しやすいサイズ（最低 44px 推奨）
