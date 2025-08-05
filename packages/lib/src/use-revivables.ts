/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import {
  useReducer as _useReducer,
  useState as _useState,
  useEffect,
  type AnyActionArg,
} from "react";

const cache = new Map<string, unknown>();

/**
 * **useReducer()**
 *
 * This hook has the same API as standard React `useReducer`, with one
 * difference. If the hook is re-mounted the initial value will be set to the
 * previous known value.
 *
 * The `name` arg should be unique across the application otherwise unintended
 * behavior will arise.
 */
export function useRevivableReducer<S, A extends AnyActionArg>(
  reducer: (prevState: S, ...args: A) => S,
  _initialState: S,
  name: string,
): [S, React.ActionDispatch<A>] {
  const key = `reducer-${name}`;
  const initialState: S = (cache.get(key) || _initialState) as S;
  const [state, dispatch] = _useReducer<S, A>(reducer, initialState);

  useEffect(() => {
    cache.set(key, state);
  }, [key, state]);

  return [state, dispatch];
}

/**
 * **useState()**
 *
 * This hook has the same API as standard React `useState`, with one difference.
 * If the hook is re-mounted the initial value will be set to the previous known
 * value.
 *
 * The `name` arg should be unique across the application otherwise unintended
 * behavior will arise.
 */
export function useRevivableState<T>(
  initialValue: T,
  name: string,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const key = `state-${name}`;
  const initialState = (cache.get(key) || initialValue) as T;
  const [state, setState] = _useState<T>(initialState);

  useEffect(() => {
    cache.set(key, state);
  }, [key, state]);

  return [state, setState];
}

export function UNSAFE_clearCache(): void {
  cache.clear();
}
