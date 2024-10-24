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
  const { route: fallbackRoute } = useRouter();

  return (
    <div
      className={cn([
        "mt-6",
        variant === "list" && "flex flex-col gap-10",
        variant === "grid" && "grid grid-cols-2 gap-6",
      ])}
    >
      {getPagesUnderRoute(route || fallbackRoute)
        .filter((page) => page.route !== route)
        .flatMap((page) => (page.kind === "Folder" ? page.children : page))
        .map(
          (page) =>
            page.kind === "MdxPage" && (
              <Link
                className={cn([
                  "group flex flex-col",
                  variant === "grid" && "gap-2 border border-neutral-800 p-6",
                ])}
                href={page.route}
                key={page.route}
              >
                {page.frontMatter?.date && (
                  <time className="text-sm text-neutral-400">
                    {friendlyDate(page.frontMatter.date)}
                  </time>
                )}
                <div className="text-xl font-medium text-neutral-100 group-hover:underline">
                  {page.frontMatter?.title || page.meta?.title || page.name}
                </div>
                <div className="text-base text-neutral-400">
                  {page.frontMatter?.description || "(empty description)"}
                </div>
              </Link>
            ),
        )}
    </div>
  );
}
