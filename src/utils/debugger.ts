import { Block, GameState } from '@/types';
import { DEBUG_CONFIG, GAME_CONFIG } from '@/config/gameConfig';

/**
 * デバッグ情報表示クラス
 */
export class GameDebugger {
  private static instance: GameDebugger;
  private debugPanel: HTMLElement | null = null;
  private isVisible: boolean = false;
  
  static getInstance(): GameDebugger {
    if (!GameDebugger.instance) {
      GameDebugger.instance = new GameDebugger();
    }
    return GameDebugger.instance;
  }
  
  /**
   * デバッグパネルを初期化
   */
  init(): void {
    if (!DEBUG_CONFIG.ENABLE_CHEATS) return;
    
    this.createDebugPanel();
    this.setupKeyboardShortcuts();
  }
  
  /**
   * デバッグパネルを作成
   */
  private createDebugPanel(): void {
    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      display: none;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    document.body.appendChild(this.debugPanel);
  }
  
  /**
   * キーボードショートカットを設定
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      if (!DEBUG_CONFIG.ENABLE_CHEATS) return;
      
      // Ctrl + D でデバッグパネル表示切り替え
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        this.toggleDebugPanel();
      }
      
      // Ctrl + G でグリッド表示切り替え
      if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        this.toggleGrid();
      }
    });
  }
  
  /**
   * デバッグパネルの表示切り替え
   */
  toggleDebugPanel(): void {
    if (!this.debugPanel) return;
    
    this.isVisible = !this.isVisible;
    this.debugPanel.style.display = this.isVisible ? 'block' : 'none';
    
    if (this.isVisible) {
      this.log('デバッグパネルを表示しました');
      this.log('ショートカット:');
      this.log('  Ctrl+D: パネル表示切り替え');
      this.log('  Ctrl+G: グリッド表示切り替え');
    }
  }
  
  /**
   * グリッド表示の切り替え
   */
  private toggleGrid(): void {
    DEBUG_CONFIG.SHOW_GRID = !DEBUG_CONFIG.SHOW_GRID;
    this.log(`グリッド表示: ${DEBUG_CONFIG.SHOW_GRID ? 'ON' : 'OFF'}`);
  }
  
  /**
   * ゲーム状態を表示
   */
  displayGameState(gameState: GameState): void {
    if (!this.isVisible || !this.debugPanel) return;
    
    const stateInfo = `
      <h3>🎮 ゲーム状態</h3>
      <div>ステージ: ${gameState.currentStage}</div>
      <div>ゴールド: ${gameState.gold}</div>
      <div>スコア: ${gameState.score} / ${gameState.targetScore}</div>
      <div>スコアブースター: ${gameState.isScoreBoosterActive ? 'ON' : 'OFF'}</div>
      <div>アイテム数: ${gameState.items.length}</div>
    `;
    
    this.updateSection('game-state', stateInfo);
  }
  
  /**
   * 盤面状態を表示
   */
  displayBoardState(blocks: Block[]): void {
    if (!this.isVisible || !this.debugPanel) return;
    
    const blockCounts = this.countBlockTypes(blocks);
    const boardInfo = `
      <h3>🎯 盤面状態</h3>
      <div>総ブロック数: ${blocks.length}</div>
      <div>通常: ${blockCounts.normal}</div>
      <div>氷結: ${blockCounts.ice}</div>
      <div>カウンター: ${blockCounts.counter}</div>
      <div>岩: ${blockCounts.rock}</div>
      <div>鋼鉄: ${blockCounts.steel}</div>
    `;
    
    this.updateSection('board-state', boardInfo);
  }
  
  /**
   * パフォーマンス情報を表示
   */
  displayPerformance(fps: number, memoryUsage?: number): void {
    if (!this.isVisible || !this.debugPanel) return;
    
    const perfInfo = `
      <h3>⚡ パフォーマンス</h3>
      <div>FPS: ${fps.toFixed(1)}</div>
      ${memoryUsage ? `<div>メモリ: ${(memoryUsage / 1024 / 1024).toFixed(1)}MB</div>` : ''}
    `;
    
    this.updateSection('performance', perfInfo);
  }
  
  /**
   * チートコマンドパネルを表示
   */
  displayCheatCommands(): void {
    if (!this.isVisible || !this.debugPanel) return;
    
    const cheatInfo = `
      <h3>🔧 チートコマンド</h3>
      <button onclick="window.gameDebugger?.addGold(1000)">ゴールド+1000</button><br>
      <button onclick="window.gameDebugger?.skipStage()">ステージスキップ</button><br>
      <button onclick="window.gameDebugger?.clearBoard()">盤面クリア</button><br>
      <button onclick="window.gameDebugger?.addAllItems()">全アイテム追加</button>
    `;
    
    this.updateSection('cheat-commands', cheatInfo);
  }
  
  /**
   * セクションを更新
   */
  private updateSection(sectionId: string, content: string): void {
    if (!this.debugPanel) return;
    
    let section = this.debugPanel.querySelector(`#${sectionId}`);
    if (!section) {
      section = document.createElement('div');
      section.id = sectionId;
      this.debugPanel.appendChild(section);
    }
    
    section.innerHTML = content;
  }
  
  /**
   * ブロック種類をカウント
   */
  private countBlockTypes(blocks: Block[]): Record<string, number> {
    const counts = {
      normal: 0,
      ice: 0,
      counter: 0,
      rock: 0,
      steel: 0,
    };
    
    blocks.forEach(block => {
      switch (block.type) {
        case 'normal':
          counts.normal++;
          break;
        case 'ice1':
        case 'ice2':
        case 'iceCounter':
        case 'iceCounterPlus':
          counts.ice++;
          break;
        case 'counter':
        case 'counterPlus':
          counts.counter++;
          break;
        case 'rock':
          counts.rock++;
          break;
        case 'steel':
          counts.steel++;
          break;
      }
    });
    
    return counts;
  }
  
  /**
   * ログ出力
   */
  log(message: string, data?: any): void {
    if (DEBUG_CONFIG.LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] ${message}`, data || '');
    }
    
    if (this.isVisible && this.debugPanel) {
      const logEntry = document.createElement('div');
      logEntry.style.cssText = 'margin: 2px 0; padding: 2px; background: rgba(255,255,255,0.1);';
      logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
      
      let logSection = this.debugPanel.querySelector('#debug-log');
      if (!logSection) {
        logSection = document.createElement('div');
        logSection.id = 'debug-log';
        logSection.innerHTML = '<h3>📝 ログ</h3>';
        this.debugPanel.appendChild(logSection);
      }
      
      logSection.appendChild(logEntry);
      
      // ログが多くなりすぎないよう制限
      const logEntries = logSection.querySelectorAll('div:not(h3)');
      if (logEntries.length > 20) {
        logEntries[0].remove();
      }
    }
  }
  
  /**
   * 盤面を可視化（コンソール出力）
   */
  visualizeBoard(blocks: Block[]): void {
    if (DEBUG_CONFIG.LOG_LEVEL !== 'debug') return;
    
    const { boardWidth, boardHeight } = GAME_CONFIG;
    const grid: string[][] = Array(boardHeight).fill(null).map(() => 
      Array(boardWidth).fill('.')
    );
    
    blocks.forEach(block => {
      const symbol = this.getBlockSymbol(block);
      grid[block.y][block.x] = symbol;
    });
    
    console.log('=== 盤面状態 ===');
    grid.forEach((row, y) => {
      console.log(`${y.toString().padStart(2)}: ${row.join(' ')}`);
    });
    console.log('================');
  }
  
  /**
   * ブロックのシンボルを取得
   */
  private getBlockSymbol(block: Block): string {
    switch (block.type) {
      case 'normal': return block.color.charAt(0).toUpperCase();
      case 'ice1': return 'I';
      case 'ice2': return 'i';
      case 'counter': return 'C';
      case 'counterPlus': return '+';
      case 'rock': return 'R';
      case 'steel': return 'S';
      default: return '?';
    }
  }
}

// グローバルアクセス用（チートコマンド用）
if (DEBUG_CONFIG.ENABLE_CHEATS) {
  (window as any).gameDebugger = GameDebugger.getInstance();
}
