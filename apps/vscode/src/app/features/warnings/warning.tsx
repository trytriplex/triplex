/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { cn } from "@triplex/lib";
import { useTelemetry, type ActionGroup } from "@triplex/ux";
import { useEffect } from "react";
import { sendVSCE } from "../../util/bridge";
import { useUIWarnings } from "./store";

export function WarningDot({
  label,
  position = "top-right",
}: {
  label: string;
  position?: "top-right" | "center-right";
}) {
  return (
    <div
      aria-label={label}
      className={cn([
        "bg-warning absolute h-2 w-2 rounded-full",
        position === "top-right" && "-right-0.5 -top-0.5",
        position === "center-right" && "right-1.5 top-1/2 -translate-y-1/2",
      ])}
      title={label}
    />
  );
}

export function WarningPredicate({
  actionId,
  position,
  predicate,
}: {
  actionId: `notification_${ActionGroup}${string}`;
  position?: "top-right" | "center-right";
  predicate: string | false;
}) {
  const increment = useUIWarnings((store) => store.increment);
  const telemetry = useTelemetry();

  useEffect(() => {
    if (predicate) {
      sendVSCE("notification", {
        actions: [],
        message: predicate,
        type: "warning",
      });

      telemetry.event(actionId);

      return increment();
    }
  }, [predicate, increment, telemetry, actionId]);

  if (predicate) {
    return <WarningDot label={predicate} position={position} />;
  }

  return null;
}
