/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join, normalize } from "node:path";
import { watch } from "chokidar";
import { format, resolveConfig, resolveConfigFile } from "prettier";
import { Project, ProjectOptions, SourceFile } from "ts-morph";
import { deleteCommentComponents } from "../services/component";
import { SourceFileChangedEvent } from "../types";

export type TRIPLEXProject = ReturnType<typeof createProject>;
export type SourceFileGetters = Extract<
  keyof SourceFile,
  `get${string}` | `on${string}` | `is${string}`
>;
export type SourceFileReadOnly = Pick<SourceFile, SourceFileGetters>;

export function _createProject(opts: ProjectOptions) {
  const project = new Project({
    ...opts,
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
    skipAddingFilesFromTsConfig: true,
  });

  return project;
}

async function persistSourceFile({
  cwd,
  newPath,
  sourceFile,
}: {
  cwd: string;
  newPath?: string;
  sourceFile: SourceFile;
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
          ensureNewLineAtEndOfFile: true,
          indentSize: 2,
          trimTrailingWhitespace: true,
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
  const onSourceFileChangeCallbacks = new Set<
    (e: SourceFileChangedEvent) => void
  >();
  const modifiedSourceFiles = new Map<SourceFile, { new: boolean }>();
  const openedSourceFiles = new Map<SourceFile, string>();

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

    // Setup callbacks
    modifiedSourceFiles.set(sourceFile, { new: true });
    sourceFile.onModified(onSourceFileModified);

    // Immediately callback to notify the creation of this source file
    onSourceFileModified(sourceFile);

    return getSourceFile(filename);
  }

  function onSourceFileModified(sourceFile: SourceFile) {
    const path = sourceFile.getFilePath();
    const data = { path };
    onSourceFileChangeCallbacks.forEach((cb) => cb(data));
  }

  function getSourceFile(path: string) {
    if (!normalize(path).startsWith(normalize(cwd))) {
      throw new Error("invariant: path is outside of cwd");
    }

    let sourceFile = project.getSourceFile(path)!;

    if (!sourceFile) {
      sourceFile = project.addSourceFileAtPath(path);
      sourceFile.onModified(onSourceFileModified);
    }

    return {
      close: () => {
        openedSourceFiles.delete(sourceFile);
        modifiedSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
      },
      edit: <TResult>(callback: (sourceFile: SourceFile) => TResult) => {
        const result = callback(sourceFile);

        if (!modifiedSourceFiles.has(sourceFile)) {
          modifiedSourceFiles.set(sourceFile, { new: false });
        }

        onStateChangeCallbacks.forEach((cb) => cb());

        return result;
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
      open: (exportName: string) => {
        openedSourceFiles.set(sourceFile, exportName);
        onStateChangeCallbacks.forEach((cb) => cb());
      },
      read: () => {
        return sourceFile as SourceFileReadOnly;
      },
      reset: async () => {
        await sourceFile.refreshFromFileSystem();
        modifiedSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
      },
      save: async (newPath?: string) => {
        if (modifiedSourceFiles.get(sourceFile)?.new && !newPath) {
          return {
            id: "missing-new-path",
            message: "Cannot save without newPath arg.",
          };
        }

        await persistSourceFile({
          cwd,
          newPath,
          sourceFile,
        });

        modifiedSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
      },
    };
  }

  async function saveAll() {
    const sourceFiles = Array.from(modifiedSourceFiles)
      // Filter out source files that are "new".
      .filter(([, value]) => !value.new);

    const promises = sourceFiles.map(([sourceFile]) =>
      persistSourceFile({
        cwd,
        sourceFile,
      })
    );

    await Promise.all(promises);

    sourceFiles.forEach(([sourceFile]) => {
      modifiedSourceFiles.delete(sourceFile);
    });
    onStateChangeCallbacks.forEach((cb) => cb());
  }

  function getState() {
    return Array.from(openedSourceFiles).map(([file, exportName]) => {
      const modified = modifiedSourceFiles.get(file);

      return {
        exportName,
        fileName: file.getBaseName(),
        filePath: file.getFilePath(),
        isDirty: !!modified,
        isNew: !!modified?.new,
      };
    });
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

  function onSourceFileChange(callback: (e: SourceFileChangedEvent) => void) {
    onSourceFileChangeCallbacks.add(callback);

    return () => {
      const callbacks = onSourceFileChangeCallbacks.has(callback);
      if (!callbacks) {
        return;
      }

      onSourceFileChangeCallbacks.delete(callback);
    };
  }

  return {
    createSourceFile,
    cwd: () => cwd,
    getSourceFile,
    getState,
    onSourceFileChange,
    onStateChange,
    saveAll,
  };
}
