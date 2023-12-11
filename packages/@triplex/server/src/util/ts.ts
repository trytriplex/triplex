/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export const baseTsConfig = {
  compilerOptions: {
    allowJs: true,
    baseUrl: ".",
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    incremental: true,
    isolatedModules: true,
    jsx: "preserve",
    lib: ["dom", "dom.iterable", "es2022"],
    module: "esnext",
    moduleResolution: "node",
    noEmit: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    strict: true,
    types: ["@react-three/fiber"],
  },
  exclude: ["node_modules"],
  include: ["."],
};
