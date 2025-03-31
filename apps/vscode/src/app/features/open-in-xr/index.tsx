/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { Dialog, useScreenView } from "@triplex/ux";
import { useDialogs } from "../../stores/dialogs";

export function OpenInXR() {
  const hideSelf = useDialogs((store) => () => store.set(undefined));
  const externalURL = `https://localhost:${window.triplex.env.ports.client}/webxr`;

  useScreenView("open_in_xr", "Dialog");

  return (
    <Dialog
      className="backdrop:bg-overlay border-overlay bg-overlay-top text-default w-full max-w-xs rounded border backdrop:opacity-80"
      onDismiss={hideSelf}
    >
      <div className="flex flex-col gap-2.5 p-2.5">
        <span className="text-heading select-none font-medium">
          Open in WebXR
        </span>
        <p className="select-none">
          Run and edit your project in WebXR by visiting the following URL on
          your headset or browser.
        </p>
        <div>
          <a
            className="text-link underline focus:outline-none"
            href={externalURL}
            onClick={hideSelf}
            rel="noreferrer"
            target="_blank"
          >
            {externalURL}
          </a>
        </div>
      </div>
    </Dialog>
  );
}
