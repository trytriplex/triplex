/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export async function getCode(path: string, port: number): Promise<string> {
  const { default: fetch } = await import("node-fetch");

  const result = await fetch(
    `http://127.0.0.1:${port}/fs/${encodeURIComponent(path)}`,
  );

  if (!result.ok) {
    throw new Error(`invariant: failed to load ${path}`);
  }

  const code = await result.text();
  return code;
}
