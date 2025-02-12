/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { HamburgerMenuIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useSearchStore } from "../stores/search";
import { cn } from "../util/cn";

export function Header({
  children,
  onShowNav,
}: {
  children: ReactNode;
  onShowNav: () => void;
}) {
  const showSearch = useSearchStore((store) => () => store.setIsOpen(true));

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") {
        return;
      }

      if (e.key === "/") {
        requestAnimationFrame(showSearch);
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [showSearch]);

  return (
    <header className="bg-surface sticky top-0 z-50 col-span-full row-start-1 flex h-14 items-center gap-4 px-6 md:gap-6 md:px-8 lg:px-20">
      <Link aria-label="Home" className="flex-shrink-0" href="/">
        <object
          className="pointer-events-none mb-1"
          data="/logos/logo-horizontal.svg"
          height={Math.round(223 / 9)}
          width={Math.round(818 / 9)}
        />
      </Link>

      <nav className="flex flex-grow items-center gap-0.5 md:gap-5">
        <button
          className="text-subtle hover:bg-hovered active:bg-pressed outline-link relative ml-auto flex h-8 flex-shrink-0 cursor-default items-center rounded px-3 text-sm -outline-offset-1 md:-ml-2.5 md:hidden"
          onClick={onShowNav}
          type="submit"
        >
          <HamburgerMenuIcon className="flex-shrink-0" />
        </button>

        <div className="hidden md:contents">{children}</div>

        <div className="flex gap-2 md:w-full md:pl-2">
          <button
            className="text-subtle md:bg-neutral border-neutral hover:bg-hovered active:bg-pressed outline-link relative ml-auto flex h-8 w-full cursor-default items-center rounded-md px-3 text-base -outline-offset-1 md:max-w-xs md:cursor-text md:border md:pl-3 md:pr-1.5"
            onClick={showSearch}
            type="button"
          >
            <MagnifyingGlassIcon className="flex-shrink-0 md:mr-2" />
            <span className="hidden md:block">
              Type{" "}
              <div className="border-neutral bg-neutral inline-block rounded border px-1 py-0.5 text-xs">
                /
              </div>{" "}
              to search
            </span>
          </button>

          <Link
            className="text-inverse bg-brand flex items-center rounded-md px-4 py-1 text-base font-medium"
            href="/download"
          >
            Download
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function HeaderItem({
  children,
  href,
  isSelected,
}: {
  children: string;
  href: string;
  isSelected?: boolean;
}) {
  return (
    <Link
      className={cn([
        isSelected
          ? "text-brand font-medium"
          : "text-subtle hover:text-default",
        "text-base",
      ])}
      href={href}
    >
      {children}
    </Link>
  );
}
