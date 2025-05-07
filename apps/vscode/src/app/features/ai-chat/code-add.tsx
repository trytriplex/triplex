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

export function CodeAdd({
  children = "",
  isResolved,
  lineNumber = 1,
  path = "",
}: ChatRenderableProps<{ lineNumber: number; path: string }>) {
  useEffect(() => {
    if (!isResolved) {
      return;
    }

    sendVSCE("code-update", {
      code: `${children}`,
      id: hash(children, lineNumber, path),
      lineNumber,
      path,
      type: "add",
    });
  }, [children, isResolved, lineNumber, path]);

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
