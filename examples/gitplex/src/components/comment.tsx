/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ReactNode } from "react";

export function Comment({
  children,
  name,
  text,
}: {
  children?: ReactNode;
  name: string;
  text: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 py-2">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 flex-shrink-0 rounded-full border border-slate-700 bg-slate-800"></div>
        <div className="text-sm font-medium text-slate-200">{name}</div>
      </div>
      <div className="text-sm text-slate-300">{text}</div>
      {children}
    </div>
  );
}
