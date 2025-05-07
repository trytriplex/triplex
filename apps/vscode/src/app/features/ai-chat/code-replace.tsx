/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { hash } from "@triplex/lib";
import { useEffect } from "react";
import { sendVSCE } from "../../util/bridge";
import { type ChatRenderableProps } from "./types";

export function CodeReplace({
  children = "",
  fromLineNumber = 1,
  isResolved,
  path = "",
  toLineNumber = 1,
}: ChatRenderableProps<{
  fromLineNumber: number;
  path: string;
  toLineNumber: number;
}>) {
  useEffect(() => {
    if (!isResolved) {
      return;
    }

    sendVSCE("code-update", {
      code: children.toString(),
      fromLineNumber,
      id: hash(children, toLineNumber, fromLineNumber, path),
      path,
      toLineNumber,
      type: "replace",
    });
  }, [children, fromLineNumber, isResolved, path, toLineNumber]);

  return (
    <div className="border-input bg-neutral rounded border px-0.5 py-0.5">
      <div className="text-subtlest overflow-hidden whitespace-nowrap px-1 py-0.5 text-[11px]">
        Update file —
        {path && (
          <span className="" title={path}>
            {" "}
            {path.split("/").at(-1)}
          </span>
        )}
      </div>
      <pre className="border-input bg-editor overflow-auto rounded-sm border px-2 py-1">
        <code className="bg-editor text-subtle">{children}</code>
      </pre>
    </div>
  );
}
