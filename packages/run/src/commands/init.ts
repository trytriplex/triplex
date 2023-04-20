import { exec as execCb } from "child_process";
import { promisify } from "node:util";
import fs_dont_use_directly from "fs/promises";
import { join } from "path";
import { prompt as prompt_dont_use_directly } from "enquirer";

const exec_dont_use_directly = promisify(execCb);
const templateDir = join(__dirname, "../../templates");

export async function init({
  name,
  version,
  pkgManager,
  cwd: __cwd = process.cwd(),
  __fs: fs = fs_dont_use_directly,
  __exec: exec = exec_dont_use_directly,
  __prompt: prompt = prompt_dont_use_directly,
}: {
  name: string;
  cwd?: string;
  version: string;
  pkgManager: "npm" | "pnpm" | "yarn";
  __prompt?: typeof import("enquirer").prompt;
  __fs?: typeof import("fs/promises");
  __exec?: typeof exec_dont_use_directly;
}) {
  const { default: ora } = await import("ora");

  let cwd = __cwd;
  let dir = await fs.readdir(cwd);
  let freshInstall = false;

  if (!dir.includes("package.json")) {
    const response = await prompt<{ continue: boolean }>({
      name: "continue",
      type: "confirm",
      required: true,
      initial: "Y",
      message: `Will initialize into a new folder, continue?`,
    });

    if (!response.continue) {
      process.exit(0);
    }

    cwd = join(__cwd, name);
    freshInstall = true;
    await fs.mkdir(cwd);
    // Clear out dir just in case
    dir = [];
  } else {
    const response = await prompt<{ continue: boolean }>({
      name: "continue",
      type: "confirm",
      required: true,
      initial: "Y",
      message: `Will initialize into your existing repository, continue?`,
    });

    if (!response.continue) {
      process.exit(0);
    }
  }

  const spinner = ora("Setting up files...").start();
  const gitIgnorePath = join(cwd, ".gitignore");
  const packageJsonPath = join(cwd, "package.json");
  const readmePath = join(cwd, "README.md");
  const tsconfigPath = join(cwd, "tsconfig.json");
  const examplePath = join(cwd, "src");

  if (dir.includes(".gitignore")) {
    // Update
    let gitIgnore = await fs.readFile(gitIgnorePath, "utf-8");

    if (gitIgnore.includes(".triplex/tmp")) {
      // Abort
    } else {
      // Add ignore
      gitIgnore += ".triplex/tmp\n";
      await fs.writeFile(gitIgnorePath, gitIgnore);
    }
  } else {
    // Create one
    const templatePath = join(templateDir, "gitignore");
    await fs.copyFile(templatePath, gitIgnorePath);
  }

  if (dir.includes("package.json")) {
    // Update
    const packageJson = await fs.readFile(packageJsonPath, "utf-8");
    const parsed = JSON.parse(packageJson);
    const pkgJSON = await fs.readFile(
      join(templateDir, "package.json"),
      "utf-8"
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
      join(templateDir, "package.json"),
      "utf-8"
    );
    await fs.writeFile(
      packageJsonPath,
      pkgJson.replace("{app_name}", name).replace("{triplex_version}", version)
    );
  }

  if (dir.includes("README.md")) {
    // Skip
  } else {
    const readme = await fs.readFile(join(templateDir, "README.md"), "utf-8");
    await fs.writeFile(
      readmePath,
      readme.replace("{pkg_manager}", pkgManager).replace("{app_name}", name)
    );
  }

  if (dir.includes("tsconfig.json")) {
    // Ensure r3f is in types
    const tsconfig = await fs.readFile(tsconfigPath, "utf-8");
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
      const templatePath = join(templateDir, "src");
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
      const templatePath = join(templateDir, "src");
      await fs.cp(templatePath, join(examplePath, "triplex-examples"), {
        recursive: true,
      });
    } else {
      // A previous run already added examples, nothing to do here.
    }

    openPath = join(examplePath, "triplex-examples", "scene.tsx");
  } else {
    const templatePath = join(templateDir, "src");
    await fs.cp(templatePath, examplePath, { recursive: true });
    openPath = join(examplePath, "scene.tsx");
  }

  if (dir.includes(".triplex")) {
    // Skip creating an example
  } else {
    const templatePath = join(templateDir, ".triplex");
    await fs.cp(templatePath, join(cwd, ".triplex"), {
      recursive: true,
    });
  }

  spinner.text = "Installing dependencies...";

  await exec(`(cd ${cwd} && ${pkgManager} install)`);

  if (freshInstall) {
    spinner.text = "Initializing git...";

    await exec(`(cd ${cwd} && git init)`);
    await exec(`(cd ${cwd} && git add .)`);
    await exec(`(cd ${cwd} && git commit -m "Initialized Triplex.")`);
  }

  spinner.succeed("Successfully initialized!");

  console.log(`
          Get started: cd ${name} && ${pkgManager} run editor
           Raise bugs: https://github.com/triplex-run/triplex/issues
  Sponsor development: https://github.com/sponsors/itsdouges
`);

  return {
    dir: cwd,
    openPath,
  };
}
