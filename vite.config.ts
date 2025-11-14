import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import removeConsole from 'vite-plugin-remove-console';

const ENABLE_HASH = false;

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // 仅生产环境使用 CDN base，开发环境保持默认
  base:
    mode === 'production'
      ? 'https://cdn.jsdelivr.net/gh/scarletborder/bloggerv2@static/'
      : '/',
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 只压缩大于 10kb 的文件
      algorithm: 'gzip',
      ext: '.gz',
    }),
    removeConsole(),
  ],
  optimizeDeps: {
    rollupOptions: {},
  },
  server: {
    proxy: {
      '/proxy-api': {
        target: 'https://blog.scarletborder.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-api/, ''),
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
    },
  },
  build: {
    minify: true, // 启用代码混淆和压缩
    rollupOptions: {
      output: {
        // 主入口文件的名称，根据 ENABLE_HASH 决定是否添加 hash
        entryFileNames: ENABLE_HASH
          ? 'assets/index-[hash].js'
          : 'assets/index.js',
        // chunk 文件的名称，根据 ENABLE_HASH 决定是否添加 hash
        chunkFileNames: ENABLE_HASH
          ? 'assets/[name]-[hash].js'
          : 'assets/[name].js',
        // 其他资源的名称，根据 ENABLE_HASH 决定是否添加 hash
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];

          // CSS 文件，根据 ENABLE_HASH 决定是否添加 hash
          if (ext === 'css') {
            return ENABLE_HASH
              ? `assets/[name]-[hash].css`
              : `assets/[name].css`;
          }

          // 图片文件，根据 ENABLE_HASH 决定是否添加 hash
          if (/png|jpe?g|gif|svg|webp|avif/i.test(ext)) {
            return ENABLE_HASH
              ? `assets/images/[name]-[hash].[ext]`
              : `assets/images/[name].[ext]`;
          }

          // 字体文件，根据 ENABLE_HASH 决定是否添加 hash
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return ENABLE_HASH
              ? `assetsc/fonts/[name]-[hash].[ext]`
              : `assets/fonts/[name].[ext]`;
          }

          // 其他资源文件，根据 ENABLE_HASH 决定是否添加 hash
          return ENABLE_HASH
            ? `assets/[name]-[hash].[ext]`
            : `assets/[name].[ext]`;
        },
        // manualChunks 仍然保持禁用状态
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
