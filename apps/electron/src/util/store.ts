/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createHash, randomUUID } from "node:crypto";
import {
  type EditorSettings,
  type ProjectSettings,
  type RendererManifest,
} from "@triplex/server";
import Store from "electron-store";

export const userStore = new Store<{ userId: string }>({
  name: "user",
  schema: {
    userId: {
      default: randomUUID(),
      format: "uuid",
      type: "string",
    },
  },
});

/**
 * Holds the global configuration for the editor.
 */
export const editorConfigStore = new Store<EditorSettings>({
  name: "editor-config",
  schema: {
    layout: {
      default: "collapsed",
      type: "string",
    },
  },
});

/**
 * Holds the local configuration for a project. Each unique cwd is considered
 * another project.
 */
export function getProjectStore(opts: {
  cwd: string;
  manifest: RendererManifest;
}) {
  const filepathHash = createHash("md5")
    .update(opts.cwd)
    .digest("hex")
    .slice(0, 7);

  const projectStore = new Store<ProjectSettings>({
    name: filepathHash,
    schema: {
      frame: {
        default: opts.manifest.stage.defaultFrame,
        type: "string",
      },
    },
  });

  return projectStore;
}
