/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { MagnifyingGlassIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { cn } from "../util/cn";
import { useSearchStore } from "../stores/search";

export function Header({
  children,
  onShowNav,
  appearance = "default",
}: {
  children: ReactNode;
  onShowNav: () => void;
  appearance?: "default" | "transparent";
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
    <>
      <header
        className={cn([
          appearance === "default" && "border-neutral-800",
          appearance === "transparent" && "border-transparent",
          "z-50 col-span-full row-start-1 flex h-16 items-center gap-6 border-b px-10",
        ])}
      >
        <span className="mr-3">
          <Link
            aria-label="Triplex home"
            className="font text-[2.5rem] text-white/90"
            href="/"
          >
            <svg width="2rem" viewBox="0 0 200 200">
              <polygon
                className="fill-none stroke-current [stroke-width:0.8rem]"
                points="183,172 26,172 100,28"
              />
            </svg>
          </Link>
        </span>

        <Link
          href="/download"
          className="flex h-full items-center bg-blue-400 px-6 py-3 text-lg font-semibold text-neutral-950 md:text-base"
        >
          Download
        </Link>

        <nav className="flex flex-grow items-center gap-1 overflow-hidden md:gap-6">
          <div className="ml-auto md:hidden" />

          <button
            onClick={onShowNav}
            type="submit"
            className="relative flex h-8 flex-shrink-0 cursor-default items-center rounded px-3 text-sm text-neutral-400 -outline-offset-1 outline-blue-400 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 active:bg-white/10 md:hidden"
          >
            <HamburgerMenuIcon className="flex-shrink-0" />
          </button>

          <div className="hidden md:contents">{children}</div>

          <button
            onClick={showSearch}
            className="relative flex h-8 cursor-default items-center rounded-md border-neutral-700 px-3 text-sm text-neutral-400 -outline-offset-1 outline-blue-400 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 active:bg-white/10 md:ml-auto md:w-64 md:cursor-text md:border md:pl-3 md:pr-1.5"
            type="button"
          >
            <MagnifyingGlassIcon className="flex-shrink-0 md:hidden" />
            <span className="hidden lg:block">Search documentation...</span>
            <span className="hidden md:block lg:hidden">Search docs...</span>
            <div className="ml-auto hidden rounded-sm border border-neutral-600 bg-white/5 px-2 py-0.5 text-xs md:block">
              /
            </div>
          </button>
        </nav>
      </header>
    </>
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
        isSelected ? "text-blue-400" : "text-white/80 hover:text-white/90",
        "text-base font-semibold",
      ])}
      href={href}
    >
      {children}
    </Link>
  );
}
