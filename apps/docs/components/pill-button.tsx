/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { cn } from "../util/cn";

export function PillButton({
  children,
  isSelected,
}: {
  children: string;
  isSelected?: boolean;
}) {
  return (
    <button
      className={cn([
        isSelected && "outline-brand outline outline-2 -outline-offset-1",
        "border-neutral font-default text-default cursor-pointer rounded-full border px-4 py-1 text-lg font-medium",
      ])}
      type="button"
    >
      {children}
    </button>
  );
}
