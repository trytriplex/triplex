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
  htmlFor,
  label,
  description,
  children,
  tags,
}: {
  label: string;
  htmlFor: string;
  tags: Record<string, string | number | boolean>;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="-mt-2 flex w-full flex-shrink gap-2 px-4 py-2 hover:bg-white/[2%]">
      <div className="w-[61px] flex-grow items-center overflow-hidden text-ellipsis text-right text-neutral-400">
        <label
          className="whitespace-nowrap text-xs text-neutral-400"
          title={
            description
              ? `${label} — ${description}`
              : label + stringifyTags(tags)
          }
          htmlFor={htmlFor}
        >
          {titleCase(label)}
        </label>
      </div>

      <div className="flex w-[139px] flex-shrink-0 flex-col justify-center gap-1">
        {children}
      </div>
    </div>
  );
}
