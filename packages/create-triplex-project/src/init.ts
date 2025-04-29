/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { exec as execCb } from "node:child_process";
import fs_dont_use_directly from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { prompt as prompt_dont_use_directly } from "enquirer";

const exec_dont_use_directly = promisify(execCb);
const templateDir = join(__dirname, "../templates");

const templateEntrypoints: Record<
  string,
  { entrypoint: string; exportName: string } | undefined
> = {
  empty: {
    entrypoint: "src/scene.tsx",
    exportName: "Scene",
  },
  "point-and-click": {
    entrypoint: "src/levels/debug.tsx",
    exportName: "DebugLevel",
  },
};

export async function init({
  __exec: exec = exec_dont_use_directly,
  __fs: fs = fs_dont_use_directly,
  __prompt: prompt = prompt_dont_use_directly,
  createFolder = true,
  cwd: __cwd = process.cwd(),
  env,
  mode = "interactive",
  name,
  pkgManager,
  template,
}: {
  __exec?: typeof exec_dont_use_directly;
  __fs?: typeof import("fs/promises");
  __prompt?: typeof import("enquirer").prompt;
  createFolder?: boolean;
  cwd?: string;
  env?: Record<string, string>;
  mode?: "non-interactive" | "interactive";
  name: string;
  pkgManager: string;
  template: string;
}) {
  async function copyTemplateFileToDest(
    name: string,
    replace?: Record<string, string>,
    rename?: string,
  ) {
    if (replace) {
      let file = await fs.readFile(join(templateDir, template, name), "utf8");

      Object.entries(replace).forEach(([key, value]) => {
        file = file.replace(key, value);
      });

      await fs.writeFile(join(cwd, rename || name), file);
    } else {
      await fs.copyFile(
        join(templateDir, template, name),
        join(cwd, rename || name),
      );
    }
  }

  const { default: ora } = await import("ora");

  let cwd = __cwd;
  let dir = await fs.readdir(cwd);

  if (mode === "interactive") {
    const response = await prompt<{ continue: boolean }>({
      initial: "Y",
      message: createFolder
        ? `Will initialize into a new folder, continue?`
        : "Will initialize into the current folder, continue?",
      name: "continue",
      required: true,
      type: "confirm",
    });

    if (!response.continue) {
      process.exit(0);
    }
  }

  if (!createFolder && dir.length > 0) {
    // eslint-disable-next-line no-console
    throw new Error(
      "Your directory must be empty when creating a project, please select another.",
    );
  }

  if (createFolder) {
    cwd = join(__cwd, name);
    await fs.mkdir(cwd, { recursive: true });
    // Clear out dir since we're now in a new folder.
    dir = [];
  }

  const spinner = ora("Copying files...").start();
  const templateFiles = join(templateDir, template);

  await fs.cp(templateFiles, cwd, { recursive: true });
  await copyTemplateFileToDest("package.json", { "{app_name}": name });
  await copyTemplateFileToDest("README.md", { "{app_name}": name });

  spinner.text = "Installing dependencies...";

  await exec(`${pkgManager} install`, {
    cwd,
    env,
  });

  spinner.succeed("Your project is ready!");

  // eslint-disable-next-line no-console
  console.log(`
                  Get Started: https://triplex.dev/docs/get-started
                 Join Discord: https://discord.gg/nBzRBUEs4b
  Install Triplex for VS Code: https://marketplace.visualstudio.com/items?itemName=trytriplex.triplex-vsce
`);

  const templateEntrypoint = templateEntrypoints[template];

  return {
    dir: cwd,
    open: {
      exportName: templateEntrypoint
        ? templateEntrypoint.exportName
        : "default",
      filepath: templateEntrypoint
        ? join(cwd, templateEntrypoint.entrypoint)
        : cwd,
    },
  };
}
