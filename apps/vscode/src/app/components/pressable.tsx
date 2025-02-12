/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { cn, onKeyDown, useEvent, type Accelerator } from "@triplex/lib";
import { useTelemetry, type ActionId } from "@triplex/ux";
import { forwardRef, useEffect, type CSSProperties } from "react";

interface PressableProps {
  accelerator?: Accelerator;
  actionId: ActionId;
  children?: React.ReactNode;
  className?: string;
  describedBy?: string;
  isDisabled?: boolean;
  labelledBy?: string;
  onClick: (e: React.MouseEvent | KeyboardEvent) => void;
  style?: CSSProperties;
  title?: string;
  vscodeContext?: Record<string, unknown>;
}

export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(
  (
    {
      accelerator,
      actionId,
      children,
      className,
      describedBy,
      isDisabled,
      labelledBy,
      onClick,
      style,
      title,
      vscodeContext,
    },
    ref,
  ) => {
    const telemetry = useTelemetry();
    const onClickHandler = useEvent((e: React.MouseEvent | KeyboardEvent) => {
      telemetry.event(actionId);
      onClick(e);
    });

    useEffect(() => {
      if (!accelerator) {
        return;
      }

      return onKeyDown(accelerator, onClickHandler);
    }, [accelerator, actionId, telemetry, onClickHandler]);

    return (
      <button
        aria-describedby={describedBy}
        aria-labelledby={labelledBy}
        className={cn([
          "focus-visible:outline-selected focus-visible:outline-default select-none focus-visible:outline",
          className,
        ])}
        data-vscode-context={
          vscodeContext ? JSON.stringify(vscodeContext) : undefined
        }
        disabled={isDisabled}
        onClick={onClickHandler}
        ref={ref}
        style={style}
        title={title}
      >
        {children}
      </button>
    );
  },
);

Pressable.displayName = "Pressable";
