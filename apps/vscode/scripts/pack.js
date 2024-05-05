/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { Platform, build } = require("electron-builder");
const { join } = require("upath");
const { copyFileSync, cpSync } = require("node:fs");
const { createVSIX } = require("@vscode/vsce");

const tempDir = ".tmp";
const outDir = "out";
const modulesSource = join(
  process.cwd(),
  `${tempDir}/linux-unpacked/resources/app/node_modules`
);
const modulesDest = join(process.cwd(), `${outDir}/node_modules`);

const copyToDest = (...filenames) => {
  filenames.forEach((filename) => {
    copyFileSync(
      join(process.cwd(), filename),
      join(process.cwd(), outDir, filename)
    );
  });
};

async function main() {
  await build({
    config: {
      asar: false,
      directories: { output: tempDir },
      extraMetadata: { main: join(__dirname, "noop.js") },
      linux: { target: ["dir:x64"] },
    },
    targets: Platform.LINUX.createTarget(),
  });

  cpSync(modulesSource, modulesDest, { recursive: true });
  copyToDest(
    "package.json",
    "README.md",
    "loading.html",
    "LICENSE",
    "CHANGELOG.md"
  );

  await createVSIX({ cwd: join(process.cwd(), outDir), dependencies: false });
}

main();
