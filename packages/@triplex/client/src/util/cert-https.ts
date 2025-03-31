/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import fsp from "node:fs/promises";
import { join } from "@triplex/lib/path";
import { createCertificate } from "./cert-gen";

export async function getCertificate(
  cacheDir: string,
  name?: string,
  domains?: string[],
) {
  const cachePath = join(cacheDir, "_cert.pem");

  try {
    const [stat, content] = await Promise.all([
      fsp.stat(cachePath),
      fsp.readFile(cachePath, "utf8"),
    ]);

    if (Date.now() - stat.ctime.valueOf() > 30 * 24 * 60 * 60 * 1000) {
      throw new Error("invariant: certificate has expired");
    }

    return content;
  } catch {
    const content = createCertificate(name, domains);

    await fsp.mkdir(cacheDir, { recursive: true });
    await fsp.writeFile(cachePath, content);

    return content;
  }
}
