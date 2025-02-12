/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { init } from "./init";

export { templates } from "./templates";

export function create({
  cwd = process.cwd(),
  env,
  name,
  packageManager = "npm",
  template,
}: {
  cwd?: string;
  env?: Record<string, string>;
  name: string;
  packageManager?: "npm" | "yarn" | "pnpm";
  template: "default" | "empty" | "halloween" | (string & { strHack?: true });
}) {
  return init({
    createFolder: false,
    cwd,
    env,
    mode: "non-interactive",
    name,
    pkgManager: packageManager,
    template,
  });
}
