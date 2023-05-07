import { useEffect, useRef } from "react";

export const noop = () => {};

export function useCacheWhile<TValue>(
  value: TValue | undefined,
  predicate: boolean
): TValue | undefined {
  const cached = useRef<TValue>();

  if (value && predicate) {
    cached.current = value;
  }

  useEffect(() => {
    if (!predicate) {
      cached.current = undefined;
    }
  }, [predicate]);

  return cached.current;
}
