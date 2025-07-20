/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { buildPath, defer, noop } from "./lib";
import { parseJSON } from "./string";
import { type RemapWithNumber } from "./types";
import useEvent from "./use-event";

/**
 * **createWSHooks()**
 *
 * Returns typed React hooks to be used with an instantiated websocks server.
 * Options can be either passed in immediately or passed in as a callback to be
 * called just-in-time when needed.
 *
 * ```ts
 * import { type Routes } from "./server";
 *
 * createWSHooks<Routes>({ url: "ws://localhost:3000" });
 * const { preloadSubscription, useSubscription } = createWSHooks<Routes>(
 *   () => ({ url: "ws://localhost:3000" }),
 * );
 *
 * preloadSubscription("/my-route");
 *
 * function Component() {
 *   return useSubscription("/my-route");
 * }
 * ```
 */
export function createWSHooks<
  TWSRouteDefinition extends Record<string, { data: unknown; params: unknown }>,
>(opts: (() => { url: string }) | { url: string }) {
  const valueCache = new Map<string, unknown>();
  const experimental_streamCache = new Map<string, Array<unknown>>();
  const queryCache = new Map<
    string,
    {
      deferred: ReturnType<typeof defer>;
      lazilyRefetch: boolean;
      subscribe: (onStoreChanged: () => void) => () => void;
    }
  >();

  function createRecoverableWebSocket({
    onClose,
    onError,
    onMessage,
    path,
    url,
  }: {
    onClose: () => void;
    onError: () => void;
    onMessage: (data: unknown) => void;
    path: string;
    url: string;
  }) {
    let ws = recreate();

    function recreate() {
      const ws = new WebSocket(url);

      ws.addEventListener("open", () => {
        ws.send(path);
      });

      ws.addEventListener("message", (e) => {
        const parsed = parseJSON(e.data);
        onMessage(parsed);
      });

      ws.addEventListener("error", () => {
        onError();
      });

      ws.addEventListener("close", ({ code }) => {
        if (code === 1006) {
          // The websocket connection closed from some local browser related issue.
          // Try and reconnect in a second.
          setTimeout(() => {
            if (ws.readyState === WebSocket.CLOSED) {
              recreate();
            }
          }, 1000);
        } else {
          onClose();
        }
      });

      return ws;
    }

    return {
      close: () => ws.close(),
    };
  }

  function wsQuery<TValue>(path: string) {
    function load() {
      const query = queryCache.get(path);
      if (query && !query.lazilyRefetch) {
        return;
      }

      if (query) {
        queryCache.set(path, {
          ...query,
          lazilyRefetch: false,
        });
      }

      const resolvedOpts = typeof opts === "function" ? opts() : opts;
      const deferred = defer();
      const subscriptions: (() => void)[] = [];

      let cleanupTimeoutId: number;

      const ws = createRecoverableWebSocket({
        onClose: () => {
          const query = queryCache.get(path);
          if (query) {
            /**
             * Once a query has been closed we mark it as needing a refetch if
             * it's accessed again in the future. This means it can transition
             * from a standard subscription to a lazy subscription later in its
             * life.
             */
            valueCache.delete(path);
            experimental_streamCache.delete(path);
            queryCache.set(path, { ...query, lazilyRefetch: true });
          }
        },
        onError: () => {
          deferred.reject(new Error("Error connecting to websocket."));
        },
        onMessage: (_data) => {
          const data = _data === undefined ? null : _data;

          const streamValue = experimental_streamCache.get(path) || [];
          streamValue.push(data);
          experimental_streamCache.set(path, streamValue);

          valueCache.set(path, data);

          subscriptions.forEach((cb) => cb());
          deferred.resolve();
        },
        path,
        url: resolvedOpts.url,
      });

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
              ws.close();
            }
          }, 9999);
        };
      }

      queryCache.set(path, {
        deferred,
        lazilyRefetch: false,
        subscribe,
      });
    }

    function read({
      stream,
      suspend = true,
    }: { stream?: "all" | "last"; suspend?: boolean } = {}) {
      const query = queryCache.get(path);
      if (!query) {
        throw new Error(`invariant: call load() first for ${path}`);
      }

      if (query.lazilyRefetch) {
        load();
      }

      const value = stream
        ? experimental_streamCache.get(path)
        : valueCache.get(path);

      if (value === undefined) {
        if (suspend) {
          throw query.deferred.promise;
        } else {
          return null as TValue;
        }
      }

      if (typeof value === "object" && value !== null && "error" in value) {
        throw new Error(
          `Error reading "${decodeURIComponent(path)}" - [${value.error}]`,
        );
      }

      if (stream === "all" && Array.isArray(value)) {
        return value;
      } else if (stream === "last" && Array.isArray(value)) {
        return value.at(-1);
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

  /**
   * **preloadSubscription()**
   *
   * Preloads a subscription. This should be called as early as possible in your
   * application.
   */
  function preloadSubscription<
    TRoute extends string & keyof TWSRouteDefinition,
  >(
    ...args: TWSRouteDefinition[TRoute]["params"] extends never
      ? [route: TRoute]
      : [
          route: TRoute,
          params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]>,
        ]
  ): void {
    const [route, params = {}] = args;
    const query = wsQuery(buildPath(route, params));
    query.load();
  }

  /**
   * **useLazySubscription()**
   *
   * Lazily subscribes to a route. This hook does not need to be preloaded and
   * so is at risk of causing data loading waterfalls.
   *
   * Prefer preloading as early as possible and using `useSubscription()`
   * instead.
   */
  function useLazySubscription<
    TRoute extends string & keyof TWSRouteDefinition,
  >(
    ...args: TWSRouteDefinition[TRoute]["params"] extends never
      ? [route: TRoute]
      : [
          route: TRoute,
          params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]>,
        ]
  ): TWSRouteDefinition[TRoute]["data"] {
    const [route, params = {}] = args;
    const query = wsQuery<TWSRouteDefinition[TRoute]["data"]>(
      buildPath(route, params),
    );

    query.load();

    const data = useSyncExternalStore<TWSRouteDefinition[TRoute]["data"]>(
      useCallback((onStoreChanged) => query.subscribe(onStoreChanged), [query]),
      query.read,
    );

    return data;
  }

  /**
   * **useSubscription()**
   *
   * Returns the value of a preloaded subscription. You must call
   * `preloadSubscription()` prior to calling this hook otherwise an error will
   * be thrown.
   */
  function useSubscription<TRoute extends string & keyof TWSRouteDefinition>(
    ...args: TWSRouteDefinition[TRoute]["params"] extends never
      ? [route: TRoute]
      : [
          route: TRoute,
          params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]>,
        ]
  ): TWSRouteDefinition[TRoute]["data"] {
    const [route, params = {}] = args;
    const query = wsQuery<TWSRouteDefinition[TRoute]["data"]>(
      buildPath(route, params),
    );

    const data = useSyncExternalStore<TWSRouteDefinition[TRoute]["data"]>(
      useCallback((onStoreChanged) => query.subscribe(onStoreChanged), [query]),
      query.read,
    );

    return data;
  }

  /**
   * **clearQuery()**
   *
   * Clears a path from the query cache. When accessing the path again it will
   * be lazily fetched from the server, meaning it doesn't need to be
   * preloaded.
   */
  function clearQuery<TRoute extends string & keyof TWSRouteDefinition>(
    ...args: TWSRouteDefinition[TRoute]["params"] extends never
      ? [route: TRoute]
      : [
          route: TRoute,
          params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]>,
        ]
  ): void {
    const [route, params = {}] = args;
    const path = buildPath(route, params);
    const query = queryCache.get(path);

    valueCache.delete(path);

    if (query) {
      /**
       * To prevent an invariant being thrown we set the query to lazily refresh
       * the next time it's accessed, transforming the query to a lazy
       * subscription.
       */
      queryCache.set(path, { ...query, lazilyRefetch: true });
    }
  }

  /** @experimental */
  function useLazySubscriptionStream<
    TRoute extends string & keyof TWSRouteDefinition,
  >(
    ...args: TWSRouteDefinition[TRoute]["params"] extends never
      ? [
          route: TRoute,
          callback: (
            data: TWSRouteDefinition[TRoute]["data"],
            type: "chunk" | "all",
          ) => void,
        ]
      : [
          route: TRoute,
          params: RemapWithNumber<TWSRouteDefinition[TRoute]["params"]>,
          callback: (
            data: TWSRouteDefinition[TRoute]["data"],
            type: "chunk" | "all",
          ) => void,
        ]
  ) {
    const [route, paramsOrCallback, maybeCallback = noop] = args;
    const params =
      typeof paramsOrCallback === "function" ? {} : paramsOrCallback;
    const callback =
      typeof paramsOrCallback === "function" ? paramsOrCallback : maybeCallback;
    const callbackEvent = useEvent(callback);
    const query = wsQuery<TWSRouteDefinition[TRoute]["data"]>(
      buildPath(route, params),
    );

    query.load();

    useEffect(() => {
      const latestValue = query.read({ stream: "all", suspend: false });
      if (latestValue?.length > 0) {
        callbackEvent(latestValue, "all");
      }

      return query.subscribe(() => {
        callbackEvent(query.read({ stream: "last" }), "chunk");
      });
    }, [callbackEvent, query]);
  }

  return {
    clearQuery,
    experimental_useLazySubscriptionStream: useLazySubscriptionStream,
    preloadSubscription,
    useLazySubscription,
    useSubscription,
  };
}

export { type RemapWithNumber, buildPath };
