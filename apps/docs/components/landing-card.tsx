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
      className={cn([className, "appearance-none rounded-3xl text-left"])}
      onClick={onClick}
      type="button"
    >
      <LandingCard
        alignContentBlock={alignContentBlock}
        alignContentInline={alignContentInline}
        className="h-full"
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
    <Link className={cn([className, "rounded-3xl"])} href={href} type="button">
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
          size === "xlarge" && "gap-8 p-8 md:rounded-3xl md:p-10",
          size === "large" && "gap-6 rounded-3xl md:p-8",
          size === "default" && "gap-6 rounded-3xl md:p-8",
          variant === "default" &&
            "bg-surface outline-neutral outline outline-1 -outline-offset-1",
          variant === "inverse" && "bg-inverse",
          "group flex flex-col px-6 pb-6 pt-8",
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
  lineClamp = 99,
}: {
  children: string;
  decoration?: string;
  lineClamp?: number;
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
          size === "xlarge" && "text-center text-5xl",
          variant === "default" && "text-default",
          variant === "inverse" && "text-inverse",
          "font-default line-clamp-6 overflow-hidden font-medium",
        ])}
        style={{
          WebkitLineClamp: lineClamp,
        }}
      >
        {children}
      </h3>
    </div>
  );
}

export function LandingCardBody({
  children,
  lineClamp,
}: {
  children: ReactNode;
  lineClamp?: number;
}) {
  const { alignContentInline, size, variant } = useContext(CardContext);

  return (
    <div
      className={cn([
        alignContentInline === "center" && "text-center",
        size === "default" && "text-base",
        size !== "default" && "text-base lg:text-lg",
        variant === "default" && "text-subtle",
        variant === "inverse" && "text-inverse-subtle",
      ])}
      style={{ lineClamp }}
    >
      {children}
    </div>
  );
}

export function LandingCardIcon({
  icon: Icon = () => null,
}: {
  icon: () => ReactNode;
}) {
  const { size, variant } = useContext(CardContext);

  return (
    <div
      className={cn([
        variant === "default" && "text-subtle",
        variant === "inverse" && "text-inverse-subtle",
        size === "xlarge" && "h-14 w-14",
        size !== "xlarge" && "h-10 w-10",
        "flex",
      ])}
    >
      <Icon />
    </div>
  );
}
