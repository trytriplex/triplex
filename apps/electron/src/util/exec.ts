import { exec as execSync } from "node:child_process";

export function exec(
  cmd: string,
  { signal, cwd }: { signal?: AbortSignal; cwd?: string }
) {
  return new Promise<void>((resolve, reject) => {
    execSync(
      `${cmd} install`,
      {
        cwd,
        signal,
        env: {
          // Ensure volta is available on PATH just in case.
          // See: https://github.com/volta-cli/volta/issues/1007
          PATH: `${process.env.HOME}/.volta/bin:${process.env.PATH}:/usr/local/bin`,
        },
      },
      (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      }
    );
  });
}
