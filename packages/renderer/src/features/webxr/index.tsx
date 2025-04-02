/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { lazy } from "../../util/react-lazy";

export const WebXRApp = lazy(() =>
  import("./webxr").then((module) => ({ default: module.WebXRApp })),
);
