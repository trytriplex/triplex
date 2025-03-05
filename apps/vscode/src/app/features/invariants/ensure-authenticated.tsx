/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { fg } from "@triplex/lib/fg";
import { useTelemetry } from "@triplex/ux";
import { use, useEffect, type ReactNode } from "react";
import { preloadSubscription, useSubscription } from "../../hooks/ws";
import { AuthenticationContext } from "../authentication/context";
import { SignIn } from "../authentication/sign-in";

export function EnsureAuthenticated({ children }: { children: ReactNode }) {
  const repo = useSubscription("/project/repo");
  const telemetry = useTelemetry();
  const session = use(AuthenticationContext);

  useEffect(() => {
    const eventName = `repo_loaded_${repo.visibility}` as const;
    telemetry.event(eventName);
  }, [repo.visibility, telemetry]);

  if (fg("private_auth_gate")) {
    return (
      <>{repo.visibility === "private" && !session ? <SignIn /> : children}</>
    );
  }

  return children;
}

preloadSubscription("/project/repo");
