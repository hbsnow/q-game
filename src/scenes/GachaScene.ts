  private showRateDetails() {
    // 既に表示されている場合は閉じる
    if (this.rateDetailsContainer) {
      this.rateDetailsContainer.destroy();
      this.rateDetailsContainer = null;
      return;
    }
    
    const { width, height } = this.cameras.main;
    
    // 確率詳細表示用のコンテナ
    this.rateDetailsContainer = this.add.container(width / 2, height / 2);
    
    // 背景オーバーレイ
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0.5);
    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      this.rateDetailsContainer?.destroy();
      this.rateDetailsContainer = null;
    });
    
    // 詳細パネル
    const panel = this.add.rectangle(0, 0, width - 60, height - 200, 0x1A3A5A, 0.9);
    panel.setStrokeStyle(2, 0x87CEEB, 0.8);
    
    // タイトル
    const titleText = this.add.text(0, -panel.height / 2 + 30, '排出確率詳細', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 閉じるボタン
    const closeButton = this.add.rectangle(panel.width / 2 - 30, -panel.height / 2 + 30, 40, 40, 0xFF5555, 0.8);
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      this.rateDetailsContainer?.destroy();
      this.rateDetailsContainer = null;
    });
    
    const closeText = this.add.text(panel.width / 2 - 30, -panel.height / 2 + 30, '×', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // レア度ごとの確率
    const rarityRates = this.gachaManager.getRarityRates();
    let rateY = -panel.height / 2 + 80;
    
    // レア度ごとの確率表示（表形式）
    const tableWidth = panel.width - 100;
    const tableHeight = 40;
    const tableX = 0;
    
    // テーブルヘッダー
    const headerBg = this.add.rectangle(tableX, rateY, tableWidth, tableHeight, 0x2A4A6A, 0.9);
    headerBg.setStrokeStyle(1, 0xFFFFFF, 0.5);
    
    this.add.text(tableX - tableWidth / 3, rateY, 'レア度', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(tableX, rateY, '排出確率', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(tableX + tableWidth / 3, rateY, '出現アイテム数', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    rateY += tableHeight;
    
    // 各レア度の行
    const rarities: string[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const availableItems = this.gachaManager.getAvailableItems();
    
    rarities.forEach((rarity, index) => {
      const rowBg = this.add.rectangle(tableX, rateY, tableWidth, tableHeight, index % 2 === 0 ? 0x1A3A5A : 0x2A4A6A, 0.7);
      rowBg.setStrokeStyle(1, 0x87CEEB, 0.3);
      
      // レア度
      this.add.text(tableX - tableWidth / 3, rateY, rarity, {
        fontSize: '16px',
        color: getRarityColor(rarity as any),
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 排出確率
      const rate = rarityRates[rarity as keyof typeof rarityRates] || 0;
      this.add.text(tableX, rateY, `${rate.toFixed(1)}%`, {
        fontSize: '16px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      // 出現アイテム数
      const itemCount = availableItems.filter(item => item.rarity === rarity).length;
      this.add.text(tableX + tableWidth / 3, rateY, `${itemCount}個`, {
        fontSize: '16px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      
      rateY += tableHeight;
    });
    
    // 10連ガチャの確定枠説明
    rateY += 20;
    const guaranteedBg = this.add.rectangle(tableX, rateY, tableWidth, 60, 0x32CD32, 0.2);
    guaranteedBg.setStrokeStyle(1, 0x32CD32, 0.5);
    
    this.add.text(tableX, rateY, '10連ガチャ: Dレア以上1枠確定!', {
      fontSize: '16px',
      color: '#32CD32',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(tableX, rateY + 25, '（通常の抽選でDレア以上が出なかった場合のみ）', {
      fontSize: '12px',
      color: '#CCCCCC'
    }).setOrigin(0.5);
    
    // 出現アイテム一覧
    rateY += 100;
    this.add.text(0, rateY, '出現アイテム一覧', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    rateY += 30;
    
    // レア度ごとにアイテムをグループ化
    const itemsByRarity: { [key: string]: { name: string, type: ItemType }[] } = {};
    
    availableItems.forEach(item => {
      if (!itemsByRarity[item.rarity]) {
        itemsByRarity[item.rarity] = [];
      }
      itemsByRarity[item.rarity].push({ name: item.name, type: item.type });
    });
    
    // レア度ごとにアイテムを表示
    let currentY = rateY;
    
    rarities.forEach(rarity => {
      const items = itemsByRarity[rarity];
      if (!items || items.length === 0) return;
      
      // レア度ヘッダー
      const rarityBg = this.add.rectangle(0, currentY, tableWidth, 30, parseInt(getRarityColor(rarity as any).replace('#', '0x')), 0.3);
      rarityBg.setStrokeStyle(1, parseInt(getRarityColor(rarity as any).replace('#', '0x')), 0.5);
      
      this.add.text(0, currentY, `${rarity}レア (${items.length}個)`, {
        fontSize: '14px',
        color: getRarityColor(rarity as any),
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      currentY += 35;
      
      // アイテム一覧（3列に分ける）
      const columns = 3;
      const columnWidth = tableWidth / columns;
      
      items.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        const x = -tableWidth / 2 + columnWidth / 2 + col * columnWidth;
        const y = currentY + row * 25;
        
        this.add.text(x, y, item.name, {
          fontSize: '12px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
      });
      
      currentY += Math.ceil(items.length / columns) * 25 + 15;
    });
    
    // 閉じるボタン（下部）
    const bottomCloseButton = this.add.rectangle(0, panel.height / 2 - 30, 150, 40, 0x2196F3, 0.8);
    bottomCloseButton.setStrokeStyle(2, 0xFFFFFF, 0.8);
    bottomCloseButton.setInteractive();
    bottomCloseButton.on('pointerdown', () => {
      this.rateDetailsContainer?.destroy();
      this.rateDetailsContainer = null;
    });
    
    this.add.text(0, panel.height / 2 - 30, '閉じる', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // コンテナに追加
    this.rateDetailsContainer.add([
      overlay, panel, titleText, closeButton, closeText,
      headerBg, guaranteedBg, bottomCloseButton
    ]);
    
    // スクロール可能なコンテンツエリアを作成（必要に応じて）
    if (currentY > panel.height / 2 - 50) {
      // スクロール機能の実装（Phaserのマスク機能を使用）
      // 実装は複雑になるため、必要に応じて追加
    }
  }
