#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { description, version } from "../package.json";
import { editor } from "./commands/editor";
import { init } from "./commands/init";

program.name("triplex").description(description).version(version);

program
  .command("editor")
  .description("start the TRIPLEX editor")
  .option("-o --open [file]", "opens the editor when running")
  .action(({ open }) => {
    editor({ open });
  });

program
  .command("init")
  .description("initialize TRIPLEX in this folder")
  .option(
    "-p --pkg-manager <type>",
    "package manager to install dependencies with",
    "npm"
  )
  .action(({ pkgManager }) => {
    if (["npm", "yarn", "pnpm"].includes(pkgManager)) {
      init({ version, pkgManager });
    } else {
      throw new Error(`invariant: unhandled pkg manager: ${pkgManager}`);
    }
  });

program.parse();
