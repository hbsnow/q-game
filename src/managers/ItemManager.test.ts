/**
 * ItemManager のユニットテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ItemManager } from './ItemManager';
import { ITEM_DATA } from '../data/ItemData';
import { ItemRarity } from '../types/Item';

describe('ItemManager', () => {
  let itemManager: ItemManager;

  beforeEach(() => {
    // シングルトンインスタンスを取得
    itemManager = ItemManager.getInstance();
    
    // テスト前にインベントリをクリア（プライベートメソッドを使用できないため、リフレクションを使用）
    (itemManager as any).inventory = {};
    (itemManager as any).equippedItems = {
      specialSlot: null,
      normalSlot: null
    };
    (itemManager as any).usageState = {
      specialSlotUsed: false,
      normalSlotUsed: false
    };
  });

  describe('アイテム追加・消費', () => {
    it('アイテムを正しく追加できる', () => {
      itemManager.addItem('swap', 3);
      expect(itemManager.getItemCount('swap')).toBe(3);
    });

    it('同じアイテムを複数回追加すると累積される', () => {
      itemManager.addItem('swap', 2);
      itemManager.addItem('swap', 3);
      expect(itemManager.getItemCount('swap')).toBe(5);
    });

    it('所持上限（99個）を超えると99個に制限される', () => {
      itemManager.addItem('swap', 100);
      expect(itemManager.getItemCount('swap')).toBe(99);
    });

    it('アイテムを正しく消費できる', () => {
      itemManager.addItem('swap', 5);
      const success = itemManager.consumeItem('swap', 2);
      
      expect(success).toBe(true);
      expect(itemManager.getItemCount('swap')).toBe(3);
    });

    it('所持数不足の場合は消費できない', () => {
      itemManager.addItem('swap', 2);
      const success = itemManager.consumeItem('swap', 5);
      
      expect(success).toBe(false);
      expect(itemManager.getItemCount('swap')).toBe(2);
    });

    it('存在しないアイテムの消費は失敗する', () => {
      const success = itemManager.consumeItem('nonexistent', 1);
      expect(success).toBe(false);
    });
  });

  describe('アイテム装備', () => {
    beforeEach(() => {
      // テスト用アイテムを追加
      itemManager.addItem('swap', 5);      // Eレア（通常アイテム）
      itemManager.addItem('bomb', 2);      // Sレア（特殊アイテム）
      itemManager.addItem('hammer', 3);    // Cレア（通常アイテム）
    });

    it('通常アイテムを特殊枠に装備できる', () => {
      const swapItem = ITEM_DATA.swap;
      const success = itemManager.equipItem(swapItem, 'special');
      
      expect(success).toBe(true);
      expect(itemManager.getEquippedItems().specialSlot?.id).toBe('swap');
    });

    it('通常アイテムを通常枠に装備できる', () => {
      const swapItem = ITEM_DATA.swap;
      const success = itemManager.equipItem(swapItem, 'normal');
      
      expect(success).toBe(true);
      expect(itemManager.getEquippedItems().normalSlot?.id).toBe('swap');
    });

    it('特殊アイテム（Sレア）を特殊枠に装備できる', () => {
      const bombItem = ITEM_DATA.bomb;
      const success = itemManager.equipItem(bombItem, 'special');
      
      expect(success).toBe(true);
      expect(itemManager.getEquippedItems().specialSlot?.id).toBe('bomb');
    });

    it('特殊アイテム（Sレア）を通常枠に装備できない', () => {
      const bombItem = ITEM_DATA.bomb;
      const success = itemManager.equipItem(bombItem, 'normal');
      
      expect(success).toBe(false);
      expect(itemManager.getEquippedItems().normalSlot).toBeNull();
    });

    it('所持していないアイテムは装備できない', () => {
      const changeOneItem = ITEM_DATA.changeOne;
      const success = itemManager.equipItem(changeOneItem, 'special');
      
      expect(success).toBe(false);
    });

    it('装備を解除できる', () => {
      const swapItem = ITEM_DATA.swap;
      itemManager.equipItem(swapItem, 'special');
      itemManager.unequipItem('special');
      
      expect(itemManager.getEquippedItems().specialSlot).toBeNull();
    });
  });

  describe('アイテム使用', () => {
    beforeEach(() => {
      itemManager.addItem('swap', 5);
      itemManager.addItem('bomb', 2);
      itemManager.equipItem(ITEM_DATA.swap, 'special');
      itemManager.equipItem(ITEM_DATA.bomb, 'normal'); // これは失敗するはず
      itemManager.equipItem(ITEM_DATA.swap, 'normal'); // 代わりにこれを装備
    });

    it('装備したアイテムを使用できる', () => {
      const success = itemManager.useItem('special');
      expect(success).toBe(true);
      expect(itemManager.isItemUsed('special')).toBe(true);
    });

    it('使用済みアイテムは再使用できない', () => {
      itemManager.useItem('special');
      const success = itemManager.useItem('special');
      
      expect(success).toBe(false);
    });

    it('装備していないスロットのアイテムは使用できない', () => {
      itemManager.unequipItem('special');
      const success = itemManager.useItem('special');
      
      expect(success).toBe(false);
    });
  });

  describe('ステージ完了処理', () => {
    beforeEach(() => {
      itemManager.addItem('swap', 5);
      itemManager.addItem('hammer', 3);
      itemManager.equipItem(ITEM_DATA.swap, 'special');
      itemManager.equipItem(ITEM_DATA.hammer, 'normal');
    });

    it('ステージクリア時に使用したアイテムが消費される', () => {
      // 両方のアイテムを使用
      itemManager.useItem('special');
      itemManager.useItem('normal');
      
      // ステージクリア処理
      itemManager.onStageComplete();
      
      // 使用したアイテムが消費されている
      expect(itemManager.getItemCount('swap')).toBe(4);
      expect(itemManager.getItemCount('hammer')).toBe(2);
      
      // 使用状態がリセットされている
      expect(itemManager.isItemUsed('special')).toBe(false);
      expect(itemManager.isItemUsed('normal')).toBe(false);
    });

    it('使用しなかったアイテムは消費されない', () => {
      // 片方のアイテムのみ使用
      itemManager.useItem('special');
      
      // ステージクリア処理
      itemManager.onStageComplete();
      
      // 使用したアイテムのみ消費
      expect(itemManager.getItemCount('swap')).toBe(4);
      expect(itemManager.getItemCount('hammer')).toBe(3); // 消費されない
    });

    it('ステージリトライ時は使用状態のみリセットされる', () => {
      // アイテムを使用
      itemManager.useItem('special');
      itemManager.useItem('normal');
      
      // リトライ処理
      itemManager.onStageRetry();
      
      // 所持数は変わらない
      expect(itemManager.getItemCount('swap')).toBe(5);
      expect(itemManager.getItemCount('hammer')).toBe(3);
      
      // 使用状態はリセットされる
      expect(itemManager.isItemUsed('special')).toBe(false);
      expect(itemManager.isItemUsed('normal')).toBe(false);
    });
  });

  describe('装備制限チェック', () => {
    beforeEach(() => {
      itemManager.addItem('swap', 5);      // Eレア
      itemManager.addItem('bomb', 2);      // Sレア
      itemManager.addItem('scoreBooster', 1); // Aレア
    });

    it('通常アイテムは両方の枠に装備可能', () => {
      const swapItem = ITEM_DATA.swap;
      expect(itemManager.canEquipItem(swapItem, 'special')).toBe(true);
      expect(itemManager.canEquipItem(swapItem, 'normal')).toBe(true);
    });

    it('Sレアアイテムは特殊枠のみ装備可能', () => {
      const bombItem = ITEM_DATA.bomb;
      expect(itemManager.canEquipItem(bombItem, 'special')).toBe(true);
      expect(itemManager.canEquipItem(bombItem, 'normal')).toBe(false);
    });

    it('Aレアアイテムは特殊枠のみ装備可能', () => {
      const boosterItem = ITEM_DATA.scoreBooster;
      expect(itemManager.canEquipItem(boosterItem, 'special')).toBe(true);
      expect(itemManager.canEquipItem(boosterItem, 'normal')).toBe(false);
    });

    it('所持していないアイテムは装備不可', () => {
      const hammerItem = ITEM_DATA.hammer;
      expect(itemManager.canEquipItem(hammerItem, 'special')).toBe(false);
      expect(itemManager.canEquipItem(hammerItem, 'normal')).toBe(false);
    });
  });

  describe('デバッグ機能', () => {
    beforeEach(() => {
      itemManager.addItem('swap', 3);
      itemManager.addItem('bomb', 1);
      itemManager.equipItem(ITEM_DATA.swap, 'special');
      itemManager.useItem('special');
    });

    it('インベントリ情報を文字列で取得できる', () => {
      const info = itemManager.getInventoryInfo();
      expect(info).toContain('swap: 3');
      expect(info).toContain('bomb: 1');
      expect(info).toContain('総数: 4');
    });

    it('装備情報を文字列で取得できる', () => {
      const info = itemManager.getEquipmentInfo();
      expect(info).toContain('特殊枠: スワップ(使用済み)');
      expect(info).toContain('通常枠: 未装備');
    });

    it('総アイテム数を取得できる', () => {
      expect(itemManager.getTotalItemCount()).toBe(4);
    });
  });
});
