import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import reactNativeWeb from 'vite-plugin-react-native-web';
import { transform } from 'esbuild';

const codegenFixPlugin = () => ({
  name: 'codegen-fix',
  enforce: 'pre',
  resolveId(id) {
    if (id.includes('codegenNativeComponent')) {
      return path.resolve(__dirname, 'src/mocks/codegenNativeComponent.js');
    }
  }
});

const victoryNativeJsxPlugin = () => ({
  name: 'victory-native-jsx',
  enforce: 'pre',
  async transform(code, id) {
    if (id.includes('victory-native') && id.endsWith('.js')) {
      const result = await transform(code, {
        loader: 'jsx',
        sourcefile: id,
      });
      return {
        code: result.code,
        map: result.map || null,
      };
    }
  }
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      codegenFixPlugin(), 
      victoryNativeJsxPlugin(),
      react({
        include: /\.(jsx|tsx|js|ts)$/
      }), 
      tailwindcss(), 
      reactNativeWeb()
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['victory-native'],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
