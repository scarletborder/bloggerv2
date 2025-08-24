import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // 仅生产环境使用 CDN base，开发环境保持默认
  base: mode === 'production' ? 'https://cdn.jsdelivr.net/gh/scarletborder/bloggerv2@static/' : '/',
  plugins: [
    react(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 只压缩大于 10kb 的文件
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('prismjs')) {
              return 'vendor-prismjs';
            }
            if (id.includes('swiper')) {
              return 'vendor-swiper';
            }
            if (id.includes('ahooks')) {
              return 'vendor-ahooks';
            }
            return 'vendor';
          }
          if (id.includes('/src/pages/')) {
            const match = id.match(/src\/pages\/([^/]+)\.tsx/);
            if (match && match[1]) {
              return `page-${match[1].toLowerCase()}`;
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
