/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
const { Arch, Platform, build } = require("electron-builder");
const { join } = require("node:path");
const { copyFileSync, cpSync } = require("node:fs");
const { createVSIX } = require("@vscode/vsce");

const tempDir = ".tmp";
const outDir = "out";
const nmSrc = join(
  process.cwd(),
  `${tempDir}/linux-unpacked/resources/app/node_modules`,
);
const nmDest = join(process.cwd(), `${outDir}/node_modules`);
const staticSrc = join(process.cwd(), `static`);
const staticDest = join(process.cwd(), `${outDir}/static`);
const rootESBuild = join(process.cwd(), "../..", "node_modules", "@esbuild");

const copyToDest = (...filenames) => {
  filenames.forEach((filename) => {
    copyFileSync(
      join(process.cwd(), filename),
      join(process.cwd(), outDir, filename),
    );
  });
};

function copyWindowsESBuildHackFix() {
  const dest = join(nmDest, "@esbuild");

  cpSync(join(rootESBuild, "win32-arm64"), join(dest, "win32-arm64"), {
    recursive: true,
  });
  cpSync(join(rootESBuild, "win32-ia32"), join(dest, "win32-ia32"), {
    recursive: true,
  });
  cpSync(join(rootESBuild, "win32-x64"), join(dest, "win32-x64"), {
    recursive: true,
  });
}

async function main() {
  await build({
    config: {
      asar: false,
      directories: { output: tempDir },
      extraMetadata: { main: join(__dirname, "noop.js") },
    },
    targets: Platform.LINUX.createTarget(["dir"], Arch.x64),
  });

  copyWindowsESBuildHackFix();
  cpSync(nmSrc, nmDest, { recursive: true });
  cpSync(staticSrc, staticDest, { recursive: true });
  copyToDest("package.json", "README.md", "LICENSE", "CHANGELOG.md");

  await createVSIX({ cwd: join(process.cwd(), outDir), dependencies: false });
}

main();
