/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useTelemetry, type ActionId } from "@triplex/ux";
import { cn } from "./cn";

export function ExternalLink({
  actionId,
  children,
  size = "md",
  to,
  variant = "link",
}: {
  actionId: ActionId;
  children: React.ReactNode;
  size?: "xs" | "md";
  to: string | `triplex:${TriplexActionId}`;
  variant?: "link" | "subtle";
}) {
  const telemetry = useTelemetry();
  return (
    <a
      className={cn([
        variant === "link" ? "text-blue-400" : "text-neutral-400",
        size === "xs" && "text-xs",
        size === "md" && "text-md",
      ])}
      href="#"
      onClick={() => {
        if (to.startsWith("triplex:")) {
          const id = to.split("triplex:")[1] as TriplexActionId;
          window.triplex.sendCommand(id);
        } else {
          window.triplex.openLink(to);
        }
        telemetry.event(actionId);
      }}
    >
      {children}
    </a>
  );
}
