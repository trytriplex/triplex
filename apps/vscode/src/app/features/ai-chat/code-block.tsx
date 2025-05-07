/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type ReactNode } from "react";

export function CodeBlock({
  children = "",
  path = "",
}: {
  children: ReactNode;
  path: string;
}) {
  return (
    <div
      className="border-input bg-neutral rounded border px-0.5 py-0.5"
      onKeyDown={(e) => {
        // If selecting text only select the text in this element
        if (e.metaKey && e.key === "a" && e.target instanceof HTMLElement) {
          e.stopPropagation();
          window.getSelection()?.selectAllChildren(e.target);
        }
      }}
      tabIndex={0}
    >
      <div className="text-subtlest overflow-hidden whitespace-nowrap px-1 py-0.5 text-[11px]">
        Update file —
        {path && (
          <span className="" title={path}>
            {" "}
            {path.split("/").at(-1)}
          </span>
        )}
      </div>

      <pre
        className="border-input bg-editor overflow-auto rounded-sm border px-2 py-1"
        tabIndex={-1}
      >
        <code
          className="bg-editor text-subtle select-text"
          onKeyDown={(e) => {
            // If selecting text only select the text in this element
            if (e.metaKey && e.key === "a") {
              e.stopPropagation();
            }
          }}
        >
          {children}
        </code>
      </pre>
    </div>
  );
}
