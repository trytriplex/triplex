/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { cn, useEvent } from "@triplex/lib";
import {
  createContext,
  forwardRef,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

type StateListener = (active: boolean) => void;

const SurfaceStateContext = createContext<
  ((cb: StateListener) => () => void) | null
>(null);

export function useOnSurfaceStateChange(cb: StateListener) {
  const ctx = useContext(SurfaceStateContext);
  if (!ctx) {
    throw new Error("invariant: must be used within a surface component");
  }

  const eventCb = useEvent(cb);

  useLayoutEffect(() => {
    return ctx(eventCb);
  }, [eventCb, ctx]);
}

export const Surface = forwardRef<
  HTMLDivElement,
  {
    bg?: "overlay" | "editor";
    children: React.ReactNode;
    className?: string;
    direction?: "horizontal" | "vertical";
    isHidden?: boolean;
    shape?: "rounded" | "square";
    style?: React.CSSProperties;
    testId?: string;
  }
>(
  (
    {
      bg,
      children,
      className,
      direction = "vertical",
      isHidden,
      shape = "rounded",
      style,
      testId,
    },
    ref,
  ) => {
    const listeners = useRef<StateListener[]>([]);

    const addListener = useEvent((listener: StateListener) => {
      listeners.current.push(listener);
      return () => {
        listeners.current.splice(listeners.current.indexOf(listener), 1);
      };
    });

    return (
      <SurfaceStateContext.Provider value={addListener}>
        <div
          className={cn([
            "border-overlay group pointer-events-auto z-10 flex select-none focus:outline-none",
            isHidden && "hidden",
            direction === "horizontal" && "flex-row",
            direction === "vertical" && "flex-col",
            shape === "rounded" && "rounded",
            className,
            bg === "overlay" && "bg-overlay",
            bg === "editor" && "bg-editor",
          ])}
          data-testid={testId}
          // @ts-expect-error — updating React types will make this go away
          inert={isHidden ? "true" : undefined}
          onBlur={() => listeners.current.forEach((cb) => cb(false))}
          onFocus={() => listeners.current.forEach((cb) => cb(true))}
          ref={ref}
          style={style}
          tabIndex={-1}
        >
          {children}
        </div>
      </SurfaceStateContext.Provider>
    );
  },
);

Surface.displayName = "Surface";
