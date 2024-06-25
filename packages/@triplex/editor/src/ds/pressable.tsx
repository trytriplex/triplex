/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEvent } from "@triplex/lib";
import { useTelemetry, type ActionId } from "@triplex/ux";
import {
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";
import { cn } from "./cn";

const PrimitiveContext = createContext({});

export const PrimitiveProvider = forwardRef<unknown, { children: JSX.Element }>(
  ({ children, ...props }, ref) => {
    return (
      <PrimitiveContext.Provider value={props}>
        {cloneElement(children, { ref })}
      </PrimitiveContext.Provider>
    );
  },
);

PrimitiveProvider.displayName = "PrimitiveProvider";

export const Pressable = forwardRef<
  HTMLDivElement,
  {
    accelerator?: string;
    children?: React.ReactNode;
    className?: string;
    doublePressActionId?: ActionId;
    focusRing?: "inset" | "default";
    label?: string;
    onBlur?: () => void;
    onDoublePress?: () => void;
    onPress?: () => void;
    pressActionId: ActionId;
    style?: React.CSSProperties;
    tabIndex?: number;
    testId?: string;
    title?: string;
  }
>(
  (
    {
      accelerator,
      children,
      className,
      doublePressActionId,
      focusRing,
      label,
      onBlur,
      onDoublePress,
      onPress,
      pressActionId,
      style,
      tabIndex,
      testId,
      title,
    },
    ref,
  ) => {
    const telemetry = useTelemetry();
    const props = useContext(PrimitiveContext);

    useEffect(() => {
      if (!onPress || !accelerator) {
        return;
      }

      return window.triplex.accelerator(accelerator, () => {
        onPress();
        telemetry.event(pressActionId);
      });
    }, [accelerator, telemetry, onPress, pressActionId]);

    const onKeyDownHandler: KeyboardEventHandler = useEvent((e) => {
      if (e.key === "Enter" && onPress) {
        onPress();
        e.stopPropagation();
        telemetry.event(pressActionId);
      }
    });

    const onKeyUpHandler: KeyboardEventHandler = useEvent((e) => {
      if (e.key === " " && onPress) {
        onPress();
        e.stopPropagation();
        telemetry.event(pressActionId);
      }
    });

    const onClickHandler: MouseEventHandler = useEvent((e) => {
      if (onPress) {
        onPress?.();
        e.stopPropagation();
        telemetry.event(pressActionId);
      }
    });

    const onDoubleClickHandler: MouseEventHandler = useEvent((e) => {
      if (onDoublePress) {
        onDoublePress?.();
        e.stopPropagation();
        telemetry.event(doublePressActionId);
      }
    });

    return (
      <div
        aria-label={label}
        className={cn([
          focusRing === "inset" && "-outline-offset-1",
          "cursor-default select-none outline-1 outline-blue-400 focus-visible:outline",
          className,
        ])}
        data-testid={testId}
        onBlur={onBlur}
        onClick={onClickHandler}
        onDoubleClick={onDoubleClickHandler}
        onKeyDown={onKeyDownHandler}
        onKeyUp={onKeyUpHandler}
        ref={ref}
        role="button"
        style={style}
        tabIndex={tabIndex || 0}
        title={title}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Pressable.displayName = "Pressable";
