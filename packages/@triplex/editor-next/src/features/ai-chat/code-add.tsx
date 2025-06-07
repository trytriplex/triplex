/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { hash } from "@triplex/lib";
import { useEffect } from "react";
import { sendVSCE } from "../../util/bridge";
import { CodeBlock } from "./code-block";
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

  return <CodeBlock path={path}>{children}</CodeBlock>;
}
