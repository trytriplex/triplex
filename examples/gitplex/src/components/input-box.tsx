/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type ReactNode } from "react";

export function InputBox({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-md border border-blue-500/50 bg-neutral-800/50 px-2 py-2 focus-within:border-blue-500">
      <input
        className="-mx-2 bg-transparent px-2 text-sm text-slate-300 [color-scheme:dark] placeholder:text-slate-500 focus:outline-none"
        placeholder="Ask Copilot"
        type="text"
      />
      {children}
    </div>
  );
}
