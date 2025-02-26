/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { existsSync } from "node:fs";
import { watch } from "chokidar";
import {
  DiagnosticCategory,
  getCompilerOptionsFromTsConfig,
  ModuleResolutionKind,
  Project,
  type SourceFile,
} from "ts-morph";
import { join } from "upath";
import { deleteCommentComponents } from "../services/component";
import { type SourceFileChangedEvent } from "../types";
import { invalidateThumbnail } from "../util/thumbnail";
import "@ts-morph/common";

export type TRIPLEXProject = ReturnType<typeof createProject>;
export type SourceFileGetters = Extract<
  keyof SourceFile,
  `get${string}` | `is${string}`
>;
export type SourceFileReadOnly = Pick<SourceFile, SourceFileGetters>;

function normalizeLineEndings(source: string): string {
  return source.replaceAll("\r\n", "\n");
}

export function _createProject({
  tsConfigFilePath,
}: {
  tsConfigFilePath: string;
}) {
  const hasTsConfig = existsSync(tsConfigFilePath);

  const { options } = hasTsConfig
    ? getCompilerOptionsFromTsConfig(tsConfigFilePath)
    : {};

  const project = new Project({
    compilerOptions: {
      // This ensures that even if a project is misconfigured we can still infer types from JS.
      allowJs: true,
      // This forces the module resolution to use the bundler algorithm. This fixes @react-three/uikit for use in Triplex
      // without userland needing to fix it.
      // See: https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#--moduleresolution-bundler
      moduleResolution: ModuleResolutionKind.Bundler,
      // Having this as `true` results in 100% CPU utilization when importing modules from
      // node_modules. We set this to false to ensure that consumers of triplex never run into
      // this.
      preserveSymlinks: false,
      // We turn this off so we can effectively ignore null and undefined when fetching
      // the types of jsx elements. This makes everything much easier to reason about.
      // Meaning instead of us having to manually iterate and ignore type values they just
      // aren't ever defined.
      strictNullChecks: false,
      // This ensures React Three Fiber host elements are present even if they're not in the module graph.
      // We set this as an override but import the types from the options to ensure that we don't remove any
      // user defined types.
      types: (options?.types || []).concat("@react-three/fiber"),
    },
    defaultCompilerOptions: {
      // This is needed to keep JavaScript based projects working.
      lib: ["lib.es2022.d.ts"],
    },
    skipAddingFilesFromTsConfig: true,
    tsConfigFilePath: hasTsConfig ? tsConfigFilePath : undefined,
  });

  return project;
}

async function tryPrettierFormat(cwd: string, sourceFile: SourceFile) {
  try {
    const prettierPath = require.resolve("prettier", { paths: [cwd] });
    const { default: prettier } = await import(prettierPath);
    const prettierConfigPath = await prettier.resolveConfigFile(cwd);

    if (prettierConfigPath) {
      const prettierConfig = await prettier.resolveConfig(prettierConfigPath);
      if (prettierConfig) {
        // A prettier config was found so we will use that to format.
        const source = await prettier.format(sourceFile.getFullText(), {
          ...prettierConfig,
          filepath: sourceFile.getFilePath(),
        });
        sourceFile.replaceWithText(source);
        return true;
      }
    }
  } catch (error) {
    // We log and continue saving even if an error occurred during formatting.
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return false;
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

    const success = await tryPrettierFormat(cwd, sourceFile);
    if (!success) {
      // No prettier config was found - so we'll use the default ts formatter.
      sourceFile.formatText({
        convertTabsToSpaces: true,
        ensureNewLineAtEndOfFile: true,
        indentSize: 2,
        trimTrailingWhitespace: true,
      });
    }
  }

  if (newPath && newPath !== sourceFile.getFilePath()) {
    // Force save even if it isn't modified
    const result = sourceFile.copy(newPath);
    result.saveSync();
  } else if (!sourceFile.isSaved()) {
    // Save only if the file is modified
    sourceFile.saveSync();
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
  const onSourceFileExternalChangeCallbacks = new Set<
    (e: { path: string; redoID: number; undoID: number }) => void
  >();
  const modifiedSourceFiles = new Set<SourceFile>();
  const initializedSourceFiles = new Set<SourceFile>();
  const openedSourceFiles = new Map<SourceFile, string>();
  const newSourceFiles = new Set<SourceFile>();
  const sourceFileHistory = new Map<SourceFile, string[]>();
  const sourceFileHistoryPointer = new Map<SourceFile, number>();
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

    const [ids] = await sourceFile.edit((source) => {
      return source.refreshFromFileSystem();
    });

    onSourceFileExternalChangeCallbacks.forEach((cb) => cb({ ...ids, path }));

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
    const sourceFile =
      project.getSourceFile(path) || project.addSourceFileAtPath(path);

    if (!initializedSourceFiles.has(sourceFile)) {
      // Lazily initialize the source file events when they have been
      // explicitly requested.
      sourceFile.onModified(onSourceFileModified);
    }

    function flushDirtyState() {
      const persisted = normalizeLineEndings(
        persistedSourceFile.get(sourceFile) || "",
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
          sourceFile: SourceFile,
        ) => TResult extends SourceFile ? never : TResult,
      ): Promise<
        [
          ids: { redoID: number; undoID: number },
          result: TResult extends SourceFile ? never : TResult,
        ]
      > => {
        const currentFullText = sourceFile.getFullText();

        if (!persistedSourceFile.has(sourceFile)) {
          // Lazily set the current source file as the persisted source file
          // before any changes have been made.
          persistedSourceFile.set(sourceFile, currentFullText);
        }

        const undoStack = sourceFileHistory.get(sourceFile) || [
          currentFullText,
        ];
        let undoStackPointer = sourceFileHistoryPointer.get(sourceFile) || 0;

        const result = await callback(sourceFile);

        const nextFullText = sourceFile.getFullText();

        if (nextFullText !== currentFullText) {
          // Source has changed so we'll add it to the undo stack.
          undoStackPointer += 1;
          undoStack.length = undoStackPointer;
          undoStack.push(nextFullText);
          sourceFileHistoryPointer.set(sourceFile, undoStackPointer);
          sourceFileHistory.set(sourceFile, undoStack);
          flushDirtyState();
        }

        return [
          { redoID: undoStackPointer, undoID: undoStackPointer - 1 },
          result,
        ];
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
            callbacks.filter((callback) => callback !== wrappedCb),
          );
        };
      },
      onModified: (
        cb: () => void,
        { includeInvalidChanges }: { includeInvalidChanges?: boolean } = {},
      ) => {
        const modifiedHandler = () => {
          if (!includeInvalidChanges) {
            const diagnostics = project
              .getProgram()
              .getSyntacticDiagnostics(sourceFile)
              .filter(
                (diagnostic) =>
                  diagnostic.getCategory() === DiagnosticCategory.Error,
              );

            if (diagnostics.length !== 0) {
              // If there are any syntax errors we skip the callback.
              return;
            }
          }

          setTimeout(cb, 14);
        };

        sourceFile.onModified(modifiedHandler);

        return () => {
          sourceFile.onModified(modifiedHandler, false);
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
        const undoStackIndex = sourceFileHistoryPointer.get(sourceFile);

        if (!undoStack) {
          return {
            message: "Source file has no history.",
            state: "unmodified",
          };
        }

        if (undoStackIndex === undefined) {
          return {
            message: "Source file has no history pointer.",
            state: "unmodified",
          };
        }

        const nextIndex = id ?? undoStackIndex + 1;
        const nextSourceCode = undoStack[nextIndex];

        if (!nextSourceCode) {
          return {
            message: `Source file has no history at index "${nextIndex}".`,
            state: "unmodified",
          };
        }

        sourceFile.replaceWithText(nextSourceCode);

        sourceFileHistoryPointer.set(sourceFile, nextIndex);

        flushDirtyState();

        return { index: nextIndex, state: "modified" };
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
        const filePath = sourceFile.getFilePath();
        const startAgainWhenChangedWatcher = watch(filePath, {
          ignoreInitial: true,
        }).once("change", async () => {
          // Start watching the file again after the save has completed and watcher events
          // have been flushed. We do this to resiliently skip the change event in the global watcher.
          await startAgainWhenChangedWatcher.close();
          watcher.add(filePath);
        });

        // Stop watching the file during the save so it doesn't trigger a change event in the global watcher.
        watcher.unwatch(filePath);

        await persistSourceFile({
          cwd,
          newPath,
          sourceFile,
        });

        const sourceText = sourceFile.getFullText();
        const undoStack = sourceFileHistory.get(sourceFile);
        const undoStackPointer = sourceFileHistoryPointer.get(sourceFile);

        if (undoStack && undoStackPointer !== undefined) {
          // Replace the current pointer with the formatted source text.
          undoStack[undoStackPointer] = sourceText;
        }

        persistedSourceFile.set(sourceFile, sourceText);
        modifiedSourceFiles.delete(sourceFile);
        newSourceFiles.delete(sourceFile);
        onStateChangeCallbacks.forEach((cb) => cb());

        if (exportName) {
          invalidateThumbnail({ exportName, path: filePath });
        }
      },
      syntaxErrors: () => {
        const diagnostics = project
          .getProgram()
          .getSyntacticDiagnostics(sourceFile)
          .filter(
            (diagnostic) =>
              diagnostic.getCategory() === DiagnosticCategory.Error,
          );

        return diagnostics.map((error) => {
          const message = error.getMessageText().toString();
          const { column, line } = sourceFile.getLineAndColumnAtPos(
            error.getStart(),
          );

          return {
            code: error.getCode(),
            column,
            line: line - 1,
            message,
          };
        });
      },
      undo: (id?: number) => {
        const undoStack = sourceFileHistory.get(sourceFile);
        const undoStackIndex = sourceFileHistoryPointer.get(sourceFile);

        if (!undoStack) {
          return {
            message: "Source file has no history.",
            state: "unmodified",
          };
        }

        if (undoStackIndex === undefined) {
          return {
            message: "Source file has no history pointer.",
            state: "unmodified",
          };
        }

        const nextIndex = id ?? undoStackIndex - 1;
        const nextSourceCode = undoStack[nextIndex];

        if (!nextSourceCode) {
          return {
            message: `Source file has no history at index "${nextIndex}".`,
            state: "unmodified",
          };
        }

        sourceFile.replaceWithText(nextSourceCode);

        sourceFileHistoryPointer.set(sourceFile, nextIndex);

        flushDirtyState();

        return { index: nextIndex, state: "modified" };
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
      }),
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

  function onSourceFileExternalChange(
    callback: (e: { path: string; redoID: number; undoID: number }) => void,
  ) {
    onSourceFileExternalChangeCallbacks.add(callback);

    return () => {
      const callbacks = onSourceFileExternalChangeCallbacks.has(callback);
      if (!callbacks) {
        return;
      }

      onSourceFileExternalChangeCallbacks.delete(callback);
    };
  }

  return {
    createSourceFile,
    cwd: () => cwd,
    getSourceFile,
    getState,
    onSourceFileChange,
    onSourceFileExternalChange,
    onStateChange,
    saveAll,
  };
}
