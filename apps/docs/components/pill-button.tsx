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
  onClick,
}: {
  children: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn([
        isSelected && "border-brand text-default",
        !isSelected && "border-neutral text-subtle",
        "font-default cursor-pointer rounded-full border px-4 py-1 text-lg",
      ])}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
