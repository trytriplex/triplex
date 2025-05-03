/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ChatRenderableProps } from "./types";

export function Mutations({ children }: ChatRenderableProps) {
  return (
    <div className="border-input bg-neutral rounded border p-0.5">
      {children}
    </div>
  );
}
