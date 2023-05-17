import { version } from "../package.json";
import { init } from "./init";

export function create({
  name,
  packageManager = "npm",
  cwd = process.cwd(),
}: {
  name: string;
  packageManager?: "npm" | "yarn" | "pnpm";
  cwd?: string;
}) {
  return init({
    name,
    version,
    pkgManager: packageManager,
    cwd,
    mode: "non-interactive",
    createFolder: false,
  });
}
