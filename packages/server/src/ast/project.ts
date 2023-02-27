import { join } from "path";
import {
  FileSystemRefreshResult,
  Project,
  ProjectOptions,
  SourceFile,
} from "ts-morph";
import { watch, rm as remove, FileChangeInfo } from "fs/promises";
import { cloneAndWrapSourceJsx } from "./transform";

interface FsWatcher {
  iterable: AsyncIterable<FileChangeInfo<string>>;
  abort: () => void;
}

export interface TRIPLEXProject {
  getSourceFile(path: string): {
    sourceFile: SourceFile;
    transformedPath: string;
  };
  removeSourceFile(path: string): Promise<void>;
}

export function _createProject(opts: ProjectOptions) {
  const project = new Project({
    ...opts,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      // Having this as `true` results in 100% CPU utilization when importing modules from
      // node_modules. We set this to false to ensure that consumers of TRIPLEX never run into
      // this.
      preserveSymlinks: false,
    },
  });

  return project;
}

export function createProject({
  tempDir,
}: {
  tempDir: string;
}): TRIPLEXProject {
  const project = _createProject({
    tsConfigFilePath: join(process.cwd(), "tsconfig.json"),
  });
  const sourceFiles = new Map<
    string,
    { watcher: FsWatcher; transformedPath: string }
  >();

  async function iterateWatcher(
    sourceFile: SourceFile,
    watcher: FsWatcher,
    onUpdated: () => void
  ) {
    for await (const event of watcher.iterable) {
      if (event.eventType === "change") {
        const result = sourceFile.refreshFromFileSystemSync();
        if (
          result === FileSystemRefreshResult.Updated &&
          // TODO: Hack - there is a race condition somewhere.
          // This ensures the file doesn't get blown away unexpectedly.
          sourceFile.getText().trim()
        ) {
          onUpdated();
        }
      }
    }
  }

  function getSourceFile(path: string) {
    if (!path.startsWith(process.cwd())) {
      throw new Error("invariant: path is outside of cwd");
    }

    const sourceFile = project.addSourceFileAtPath(path);
    const sourceFileMeta = sourceFiles.get(path);

    if (!sourceFileMeta) {
      const { transformedPath } = cloneAndWrapSourceJsx(sourceFile, tempDir);
      const abort = new AbortController();
      const iterable = watch(path, { signal: abort.signal });

      const watcher: FsWatcher = {
        abort: () => abort.abort(),
        iterable,
      };

      sourceFiles.set(path, { transformedPath, watcher });
      iterateWatcher(sourceFile, watcher, () =>
        cloneAndWrapSourceJsx(sourceFile, tempDir)
      );

      return {
        sourceFile,
        transformedPath,
      };
    }

    return {
      sourceFile,
      transformedPath: sourceFileMeta.transformedPath,
    };
  }

  async function removeSourceFile(path: string) {
    const { sourceFile } = getSourceFile(path);
    const meta = sourceFiles.get(path);

    project.removeSourceFile(sourceFile);

    if (meta) {
      await remove(meta.transformedPath);
      meta.watcher.abort();
      sourceFiles.delete(path);
    }
  }

  return {
    getSourceFile,
    removeSourceFile,
  };
}
