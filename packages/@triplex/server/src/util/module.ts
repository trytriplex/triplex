/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

/** Infers ESM component exports from a given JS/TS file. */
export function inferExports(file: string) {
  const namedExports = file.matchAll(/export (function|const|let) ([A-Z]\w+)/g);
  const defaultExport = /export default \w*? ?\(?([A-Z]\w+)/.exec(file);
  const foundExports: { exportName: string; name: string }[] = [];

  for (const match of namedExports) {
    const [, , exportName] = match;
    foundExports.push({ exportName, name: exportName });
  }

  if (defaultExport) {
    const name = defaultExport[1];
    foundExports.push({ exportName: "default", name });
  }

  return foundExports;
}
