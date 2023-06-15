import { version } from "../package.json";
import { init } from "./init";

export function create({
  name,
  packageManager = "npm",
  cwd = process.cwd(),
  target,
  env,
}: {
  name: string;
  packageManager?: "npm" | "yarn" | "pnpm";
  cwd?: string;
  target: "node" | "app";
  env?: Record<string, string>;
}) {
  return init({
    name,
    env,
    version,
    target,
    pkgManager: packageManager,
    cwd,
    mode: "non-interactive",
    createFolder: false,
  });
}
