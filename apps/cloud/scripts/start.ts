/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { spawn } from "node:child_process";
import { join } from "node:path";
import treekill from "tree-kill";

export async function start() {
  // eslint-disable-next-line no-console
  console.log(`[@triplex/cloud]: starting...`);

  const p = spawn("npx", ["next", "dev", "--turbopack", "--port", "3010"], {
    cwd: join(__dirname, "../../cloud"),
    env: process.env,
  });

  p.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error(`[@triplex/cloud]: ${err}`);
  });

  p.stdout.on("data", (data) => {
    // eslint-disable-next-line no-console
    console.log(`[@triplex/cloud]: ${data}`);
  });

  p.stderr.on("data", (data) => {
    // eslint-disable-next-line no-console
    console.error(`[@triplex/cloud]: ${data}`);
  });

  process.on("SIGTERM", () => {
    // eslint-disable-next-line no-console
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
