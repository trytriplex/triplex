/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

/**
 * **buildPath()**
 *
 * Builds a websocks path given a route and params.
 */
export function buildPath(
  route: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  let path = route;

  for (const param in params) {
    const rawValue = params[param];
    const value = rawValue === undefined ? "" : encodeURIComponent(rawValue);
    path = path.replace(`:${param}`, value);
  }

  return (
    path
      // Collapse all unreplaced optionals and return the path.
      .replaceAll(/{\/:\w+}/g, "")
      // Remove all parens from optional params that have now been filled in.
      .replaceAll(/{|}/g, "")
  );
}

export function defer() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    reject,
    resolve,
  };
}

export function noop() {}
