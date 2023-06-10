import { version } from "../package.json";
import { init } from "./init";

export function create({
  name,
  packageManager = "npm",
  cwd = process.cwd(),
  env,
}: {
  name: string;
  packageManager?: "npm" | "yarn" | "pnpm";
  cwd?: string;
  env?: Record<string, string>;
}) {
  return init({
    name,
    env,
    version,
    pkgManager: packageManager,
    cwd,
    mode: "non-interactive",
    createFolder: false,
  });
}
