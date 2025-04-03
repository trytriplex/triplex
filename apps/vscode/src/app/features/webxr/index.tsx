/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { Dialog } from "@triplex/ux";
import { useSubscription } from "../../hooks/ws";
import { useDialogs } from "../../stores/dialogs";
import { WebXRNeedsSetup } from "./webxr-needs-setup";
import { WebXROpenDevice } from "./webxr-open-device";

export function OpenInWebXR() {
  const hideSelf = useDialogs((store) => () => store.set(undefined));
  const dependencies = useSubscription("/project/dependencies");
  const needsXR =
    dependencies.missingDependencies.category === "react" ||
    dependencies.missingDependencies.optional.includes("@react-three/xr");

  return (
    <Dialog
      className="backdrop:bg-overlay border-overlay bg-overlay-top text-default w-full max-w-sm rounded border backdrop:opacity-80"
      onDismiss={hideSelf}
    >
      <div
        className="flex flex-col gap-2.5 p-2.5"
        data-testid={
          needsXR ? "webxr-dialog-needs-setup" : "webxr-dialog-open-device"
        }
      >
        <span className="text-heading select-none font-medium">
          Open Component in WebXR
        </span>
        {needsXR ? <WebXRNeedsSetup /> : <WebXROpenDevice />}
      </div>
    </Dialog>
  );
}
