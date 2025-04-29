/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import Link from "next/link";
import { cn } from "../util/cn";

export function LandingPresentationalButton({
  size = "base",
  variant,
}: {
  size?: "base" | "lg";
  variant: "default" | "inverse" | "inverse-hint";
}) {
  return (
    <div
      className={cn([
        size === "base" && "h-12 w-12",
        size === "lg" && "h-12 w-12 md:h-14 md:w-14",
        variant === "inverse" && "bg-inverse text-inverse",
        variant === "inverse-hint" &&
          "border-neutral bg-surface text-default group-hover:bg-inverse group-hover:text-inverse border group-hover:border-transparent",
        variant === "default" && "bg-surface text-default",
        "relative flex flex-shrink-0 items-center justify-center rounded-full p-4 transition-transform group-hover:translate-x-1",
      ])}
    >
      <svg
        className="ml-0.5"
        fill="none"
        height="100%"
        viewBox="0 0 16 27"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M14.9036 14.698L3.38031 26.2213L0.5 23.341L10.5831 13.2579L0.5 3.17475L3.38031 0.294434L14.9036 11.8177C15.2855 12.1997 15.5 12.7177 15.5 13.2579C15.5 13.798 15.2855 14.316 14.9036 14.698Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
}

export function LandingLink({
  children,
  href,
  variant,
}: {
  children: string;
  href: string;
  variant: "inverse" | "inverse-border" | "border";
}) {
  return (
    <Link
      className={cn([
        "font-default flex cursor-pointer items-center px-6 py-2 text-center text-lg font-medium",
        variant === "inverse" && "bg-surface text-default",
        variant === "inverse-border" &&
          "border-surface text-inverse-subtle border bg-transparent",
        variant === "border" &&
          "border-neutral text-subtle border bg-transparent",
      ])}
      href={href}
    >
      {children}
    </Link>
  );
}

export function LandingButton({
  children,
  isSelected,
  onClick,
}: {
  children: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn([
        isSelected && "border-brand bg-inverse text-inverse",
        !isSelected && "border-neutral text-subtle bg-transparent",
        "font-default cursor-pointer rounded-full border px-4 py-1 text-lg",
      ])}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
