/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useTelemetry } from "@triplex/ux";
import { useEffect } from "react";
import { preloadSubscription, useSubscription } from "../../hooks/ws";

export function RepoTelemetry() {
  const repo = useSubscription("/project/repo");
  const telemetry = useTelemetry();

  useEffect(() => {
    const eventName = `repo_loaded_${repo.visibility}` as const;
    telemetry.event(eventName);
  }, [repo.visibility, telemetry]);

  return null;
}

preloadSubscription("/project/repo");
