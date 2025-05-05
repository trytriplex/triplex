/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type ReactNode } from "react";

export function Lozenge({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div
      className="border-input text-subtle flex whitespace-nowrap rounded border px-1 py-0.5 text-[11px] leading-none"
      title={title}
    >
      {children}
    </div>
  );
}
