/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
