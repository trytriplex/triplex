/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import { cn, onKeyDown, useEvent, type Accelerator } from "@triplex/lib";
import { useTelemetry, type ActionId } from "@triplex/ux";
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
  spacing = "default",
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
    <button
      aria-label={label + (isSelected ? " active" : "")}
      className={cn([
        "hover:bg-hover outline-default outline-selected active:bg-pressed text-default relative flex flex-shrink-0 items-center justify-center rounded focus-visible:outline",
        spacing === "default" && "h-[22px] w-[22px]",
        spacing === "thin" && "",
        spacing === "spacious" && "h-[26px] w-[26px]",
        isSelected ? "bg-selected text-selected" : "",
      ])}
      data-vscode-context={
        vscodeContext ? JSON.stringify(vscodeContext) : undefined
      }
      onClick={onClickHandler}
      title={label + (accelerator ? ` (${accelerator.toUpperCase()})` : "")}
    >
      <Icon className="pointer-events-none h-[16px] w-[16px] flex-shrink-0" />
      {children}
    </button>
  );
}

export function Button({
  accelerator,
  actionId,
  children,
  isDisabled,
  onClick,
  variant = "default",
  vscodeContext,
}: {
  accelerator?: Accelerator;
  actionId: ActionId;
  children: string;
  isDisabled?: boolean;
  onClick: (e: React.MouseEvent | KeyboardEvent) => void;
  variant?: "default" | "cta";
  vscodeContext?: Record<string, unknown>;
}) {
  return (
    <Pressable
      accelerator={accelerator}
      actionId={actionId}
      className={cn([
        "border-button outline-default outline-selected outline-offset-button relative rounded-sm border px-2.5 py-1 text-[13px] focus-visible:outline",
        isDisabled
          ? "text-disabled bg-neutral cursor-not-allowed"
          : [
              variant === "default" && "text-subtle bg-neutral hover:bg-hover",
              variant === "cta" &&
                "text-primary bg-primary hover:bg-primary-hovered",
            ],
      ])}
      isDisabled={isDisabled}
      onClick={onClick}
      vscodeContext={vscodeContext}
    >
      {children}
    </Pressable>
  );
}

export function ButtonLink({
  actionId,
  children,
  href,
  variant = "default",
}: {
  actionId: ActionId;
  children: string;
  href: string;
  variant?: "default" | "cta";
}) {
  const telemetry = useTelemetry();
  const onClickHandler = useEvent(() => {
    telemetry.event(actionId);
  });

  return (
    <a
      className={cn([
        "border-button outline-default outline-selected outline-offset-button relative rounded-sm border px-2.5 py-1 text-center text-[13px] leading-[18px] focus:outline-none focus-visible:outline",
        variant === "default" && "text-subtle bg-neutral hover:bg-hover",
        variant === "cta" &&
          "text-primary bg-primary hover:text-primary hover:bg-primary-hovered",
      ])}
      href={href}
      onClick={onClickHandler}
    >
      <span>{children}</span>
    </a>
  );
}
