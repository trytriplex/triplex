/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type SupportedElements } from "./types";

export const hasThreeFiberHelper = (
  elementName: unknown,
): elementName is SupportedElements => {
  if (typeof elementName !== "string") {
    return false;
  }

  switch (elementName) {
    case "rectAreaLight":
    case "pointLight":
    case "ambientLight":
    case "hemisphereLight":
    case "spotLight":
    case "directionalLight":
    case "perspectiveCamera":
    case "orthographicCamera":
      return true;

    default:
      return false;
  }
};
