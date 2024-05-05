/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, normalize, resolve } from "upath";
import {
  type ReconciledTriplexConfig,
  type SecretTriplexConfig,
  type TriplexConfig,
} from "../types";

const STATIC_ASSETS: string[] = ["glb", "gltf"];
const DEFAULT_FILES: string[] = ["../**/*.{jsx,tsx}"];
const DEFAULT_COMPONENTS: string[] = [];
const DEFAULT_RENDERER = "react-three-fiber";
const DEFAULT_PROVIDER = "triplex:empty-provider.tsx";
const DEFAULT_PUBLIC_DIR = "../public";
const DEFAULT_ASSETS_DIR = "assets";

export function getConfig(cwd: string): ReconciledTriplexConfig {
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // TODO: VALIDATE THIS CONFIG!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: TriplexConfig & SecretTriplexConfig;

  try {
    const conf = readFileSync(join(cwd, ".triplex/config.json"), "utf8");
    config = JSON.parse(conf);
  } catch {
    config = {};
  }

  const publicDir: string = join(
    cwd,
    ".triplex",
    config.publicDir || DEFAULT_PUBLIC_DIR
  );

  const provider: string = config.provider
    ? join(cwd, ".triplex", config.provider)
    : DEFAULT_PROVIDER;

  const files: string[] = (config.files || DEFAULT_FILES).map((file: string) =>
    join(cwd, ".triplex", file)
  );

  const components: string[] = (config.components || DEFAULT_COMPONENTS).map(
    (file: string) => join(cwd, ".triplex", file)
  );

  const assetsDir = normalize(
    join(
      publicDir,
      config.assetsDir || DEFAULT_ASSETS_DIR,
      `/**/*.(${STATIC_ASSETS.join("|")})`
    )
  );

  const renderer: string =
    config.renderer && config.renderer.startsWith(".")
      ? join(cwd, ".triplex", config.renderer)
      : config.renderer || DEFAULT_RENDERER;

  return {
    assetsDir,
    components,
    cwd,
    define: config.define || {},
    files,
    provider,
    publicDir,
    renderer,
    rendererAttributes: config.rendererAttributes || {},
  };
}

function _resolveProjectCwd(
  startPath: string,
  __fallbackPkgJsonPath?: string
): string | undefined {
  const next = resolve(startPath, "..");

  if (startPath === next) {
    // We've traversed all the way up the folder path and found nothing. Bail out!
    return __fallbackPkgJsonPath || undefined;
  }

  const dir = readdirSync(startPath);
  if (dir.includes(".triplex")) {
    const triplexDir = readdirSync(join(startPath, ".triplex"));
    if (triplexDir.includes("config.json")) {
      return startPath;
    }
  }

  if (dir.includes("package.json") && !__fallbackPkgJsonPath) {
    // Keep track of the first found package.json just in case as a fallback cwd.
    return _resolveProjectCwd(next, startPath);
  }

  return _resolveProjectCwd(next, __fallbackPkgJsonPath);
}

export function resolveProjectCwd(startPath: string): string | undefined {
  return _resolveProjectCwd(startPath);
}
