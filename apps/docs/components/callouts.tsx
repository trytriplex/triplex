/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { BookmarkFilledIcon, RocketIcon } from "@radix-ui/react-icons";

export function KnowledgeCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10 flex flex-col gap-2.5 bg-neutral-900 px-6 py-8">
      <span className="flex items-center gap-4 text-xl font-medium text-white">
        <BookmarkFilledIcon />
        New Knowledge
      </span>
      <span className="pl-8 text-xl text-neutral-300 md:text-lg [&>*:first-child]:mt-0">
        {children}
      </span>
    </div>
  );
}

export function YouWillLearnCallout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="my-10 flex flex-col gap-2.5 bg-white/10 px-6 py-8">
      <span className="flex items-center gap-4 text-xl font-medium text-neutral-200">
        <RocketIcon />
        You Will Learn
      </span>
      <span className="pl-8 text-xl text-neutral-300 md:text-lg [&>*:first-child]:mt-0">
        {children}
      </span>
    </div>
  );
}
