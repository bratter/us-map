import resolve from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import * as meta from './package.json';

const filename = meta.name.replace('@d3ts/', 'd3ts-');
const d3Externals = Object.keys(meta.peerDependencies || {}).filter(k => /^d3-/.test(k));

// Base config
const config = {
  input: 'src/index.ts',
  external: d3Externals,
  output: {
    file: `dist/${filename}.js`,
    name: 'd3ts',
    format: 'umd',
    sourcemap: true,
    extend: true,
    indent: false,
    banner: `// ${meta.name} v${meta.version} (${meta.homepage}) Copyright ${new Date().getFullYear()} ${meta.author.name}`,
    // All d3 dependencies will be found on a single d3 external, so point all package keys to 'd3'
    // Note that we do not add topojson-client as a global but bunlde it with the umd distros
    globals: Object.assign({}, ...d3Externals.map(key => ({ [key]: 'd3' }))),
  },
  plugins: [
    resolve(),
    ts(),
    sourceMaps(),
  ],
};

export default [
  // Non-minified UMD output
  config,
  // Minified UMD output
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${filename}.min.js`,
    },
    plugins: [
      ...config.plugins,
      terser({
        output: { preamble: config.output.banner },
      }),
    ],
  },
  // ES Module output, overwriting plugins to add ts declarations
  {
    ...config,
    output: {
      ...config.output,
      file: 'dist/index.js',
      format: 'es',
    },
    plugins: [
      resolve(),
      ts({
        tsconfig: cfg => ({ ...cfg, declaration: true, declarationMap: true }),
      }),
      sourceMaps(),
      terser({
        output: { preamble: config.output.banner },
      }),
    ],
  },
];
