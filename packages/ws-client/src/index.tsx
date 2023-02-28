import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const valueCache = new Map<string, unknown>();
const queryCache = new Map<
  string,
  {
    subscriptions: (() => void)[];
    deferred: ReturnType<typeof defer>;
    ws: WebSocket;
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

    ws.addEventListener("open", () => {
      ws!.send(path);
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
      subscriptions,
      ws,
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

    query.subscriptions.push(onStoreChanged);

    return () => {
      const index = query.subscriptions.indexOf(onStoreChanged);
      query.subscriptions.splice(index, 1);
    };
  }

  return {
    load,
    read,
    subscribe,
  };
}

export function preloadSubscription(path: string) {
  const query = wsQuery(path);
  query.load();
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
