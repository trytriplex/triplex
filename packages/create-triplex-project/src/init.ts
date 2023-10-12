/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { exec as execCb } from "node:child_process";
import fs_dont_use_directly from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { prompt as prompt_dont_use_directly } from "enquirer";

const exec_dont_use_directly = promisify(execCb);
const templateDir = join(__dirname, "../templates");

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
  template = "halloween",
  version,
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
  template?: "default" | "halloween";
  version: string;
}) {
  const { default: ora } = await import("ora");

  let cwd = __cwd;
  let dir = await fs.readdir(cwd);

  if (!dir.includes("package.json")) {
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

    if (createFolder) {
      cwd = join(__cwd, name);
      await fs.mkdir(cwd, { recursive: true });
      // Clear out dir since we're now in a new folder.
      dir = [];
    }
  } else {
    if (mode === "interactive") {
      const response = await prompt<{ continue: boolean }>({
        initial: "Y",
        message: `Will initialize into your existing repository, continue?`,
        name: "continue",
        required: true,
        type: "confirm",
      });

      if (!response.continue) {
        process.exit(0);
      }
    }
  }

  const spinner = ora("Setting up files...").start();
  const gitIgnorePath = join(cwd, ".gitignore");
  const packageJsonPath = join(cwd, "package.json");
  const readmePath = join(cwd, "README.md");
  const tsconfigPath = join(cwd, "tsconfig.json");
  const examplePath = join(cwd, "src");

  if (dir.includes(".gitignore")) {
    // Nothing to do
  } else {
    // Create one
    const templatePath = join(templateDir, "gitignore");
    await fs.copyFile(templatePath, gitIgnorePath);
  }

  if (dir.includes("package.json")) {
    // Update
    const packageJson = await fs.readFile(packageJsonPath, "utf8");
    const parsed = JSON.parse(packageJson);
    const pkgJSON = await fs.readFile(
      join(templateDir, `package.json`),
      "utf8"
    );
    const pkgJSONParsed = JSON.parse(pkgJSON);

    if (!parsed.dependencies) {
      parsed.dependencies = {};
    }

    if (!parsed.scripts) {
      parsed.scripts = {};
    }

    Object.assign(parsed.scripts, pkgJSONParsed.scripts);
    Object.assign(parsed.dependencies, pkgJSONParsed.dependencies);

    const result = JSON.stringify(parsed, null, 2).replace(
      "{triplex_version}",
      `${version}`
    );

    await fs.writeFile(packageJsonPath, result + "\n");
  } else {
    // Create
    const pkgJson = await fs.readFile(
      join(templateDir, `package.json`),
      "utf8"
    );
    await fs.writeFile(
      packageJsonPath,
      pkgJson.replace("{app_name}", name).replace("{triplex_version}", version)
    );
  }

  if (dir.includes("README.md")) {
    // Skip
  } else {
    const readme = await fs.readFile(join(templateDir, `README.md`), "utf8");
    await fs.writeFile(
      readmePath,
      readme.replace("{pkg_manager}", pkgManager).replace("{app_name}", name)
    );
  }

  if (dir.includes("tsconfig.json")) {
    // Ensure r3f is in types
    const tsconfig = await fs.readFile(tsconfigPath, "utf8");
    const parsed = JSON.parse(tsconfig);

    if (!parsed.compilerOptions) {
      parsed.compilerOptions = {};
    }

    parsed.compilerOptions.jsx = "preserve";

    if (!parsed.compilerOptions.types) {
      parsed.compilerOptions.types = [];
    }

    if (!parsed.include) {
      parsed.include = [];
    }

    if (!parsed.exclude) {
      parsed.exclude = [];
    }

    if (!parsed.include.includes(".")) {
      parsed.include.push(".");
    }

    if (!parsed.exclude.includes("node_modules")) {
      parsed.exclude.push("node_modules");
    }

    if (!parsed.compilerOptions.types.includes("@react-three/fiber")) {
      parsed.compilerOptions.types.push("@react-three/fiber");
    }

    await fs.writeFile(tsconfigPath, JSON.stringify(parsed, null, 2) + "\n");
  } else {
    // Create
    const templatePath = join(templateDir, "tsconfig.json");
    await fs.copyFile(templatePath, tsconfigPath);
  }

  let openPath = "";

  if (dir.includes("packages")) {
    const packagesPath = join(cwd, "packages");
    // Assume workspace environment
    const examplesDir = await fs.readdir(packagesPath);
    if (!examplesDir.includes("triplex-examples")) {
      // Examples haven't been added yet - add them!
      const templatePath = join(templateDir, template, "src");
      await fs.cp(templatePath, join(packagesPath, "triplex-examples"), {
        recursive: true,
      });
    } else {
      // A previous run already added examples, nothing to do here.
    }

    openPath = join(__cwd, "packages/triplex-examples", "scene.tsx");
  } else if (dir.includes("src")) {
    const srcDir = await fs.readdir(examplePath);
    if (!srcDir.includes("scene.tsx")) {
      // Examples haven't been added yet - add them!
      const templatePath = join(templateDir, template, "src");
      await fs.cp(templatePath, join(examplePath, "triplex-examples"), {
        recursive: true,
      });

      openPath = join(examplePath, "triplex-examples", "scene.tsx");
    } else {
      // A previous run already added examples, nothing to do here.
      openPath = join(examplePath, "scene.tsx");
    }
  } else {
    const templatePath = join(templateDir, template, "src");
    await fs.cp(templatePath, examplePath, { recursive: true });
    openPath = join(examplePath, "scene.tsx");
  }

  if (dir.includes(".triplex")) {
    // Skip creating an example
  } else {
    const templatePath = join(templateDir, template, ".triplex");
    await fs.cp(templatePath, join(cwd, ".triplex"), {
      recursive: true,
    });
  }

  if (dir.includes("public")) {
    // Skip creating a public dir
  } else {
    const templatePath = join(templateDir, template, "public");
    await fs.cp(templatePath, join(cwd, "public"), {
      recursive: true,
    });
  }

  spinner.text = "Installing dependencies...";

  await exec(`${pkgManager} install`, {
    cwd,
    env,
  });

  spinner.succeed("Successfully initialized!");

  // eslint-disable-next-line no-console
  console.log(`
          Get started: ${
            cwd === __cwd
              ? `${pkgManager} run editor`
              : `cd ${name} && ${pkgManager} run editor`
          }
           Raise bugs: https://github.com/triplex-run/triplex/issues
  Sponsor development: https://github.com/sponsors/itsdouges
`);

  return {
    dir: cwd,
    openPath,
  };
}
