#!/usr/bin/env node
/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";
import { program } from "@commander-js/extra-typings";
import { prompt } from "enquirer";
import { version } from "../package.json";
import { init } from "./init";

/* eslint-disable no-irregular-whitespace */
// eslint-disable-next-line no-console
console.log(`
 ▀█▀ █▀█ █ █▀█ █░░ █▀▀ ▀▄▀
 ░█░ █▀▄ █ █▀▀ █▄▄ ██▄ █░█
`);
/* eslint-enable no-irregular-whitespace */

const exec = promisify(execCb);

async function main() {
  program
    .description(
      "Initializes a Triplex project into a new or existing repository.\nPassing any args will run in non-interactive mode."
    )
    .option("--name <name>", "name of your project")
    .option(
      "--pkg-manager <name>",
      "package manager to use when installing dependencies"
    )
    .option("--cwd <cwd>", "target working directory")
    .action(async (args) => {
      let packageManager: string;
      let projectName: string;
      let mode: "non-interactive" | "interactive";
      let cwd = process.cwd();

      if (args.pkgManager || args.name || args.cwd) {
        // Non-interactive mode
        if (!args.pkgManager) {
          program.error(
            "Missing --pkg-manager arg. Valid values are: npm, pnpm, yarn."
          );
        }

        if (!args.name) {
          program.error("Missing --name arg.");
        }

        if (!["npm", "yarn", "pnpm"].includes(args.pkgManager)) {
          program.error(
            `The package manager ${args.pkgManager} is not supported.`
          );
        }

        mode = "non-interactive";
        packageManager = args.pkgManager;
        projectName = args.name;

        if (args.cwd) {
          cwd = args.cwd;
        }
      } else {
        const response = await prompt<{
          name: string;
          pkgManager: "npm" | "pnpm" | "yarn";
        }>([
          {
            initial: "my-triplex-project",
            message: "What should we call your project?",
            name: "name",
            required: true,
            type: "text",
          },
          {
            choices: ["npm", "pnpm", "yarn"],
            message: "What package manager do you use?",
            name: "pkgManager",
            required: true,
            type: "select",
          },
        ]);

        mode = "interactive";
        packageManager = response.pkgManager;
        projectName = response.name;
      }

      try {
        const { dir, openPath } = await init({
          cwd,
          mode,
          name: projectName,
          pkgManager: packageManager,
          template: "empty",
          version,
        });

        if (mode === "non-interactive") {
          return;
        }

        const result = await prompt<{ start: boolean }>([
          {
            initial: "Y",
            message: "Open an example scene in the editor?",
            name: "start",
            type: "confirm",
          },
        ]);

        if (result.start) {
          const p = exec(`${packageManager} run editor --open ${openPath}`, {
            cwd: dir,
          });
          const { default: ora } = await import("ora");

          const spinner = ora("Opening example scene....\n").start();

          setTimeout(() => {
            spinner.succeed("Now open at http://localhost:5754");
          }, 2000);

          await p;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        process.exit(1);
      }
    });

  program.parse();
}

main();
