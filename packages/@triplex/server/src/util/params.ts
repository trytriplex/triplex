/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { HttpError, type RouterContext } from "@oakserver/oak";

export function getParam<T extends string>(
  context: RouterContext<T>,
  key: string,
) {
  const path = context.request.url.searchParams.get(key);
  if (!path) {
    throw new HttpError(`Missing [${key}] search param`);
  }

  return path;
}

export function getParamOptional<T extends string>(
  context: RouterContext<T>,
  key: string,
) {
  const path = context.request.url.searchParams.get(key);
  return path;
}
