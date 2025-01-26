/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type TWSEventDefinition } from "@triplex/server";
import { createEvents } from "@triplex/websocks";

export const { on } = createEvents<TWSEventDefinition>();
