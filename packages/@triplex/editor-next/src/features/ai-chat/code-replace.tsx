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

  return <CodeBlock path={path}>{children}</CodeBlock>;
}
