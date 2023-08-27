/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { IconProps } from "@radix-ui/react-icons/dist/types";
import { ComponentType, forwardRef } from "react";
import { cn } from "./cn";

export const IconButton = forwardRef<
  HTMLButtonElement,
  {
    icon: ComponentType<IconProps>;
    title: string;
    isSelected?: boolean;
    isDisabled?: boolean;
    testId?: string;
    className?: string;
    onClick?: () => void;
    size?: "default" | "tight";
    variant?: "default" | "inverse";
  }
>(
  (
    {
      icon: Icon,
      title,
      isSelected,
      onClick,
      className,
      testId,
      isDisabled,
      variant = "default",
      size = "default",
    },
    ref
  ) => (
    <button
      data-testid={testId}
      ref={ref}
      title={title}
      aria-label={title}
      disabled={isDisabled}
      onClick={onClick}
      type="submit"
      className={cn([
        "cursor-default outline-1 outline-offset-1 outline-blue-400 focus-visible:outline",
        isDisabled && [
          "cursor-not-allowed opacity-50",
          variant === "default" && "text-neutral-400",
          variant === "inverse" && "bg-black/5 text-neutral-800",
        ],
        !isDisabled &&
          (isSelected
            ? "bg-white/5 text-blue-400"
            : [
                variant === "default" &&
                  "text-neutral-400 hover:bg-white/5 active:bg-white/10",
                variant === "inverse" &&
                  "bg-black/5 text-neutral-800 hover:bg-black/10 active:bg-black/20",
              ]),
        size === "default" && "rounded-md p-1.5",
        size === "tight" && "rounded p-0.5",
        className,
      ])}
    >
      <Icon />
    </button>
  )
);

export const Button = forwardRef<
  HTMLButtonElement,
  {
    icon?: ComponentType<IconProps>;
    isSelected?: boolean;
    className?: string;
    disabled?: boolean;
    variant?: "default" | "inverse";
    onClick?: () => void;
    children: string;
    size?: "default" | "tight";
  }
>(
  (
    {
      icon: Icon,
      children,
      disabled,
      isSelected,
      onClick,
      className,
      variant = "default",
      size = "default",
    },
    ref
  ) => (
    <button
      ref={ref}
      onClick={onClick}
      type="submit"
      disabled={disabled}
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
    >
      {Icon && <Icon />}
      {children}
    </button>
  )
);
