/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

/**
 * Infers ESM exports from a given JS/TS file.
 */
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
