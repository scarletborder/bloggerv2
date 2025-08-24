import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  // 配置静态资源的 CDN 地址，指向 GitHub static 分支
  // 请将 'yourname/bloggerv2' 替换为您的实际 GitHub 仓库
  base: 'https://cdn.jsdelivr.net/gh/yourname/bloggerv2@static/',
  plugins: [react()],
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
})
