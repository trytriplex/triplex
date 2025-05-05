/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type ChatRenderableProps } from "./types";

export function CodeReplace({
  children,
}: ChatRenderableProps<{
  fromLineNumber: number;
  path: string;
  toLineNumber: number;
}>) {
  return (
    <div className="border-input bg-neutral rounded border px-0.5 pb-0.5">
      <span className="text-subtlest px-1 text-[11px]">Update code</span>
      <pre className="border-input bg-editor overflow-auto rounded-sm border px-2 py-1">
        <code className="bg-editor text-subtle">{children}</code>
      </pre>
    </div>
  );
}
