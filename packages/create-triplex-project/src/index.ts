/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { version } from "../package.json";
import { init } from "./init";

export function create({
  cwd = process.cwd(),
  env,
  name,
  packageManager = "npm",
  target,
}: {
  cwd?: string;
  env?: Record<string, string>;
  name: string;
  packageManager?: "npm" | "yarn" | "pnpm";
  target: "node" | "app";
}) {
  return init({
    createFolder: false,
    cwd,
    env,
    mode: "non-interactive",
    name,
    pkgManager: packageManager,
    target,
    version,
  });
}
