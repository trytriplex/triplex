/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join, normalize } from "path";
import { watch } from "chokidar";
import { Project, ProjectOptions, SourceFile } from "ts-morph";

export interface TRIPLEXProject {
  cwd(): string;
  createSourceFile(componentName: string): SourceFile;
  getSourceFile(path: string): {
    sourceFile: SourceFile;
    onDependencyModified: (cb: () => void) => () => void;
    cleanup(): void;
  };
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

export function createProject({
  cwd = process.cwd(),
  tsConfigFilePath = join(cwd, "tsconfig.json"),
} = {}): TRIPLEXProject {
  const project = _createProject({
    tsConfigFilePath,
  });
  const dependencyModifiedCallbacks = new Map<string, (() => void)[]>();

  // Watch the all files inside cwd and watch for changes.
  // If any changes have been made refresh the source file.
  const watcher = watch(cwd, { ignoreInitial: true });
  watcher.on("change", async (path) => {
    const sourceFile = project.getSourceFile(path);
    if (!sourceFile) {
      // We're only interested in source files that have been
      // added to the project graph. This is why we use project
      // directly and not the abstraction that creates it if missing.
      return;
    }

    await sourceFile.refreshFromFileSystem();

    sourceFile.getReferencingSourceFiles().forEach((refFile) => {
      const path = refFile.getFilePath();
      const callbacks = dependencyModifiedCallbacks.get(path);

      if (callbacks) {
        callbacks.forEach((cb) => cb());
      }
    });
  });

  function createSourceFile(componentName: string) {
    const fs = project.getFileSystem();
    let count = 0;
    let filename = join(cwd, "src/untitled.tsx");

    while (project.getSourceFile(filename) || fs.fileExistsSync(filename)) {
      // Find a filename that doesn't exist
      count += 1;
      filename = join(cwd, `src/untitled${count}.tsx`);
    }

    const template = `
export function ${componentName}() {
  return (
    <>
    </>
  );
}
`;

    return project.createSourceFile(filename, template);
  }

  function getSourceFile(path: string) {
    if (!normalize(path).startsWith(normalize(cwd))) {
      throw new Error("invariant: path is outside of cwd");
    }

    const sourceFile =
      project.getSourceFile(path) || project.addSourceFileAtPath(path);

    return {
      sourceFile,
      cleanup: () => {
        const { sourceFile } = getSourceFile(path);
        project.removeSourceFile(sourceFile);
        dependencyModifiedCallbacks.delete(sourceFile.getFilePath());
      },
      onDependencyModified: (cb: () => void) => {
        const callbacks = dependencyModifiedCallbacks.get(path) || [];
        dependencyModifiedCallbacks.set(path, [...callbacks, cb]);

        return () => {
          const callbacks = dependencyModifiedCallbacks.get(path);
          if (!callbacks) {
            return;
          }

          dependencyModifiedCallbacks.set(
            path,
            callbacks.filter((callback) => callback !== cb)
          );
        };
      },
    };
  }

  return {
    cwd() {
      return cwd;
    },
    createSourceFile,
    getSourceFile,
  };
}
