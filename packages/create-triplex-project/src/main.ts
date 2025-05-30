#!/usr/bin/env node
/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
const DEFAULT_TEMPLATE = templates.includes("basic") ? "basic" : templates[0];
const DEFAULT_CWD = process.cwd();
const packageManagers = ["npm", "pnpm", "yarn"];

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
    .option(
      "--yes",
      "use passed in args otherwise default values for all options",
    )
    .action(async (args) => {
      try {
        let packageManager = args.pkgManager;
        let projectName = args.name;
        let templateName = args.template;
        let cwd = args.cwd;
        let yes = args.yes;

        const mode: "non-interactive" | "interactive" = yes
          ? "non-interactive"
          : "interactive";

        if (mode === "non-interactive") {
          // Check if we're using a Deno template
          const isDenoTemplate = templateName.endsWith("-deno");
          
          // Only validate package manager if not a Deno template
          if (!isDenoTemplate && !["npm", "yarn", "pnpm"].includes(args.pkgManager)) {
            program.error(
              `The package manager "${args.pkgManager}" is not supported.`,
            );
          }
          
          // Set packageManager to "deno" for Deno templates
          if (isDenoTemplate) {
            packageManager = "deno";
          }
        } else {
          // First ask for project name and template
          const initialResponse = await prompt<{
            name: string;
            template: string;
          }>([
            {
              initial: projectName,
              message: "What should we call your project?",
              name: "name",
              required: true,
              type: "text",
            },
            {
              choices:
                templateName !== DEFAULT_TEMPLATE ? [templateName] : templates,
              message: "What template would you like to use?",
              name: "template",
              required: true,
              type: "select",
            },
          ]);

          projectName = initialResponse.name;
          templateName = initialResponse.template;

          // Only prompt for package manager if not a Deno template
          if (!templateName.endsWith("-deno")) {
            const pkgResponse = await prompt<{
              pkgManager: "npm" | "pnpm" | "yarn";
            }>([
              {
                choices:
                  packageManager !== DEFAULT_PKG_MANAGER
                    ? [packageManager]
                    : packageManagers,
                message: "What package manager do you use?",
                name: "pkgManager",
                required: true,
                type: "select",
              },
            ]);
            packageManager = pkgResponse.pkgManager;
          } else {
            packageManager = "deno";
          }
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
