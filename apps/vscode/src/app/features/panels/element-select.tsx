/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/host";
import { Suspense } from "react";
import { useLazySubscription } from "../../hooks/ws";
import { useSceneStore } from "../../stores/scene";

function ElementOptions() {
  const context = useSceneStore((store) => store.context);
  const { exports } = useLazySubscription("/scene/:path/:exportName", context);

  return exports.map((exp) => (
    <option key={exp.exportName} value={exp.exportName}>
      {exp.name}
    </option>
  ));
}

export function ElementSelect() {
  const context = useSceneStore((store) => store.context);

  return (
    <select
      aria-label="Switch component"
      className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder h-[26px] w-full rounded-sm border px-1.5 focus:outline-none"
      onChange={(e) => {
        const exportName = e.target.value;

        if (!exportName) {
          return;
        }

        send("request-open-component", {
          encodedProps: "",
          exportName,
          path: context.path,
        });
      }}
      value={context.exportName}
    >
      <Suspense>
        <ElementOptions />
      </Suspense>
    </select>
  );
}
