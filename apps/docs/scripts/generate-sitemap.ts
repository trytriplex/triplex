/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import readdirp from "readdirp";

const root = join(process.cwd(), "pages");
const sitemapLoc = join(process.cwd(), "public", "sitemap.xml");

function getLastModifiedDateTime(fullPath: string) {
  const result = execSync(
    `git log -1 --pretty="format:%ci" ${fullPath}`,
  ).toString();

  if (result) {
    return new Date(result).toISOString().slice(0, 10);
  }

  return undefined;
}

const changeHints = [
  ["/blog", "weekly"],
  ["/docs", "monthly"],
  ["/guides", "monthly"],
] as const;

const priorityHints = [
  ["/blog/", 0.7],
  ["/guides/", 0.6],
  ["/download", 0.9],
] as const;

async function main() {
  const sitemap = [];

  for await (const entry of readdirp(root)) {
    if (entry.path.endsWith(".mdx")) {
      const path = entry.path.replace(".mdx", "").replace("index", "");
      const url = "https://triplex.dev/" + path;

      sitemap.push({
        changeFrequency:
          changeHints.find(([hint]) => url.includes(hint))?.[1] ?? "monthly",
        lastModified: getLastModifiedDateTime(entry.fullPath),
        priority: path
          ? priorityHints.find(([hint]) => url.includes(hint))?.[1] ?? 0.5
          : // Root gets immediate 1 priority.
            1,
        url,
      });
    }
  }

  const xml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemap
    .map((url) => {
      return `<url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
    })
    .join("\n  ")}
</urlset>
`;

  await writeFile(sitemapLoc, xml);
}

main();
