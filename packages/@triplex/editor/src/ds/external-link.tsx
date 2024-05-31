/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useAnalytics, type ActionId } from "@triplex/ux";
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
  const analytics = useAnalytics();
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
        analytics.event(actionId);
      }}
    >
      {children}
    </a>
  );
}
