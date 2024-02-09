import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/cjs/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/es/index.js',
      format: 'es',
    },
  ],
  plugins: [
    resolve({
      extensions, // 指定 import 模块后缀解析规则
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
      plugins: [
        ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
      ],
    }),
  ],
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'use-sync-external-store/shim/with-selector',
  ],
};
