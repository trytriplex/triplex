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
          // If changing this make sure to also update init.ts inside create-triplex-project.
          PATH: [
            process.env.PATH,
            // Ensure volta is available on PATH just in case.
            // See: https://github.com/volta-cli/volta/issues/1007
            `${process.env.HOME}/.volta/bin`,
            // Ensure the default location for npm is available on PATH.
            "/usr/local/bin",
            // Ensure nvm is available on PATH.
            `${process.env.HOME}/.nvm`,
          ].join(":"),
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
