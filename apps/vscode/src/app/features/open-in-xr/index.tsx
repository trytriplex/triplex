/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { Dialog, useScreenView } from "@triplex/ux";
import { ButtonLink } from "../../components/button";
import { useDialogs } from "../../stores/dialogs";

export function OpenInXR() {
  const hideSelf = useDialogs((store) => () => store.set(undefined));
  const externalURL = `https://${window.triplex.env.externalIP}:${window.triplex.env.ports.client}/webxr`;
  const openInMetaQuestURL = `https://www.oculus.com/open_url/?url=${encodeURIComponent(externalURL)}`;

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
        <div className="flex-start flex flex-col gap-1.5">
          <ButtonLink
            actionId="dialog_webxr_metaquest"
            href={openInMetaQuestURL}
            variant="cta"
          >
            Send Link To Meta Quest
          </ButtonLink>
          <ButtonLink actionId="dialog_webxr_browser" href={externalURL}>
            Open in Browser
          </ButtonLink>
        </div>
      </div>
    </Dialog>
  );
}
