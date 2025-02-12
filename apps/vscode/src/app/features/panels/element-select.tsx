/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { send } from "@triplex/bridge/host";
import { useTelemetry } from "@triplex/ux";
import { Suspense } from "react";
import { useLazySubscription } from "../../hooks/ws";
import { useSceneContext } from "../app-root/context";

function ElementOptions() {
  const context = useSceneContext();
  const { exports } = useLazySubscription("/scene/:path/:exportName", context);

  return exports.map((exp) => (
    <option key={exp.exportName} value={exp.exportName}>
      {exp.name}
    </option>
  ));
}

export function ElementSelect() {
  const context = useSceneContext();
  const telemetry = useTelemetry();

  return (
    <Suspense
      fallback={
        <select className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder h-[26px] w-full rounded-sm border px-1.5 focus:outline-none">
          <option>{context.exportName}</option>
        </select>
      }
    >
      <select
        aria-label="Switch component"
        className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder h-[26px] w-full text-ellipsis whitespace-nowrap rounded-sm border px-1.5 focus:outline-none"
        data-testid="ElementSelect"
        onChange={(e) => {
          const exportName = e.target.value;

          if (!exportName) {
            return;
          }

          telemetry.event("scenepanel_element_switch");

          send("request-open-component", {
            encodedProps: "",
            exportName,
            path: context.path,
          });
        }}
        value={context.exportName}
      >
        <ElementOptions />
      </select>
    </Suspense>
  );
}
