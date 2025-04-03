/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useScreenView } from "@triplex/ux";
import { ButtonLink } from "../../components/button";
import { Link } from "../../components/link";
import { useSceneContext } from "../app-root/context";

export function WebXROpenDevice() {
  const { exportName, path } = useSceneContext();
  const externalURL = `https://${window.triplex.env.externalIP}:${window.triplex.env.ports.client}/webxr?exportName=${encodeURIComponent(exportName)}&path=${encodeURIComponent(path)}`;
  const openInMetaQuestURL = `https://www.oculus.com/open_url/?url=${encodeURIComponent(externalURL)}`;

  useScreenView("webxr_open_device", "Dialog");

  return (
    <>
      <p className="select-none">
        View and edit your component in WebXR by visiting the link on your
        headset, phone, or browser.{" "}
        <Link
          actionId="dialog_webxr_learn"
          href="https://triplex.dev/docs/building-your-scene/scene/webxr"
        >
          Learn more
        </Link>
        .
      </p>
      <div className="flex-start flex flex-col gap-1.5">
        <ButtonLink
          actionId="dialog_webxr_metaquest"
          href={openInMetaQuestURL}
          variant="cta"
        >
          Send to Meta Quest
        </ButtonLink>
        <ButtonLink actionId="dialog_webxr_browser" href={externalURL}>
          Open in Browser
        </ButtonLink>
      </div>
      <p className="select-none">
        Your devices must be on the same network. Not loading? Try restarting
        your browser, device, or router.
      </p>
    </>
  );
}
