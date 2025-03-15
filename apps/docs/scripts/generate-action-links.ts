/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import readdirp from "readdirp";

const root = join(process.cwd(), "pages");
const outputPath = join(process.cwd(), "action-links.generated.json");

async function main() {
  const currentJSON = JSON.parse(await readFile(outputPath, "utf8"));
  const foundKeys: string[] = [];

  for await (const entry of readdirp(root)) {
    if (entry.path.endsWith(".mdx")) {
      const file = await readFile(entry.fullPath, "utf8");
      const regex = /<ActionLink(?:\s+[^>]*)?\s*\/>/g;
      const matches = file.matchAll(regex);

      Array.from(matches).forEach((links) => {
        links.forEach((link) => {
          if (link.includes("href")) {
            // Ignore manual links
            return;
          }

          const name = link.match(/name="([^"]+)"/)?.[1];
          if (name) {
            foundKeys.push(name);
            if (!currentJSON[name]) {
              currentJSON[name] = "No description yet, please add one!";
            }
          }
        });
      });
    }
  }

  // Sort the currentJSON object by key and then write it to the file
  const nextJSON: Record<string, string> = {};
  // Only the found keys will be used, meaning any that aren't used anymore will be removed from the generated file.
  foundKeys.sort().forEach((key) => {
    nextJSON[key] = currentJSON[key];
  });

  await writeFile(outputPath, JSON.stringify(nextJSON, null, 2) + "\n");
}

main();
