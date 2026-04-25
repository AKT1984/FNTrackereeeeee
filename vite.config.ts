import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import reactNativeWeb from 'vite-plugin-react-native-web';
import { transform } from 'esbuild';

const codegenFixPlugin = () => ({
  name: 'codegen-fix',
  enforce: 'pre' as const,
  resolveId(id: string) {
    if (id.includes('codegenNativeComponent')) {
      return path.resolve(__dirname, 'src/mocks/codegenNativeComponent.js');
    }
    if (id.includes('NativeSvgRenderableModule') || id.includes('NativeSvgViewModule')) {
      return path.resolve(__dirname, 'src/mocks/NativeSvgFabricMock.js');
    }
  }
});

const victoryNativeJsxPlugin = () => ({
  name: 'victory-native-jsx',
  enforce: 'pre' as const,
  async transform(code: string, id: string) {
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
        'victory-native': 'victory',
      },
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.json',
      ],
    },
    optimizeDeps: {
      include: ['victory-native'],
      esbuildOptions: {
        resolveExtensions: [
          '.web.tsx',
          '.web.ts',
          '.web.jsx',
          '.web.js',
          '.tsx',
          '.ts',
          '.jsx',
          '.js',
          '.json',
        ],
        loader: {
          '.js': 'jsx',
        },
        plugins: [
          {
            name: 'codegen-fix-esbuild',
            setup(build) {
              build.onResolve({ filter: /codegenNativeComponent|NativeSvgRenderableModule|NativeSvgViewModule/ }, args => {
                if (args.path.includes('codegenNativeComponent')) {
                  return { path: path.resolve(__dirname, 'src/mocks/codegenNativeComponent.js') };
                }
                return { path: path.resolve(__dirname, 'src/mocks/NativeSvgFabricMock.js') };
              });
            },
          },
        ],
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      // HMR is disabled via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
