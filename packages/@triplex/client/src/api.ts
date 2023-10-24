/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export async function getCode(path: string): Promise<string> {
  const { default: fetch } = await import("node-fetch");

  const result = await fetch(
    `http://127.0.0.1:8000/fs/${encodeURIComponent(path)}`
  );

  if (!result.ok) {
    throw new Error(`invariant: failed to load ${path}`);
  }

  const code = await result.text();
  return code;
}
