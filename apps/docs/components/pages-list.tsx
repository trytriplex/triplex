/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Link from "next/link";
import { getPagesUnderRoute } from "nextra/context";
import { friendlyDate } from "../util/date";

export function PagesList({ route }: { route: string }) {
  return (
    <div className="mt-6 flex flex-col gap-10">
      {getPagesUnderRoute(route)
        .filter((page) => page.route !== route)
        .flatMap((page) => (page.kind === "Folder" ? page.children : page))
        .map(
          (page) =>
            page.kind === "MdxPage" && (
              <Link
                className="group flex flex-col"
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
