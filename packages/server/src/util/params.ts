/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { HttpError, RouterContext } from "@oakserver/oak";

export function getParam<T extends string>(
  context: RouterContext<T>,
  key: string
) {
  const path = context.request.url.searchParams.get(key);
  if (!path) {
    throw new HttpError(`Missing [${key}] search param`);
  }

  return path;
}
