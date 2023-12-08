/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { forwardRef, type KeyboardEventHandler, type MouseEventHandler } from "react";
import { useAnalytics } from "../analytics";
import useEvent from "../util/use-event";
import { cn } from "./cn";

export const Pressable = forwardRef<
  HTMLDivElement,
  {
    children?: React.ReactNode;
    className?: string;
    doublePressActionId?: string;
    label?: string;
    onBlur?: () => void;
    onDoublePress?: () => void;
    onPress?: () => void;
    pressActionId?: string;
    style?: React.CSSProperties;
    tabIndex?: number;
    testId?: string;
    title?: string;
  }
>(
  (
    {
      children,
      className,
      doublePressActionId,
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
    ref
  ) => {
    const analytics = useAnalytics();

    const onKeyDownHandler: KeyboardEventHandler = useEvent((e) => {
      if (e.key === "Enter") {
        onPress?.();
        analytics.event(pressActionId);
        e.stopPropagation();
      }
    });

    const onKeyUpHandler: KeyboardEventHandler = useEvent((e) => {
      if (e.key === " ") {
        onPress?.();
        analytics.event(pressActionId);
        e.stopPropagation();
      }
    });

    const onClickHandler: MouseEventHandler = useEvent((e) => {
      onPress?.();
      analytics.event(pressActionId);
      e.stopPropagation();
    });

    const onDoubleClickHandler: MouseEventHandler = useEvent((e) => {
      onDoublePress?.();
      analytics.event(doublePressActionId);
      e.stopPropagation();
    });

    return (
      <div
        aria-label={label}
        className={cn([
          "cursor-default outline-1 -outline-offset-1 outline-blue-400 focus-visible:outline",
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
      >
        {children}
      </div>
    );
  }
);

Pressable.displayName = "Pressable";
