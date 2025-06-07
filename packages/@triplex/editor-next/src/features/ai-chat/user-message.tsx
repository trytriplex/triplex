/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { PersonIcon } from "@radix-ui/react-icons";
import { type ChatRenderableProps } from "./types";

export function UserMessage({ children }: ChatRenderableProps) {
  return (
    <div className="flex gap-2">
      <div className="border-input -mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center self-start rounded-full border p-1">
        <PersonIcon className="flex-shrink-0" />
      </div>
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
    </div>
  );
}
