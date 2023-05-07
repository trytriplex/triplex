import { readFile } from "fs/promises";
import { join } from "path";
import { join as joinPosix } from "path/posix";

export async function getConfig(cwd: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: Record<string, any>;

  try {
    const conf = await readFile(join(cwd, ".triplex/config.json"), "utf-8");
    config = JSON.parse(conf);
  } catch (e) {
    throw new Error("invariant: could not fetch config");
  }

  const publicDir = join(cwd, ".triplex", config.publicDir || "../public");

  const files = config.files.map((file: string) =>
    // Separators should always be forward slashes for glob compatibility.
    joinPosix(cwd, ".triplex", file)
  );

  const components = (config.components || []).map((file: string) =>
    // Separators should always be forward slashes for glob compatibility.
    joinPosix(cwd, ".triplex", file)
  );

  return {
    cwd,
    publicDir,
    files,
    components,
  };
}
