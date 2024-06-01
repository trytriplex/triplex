/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useTelemetry, type ActionId } from "@triplex/ux";
import { type ReactNode } from "react";
import { cn } from "../ds/cn";

export function IDELink({
  actionId,
  children,
  className = "text-xs text-neutral-400",
  column,
  line,
  path,
  title,
}: {
  actionId: ActionId;
  children: ReactNode;
  className?: string;
  column: number;
  line: number;
  path: string;
  title?: string;
}) {
  const telemetry = useTelemetry();

  return (
    <a
      className={cn([
        "outline-1 -outline-offset-1 outline-blue-400 focus-visible:outline",
        className,
      ])}
      href="#"
      onClick={(e) => {
        // We prevent default and use window.open() instead of native anchor behaviour
        // to keep the websocket connections open. Without it they close and never reopen.
        e.preventDefault();
        window.triplex.openIDE(path, { column, line });
        telemetry.event(actionId);
      }}
      title={title}
    >
      {children}
    </a>
  );
}
