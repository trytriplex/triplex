/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ChatRenderableProps } from "./types";

export function AIThinking({ children }: ChatRenderableProps) {
  return <div className="opacity-80">{children}</div>;
}
