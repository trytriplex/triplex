/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { createContext } from "react";
import { type Vector3 } from "three";

export const WebXRContext = createContext(false);

export const WebXRGetOriginContext = createContext<(() => Vector3) | undefined>(
  undefined,
);
