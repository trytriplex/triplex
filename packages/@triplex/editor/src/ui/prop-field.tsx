/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ReactNode } from "react";
import { cn } from "../ds/cn";
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
  labelAlignment,
  tags,
}: {
  children: ReactNode;
  description?: string;
  htmlFor: string;
  label: string;
  labelAlignment?: "start" | "center";
  tags: Record<string, string | number | boolean>;
}) {
  return (
    <div className="-mt-2 grid flex-shrink grid-cols-2 gap-2 px-4 py-2 first-of-type:mt-0 hover:bg-white/[2%]">
      <label
        className={cn([
          labelAlignment === "start" ? "mt-[5px] self-start" : "self-center",
          "text-right text-xs text-neutral-400",
        ])}
        htmlFor={htmlFor}
        title={
          description ? description + stringifyTags(tags) : stringifyTags(tags)
        }
      >
        {titleCase(label)}
      </label>

      <div className="flex flex-col justify-center gap-1">{children}</div>
    </div>
  );
}
