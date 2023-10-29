/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { IconProps } from "@radix-ui/react-icons/dist/types";
import { ComponentType, forwardRef } from "react";
import { cn } from "./cn";
import { Pressable } from "./pressable";

export const IconButton = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    color?: "inherit" | "default";
    icon: ComponentType<IconProps>;
    isDisabled?: boolean;
    isSelected?: boolean | "partial";
    label: string;
    onClick?: () => void;
    size?: "md" | "sm" | "xs";
    testId?: string;
    variant?: "default" | "inverse";
  }
>(
  (
    {
      className,
      color = "default",
      icon: Icon,
      isDisabled,
      isSelected,
      label,
      onClick,
      size = "md",
      testId,
      variant = "default",
    },
    ref
  ) => (
    <Pressable
      className={cn([
        "cursor-default outline-1 outline-offset-1 outline-blue-400 focus-visible:outline",
        isDisabled && [
          "cursor-not-allowed opacity-50",
          variant === "default" && "text-neutral-400",
          variant === "inverse" && "bg-black/5 text-neutral-800",
        ],
        !isDisabled &&
          (isSelected
            ? isSelected === "partial"
              ? "text-blue-400 hover:bg-white/5 active:bg-white/10"
              : "bg-white/5 text-blue-400 active:bg-white/10"
            : [
                variant === "default" && [
                  color === "inherit" && "text-inherit",
                  color === "default" && "text-neutral-400",
                  "hover:bg-white/5 active:bg-white/10",
                ],
                variant === "inverse" &&
                  "bg-black/5 text-neutral-800 hover:bg-black/10 active:bg-black/20",
              ]),
        size === "md" && "rounded-md p-1.5",
        size === "sm" && "rounded-md p-1",
        size === "xs" && "rounded p-0.5",
        className,
      ])}
      label={label}
      onPress={isDisabled ? undefined : onClick}
      ref={ref}
      testId={testId}
      title={label}
    >
      <Icon className="pointer-events-none" />
    </Pressable>
  )
);

IconButton.displayName = "IconButton";

export const Button = forwardRef<
  HTMLButtonElement,
  {
    children: string;
    className?: string;
    disabled?: boolean;
    icon?: ComponentType<IconProps>;
    isSelected?: boolean;
    onClick?: () => void;
    size?: "default" | "tight";
    testId?: string;
    variant?: "default" | "inverse";
  }
>(
  (
    {
      children,
      className,
      disabled,
      icon: Icon,
      isSelected,
      onClick,
      size = "default",
      testId,
      variant = "default",
    },
    ref
  ) => (
    <button
      className={cn([
        "cursor-default outline-1 outline-offset-1 outline-blue-400 focus-visible:outline",
        disabled && "cursor-not-allowed text-neutral-500",
        !disabled &&
          (isSelected
            ? "text-blue-400 hover:bg-white/5 active:bg-white/10"
            : [
                variant === "default" &&
                  "text-neutral-300 hover:bg-white/5 active:bg-white/10",
                variant === "inverse" &&
                  "bg-black/5 text-neutral-800 hover:bg-black/10 active:bg-black/20",
              ]),
        size === "default" && "rounded-md p-1.5 px-4",
        size === "tight" && "rounded px-2 py-0.5",
        "flex items-center gap-1.5 text-sm",
        className,
      ])}
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type="submit"
    >
      {Icon && <Icon />}
      {children}
    </button>
  )
);

Button.displayName = "Button";
