import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import removeConsole from "vite-plugin-remove-console";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // 仅生产环境使用 CDN base，开发环境保持默认
  base:
    mode === "production"
      ? "https://cdn.jsdelivr.net/gh/scarletborder/bloggerv2@static/"
      : "/",
  plugins: [
    react(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 只压缩大于 10kb 的文件
      algorithm: "gzip",
      ext: ".gz",
    }),
    removeConsole(),
  ],
  server: {
    proxy: {
      "/proxy-api": {
        target: "https://blog.scarletborder.cn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-api/, ""),
        secure: true,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    },
  },
  build: {
    minify: true, // 启用代码混淆和压缩
    rollupOptions: {
      output: {
        // 主入口文件的名称，通常不需要 hash
        entryFileNames: "assets/index-[hash].js", // 添加 hash
        // chunk 文件的名称，启用 hash，用于缓存 busting
        chunkFileNames: "assets/[name]-[hash].js", // 启用 hash
        // 其他资源的名称，启用 hash
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];

          // CSS 文件保持 chunk 名称，启用 hash
          if (ext === "css") {
            return `assets/[name]-[hash].css`; // 启用 hash
          }

          // 图片文件保持原名或使用固定名称，启用 hash
          if (/png|jpe?g|gif|svg|webp|avif/i.test(ext)) {
            return `assets/images/[name]-[hash].[ext]`; // 启用 hash
          }

          // 字体文件，启用 hash
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash].[ext]`; // 启用 hash
          }

          // 其他资源文件，启用 hash
          return `assets/[name]-[hash].[ext]`; // 启用 hash
        },
        // manualChunks 仍然保持禁用状态
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
