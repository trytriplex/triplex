/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { inspect } from "node:util";
import { createServer as createFrontend } from "@triplex/client";
import {
  createServer as createBackend,
  type TriplexConfig,
} from "@triplex/server";
import { dirname } from "upath";
import { object, parse, string } from "valibot";
import { logger } from "./log";
import { findParentFile } from "./path";

const renderers: Record<string, string> = {
  "react-dom": "@triplex/renderer-react",
  "react-three-fiber": "@triplex/renderer-r3f",
};

const log = logger("start-project");

interface Manifest {
  templates: { newElements: string };
}

function validateManifest(manifest: unknown): Manifest {
  const schema = object({
    templates: object({
      newElements: string(),
    }),
  });

  return parse(schema, manifest);
}

async function getRendererMeta(
  filepath: string,
  cwd: string
): Promise<{
  manifest: Manifest;
  path: string;
  root: string;
}> {
  try {
    if (filepath.startsWith("/")) {
      log.info("Resolving local renderer at", filepath);

      const root = dirname(filepath);
      const manifestPath = await findParentFile(root, "manifest.json");
      const manifest = validateManifest(require(manifestPath));

      log.debug({ manifest, manifestPath, root });

      return {
        manifest: validateManifest(require(manifestPath)),
        path: filepath,
        root,
      };
    }

    log.info("Resolving renderer package", renderers[filepath] || filepath);

    const packageName = renderers[filepath] || filepath;
    const entryPoint = require.resolve(packageName, {
      paths: [require.resolve("@triplex/client"), cwd],
    });
    const root = dirname(entryPoint);
    const manifestPath = await findParentFile(root, "manifest.json");
    const manifest = validateManifest(require(manifestPath));

    log.debug({ entryPoint, manifest, manifestPath, packageName, root });

    return {
      manifest,
      path: entryPoint,
      root,
    };
  } catch (error) {
    const wrappedError = new AggregateError(
      [error],
      `invariant: failed to resolve renderer "${filepath}" check inner errors.`
    );

    log.error(inspect(wrappedError, { depth: null }));

    throw wrappedError;
  }
}

export async function startProject(
  config: Required<TriplexConfig> & { cwd: string; renderer: string },
  ports: { client: number; server: number; ws: number }
) {
  const renderer = await getRendererMeta(config.renderer, config.cwd);
  const backend = await createBackend({
    ...config,
    renderer,
  });
  const closeBackend = await backend.listen(ports);
  const frontend = await createFrontend({
    ...config,
    ports,
    renderer,
  });
  const closeFrontend = await frontend.listen(ports.client);

  return {
    close: async () => {
      await closeFrontend({ forceExit: false });
      await closeBackend();
    },
  };
}
