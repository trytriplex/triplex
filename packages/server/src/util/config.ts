/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readFile } from "fs/promises";
import { join } from "path";
import { join as joinPosix, normalize } from "path/posix";

const STATIC_ASSETS = ["glb", "gltf"];

export async function getConfig(cwd: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: Record<string, any>;

  try {
    const conf = await readFile(join(cwd, ".triplex/config.json"), "utf-8");
    config = JSON.parse(conf);
  } catch (e) {
    throw new Error("invariant: could not fetch config");
  }

  const publicDir: string = join(
    cwd,
    ".triplex",
    config.publicDir || "../public"
  );

  const files: string[] = config.files.map((file: string) =>
    // Separators should always be forward slashes for glob compatibility.
    joinPosix(cwd, ".triplex", file).replaceAll("\\", "/")
  );

  const components: string[] = (config.components || []).map((file: string) =>
    // Separators should always be forward slashes for glob compatibility.
    joinPosix(cwd, ".triplex", file).replaceAll("\\", "/")
  );

  const assetsDir = normalize(
    // Separators should always be forward slashes for glob compatibility.
    joinPosix(
      publicDir,
      config.assetsDir || "assets",
      `/**/*.(${STATIC_ASSETS.join("|")})`
    )
  );

  return {
    cwd,
    publicDir,
    files,
    components,
    assetsDir,
  };
}
