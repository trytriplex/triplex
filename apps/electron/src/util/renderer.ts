/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  type ReconciledRenderer,
  type RendererManifest,
} from "@triplex/server";
import { dirname } from "upath";
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
import { findParentFile } from "./path";

function validateManifest(manifest: unknown): RendererManifest {
  const schema = object({
    assets: object({
      hostElements: array(
        object({
          category: string("category must be a string"),
          name: string("name must be a string"),
          type: literal("host", 'type must be "host"'),
        })
      ),
    }),
    bundler: optional(
      object({
        assetsInclude: optional(array(string())),
        dedupe: optional(array(string())),
      })
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
  "react-dom": "@triplex/renderer-react",
  "react-three-fiber": "@triplex/renderer-r3f",
};

export async function getRendererMeta(opts: {
  cwd: string;
  filepath: string;
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
      paths: [require.resolve("@triplex/client"), opts.cwd],
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
      `invariant: failed to resolve renderer "${opts.filepath}" check inner errors.`
    );

    throw wrappedError;
  }
}
