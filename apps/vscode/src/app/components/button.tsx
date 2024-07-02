/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import { cn, useEvent } from "@triplex/lib";
import { useTelemetry, type ActionId } from "@triplex/ux";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import {
  forwardRef,
  useEffect,
  type ComponentType,
  type CSSProperties,
} from "react";
import { onKeyDown } from "../util/keyboard";

export function IconButton({
  accelerator,
  actionId,
  icon: Icon,
  isSelected,
  label,
  onClick,
  spacing,
  vscodeContext,
}: {
  accelerator?: string;
  actionId: ActionId;
  icon: ComponentType<IconProps>;
  isSelected?: boolean;
  label: string;
  onClick: (e: React.MouseEvent | KeyboardEvent) => void;
  spacing?: "default" | "thin" | "spacious";
  vscodeContext?: Record<string, unknown>;
}) {
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
    <VSCodeButton
      appearance="icon"
      aria-label={label + (isSelected ? " active" : "")}
      className={cn([isSelected ? "bg-selected text-selected" : ""])}
      data-vscode-context={
        vscodeContext ? JSON.stringify(vscodeContext) : undefined
      }
      onClick={onClickHandler}
      title={label + (accelerator ? ` (${accelerator.toUpperCase()})` : "")}
    >
      <Icon
        className={cn([
          spacing === "spacious" && "m-0.5",
          spacing === "thin" && "-mx-1",
          "pointer-events-none",
        ])}
      />
    </VSCodeButton>
  );
}

interface PressableProps {
  accelerator?: string;
  actionId: ActionId;
  children?: React.ReactNode;
  className?: string;
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
        aria-labelledby={labelledBy}
        className={cn([
          "focus-visible:outline-selected focus-visible:outline-default select-none focus-visible:outline",
          className,
        ])}
        data-vscode-context={
          vscodeContext ? JSON.stringify(vscodeContext) : undefined
        }
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
