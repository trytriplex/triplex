/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { existsSync, writeFileSync } from "node:fs";
import { watch } from "chokidar";
import { format, resolveConfig, resolveConfigFile } from "prettier";
import { Project, type ProjectOptions, type SourceFile } from "ts-morph";
import { join, normalize } from "upath";
import { deleteCommentComponents } from "../services/component";
import { type SourceFileChangedEvent } from "../types";
import { invalidateThumbnail } from "../util/thumbnail";
import { baseTsConfig } from "../util/ts";

export type TRIPLEXProject = ReturnType<typeof createProject>;
export type SourceFileGetters = Extract<
  keyof SourceFile,
  `get${string}` | `is${string}`
>;
export type SourceFileReadOnly = Pick<SourceFile, SourceFileGetters>;

function normalizeLineEndings(source: string): string {
  return source.replaceAll("\r\n", "\n");
}

export function _createProject(opts: ProjectOptions & { cwd?: string }) {
  const tsConfigPath = join(opts.cwd || process.cwd(), "tsconfig.json");
  const hasTsConfig = existsSync(tsConfigPath);

  if (!hasTsConfig) {
    writeFileSync(tsConfigPath, JSON.stringify(baseTsConfig, null, 2) + "\n");
  }

  const project = new Project({
    ...opts,
    compilerOptions: {
      // This ensures that even if a project is misconfigured we can still infer types from JS.
      allowJs: true,
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
        const source = await format(sourceFile.getFullText(), {
          ...prettierConfig,
          filepath: sourceFile.getFilePath(),
        });
        sourceFile.replaceWithText(source);
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
  cwd,
  tsConfigFilePath = join(cwd, "tsconfig.json"),
  templates,
}: {
  cwd: string;
  templates: { newElements: string };
  tsConfigFilePath?: string;
}) {
  const project = _createProject({
    tsConfigFilePath,
  });
  const dependencyModifiedCallbacks = new Map<string, (() => void)[]>();
  const onStateChangeCallbacks = new Set<() => void>();
  const onSourceFileChangeCallbacks = new Set<
    (e: SourceFileChangedEvent) => void
  >();
  const modifiedSourceFiles = new Set<SourceFile>();
  const initializedSourceFiles = new Set<SourceFile>();
  const openedSourceFiles = new Map<SourceFile, string>();
  const newSourceFiles = new Set<SourceFile>();
  const sourceFileHistory = new Map<SourceFile, string[]>();
  const sourceFileHistoryIndex = new Map<SourceFile, number>();
  const persistedSourceFile = new Map<SourceFile, string>();

  // Watch the all files inside cwd and watch for changes.
  // If any changes have been made refresh the source file.
  const watcher = watch(cwd, { ignoreInitial: true, ignored: /node_modules/ });
  watcher.on("change", async (path) => {
    const privateSourceFile = project.getSourceFile(path);
    if (!privateSourceFile) {
      // We're only interested in source files that have been
      // added to the project graph. This is why we use project
      // directly and not the abstraction that creates it if missing.
      return;
    }

    const sourceFile = getSourceFile(path);

    await sourceFile.edit((source) => {
      return source.refreshFromFileSystem();
    });

    privateSourceFile.getReferencingSourceFiles().forEach((refFile) => {
      const path = refFile.getFilePath();
      const callbacks = dependencyModifiedCallbacks.get(path);

      if (callbacks) {
        callbacks.forEach((cb) => cb());
      }
    });

    // Since we've refreshed from the file system the source file is no longer modified
    modifiedSourceFiles.delete(privateSourceFile);
    persistedSourceFile.set(privateSourceFile, privateSourceFile.getFullText());
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
  return ${templates.newElements};
}
`;

    const sourceFile = project.createSourceFile(filename, template);

    // Setup callbacks
    newSourceFiles.add(sourceFile);
    persistedSourceFile.set(sourceFile, sourceFile.getFullText());
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

    const sourceFile =
      project.getSourceFile(path) || project.addSourceFileAtPath(path);

    if (!initializedSourceFiles.has(sourceFile)) {
      // Lazily initialize the source file events when they have been
      // explicitly requested.
      sourceFile.onModified(onSourceFileModified);
    }

    function flushDirtyState() {
      const persisted = normalizeLineEndings(
        persistedSourceFile.get(sourceFile) || ""
      );
      const current = normalizeLineEndings(sourceFile.getFullText());
      const isDirty = modifiedSourceFiles.has(sourceFile);

      if (persisted !== current && !isDirty) {
        modifiedSourceFiles.add(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
      } else if (persisted === current && isDirty) {
        modifiedSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
      } else {
        // Nothing to do — return!
      }
    }

    return {
      close: () => {
        openedSourceFiles.delete(sourceFile);
        modifiedSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
      },
      edit: async <TResult>(
        callback: (
          sourceFile: SourceFile
        ) => TResult extends SourceFile ? never : TResult
      ): Promise<
        [
          ids: { redoID: number; undoID: number },
          result: TResult extends SourceFile ? never : TResult
        ]
      > => {
        if (!persistedSourceFile.has(sourceFile)) {
          // Lazily set the current source file as the persisted source file
          // before any changes have been made.
          persistedSourceFile.set(sourceFile, sourceFile.getFullText());
        }

        const undoStack = sourceFileHistory.get(sourceFile) || [
          sourceFile.getFullText(),
        ];
        let undoStackIndex = sourceFileHistoryIndex.get(sourceFile) || 0;

        const result = await callback(sourceFile);

        undoStackIndex += 1;
        undoStack.length = undoStackIndex;
        undoStack.push(sourceFile.getFullText());
        sourceFileHistoryIndex.set(sourceFile, undoStackIndex);
        sourceFileHistory.set(sourceFile, undoStack);

        flushDirtyState();

        return [{ redoID: undoStackIndex, undoID: undoStackIndex - 1 }, result];
      },
      isDirty: () => {
        return modifiedSourceFiles.has(sourceFile);
      },
      onDependencyModified: (cb: () => void) => {
        const wrappedCb = () => setImmediate(cb);
        const callbacks = dependencyModifiedCallbacks.get(path) || [];
        dependencyModifiedCallbacks.set(path, [...callbacks, wrappedCb]);

        return () => {
          const callbacks = dependencyModifiedCallbacks.get(path);
          if (!callbacks) {
            return;
          }

          dependencyModifiedCallbacks.set(
            path,
            callbacks.filter((callback) => callback !== wrappedCb)
          );
        };
      },
      onModified: (cb: () => void) => {
        const wrappedCb = () => setTimeout(cb, 14);
        sourceFile.onModified(wrappedCb);

        return () => {
          sourceFile.onModified(wrappedCb, false);
        };
      },
      open: (exportName: string, index: number = -1) => {
        const existing = openedSourceFiles.get(sourceFile);
        if (existing === exportName) {
          // Already opened, skip!
          return;
        }

        if (index >= 0 && openedSourceFiles.size > index) {
          const prev = Array.from(openedSourceFiles);

          openedSourceFiles.clear();

          prev.forEach(([key, value], idx) => {
            if (index === idx) {
              openedSourceFiles.set(sourceFile, exportName);
            }

            openedSourceFiles.set(key, value);
          });
        } else {
          openedSourceFiles.set(sourceFile, exportName);
        }

        onStateChangeCallbacks.forEach((cb) => cb());
      },
      read: () => {
        return sourceFile as SourceFileReadOnly;
      },
      redo: (id?: number) => {
        const undoStack = sourceFileHistory.get(sourceFile);
        const undoStackIndex = sourceFileHistoryIndex.get(sourceFile);

        if (!undoStack || undoStackIndex === undefined) {
          return;
        }

        const nextIndex = id ?? undoStackIndex + 1;
        const nextSourceCode = undoStack[nextIndex];
        if (!nextSourceCode) {
          return;
        }

        sourceFile.replaceWithText(nextSourceCode);

        sourceFileHistoryIndex.set(sourceFile, nextIndex);

        flushDirtyState();
      },
      reset: async () => {
        await sourceFile.refreshFromFileSystem();
        modifiedSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());
      },
      save: async (newPath?: string) => {
        if (newSourceFiles.has(sourceFile) && !newPath) {
          return {
            id: "missing-new-path",
            message: "Cannot save without newPath arg.",
          };
        }

        const exportName = openedSourceFiles.get(sourceFile);

        await persistSourceFile({
          cwd,
          newPath,
          sourceFile,
        });

        const sourceText = sourceFile.getFullText();
        const undoStack = sourceFileHistory.get(sourceFile);

        if (undoStack) {
          undoStack[undoStack.length - 1] = sourceText;
        }

        persistedSourceFile.set(sourceFile, sourceText);
        modifiedSourceFiles.delete(sourceFile);
        newSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());

        if (exportName) {
          invalidateThumbnail({ exportName, path });
        }
      },
      undo: (id?: number) => {
        const undoStack = sourceFileHistory.get(sourceFile);
        const undoStackIndex = sourceFileHistoryIndex.get(sourceFile);

        if (!undoStack || undoStackIndex === undefined) {
          return;
        }

        const nextIndex = id ?? undoStackIndex - 1;
        const nextSourceCode = undoStack[nextIndex];

        if (!nextSourceCode) {
          return;
        }

        sourceFile.replaceWithText(nextSourceCode);

        sourceFileHistoryIndex.set(sourceFile, nextIndex);

        flushDirtyState();
      },
    };
  }

  async function saveAll() {
    const sourceFiles = Array.from(modifiedSourceFiles)
      // Filter out source files that are "new".
      .filter((sourceFile) => !newSourceFiles.has(sourceFile));

    const promises = sourceFiles.map((sourceFile) =>
      persistSourceFile({
        cwd,
        sourceFile,
      })
    );

    await Promise.all(promises);

    sourceFiles.forEach((sourceFile) => {
      modifiedSourceFiles.delete(sourceFile);
    });
    onStateChangeCallbacks.forEach((cb) => cb());
  }

  function getState() {
    return Array.from(openedSourceFiles).map(([file, exportName]) => {
      const modified = modifiedSourceFiles.has(file);

      return {
        exportName,
        fileName: file.getBaseName(),
        filePath: file.getFilePath(),
        isDirty: modified,
        isNew: newSourceFiles.has(file),
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
