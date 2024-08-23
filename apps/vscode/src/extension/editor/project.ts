/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { getConfig, getRendererMeta } from "@triplex/server";
import { join } from "upath";
import * as vscode from "vscode";
import { type Args } from "../../project";
import { fork } from "../util/fork";
import { getPort } from "../util/port";

export interface TriplexProject {
  /** Number of active sessions of this project */
  active: number;
  args: Args;
  dispose: () => void;
  ports: { client: number; server: number; ws: number };
}

export type TriplexProjectResolver = Promise<TriplexProject>;

export async function resolveProject(
  cwd: string,
  projectCache: Map<string, TriplexProjectResolver>,
  context: vscode.ExtensionContext,
): Promise<TriplexProject> {
  const cachedProjectResolver = projectCache.get(cwd);
  if (cachedProjectResolver) {
    const cachedProject = await cachedProjectResolver;
    cachedProject.active += 1;
    return cachedProject;
  }

  // eslint-disable-next-line no-async-promise-executor
  const projectResolver = new Promise<TriplexProject>(async (resolve) => {
    const config = getConfig(cwd);
    const ports = {
      client: await getPort(),
      server: await getPort(),
      ws: await getPort(),
    };

    const renderer = await getRendererMeta({
      cwd,
      filepath: config.renderer,
      getTriplexClientPkgPath: () => require.resolve("@triplex/client"),
    });

    const args: Args = {
      config,
      cwd,
      fgEnvironmentOverride: process.env.FG_ENVIRONMENT_OVERRIDE as
        | "production"
        | "staging"
        | "development"
        | "local",
      ports,
      renderer,
      userId: vscode.env.machineId,
    };

    const p = await fork<Args>(
      process.env.NODE_ENV === "production"
        ? join(context.extensionPath, "dist/project.js")
        : join(context.extensionPath, "src/project/index.ts"),
      {
        cwd: context.extensionPath,
        data: args,
      },
    );

    const project: TriplexProject = {
      active: 1,
      args,
      dispose: () => {
        project.active -= 1;

        if (project.active === 0) {
          projectCache.delete(cwd);
          p.kill();
        }
      },
      ports,
    };

    resolve(project);
  });

  projectCache.set(cwd, projectResolver);

  return projectResolver;
}
