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
import { init } from "./init";
import { templates } from "./templates";

/* eslint-disable no-irregular-whitespace */
// eslint-disable-next-line no-console
console.log(`
 ▀█▀ █▀█ █ █▀█ █░░ █▀▀ ▀▄▀
 ░█░ █▀▄ █ █▀▀ █▄▄ ██▄ █░█
`);
/* eslint-enable no-irregular-whitespace */

const exec = promisify(execCb);

const DEFAULT_PROJECT_NAME = "my-triplex-project";
const DEFAULT_PKG_MANAGER = "npm";
const DEFAULT_TEMPLATE = "default";
const DEFAULT_CWD = process.cwd();

async function main() {
  program
    .description(
      "Initializes a new Triplex project, passing any args will run in non-interactive mode.",
    )
    .option("--name <name>", "name of your project", DEFAULT_PROJECT_NAME)
    .option(
      `--template <${templates.join(" | ")}>`,
      "project template to use",
      DEFAULT_TEMPLATE,
    )
    .option(
      "--pkg-manager <npm | pnpm | yarn>",
      "package manager to use for installing dependencies",
      DEFAULT_PKG_MANAGER,
    )
    .option("--cwd <cwd>", "directory to install to", DEFAULT_CWD)
    .action(async (args) => {
      try {
        let packageManager = args.pkgManager;
        let projectName = args.name;
        let templateName = args.template;
        let cwd = args.cwd;
        const mode: "non-interactive" | "interactive" =
          process.argv.length > 2 ? "non-interactive" : "interactive";

        if (mode === "non-interactive") {
          // Validate inputs.
          if (!["npm", "yarn", "pnpm"].includes(args.pkgManager)) {
            program.error(
              `The package manager "${args.pkgManager}" is not supported.`,
            );
          }
        } else {
          const response = await prompt<{
            name: string;
            pkgManager: "npm" | "pnpm" | "yarn";
            template: string;
          }>([
            {
              initial: DEFAULT_PROJECT_NAME,
              message: "What should we call your project?",
              name: "name",
              required: true,
              type: "text",
            },
            {
              choices: templates,
              message: "What template would you like to use?",
              name: "template",
              required: true,
              type: "select",
            },
            {
              choices: ["npm", "pnpm", "yarn"],
              message: "What package manager do you use?",
              name: "pkgManager",
              required: true,
              type: "select",
            },
          ]);

          templateName = response.template;
          packageManager = response.pkgManager;
          projectName = response.name;
        }

        const { dir, open } = await init({
          cwd,
          mode,
          name: projectName,
          pkgManager: packageManager,
          template: templateName,
        });

        if (mode === "non-interactive") {
          return;
        }

        const result = await prompt<{ start: boolean }>([
          {
            initial: "Y",
            message: "Open project in Visual Studio Code?",
            name: "start",
            type: "confirm",
          },
        ]);

        if (result.start) {
          exec(`code ${dir} ${open.filepath} --new-window`, {
            cwd: dir,
          }).catch(() => {
            // eslint-disable-next-line no-console
            console.log(
              "\nWe couldn't open Visual Studio Code for you, sorry! Check if you have it available in your PATH.\nSee: https://code.visualstudio.com/docs/editor/command-line#_code-is-not-recognized-as-an-internal-or-external-command",
            );
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

main();
