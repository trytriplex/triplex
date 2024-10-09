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
    <div className="mt-6 flex flex-col gap-4">
      {getPagesUnderRoute(route)
        .filter((page) => page.route !== route)
        .flatMap((page) => (page.kind === "Folder" ? page.children : page))
        .map(
          (page) =>
            page.kind === "MdxPage" && (
              <Link
                className="flex flex-col gap-1"
                href={page.route}
                key={page.route}
              >
                <div className="text-2xl font-medium text-neutral-200">
                  {page.frontMatter?.title || page.meta?.title || page.name}
                </div>
                <div className="text-lg text-neutral-300">
                  {page.frontMatter?.description || "(empty)"}
                </div>
                {page.frontMatter?.date && (
                  <time className="text-neutral-400">
                    {friendlyDate(page.frontMatter?.date)}
                  </time>
                )}
              </Link>
            ),
        )}
    </div>
  );
}
