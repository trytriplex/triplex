/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type Vector3 } from "three";

export interface SelectionState {
  column: number;
  line: number;
  parentPath: string;
  path: string;
  point?: Vector3;
}
