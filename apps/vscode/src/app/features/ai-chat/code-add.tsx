/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ChatRenderableProps } from "./types";

export function CodeAdd({ children }: ChatRenderableProps) {
  return (
    <pre className="border-input bg-editor overflow-auto border">
      <code>{children}</code>
    </pre>
  );
}
