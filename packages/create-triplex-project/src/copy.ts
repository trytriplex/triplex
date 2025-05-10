/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import fs_dont_use_directly from "node:fs/promises";
import path from "node:path";

export interface FileInput {
  contents: string;
  filename: string;
}

export interface FileOutput {
  contents: string;
  filename: string;
}

export async function copyFilesToDestination({
  __fs: fs = fs_dont_use_directly,
  destinationFolder,
  sourceFolder,
  transform,
}: {
  __fs?: typeof import("fs/promises");
  destinationFolder: string;
  sourceFolder: string;
  transform: (input: FileInput) => FileOutput;
}) {
  const files = await fs.readdir(sourceFolder);

  for (const filename of files) {
    const filePath = path.join(sourceFolder, filename);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      await copyFilesToDestination({
        __fs: fs,
        destinationFolder: path.join(destinationFolder, filename),
        sourceFolder: filePath,
        transform,
      });
    } else {
      const contents = await fs.readFile(filePath, "utf8");
      const result = transform({
        contents,
        filename,
      });

      await fs.mkdir(destinationFolder, { recursive: true });
      await fs.writeFile(
        path.join(destinationFolder, result.filename),
        result.contents,
      );
    }
  }
}
