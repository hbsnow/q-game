// Vitest用のセットアップファイル
import { vi } from 'vitest';

// Phaserのモック
vi.mock('phaser', () => ({
  Game: vi.fn(),
  Scene: vi.fn(),
  GameObjects: {
    Rectangle: vi.fn(),
    Text: vi.fn(),
    Group: vi.fn(),
  },
  Input: {
    Events: {
      POINTER_DOWN: 'pointerdown',
      POINTER_UP: 'pointerup',
    },
  },
  Tweens: {
    Tween: vi.fn(),
  },
}));

// グローバルなテスト用ヘルパー
global.createMockBlock = (x: number, y: number, color: string = 'blue') => ({
  id: `block-${x}-${y}`,
  type: 'normal' as const,
  color: color as any,
  x,
  y,
});

global.createMockGameState = () => ({
  currentStage: 1,
  gold: 0,
  score: 0,
  targetScore: 500,
  items: [],
  equipSlots: [
    { type: 'special' as const, item: null, used: false },
    { type: 'normal' as const, item: null, used: false },
  ],
  isScoreBoosterActive: false,
});
