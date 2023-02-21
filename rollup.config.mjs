import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from "@rollup/plugin-json";
// https://stackblitz.com/edit/node-gcuwxg?file=rollup.config.mjs
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const name = "index", sharedGlobals = {
  path: "path",
  fs: "fs"
};

export const config = [
  {
    external: [
      ...(Object.keys(pkg.devDependencies) || {}),
      // ...(Object.keys(pkg.peerDependencies) || {}),
      // ...(Object.keys(packageJson.dependencies) || {}),
    ],
    input: "./src/index.ts",
    plugins: [
      // tsconfigPaths(),
      nodeResolve(),
      // {
      // moduleDirectories: ["node_modules"]
      // extensions: [".mjs", ".ts", ".json",".ts"]
      // }
      // ),
      json(),
      esbuild({
        platform: "node",
        target: "node14",
        sourceMap: true, // default
        // optimizeDeps: {
        //   include: ["postinstall-postinstall","hast-util-classnames", "hast-util-from-html", "hast-util-select", "hast-util-to-mdast", "hast-util-to-nlcst", "mdast-util-to-markdown", "parse-english", "patch-package", "postinstall-postinstall", "unist-util-filter", "unist-util-flat-filter", "unist-util-inspect", "unist-util-reduce", "unist-util-remove"]
        // },
        loaders: {
          // Add .json files support
          // require @rollup/plugin-commonjs
          ".json": "json"
        }
      })
    ],
    output: [
      {
        file: `dist/cjs/${name}.cjs`,
        format: "cjs",
        sourcemap: true,
        globals: sharedGlobals
      },
      {
        file: `dist/esm/${name}.mjs`,
        format: "es",
        sourcemap: true,
        globals: sharedGlobals
      }
    ]
  },
  {
    input: "./src/index.ts",
    plugins: [dts()],
    output: {
      file: `dist/${name}.d.ts`,
      format: "es"
    }
  }
];

export default config;
