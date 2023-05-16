#!/usr/bin/env node
import { program } from "@commander-js/extra-typings";
import { readFile } from "fs/promises";
import { join } from "path";
import { join as joinPosix } from "path/posix";
import { description, version } from "../package.json";
import { editor } from "./commands/editor";
import { TRIPLEXConfig } from "./types";

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
      joinPosix(process.cwd(), ".triplex", file).replaceAll("\\", "/")
    );

    const components = (config.components || []).map((file) =>
      // Separators should always be forward slashes for glob compatibility.
      joinPosix(process.cwd(), ".triplex", file).replaceAll("\\", "/")
    );

    editor({
      components,
      open,
      publicDir,
      files,
      exportName,
    });
  });

program.parse();
