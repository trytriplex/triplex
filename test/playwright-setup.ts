/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { initFeatureGates } from "@triplex/lib/fg";
import { resolveExecPath } from "./playwright";

export default async () => {
  await resolveExecPath();
  await initFeatureGates({ environment: "local", userId: "__TEST_USER__" });
};
