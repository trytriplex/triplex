import { readdir as rdir, stat } from "fs/promises";
import { join } from "path";

export async function readdir(
  dir: string,
  { recursive }: { recursive?: boolean } = {}
): Promise<string[]> {
  const files = (await rdir(dir)).map((file) => join(dir, file));

  if (!recursive) {
    return files;
  }

  for (const file of files) {
    const stats = await stat(file);
    if (stats.isDirectory()) {
      const result = await readdir(file, { recursive: true });
      files.push(...result);
    }
  }

  return files.map((file) => file.replace(process.cwd(), "").replace("/", ""));
}
