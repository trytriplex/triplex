/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { HamburgerMenuIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Image from "next/image";
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
    <header className="sticky top-0 z-50 col-span-full row-start-1 flex h-14 items-center gap-4 bg-neutral-950/70 px-6 [backdrop-filter:saturate(200%)_blur(5px)] md:gap-6 md:px-8 lg:px-20">
      <Link aria-label="Home" className="flex-shrink-0" href="/">
        <Image
          alt="Home"
          className="mb-1"
          height={Math.round(223 / 9)}
          src="/logos/logo-horizontal.svg"
          width={Math.round(818 / 9)}
        />
      </Link>

      <nav className="flex flex-grow items-center gap-0.5 overflow-hidden md:gap-5">
        <button
          className="relative ml-auto flex h-8 flex-shrink-0 cursor-default items-center rounded px-3 text-sm text-neutral-300 -outline-offset-1 outline-blue-400 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 active:bg-white/10 md:-ml-2.5 md:hidden"
          onClick={onShowNav}
          type="submit"
        >
          <HamburgerMenuIcon className="flex-shrink-0" />
        </button>

        <div className="hidden md:contents">{children}</div>

        <div className="flex gap-2 md:w-full md:pl-2">
          <button
            className="relative ml-auto flex h-8 w-full cursor-default items-center rounded-md border-neutral-600 px-3 text-base text-neutral-300 -outline-offset-1 outline-blue-400 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 active:bg-white/10 md:max-w-xs md:cursor-text md:border md:pl-3 md:pr-1.5"
            onClick={showSearch}
            type="button"
          >
            <MagnifyingGlassIcon className="flex-shrink-0 md:mr-2" />
            <span className="hidden md:block">
              Type{" "}
              <div className="inline-block rounded border border-neutral-600 bg-white/5 px-1 py-0.5 text-xs">
                /
              </div>{" "}
              to search
            </span>
          </button>

          <Link
            className="flex items-center rounded-md bg-white px-4 py-1 text-base font-medium text-neutral-900"
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
          ? "font-medium text-white"
          : "font-normal text-neutral-200 hover:text-neutral-100",
        "text-base",
      ])}
      href={href}
    >
      {children}
    </Link>
  );
}
