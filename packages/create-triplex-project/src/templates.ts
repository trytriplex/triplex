/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readdirSync } from "node:fs";

export const templates = readdirSync(`${__dirname}/../templates`, {
  withFileTypes: true,
})
  .filter((file) => file.isDirectory())
  .map((file) => file.name);
