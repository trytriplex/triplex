/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useTelemetry, type ActionGroup } from "@triplex/ux";
import { useEffect } from "react";
import { sendVSCE } from "../../util/bridge";
import { useUIWarnings } from "./store";

export function WarningDot({ label }: { label: string }) {
  return (
    <div
      aria-label={label}
      className="bg-warning absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
      title={label}
    />
  );
}

export function WarningPredicate({
  actionId,
  predicate,
}: {
  actionId: `notification_${ActionGroup}${string}`;
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
    return <WarningDot label={predicate} />;
  }

  return null;
}
