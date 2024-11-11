/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import { cn, onKeyDown, useEvent, type Accelerator } from "@triplex/lib";
import { useTelemetry, type ActionId } from "@triplex/ux";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useEffect, type ComponentType } from "react";
import { Pressable } from "./pressable";

export function IconButton({
  accelerator,
  actionId,
  children,
  icon: Icon,
  isSelected,
  label,
  onClick,
  spacing,
  vscodeContext,
}: {
  accelerator?: Accelerator;
  actionId: ActionId;
  children?: React.ReactNode;
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
      className={cn([
        "relative",
        isSelected ? "bg-selected text-selected" : "",
      ])}
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
      {children}
    </VSCodeButton>
  );
}

export function Button({
  accelerator,
  actionId,
  children,
  onClick,
  variant = "default",
  vscodeContext,
}: {
  accelerator?: Accelerator;
  actionId: ActionId;
  children: string;
  onClick: (e: React.MouseEvent | KeyboardEvent) => void;
  variant?: "default" | "cta";
  vscodeContext?: Record<string, unknown>;
}) {
  return (
    <Pressable
      accelerator={accelerator}
      actionId={actionId}
      className={cn([
        "border-button relative rounded-sm border px-2.5 py-1 text-[12px] outline-offset-[2px]",
        variant === "default" && "text-subtle bg-neutral hover:bg-hover",
        variant === "cta" && "text-primary bg-primary hover:bg-primary-hovered",
      ])}
      onClick={onClick}
      vscodeContext={vscodeContext}
    >
      {children}
    </Pressable>
  );
}
