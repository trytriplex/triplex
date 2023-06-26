#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { getConfig } from "@triplex/server";
import { description, version } from "../package.json";
import { editor } from "./commands/editor";

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
    const config = await getConfig(process.cwd());

    editor({
      ...config,
      open,
      exportName,
    });
  });

program.parse();
