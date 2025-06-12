  /**
   * 氷結ブロックの隣接ブロックをチェックする
   */
  private checkAdjacentBlocksForIce(x: number, y: number): void {
    if (!this.blocks[y][x] || this.blocks[y][x].type !== 'iceLv1') {
      return;
    }
    
    const iceColor = this.blocks[y][x].color;
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }  // 左
    ];
    
    // 隣接する同色ブロックを探す
    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      // 範囲外チェック
      if (ny < 0 || ny >= this.blocks.length || nx < 0 || nx >= this.blocks[ny].length) {
        continue;
      }
      
      // 隣接ブロックが存在し、同じ色で、通常ブロックの場合
      if (this.blocks[ny][nx] && 
          this.blocks[ny][nx].color === iceColor && 
          this.blocks[ny][nx].type === 'normal') {
        
        const blockLogic = new BlockLogic();
        const connectedBlocks = blockLogic.findConnectedBlocks(this.blocks, nx, ny);
        
        // 2つ以上のブロックが隣接している場合のみ消去
        if (connectedBlocks.length >= 2) {
          // スコア計算
          const score = blockLogic.calculateScore(connectedBlocks.length);
          this.score += score;
          
          // スコア表示を更新
          this.updateScoreDisplay();
          
          // ブロックを消去
          this.removeBlocks(connectedBlocks);
          
          // 氷結ブロックを通常ブロックに変換
          this.convertIceToNormal(x, y);
          
          // 少し待ってから重力を適用
          this.time.delayedCall(300, () => {
            this.applyGravity();
          });
          
          return;
        }
      }
    }
  }
  
  /**
   * 氷結ブロックを通常ブロックに変換
   */
  private convertIceToNormal(x: number, y: number): void {
    if (!this.blocks[y][x] || this.blocks[y][x].type !== 'iceLv1') {
      return;
    }
    
    // 氷結ブロックを通常ブロックに変換
    this.blocks[y][x] = {
      x,
      y,
      color: this.blocks[y][x].color,
      type: 'normal',
      sprite: this.blocks[y][x].sprite
    };
    
    // スプライトを更新
    if (this.blocks[y][x].sprite) {
      const blockX = this.boardX + x * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
      const blockY = this.boardY + y * GameConfig.BLOCK_SIZE + GameConfig.BLOCK_SIZE / 2;
      
      // 古いスプライトを削除
      this.blocks[y][x].sprite.destroy();
      
      // 新しいスプライトを作成
      const color = this.blocks[y][x].color;
      const blockSprite = this.add.sprite(blockX, blockY, '');
      
      // スプライトの代わりに円を描画
      const circle = this.add.circle(0, 0, GameConfig.BLOCK_SIZE / 2 - 2, parseInt(color.replace('#', '0x')));
      const rt = this.add.renderTexture(0, 0, GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE);
      rt.draw(circle, GameConfig.BLOCK_SIZE / 2, GameConfig.BLOCK_SIZE / 2);
      
      blockSprite.setTexture(rt.texture);
      blockSprite.setInteractive({ useHandCursor: true });
      
      this.blocks[y][x].sprite = blockSprite;
      this.blockSprites[y][x] = blockSprite;
      
      // 氷が解けるエフェクト
      this.add.particles(blockX, blockY, 'particle', {
        speed: 100,
        lifespan: 500,
        scale: { start: 0.5, end: 0 },
        quantity: 10,
        tint: 0xFFFFFF
      });
    }
  }
  
  /**
   * 氷結ブロックの状態を更新
   */
  private updateIceBlocks(removedBlocks: Block[]): void {
    // 消去されたブロックの隣接位置にある氷結ブロックを探す
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }  // 左
    ];
    
    const updatedPositions = new Set<string>();
    
    for (const block of removedBlocks) {
      for (const dir of directions) {
        const nx = block.x + dir.dx;
        const ny = block.y + dir.dy;
        
        // 範囲外チェック
        if (ny < 0 || ny >= this.blocks.length || nx < 0 || nx >= this.blocks[ny].length) {
          continue;
        }
        
        // 氷結ブロックかつ同じ色の場合
        if (this.blocks[ny][nx] && 
            this.blocks[ny][nx].type === 'iceLv1' && 
            this.blocks[ny][nx].color === block.color) {
          
          // 同じ位置の氷結ブロックを重複して処理しないようにする
          const posKey = `${nx},${ny}`;
          if (!updatedPositions.has(posKey)) {
            updatedPositions.add(posKey);
            this.convertIceToNormal(nx, ny);
          }
        }
      }
    }
  }
