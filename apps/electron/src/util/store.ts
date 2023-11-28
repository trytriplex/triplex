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
      format: "uuid",
      type: "string",
    },
  },
});

if (!userStore.has("userId")) {
  userStore.set("userId", randomUUID());
}
