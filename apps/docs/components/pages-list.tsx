/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Link from "next/link";
import { useRouter } from "next/router";
import { getPagesUnderRoute } from "nextra/context";
import { cn } from "../util/cn";
import { friendlyDate } from "../util/date";

export function PagesList({
  route,
  variant = "list",
}: {
  route?: string;
  variant?: "list" | "grid";
}) {
  const { route: nativeRoute } = useRouter();
  const pages = [nativeRoute, route]
    .filter((str): str is string => !!str)
    .flatMap((route) => getPagesUnderRoute(route))
    .filter((page) => page.route !== route && page.route !== nativeRoute);

  if (pages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn([
        variant === "list" && "mt-6 flex flex-col gap-10",
        variant === "grid" && "my-14 grid grid-cols-2 gap-6",
      ])}
    >
      {pages.map(
        (page) =>
          page.kind === "MdxPage" && (
            <Link
              className={cn([
                "group flex flex-col",
                variant === "grid" &&
                  "justify-center gap-1 border border-neutral-600 p-6",
              ])}
              href={page.route}
              key={page.route}
            >
              {page.frontMatter?.date && (
                <time className="text-sm text-neutral-400">
                  {friendlyDate(page.frontMatter.date)}
                </time>
              )}
              <div
                className={cn([
                  "inline-flex flex-wrap items-center gap-1 text-xl text-neutral-200",
                  variant === "list" && "font-medium",
                ])}
              >
                <span className="group-hover:underline">
                  {page.frontMatter?.title || page.meta?.title || page.name}
                </span>
                {page.frontMatter?.app && (
                  <div
                    className="inline-block rounded bg-white/10 px-1 py-0.5 text-xs font-normal text-neutral-400"
                    title={`Only available in ${page.frontMatter.app}.`}
                  >
                    {page.frontMatter.app}
                  </div>
                )}
              </div>
              {page.frontMatter?.description && (
                <div className="text-base text-neutral-400">
                  {page.frontMatter?.description}
                </div>
              )}
            </Link>
          ),
      )}
    </div>
  );
}
