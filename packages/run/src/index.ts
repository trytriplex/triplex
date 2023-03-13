#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { prompt } from "enquirer";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { description, version } from "../package.json";
import { editor } from "./commands/editor";
import { init } from "./commands/init";
import { join } from "path";
import { join as joinPosix } from "path/posix";
import { TRIPLEXConfig } from "./types";

const exec = promisify(execCb);

/* eslint-disable no-irregular-whitespace */
console.log(`
 ▀█▀ █▀█ █ █▀█ █░░ █▀▀ ▀▄▀
 ░█░ █▀▄ █ █▀▀ █▄▄ ██▄ █░█
`);
/* eslint-enable no-irregular-whitespace */

program.name("triplex").description(description).version(version);

program
  .command("editor")
  .description("start the editor")
  .option("-o --open [file]", "opens the editor when running")
  .option(
    "-E --export-name <name>",
    "specify the export name when opening a file [default]"
  )
  .action(async ({ open, exportName = "default" }) => {
    let config: TRIPLEXConfig;

    try {
      const conf = await readFile(
        join(process.cwd(), ".triplex/config.json"),
        "utf-8"
      );
      config = JSON.parse(conf);
    } catch (e) {
      console.log("Could not find config! Run triplex init to generate one.\n");
      return;
    }

    const publicDir = join(
      process.cwd(),
      ".triplex",
      config.publicDir || "../public"
    );

    const files = config.files.map((file) =>
      // Separators should always be forward slashes for glob compatibility.
      joinPosix(process.cwd(), ".triplex", file)
    );

    editor({
      open,
      publicDir,
      files,
      exportName,
    });
  });

program
  .command("init")
  .description("initialize Triplex in this directory")
  .action(async () => {
    try {
      const response = await prompt<{
        name: string;
        continue?: boolean;
        pkgManager: "npm" | "pnpm" | "yarn";
      }>([
        {
          name: "name",
          type: "text",
          required: true,
          initial: "my-triplex-project",
          message: "What should we call your project?",
        },
        {
          name: "pkgManager",
          type: "select",
          required: true,
          choices: ["npm", "pnpm", "yarn"],
          message: "What package manager do you use?",
        },
      ]);

      const { openPath } = await init({
        version,
        pkgManager: response.pkgManager,
        name: response.name,
      });

      const result = await prompt<{ start: boolean }>([
        {
          message: "Open an example scene in the editor?",
          type: "confirm",
          name: "start",
          initial: "Y",
        },
      ]);

      if (result.start) {
        const p = exec(
          `${response.pkgManager} run editor --open ${openPath}`,
          {}
        );
        const { default: ora } = await import("ora");

        const spinner = ora("Opening example scene....\n").start();

        setTimeout(() => {
          // TODO: Move to spawn so we don't need to fake this :-).
          spinner.succeed("Now open at http://localhost:3333");
        }, 2000);

        await p;
      }
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  });

program.parse();
