/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useEvent } from "@triplex/lib";
import { useTelemetry, type ActionId } from "@triplex/ux";

export function Link({
  actionId,
  children,
  href,
}: {
  actionId: ActionId;
  children: string;
  href: string;
  variant?: "default" | "cta";
}) {
  const telemetry = useTelemetry();
  const onClickHandler = useEvent(() => {
    telemetry.event(actionId);
  });

  return (
    <a
      className="text-link underline focus:outline-none"
      href={href}
      onClick={onClickHandler}
    >
      {children}
    </a>
  );
}
