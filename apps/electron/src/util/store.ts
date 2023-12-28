/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { randomUUID } from "node:crypto";
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

export const editorConfigStore = new Store<{
  layout: "expanded" | "collapsed";
}>({
  name: "editor-config",
  schema: {
    layout: {
      default: "collapsed",
      type: "string",
    },
  },
});
