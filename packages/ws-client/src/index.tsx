/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { TWSRouteDefinition } from "@triplex/server";

export type RemapWithNumber<TObject> = {
  [P in keyof TObject]: string | number | undefined;
};

const valueCache = new Map<string, unknown>();
const queryCache = new Map<
  string,
  {
    subscribe: (onStoreChanged: () => void) => () => void;
    deferred: ReturnType<typeof defer>;
  }
>();

function defer() {
  let resolve!: () => void;
  let reject!: () => void;

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

function wsQuery<TValue>(path: string) {
  function load() {
    if (queryCache.has(path)) {
      return;
    }

    const ws = new WebSocket("ws://localhost:3300");
    const deferred = defer();
    const subscriptions: (() => void)[] = [];
    let cleanupTimeoutId: number | undefined;

    function subscribe(onStoreChanged: () => void) {
      subscriptions.push(onStoreChanged);

      return () => {
        // Cleanup
        window.clearTimeout(cleanupTimeoutId);

        const index = subscriptions.indexOf(onStoreChanged);
        subscriptions.splice(index, 1);

        cleanupTimeoutId = window.setTimeout(() => {
          if (subscriptions.length === 0) {
            // After a period of time if there are no more active connections
            // Close websocket and clear the cache. It'll be loaded fresh from
            // The server next time a component tries to access the data.
            queryCache.delete(path);
            ws.close();
          }
        }, 9999);
      };
    }

    ws.addEventListener("open", () => {
      ws.send(path);
    });

    ws.addEventListener("message", (e) => {
      const parsed = JSON.parse(e.data);
      valueCache.set(path, parsed);
      subscriptions.forEach((cb) => cb());
      deferred.resolve();
    });

    ws.addEventListener("error", () => {
      deferred.reject();
    });

    ws.addEventListener("close", () => {
      queryCache.delete(path);
    });

    queryCache.set(path, {
      deferred,
      subscribe,
    });
  }

  function read(suspend = true) {
    const query = queryCache.get(path);
    if (!query) {
      throw new Error(`invariant: call load() first for ${path}`);
    }

    const value = valueCache.get(path);
    if (!value) {
      if (suspend) {
        throw query.deferred.promise;
      } else {
        return null as TValue;
      }
    }

    if (typeof value === "object" && "error" in value) {
      throw new Error(
        `Error reading "${decodeURIComponent(path)}" - [${value.error}]`
      );
    }

    return value as TValue;
  }

  function subscribe(onStoreChanged: () => void) {
    const query = queryCache.get(path);
    if (!query) {
      throw new Error(`invariant: call load() first for ${path}`);
    }

    return query.subscribe(onStoreChanged);
  }

  return {
    load,
    read,
    subscribe,
  };
}

export function buildPath(
  route: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  let path = route;

  for (const param in params) {
    const rawValue = params[param];
    const value =
      typeof rawValue === "undefined" ? "" : encodeURIComponent(rawValue);
    path = path.replace(`:${param}`, value);
  }

  return path;
}

export function preloadSubscription<TRoute extends keyof TWSRouteDefinition>(
  ...args: TWSRouteDefinition[TRoute]["params"] extends never
    ? [route: TRoute]
    : [
        route: TRoute,
        params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]>
      ]
): void {
  const [route, params = {}] = args;
  const query = wsQuery(buildPath(route, params));
  query.load();
}

export function useLazySubscription<TRoute extends keyof TWSRouteDefinition>(
  ...args: TWSRouteDefinition[TRoute]["params"] extends never
    ? [route: TRoute]
    : [
        route: TRoute,
        params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]>
      ]
): TWSRouteDefinition[TRoute]["data"] {
  const [route, params = {}] = args;
  const query = wsQuery<TWSRouteDefinition[TRoute]["data"]>(
    buildPath(route, params)
  );

  query.load();

  const data = useSyncExternalStore<TWSRouteDefinition[TRoute]["data"]>(
    useCallback((onStoreChanged) => query.subscribe(onStoreChanged), [query]),
    query.read
  );

  return data;
}

export function useSubscription<TRoute extends keyof TWSRouteDefinition>(
  ...args: TWSRouteDefinition[TRoute]["params"] extends never
    ? [route: TRoute]
    : [
        route: TRoute,
        params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]>
      ]
): TWSRouteDefinition[TRoute]["data"] {
  const [route, params = {}] = args;
  const query = wsQuery<TWSRouteDefinition[TRoute]["data"]>(
    buildPath(route, params)
  );

  const data = useSyncExternalStore<TWSRouteDefinition[TRoute]["data"]>(
    useCallback((onStoreChanged) => query.subscribe(onStoreChanged), [query]),
    query.read
  );

  return data;
}

export function useSubscriptionEffect<TRoute extends keyof TWSRouteDefinition>(
  ...args: TWSRouteDefinition[TRoute]["params"] extends never
    ? [route: TRoute, params?: { disabled?: boolean }]
    : [
        route: TRoute,
        params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]> & {
          disabled?: boolean;
        }
      ]
): TWSRouteDefinition[TRoute]["data"] | null {
  const [route, params = {}] = args;
  const [value, setValue] = useState<TWSRouteDefinition[TRoute]["data"] | null>(
    null
  );
  const path = buildPath(route, params);

  useEffect(() => {
    if (params.disabled) {
      setValue(null);
      return;
    }

    const query = wsQuery<TWSRouteDefinition[TRoute]["data"] | null>(path);
    query.load();
    setValue(query.read(false));

    return query.subscribe(() => {
      setValue(query.read(false));
    });
  }, [params.disabled, path]);

  return value;
}
