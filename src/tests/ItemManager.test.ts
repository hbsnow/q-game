import { describe, it, expect, beforeEach } from 'vitest';
import { ItemManager } from '../utils/ItemManager';

describe('ItemManager', () => {
  let itemManager: ItemManager;

  beforeEach(() => {
    itemManager = new ItemManager();
  });

  describe('アイテム追加・管理', () => {
    it('新しいアイテムを追加できる', () => {
      itemManager.addItem('swap', 3);
      expect(itemManager.getItemCount('swap')).toBe(3);
    });

    it('既存アイテムの所持数を増加できる', () => {
      itemManager.addItem('swap', 2);
      itemManager.addItem('swap', 3);
      expect(itemManager.getItemCount('swap')).toBe(5);
    });

    it('アイテム所持数の上限は99個', () => {
      itemManager.addItem('swap', 100);
      expect(itemManager.getItemCount('swap')).toBe(99);
    });

    it('アイテムを使用すると所持数が減る', () => {
      itemManager.addItem('swap', 5);
      const result = itemManager.useItem('swap', 2);
      expect(result).toBe(true);
      expect(itemManager.getItemCount('swap')).toBe(3);
    });

    it('所持数不足の場合はアイテム使用に失敗する', () => {
      itemManager.addItem('swap', 2);
      const result = itemManager.useItem('swap', 5);
      expect(result).toBe(false);
      expect(itemManager.getItemCount('swap')).toBe(2);
    });

    it('所持数が0になったアイテムは削除される', () => {
      itemManager.addItem('swap', 2);
      itemManager.useItem('swap', 2);
      expect(itemManager.getItemCount('swap')).toBe(0);
      expect(itemManager.getAllItems()).toHaveLength(0);
    });
  });

  describe('装備システム', () => {
    beforeEach(() => {
      // テスト用アイテムを追加
      itemManager.addItem('swap', 3); // Eレア（通常枠OK）
      itemManager.addItem('bomb', 1); // Sレア（特殊枠のみ）
      itemManager.addItem('scoreBooster', 1); // Aレア（特殊枠のみ）
      itemManager.addItem('hammer', 1); // Cレア（通常枠OK）
    });

    it('特殊枠にはすべてのアイテムを装備できる', () => {
      expect(itemManager.equipItem('swap', 0)).toBe(true);
      expect(itemManager.equipItem('bomb', 0)).toBe(true);
    });

    it('通常枠にはS・Aレア以外のアイテムを装備できる', () => {
      expect(itemManager.equipItem('swap', 1)).toBe(true);
      expect(itemManager.equipItem('hammer', 1)).toBe(true);
    });

    it('通常枠にS・Aレアアイテムは装備できない', () => {
      expect(itemManager.equipItem('bomb', 1)).toBe(false);
      expect(itemManager.equipItem('scoreBooster', 1)).toBe(false);
    });

    it('装備したアイテムを外すことができる', () => {
      itemManager.equipItem('swap', 0);
      const slots = itemManager.getEquipSlots();
      expect(slots[0].item?.type).toBe('swap');

      itemManager.unequipItem(0);
      const updatedSlots = itemManager.getEquipSlots();
      expect(updatedSlots[0].item).toBeNull();
    });

    it('装備したアイテムを使用できる', () => {
      itemManager.equipItem('swap', 0);
      const result = itemManager.useEquippedItem(0);
      expect(result).toBe(true);

      const slots = itemManager.getEquipSlots();
      expect(slots[0].used).toBe(true);
    });

    it('使用済みアイテムは再使用できない', () => {
      itemManager.equipItem('swap', 0);
      itemManager.useEquippedItem(0);
      const result = itemManager.useEquippedItem(0);
      expect(result).toBe(false);
    });

    it('存在しないアイテムは装備できない', () => {
      const result = itemManager.equipItem('changeOne', 0);
      expect(result).toBe(false);
    });
  });

  describe('ステージ終了処理', () => {
    beforeEach(() => {
      itemManager.addItem('swap', 5);
      itemManager.addItem('bomb', 2);
    });

    it('使用したアイテムは所持数から減る', () => {
      itemManager.equipItem('swap', 0);
      itemManager.equipItem('bomb', 1);
      
      // swapのみ使用
      itemManager.useEquippedItem(0);
      
      itemManager.onStageEnd();
      
      expect(itemManager.getItemCount('swap')).toBe(4); // 5 - 1 = 4
      expect(itemManager.getItemCount('bomb')).toBe(2); // 未使用なので減らない
    });

    it('未使用アイテムは所持数が減らない', () => {
      itemManager.equipItem('swap', 0);
      itemManager.equipItem('bomb', 1);
      
      // どちらも使用しない
      
      itemManager.onStageEnd();
      
      expect(itemManager.getItemCount('swap')).toBe(5);
      expect(itemManager.getItemCount('bomb')).toBe(2);
    });

    it('ステージ終了後は装備がクリアされる', () => {
      itemManager.equipItem('swap', 0);
      itemManager.equipItem('bomb', 1);
      
      itemManager.onStageEnd();
      
      const slots = itemManager.getEquipSlots();
      expect(slots[0].item).toBeNull();
      expect(slots[1].item).toBeNull();
      expect(slots[0].used).toBe(false);
      expect(slots[1].used).toBe(false);
    });
  });

  describe('装備可能アイテム取得', () => {
    beforeEach(() => {
      itemManager.addItem('swap', 1); // Eレア
      itemManager.addItem('bomb', 1); // Sレア
      itemManager.addItem('scoreBooster', 1); // Aレア
      itemManager.addItem('hammer', 1); // Cレア
    });

    it('特殊枠にはすべてのアイテムが装備可能として返される', () => {
      const items = itemManager.getEquippableItems('special');
      expect(items).toHaveLength(4);
      expect(items.map(item => item.type)).toContain('bomb');
      expect(items.map(item => item.type)).toContain('scoreBooster');
    });

    it('通常枠にはS・Aレア以外のアイテムが返される', () => {
      const items = itemManager.getEquippableItems('normal');
      expect(items).toHaveLength(2);
      expect(items.map(item => item.type)).toContain('swap');
      expect(items.map(item => item.type)).toContain('hammer');
      expect(items.map(item => item.type)).not.toContain('bomb');
      expect(items.map(item => item.type)).not.toContain('scoreBooster');
    });
  });
});
