/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdir } from "node:fs/promises";
import { dirname, join, resolve } from "@triplex/lib/path";
import {
  array,
  literal,
  minLength,
  object,
  optional,
  parse,
  string,
  union,
} from "valibot";
import { type ReconciledRenderer, type RendererManifest } from "../types";

async function findParentFile(
  dirpath: string,
  filename: string,
): Promise<string> {
  const next = resolve(dirpath, "..");

  if (dirpath === next) {
    // We've traversed all the way up the folder path and found nothing.
    // Bail out!
    throw new Error(`invariant: ${filename} could not be found`);
  }

  const dir = await readdir(dirpath);
  if (dir.includes(filename)) {
    return join(dirpath, filename);
  }

  return findParentFile(next, filename);
}

function validateManifest(manifest: unknown): RendererManifest {
  const schema = object({
    assets: object({
      hostElements: array(
        object({
          category: string("category must be a string"),
          name: string("name must be a string"),
          type: literal("host", 'type must be "host"'),
        }),
      ),
    }),
    bundler: optional(
      object({
        assetsInclude: optional(array(string())),
        dedupe: optional(array(string())),
      }),
    ),
    stage: object({
      defaultFrame: union([literal("expanded"), literal("intrinsic")]),
    }),
    templates: object({
      newElements: string([minLength(6)]),
    }),
  });

  return parse(schema, manifest);
}

const renderers: Record<string, string> = {
  "react-three-fiber": "@triplex/renderer",
};

export async function getRendererMeta(opts: {
  cwd: string;
  filepath: string;
  getTriplexClientPkgPath: () => string;
}): Promise<ReconciledRenderer> {
  try {
    if (opts.filepath.startsWith("/")) {
      const root = dirname(opts.filepath);
      const manifestPath = await findParentFile(root, "manifest.json");
      const manifest = validateManifest(require(manifestPath));

      return {
        manifest,
        path: opts.filepath,
        root,
      };
    }

    const packageName = renderers[opts.filepath] || opts.filepath;
    const entryPoint = require.resolve(packageName, {
      paths: [opts.getTriplexClientPkgPath(), opts.cwd],
    });
    const root = dirname(entryPoint);
    const manifestPath = await findParentFile(root, "manifest.json");
    const manifest = validateManifest(require(manifestPath));

    return {
      manifest,
      path: entryPoint,
      root,
    };
  } catch (error) {
    const wrappedError = new AggregateError(
      [error],
      `invariant: failed to resolve renderer "${opts.filepath}" check inner errors.`,
    );

    throw wrappedError;
  }
}
