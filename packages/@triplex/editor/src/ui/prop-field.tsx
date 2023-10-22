/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type ReactNode } from "react";
import { titleCase } from "../util/string";

function stringifyTags(tags: Record<string, string | number | boolean>) {
  const result = Object.entries(tags)
    .map(([key, value]) => `@${key} ${value}`)
    .join("\n");

  if (result) {
    return "\n\n" + result;
  }

  return "";
}

export function PropField({
  children,
  description,
  htmlFor,
  label,
  tags,
}: {
  children: ReactNode;
  description?: string;
  htmlFor: string;
  label: string;
  tags: Record<string, string | number | boolean>;
}) {
  return (
    <div className="group -mt-2 flex w-full flex-shrink gap-2 px-4 py-2 first-of-type:mt-0 hover:bg-white/[2%]">
      <div className="flex w-[100px] flex-grow items-center justify-end text-neutral-400">
        <label
          className="overflow-hidden text-ellipsis whitespace-nowrap text-right text-xs text-neutral-400"
          htmlFor={htmlFor}
          title={
            description
              ? `${label} — ${description}`
              : label + stringifyTags(tags)
          }
        >
          {titleCase(label)}
        </label>
      </div>

      <div className="flex w-[134px] flex-col justify-center gap-1">
        {children}
      </div>
    </div>
  );
}
