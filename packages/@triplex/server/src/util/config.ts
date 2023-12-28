/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readFile } from "node:fs/promises";
import { join, normalize } from "upath";
import { type TriplexConfig } from "../types";

const STATIC_ASSETS = ["glb", "gltf"];

export async function getConfig(
  cwd: string
): Promise<Required<TriplexConfig> & { cwd: string; renderer?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: Record<string, any>;

  try {
    const conf = await readFile(join(cwd, ".triplex/config.json"), "utf8");
    config = JSON.parse(conf);
  } catch {
    throw new Error("invariant: could not fetch config");
  }

  const publicDir: string = join(
    cwd,
    ".triplex",
    config.publicDir || "../public"
  );

  const provider: string =
    config.provider && join(cwd, ".triplex", config.provider);

  const files: string[] = config.files.map((file: string) =>
    join(cwd, ".triplex", file)
  );

  const components: string[] = (config.components || []).map((file: string) =>
    join(cwd, ".triplex", file)
  );

  const assetsDir = normalize(
    join(
      publicDir,
      config.assetsDir || "assets",
      `/**/*.(${STATIC_ASSETS.join("|")})`
    )
  );

  const renderer: string =
    config.renderer && config.renderer.startsWith(".")
      ? join(cwd, ".triplex", config.renderer)
      : config.renderer;

  return {
    assetsDir,
    components,
    cwd,
    files,
    provider,
    publicDir,
    renderer,
  };
}
