/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";
import { cn } from "../util/cn";

const CardContext = createContext<{
  alignContentBlock: CardAlign;
  alignContentInline: CardAlign;
  size: CardSize;
  variant: CardVariant;
}>({
  alignContentBlock: "start",
  alignContentInline: "start",
  size: "default",
  variant: "default",
});

export type CardVariant = "inverse" | "default";
export type CardAlign = "start" | "center" | "end";
export type CardSize = "default" | "large" | "xlarge";

export function LandingCardButton({
  alignContentBlock = "start",
  alignContentInline = "start",
  children,
  className,
  onClick,
  size = "default",
  variant = "default",
}: {
  alignContentBlock?: CardAlign;
  alignContentInline?: CardAlign;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: CardSize;
  variant?: CardVariant;
}) {
  return (
    <button
      className="appearance-none text-left"
      onClick={onClick}
      type="button"
    >
      <LandingCard
        alignContentBlock={alignContentBlock}
        alignContentInline={alignContentInline}
        className={className}
        size={size}
        variant={variant}
      >
        {children}
      </LandingCard>
    </button>
  );
}

export function LandingCardLink({
  alignContentBlock = "start",
  alignContentInline = "start",
  children,
  className,
  href,
  size = "default",
  variant = "default",
}: {
  alignContentBlock?: CardAlign;
  alignContentInline?: CardAlign;
  children: ReactNode;
  className?: string;
  href: string;
  size?: CardSize;
  variant?: CardVariant;
}) {
  return (
    <Link className={className} href={href} type="button">
      <LandingCard
        alignContentBlock={alignContentBlock}
        alignContentInline={alignContentInline}
        className="h-full"
        size={size}
        variant={variant}
      >
        {children}
      </LandingCard>
    </Link>
  );
}

export function LandingCard({
  alignContentBlock = "start",
  alignContentInline = "start",
  children,
  className,
  size = "default",
  variant = "default",
}: {
  alignContentBlock?: CardAlign;
  alignContentInline?: CardAlign;
  children: ReactNode;
  className?: string;
  size?: CardSize;
  variant?: CardVariant;
}) {
  return (
    <CardContext.Provider
      value={{ alignContentBlock, alignContentInline, size, variant }}
    >
      <div
        className={cn([
          className,
          alignContentInline === "center" && "items-center",
          alignContentInline === "start" && "items-start",
          alignContentInline === "end" && "items-end",
          alignContentBlock === "center" && "justify-center",
          alignContentBlock === "start" && "justify-start",
          alignContentBlock === "end" && "justify-end",
          size === "xlarge" && "gap-8",
          size === "large" && "gap-6",
          size === "default" && "gap-6",
          variant === "default" && "bg-surface border-neutral border",
          variant === "inverse" && "bg-inverse",
          "group flex flex-col rounded-3xl px-6 pb-6 pt-8 md:p-10",
        ])}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}

export function LandingCardHeading({
  children,
  decoration,
}: {
  children: string;
  decoration?: string;
}) {
  const { size, variant } = useContext(CardContext);

  return (
    <div className="flex flex-col">
      {decoration && (
        <span
          aria-hidden
          className={cn([
            variant === "default" && "text-subtle",
            variant === "inverse" && "text-inverse-subtle",
            "text-sm",
          ])}
        >
          {decoration}
        </span>
      )}
      <h3
        className={cn([
          size === "default" && "text-2xl",
          size === "large" && "text-2xl lg:text-4xl",
          size === "xlarge" && "text-5xl",
          variant === "default" && "text-default",
          variant === "inverse" && "text-inverse",
          "font-default line-clamp-3 font-medium",
        ])}
      >
        {children}
      </h3>
    </div>
  );
}

export function LandingCardBody({ children }: { children: string }) {
  const { alignContentInline, size, variant } = useContext(CardContext);

  return (
    <div
      className={cn([
        alignContentInline === "center" && "text-center",
        size !== "xlarge" && "line-clamp-5",
        size === "default" && "text-base",
        size !== "default" && "text-base lg:text-lg",
        variant === "default" && "text-subtle",
        variant === "inverse" && "text-inverse-subtle",
      ])}
    >
      {children}
    </div>
  );
}

export function LandingCardIcon() {
  const { variant } = useContext(CardContext);

  return (
    <div
      className={cn([
        variant === "default" && "text-subtle",
        variant === "inverse" && "text-inverse-subtle",
        "flex h-12 w-12",
      ])}
    >
      <svg viewBox="0 0 24 24">
        <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
          <g fill="currentColor" fillRule="nonzero">
            <path d="M8.06561801,18.9432081 L14.565618,4.44320807 C14.7350545,4.06523433 15.1788182,3.8961815 15.5567919,4.06561801 C15.9032679,4.2209348 16.0741922,4.60676263 15.9697642,4.9611247 L15.934382,5.05679193 L9.43438199,19.5567919 C9.26494549,19.9347657 8.82118181,20.1038185 8.44320807,19.934382 C8.09673215,19.7790652 7.92580781,19.3932374 8.03023576,19.0388753 L8.06561801,18.9432081 L14.565618,4.44320807 L8.06561801,18.9432081 Z M2.21966991,11.4696699 L6.46966991,7.21966991 C6.76256313,6.9267767 7.23743687,6.9267767 7.53033009,7.21966991 C7.79659665,7.48593648 7.8208027,7.90260016 7.60294824,8.19621165 L7.53033009,8.28033009 L3.81066017,12 L7.53033009,15.7196699 C7.8232233,16.0125631 7.8232233,16.4874369 7.53033009,16.7803301 C7.26406352,17.0465966 6.84739984,17.0708027 6.55378835,16.8529482 L6.46966991,16.7803301 L2.21966991,12.5303301 C1.95340335,12.2640635 1.9291973,11.8473998 2.14705176,11.5537883 L2.21966991,11.4696699 L6.46966991,7.21966991 L2.21966991,11.4696699 Z M16.4696699,7.21966991 C16.7359365,6.95340335 17.1526002,6.9291973 17.4462117,7.14705176 L17.5303301,7.21966991 L21.7803301,11.4696699 C22.0465966,11.7359365 22.0708027,12.1526002 21.8529482,12.4462117 L21.7803301,12.5303301 L17.5303301,16.7803301 C17.2374369,17.0732233 16.7625631,17.0732233 16.4696699,16.7803301 C16.2034034,16.5140635 16.1791973,16.0973998 16.3970518,15.8037883 L16.4696699,15.7196699 L20.1893398,12 L16.4696699,8.28033009 C16.1767767,7.98743687 16.1767767,7.51256313 16.4696699,7.21966991 Z" />
          </g>
        </g>
      </svg>
    </div>
  );
}
