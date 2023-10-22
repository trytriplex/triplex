/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ReactNode } from "react";
import { cn } from "../ds/cn";

export interface EditorLinkOptions {
  column?: number;
  editor?: "sublime" | "phpstorm" | "atom" | "vscode-insiders" | "vscode";
  line?: number;
  path: string;
}

export function getEditorLink({
  column = 0,
  editor = "vscode",
  line = 0,
  path,
}: EditorLinkOptions) {
  switch (editor) {
    case "sublime":
      return `subl://open?url=file://${path}&line=${line}&column=${column}`;
    // https://youtrack.jetbrains.com/issue/IDEA-65879
    case "phpstorm":
      return `phpstorm://open?file=${path}&line=${line}&column=${column}`;
    // https://flight-manual.atom.io/hacking-atom/sections/handling-uris/#core-uris
    case "atom":
      return `atom://core/open?url=file://${path}&line=${line}&column=${column}`;
    // https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls
    case "vscode-insiders":
    case "vscode":
      return `${editor}://file/${path}:${line}:${column}`;
  }
}

export function IDELink({
  children,
  className = "text-xs text-neutral-400",
  column,
  line,
  path,
  title,
}: {
  children: ReactNode;
  className?: string;
  column: number;
  line: number;
  path: string;
  title?: string;
}) {
  return (
    <a
      className={cn([
        "rounded-sm outline-1 outline-offset-1 outline-blue-400 focus-visible:outline",
        className,
      ])}
      href={getEditorLink({
        column,
        editor: "vscode",
        line,
        path,
      })}
      onClick={(e) => {
        // We prevent default and use window.open() instead of native anchor behaviour
        // to keep the websocket connections open. Without it they close and never reopen.
        e.preventDefault();
        const ctx = window.open(e.currentTarget.href, "_target");
        ctx?.close();
      }}
      title={title}
    >
      {children}
    </a>
  );
}
