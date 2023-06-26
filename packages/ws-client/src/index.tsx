import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

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

export function preloadSubscription(path: string | string[]) {
  if (typeof path === "string") {
    const query = wsQuery(path);
    query.load();
  } else {
    path.forEach((p) => {
      const query = wsQuery(p);
      query.load();
    });
  }
}

export function useLazySubscription<TSubscriptionData>(path: string) {
  const query = wsQuery<TSubscriptionData>(path);

  query.load();

  const data = useSyncExternalStore<TSubscriptionData>(
    useCallback((onStoreChanged) => query.subscribe(onStoreChanged), [query]),
    query.read
  );

  return data;
}

export function useSubscription<TSubscriptionData>(path: string) {
  const query = wsQuery<TSubscriptionData>(path);

  const data = useSyncExternalStore<TSubscriptionData>(
    useCallback((onStoreChanged) => query.subscribe(onStoreChanged), [query]),
    query.read
  );

  return data;
}

export function useSubscriptionEffect<TSubscriptionData>(
  path: string
): TSubscriptionData | null {
  const [value, setValue] = useState<TSubscriptionData | null>(null);

  useEffect(() => {
    if (path === "") {
      setValue(null);
      return;
    }

    const query = wsQuery<TSubscriptionData | null>(path);
    query.load();
    setValue(query.read(false));

    return query.subscribe(() => {
      setValue(query.read(false));
    });
  }, [path]);

  return value;
}
