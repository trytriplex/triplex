import { join } from "path";
import { watch } from "chokidar";
import { Project, ProjectOptions, SourceFile } from "ts-morph";

export interface TRIPLEXProject {
  createSourceFile(componentName: string, fileName: string): SourceFile;
  getSourceFile(path: string): {
    sourceFile: SourceFile;
  };
  removeSourceFile(path: string): void;
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
      // We turn this off to we can effectively ignore null and undefined when fetching
      // the types of jsx elements. This makes everything much easier to reason about.
      // Meaning instead of us having to manually iterate and ignore type values they just
      // aren't ever defined.
      strictNullChecks: false,
    },
  });

  return project;
}

export function createProject(): TRIPLEXProject {
  const project = _createProject({
    tsConfigFilePath: join(process.cwd(), "tsconfig.json"),
  });

  function createSourceFile(componentName: string, fileName: string) {
    const existingSourceFile = project.getSourceFile(fileName);
    if (existingSourceFile) {
      project.removeSourceFile(existingSourceFile);
    }

    const template = `export function ${componentName}() {
  return (
    <>
    </>
  );
}
`;

    return project.createSourceFile(fileName, template);
  }

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

  function removeSourceFile(path: string) {
    const { sourceFile } = getSourceFile(path);

    project.removeSourceFile(sourceFile);
  }

  return {
    createSourceFile,
    getSourceFile,
    removeSourceFile,
  };
}
