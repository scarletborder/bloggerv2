/* eslint-disable */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import removeConsole from 'vite-plugin-remove-console';

const ENABLE_HASH = true;
const VENDORS_TO_CHUNK = ['tdesign-react', 'lodash'];

/**
 * 根据环境变量和构建模式获取环境相关配置
 * @param mode Vite 的构建模式 ('development' or 'production')
 * @returns 返回一个包含环境特定配置的对象
 */
const getEnv = (mode: string): {
  base: string;
  apiEndpoint: string;
} => {
  // --- base URL 配置 ---
  const isCdnDeploy = process.env.DEPLOY_ENV === 'CDN';
  const cdnBaseUrl = process.env.CDN_BASEURL;
  let base = '/';

  if (isCdnDeploy) {
    if (!cdnBaseUrl) {
      console.warn(
        'Warning: DEPLOY_ENV is "CDN" but CDN_BASEURL is not set.'
      );
      base = '/'; // Fallback to a safe default
    } else {
      base = cdnBaseUrl;
    }
  } else if (mode === 'production') {
    base = './';
  }

  // 优先从环境变量中读取 API_ENDPOINT。如果不存在，则默认为 '/proxy-api' 以便本地开发代理
  const apiEndpoint = process.env.API_ENDPOINT || '/proxy-api';

  return {
    base,
    apiEndpoint,
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 获取当前环境的配置
  const envConfig = getEnv(mode);

  return {
    base: envConfig.base,
    define: {
      '__API_ENDPOINT__': JSON.stringify(envConfig.apiEndpoint),
    },
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
      minify: true,
      rollupOptions: {
        output: {
          entryFileNames: ENABLE_HASH
            ? 'assets/index-[hash].js'
            : 'assets/index.js',
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name || '';
            if (VENDORS_TO_CHUNK.includes(name)) {
              return ENABLE_HASH
                ? `assets/${name}-[hash].js`
                : `assets/${name}.js`;
            }
            return ENABLE_HASH
              ? 'assets/[name]-[hash].js'
              : 'assets/[name].js';
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (ext === 'css') {
              return ENABLE_HASH
                ? `assets/[name]-[hash].css`
                : `assets/[name].css`;
            }
            if (/png|jpe?g|gif|svg|webp|avif/i.test(ext)) {
              return ENABLE_HASH
                ? `assets/images/[name]-[hash].[ext]`
                : `assets/images/[name].[ext]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return ENABLE_HASH
                ? `assetsc/fonts/[name]-[hash].[ext]`
                : `assets/fonts/[name].[ext]`;
            }
            return ENABLE_HASH
              ? `assets/[name]-[hash].[ext]`
              : `assets/[name].[ext]`;
          },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('tdesign-react') || id.includes('@tdesign')) {
                return 'tdesign-react';
              }
              const chunkName = VENDORS_TO_CHUNK.find((vendor) =>
                id.includes(vendor)
              );
              if (chunkName) {
                return chunkName;
              }
              return 'vendor';
            }
            return null;
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});