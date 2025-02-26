/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { lazy } from "../../util/react-lazy";

export { hasThreeFiberHelper } from "./has-three-fiber-helper";

export const ThreeFiberHelper = lazy(() =>
  import("./three-fiber-helper").then((module) => ({
    default: module.ThreeFiberHelper,
  })),
);

if (window.triplex.preload.reactThreeFiber) {
  ThreeFiberHelper.preload();
}
