/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type TriplexMeta } from "@triplex/bridge/client";
import { type SupportedElements } from "./types";

export const hasThreeFiberHelper = (
  meta: TriplexMeta,
): SupportedElements | false => {
  if (
    meta.name === "group" &&
    meta.parents.at(0)?.originExportName === "XROrigin"
  ) {
    return "XROrigin";
  }

  switch (meta.name) {
    case "rectAreaLight":
    case "pointLight":
    case "ambientLight":
    case "hemisphereLight":
    case "spotLight":
    case "directionalLight":
    case "perspectiveCamera":
    case "orthographicCamera":
      return meta.name;

    default:
      return false;
  }
};
