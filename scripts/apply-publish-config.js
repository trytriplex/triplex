// Assumes it runs in each package.
const { readFile, writeFile } = require("fs/promises");
const { join } = require("path");

async function main() {
  const filename = join(process.cwd(), "package.json");
  const file = await readFile(filename, "utf-8");
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
