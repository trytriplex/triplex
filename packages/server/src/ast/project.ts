/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join, normalize } from "path";
import { watch } from "chokidar";
import { Project, ProjectOptions, SourceFile } from "ts-morph";
import { deleteCommentComponents } from "../services/component";
import { format, resolveConfig, resolveConfigFile } from "prettier";

export type TRIPLEXProject = ReturnType<typeof createProject>;

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

async function persistSourceFile({
  sourceFile,
  newPath,
  cwd,
}: {
  sourceFile: SourceFile;
  newPath?: string;
  cwd: string;
}) {
  if (!sourceFile.isSaved()) {
    // Only delete + format if the file is modified.
    deleteCommentComponents(sourceFile);

    // TODO: Move config resolution out of this function.
    const prettierConfigPath = await resolveConfigFile(cwd);
    if (prettierConfigPath) {
      const prettierConfig = await resolveConfig(prettierConfigPath);
      if (prettierConfig) {
        // A prettier config was found so we will use that to format.
        const source = format(sourceFile.getText(), {
          ...prettierConfig,
          filepath: sourceFile.getFilePath(),
        });
        sourceFile.replaceText(
          [sourceFile.getStart(true), sourceFile.getEnd()],
          source
        );
      } else {
        // No prettier config was found - so we'll use the default ts formatter.
        sourceFile.formatText({
          convertTabsToSpaces: true,
          indentSize: 2,
          trimTrailingWhitespace: true,
          ensureNewLineAtEndOfFile: true,
        });
      }
    }
  }

  if (newPath && newPath !== sourceFile.getFilePath()) {
    // Force save even if it isn't modified
    const result = sourceFile.copy(newPath);
    await result.save();
  } else if (!sourceFile.isSaved()) {
    // Save only if the file is modified
    await sourceFile.save();
  }
}

export function createProject({
  cwd = process.cwd(),
  tsConfigFilePath = join(cwd, "tsconfig.json"),
} = {}) {
  const project = _createProject({
    tsConfigFilePath,
  });
  const dependencyModifiedCallbacks = new Map<string, (() => void)[]>();
  const onStateChangeCallbacks = new Set<() => void>();
  const modifiedSourceFiles = new Set<SourceFile>();

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

    // Since we've refreshed from the file system the source file is no longer modified
    modifiedSourceFiles.delete(sourceFile);
    onStateChangeCallbacks.forEach((cb) => cb());
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

    const sourceFile = project.createSourceFile(filename, template);

    modifiedSourceFiles.add(sourceFile);
    onStateChangeCallbacks.forEach((cb) => cb());

    return sourceFile;
  }

  function getSourceFile(path: string) {
    if (!normalize(path).startsWith(normalize(cwd))) {
      throw new Error("invariant: path is outside of cwd");
    }

    const sourceFile =
      project.getSourceFile(path) || project.addSourceFileAtPath(path);

    return {
      reset: async () => {
        await sourceFile.refreshFromFileSystem();
        modifiedSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
      },
      read: () => sourceFile,
      edit: () => {
        modifiedSourceFiles.add(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
        return sourceFile;
      },
      cleanup: () => {
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

  async function save({ rename = {} }: { rename?: Record<string, string> }) {
    const renamePaths = Object.keys(rename);

    // Ensure all source files that are staged to be renamed are available.
    renamePaths.forEach((path) => {
      const sourceFile = getSourceFile(path);
      if (modifiedSourceFiles.has(sourceFile.read())) {
        return;
      }

      modifiedSourceFiles.add(sourceFile.read());
    });

    const promises = Array.from(modifiedSourceFiles).map((sourceFile) =>
      persistSourceFile({
        sourceFile,
        cwd,
        newPath: rename[sourceFile.getFilePath()],
      })
    );

    await Promise.all(promises);

    modifiedSourceFiles.clear();
    onStateChangeCallbacks.forEach((cb) => cb());
  }

  function getState() {
    const dirtySourceFiles = Array.from(modifiedSourceFiles).map((sourceFile) =>
      sourceFile.getFilePath()
    );

    return {
      isDirty: dirtySourceFiles.length > 0,
      dirtySourceFiles,
    };
  }

  function onStateChange(callback: () => void) {
    onStateChangeCallbacks.add(callback);

    return () => {
      const callbacks = onStateChangeCallbacks.has(callback);
      if (!callbacks) {
        return;
      }

      onStateChangeCallbacks.delete(callback);
    };
  }

  return {
    cwd: () => cwd,
    createSourceFile,
    getSourceFile,
    save,
    getState,
    onStateChange,
  };
}
