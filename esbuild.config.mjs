import esbuild from 'esbuild';
import process from 'process';

const prod = process.argv[2] === 'production';

// Plugin to stub out Node.js modules that js-sequence-diagram tries to import
const stubNodeModules = {
  name: 'stub-node-modules',
  setup(build) {
    // Stub fs and path modules (not needed in browser)
    build.onResolve({ filter: /^(fs|path)$/ }, args => {
      return { path: args.path, namespace: 'node-stub' };
    });

    build.onLoad({ filter: /.*/, namespace: 'node-stub' }, () => {
      return {
        contents: 'module.exports = {};',
        loader: 'js',
      };
    });
  },
};

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],
  format: 'cjs',
  target: 'es2018',
  platform: 'browser',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  minify: prod,
  outfile: 'main.js',
  plugins: [stubNodeModules],
}).catch(() => process.exit(1));
