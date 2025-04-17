/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

declare const __VARIABLE__: boolean;

export function Scene() {
  if (__VARIABLE__) {
    return <div>it is true!</div>;
  }

  return <div>it is false!</div>;
}
