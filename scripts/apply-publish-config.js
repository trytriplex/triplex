/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
const { readFile, writeFile } = require("node:fs/promises");
const { join } = require("upath");

async function main() {
  const filename = join(process.cwd(), "package.json");
  const file = await readFile(filename, "utf8");
  const data = JSON.parse(file);

  if (!data.publishConfig) {
    return;
  }

  const publishConfig = data.publishConfig;

  delete data.publishConfig;

  for (const key in publishConfig) {
    const value = publishConfig[key];
    data[key] = value;
  }

  await writeFile(filename, JSON.stringify(data, null, 2) + "\n");
}

main();
