import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/q-game/", // リポジトリ名に合わせて変更
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    chunkSizeWarningLimit: 2000, // チャンクサイズ警告の閾値を2MBに設定
    rollupOptions: {
      output: {
        manualChunks: {
          // Phaserを別チャンクに分離
          phaser: ["phaser"],
          // マネージャークラスを別チャンクに分離
          managers: [
            "./src/managers/ItemManager",
            "./src/managers/GachaManager",
            "./src/managers/StageManager",
            "./src/managers/TutorialManager",
          ],
          // ユーティリティクラスを別チャンクに分離
          utils: [
            "./src/utils/BlockLogic",
            "./src/utils/DebugHelper",
            "./src/utils/ParticleManager",
          ],
        },
      },
    },
  },
  // test: {
  //   globals: true,
  //   environment: "jsdom",
  // },
});
