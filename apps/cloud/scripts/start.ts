/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/* eslint-disable no-console */

import { spawn } from "node:child_process";
import { join } from "node:path";
import killp from "kill-port";
import treekill from "tree-kill";

export async function start() {
  const cwd = join(__dirname, "../../cloud");
  const port = 3010;

  console.log(`[@triplex/cloud]: cwd set to ${cwd}`);
  console.log(`[@triplex/cloud]: starting on port ${port}...`);

  try {
    await killp(port);
  } catch (error) {
    const e = error as Error;
    if (e.message !== "No process running on port") {
      console.log(
        `[@triplex/cloud]: could not kill process running on port ${port}`,
      );
      console.log(`[@triplex/cloud]: ${e.message}`);
      return;
    }
  }

  const p = spawn("pnpm", ["run", "dev", `--port="${port}"`], {
    cwd: join(__dirname, "../../cloud"),
    env: {
      ...process.env,
      PATH: `${process.env.PATH}:/opt/homebrew/bin`,
    },
    shell: true,
  });

  p.on("error", (err) => {
    console.error(`[@triplex/cloud]: ${err}`);
  });

  p.stdout.on("data", (data) => {
    console.log(`[@triplex/cloud]: ${data}`);
  });

  p.stderr.on("data", (data) => {
    console.error(`[@triplex/cloud]: ${data}`);
  });

  process.on("SIGTERM", () => {
    console.log(`[@triplex/cloud]: closing...`);
    if (p.pid) {
      treekill(p.pid);
    }
  });

  return {
    dispose() {
      const pid = p.pid;
      if (pid) {
        return new Promise<void>((resolve) => {
          treekill(pid, () => {
            resolve();
          });
        });
      }
    },
  };
}
