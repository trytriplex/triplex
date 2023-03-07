import { join } from "path";
import { watch } from "chokidar";
import { Project, ProjectOptions, SourceFile } from "ts-morph";

export interface TRIPLEXProject {
  getSourceFile(path: string): {
    sourceFile: SourceFile;
  };
  removeSourceFile(path: string): Promise<void>;
}

export function _createProject(opts: ProjectOptions) {
  const project = new Project({
    ...opts,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      // Having this as `true` results in 100% CPU utilization when importing modules from
      // node_modules. We set this to false to ensure that consumers of triplex never run into
      // this.
      preserveSymlinks: false,
    },
  });

  return project;
}

export function createProject(): TRIPLEXProject {
  const project = _createProject({
    tsConfigFilePath: join(process.cwd(), "tsconfig.json"),
  });

  function getSourceFile(path: string) {
    if (!path.startsWith(process.cwd())) {
      throw new Error("invariant: path is outside of cwd");
    }

    const existingSourceFile = project.getSourceFile(path);
    if (!existingSourceFile) {
      // New source file! Set up watchers for when it changes.

      const sourceFile = project.addSourceFileAtPath(path);
      const watcher = watch(path);
      watcher.on("change", () => {
        sourceFile.refreshFromFileSystem();
      });

      return {
        sourceFile: sourceFile,
      };
    }

    return {
      sourceFile: existingSourceFile,
    };
  }

  async function removeSourceFile(path: string) {
    const { sourceFile } = getSourceFile(path);

    project.removeSourceFile(sourceFile);
  }

  return {
    getSourceFile,
    removeSourceFile,
  };
}
