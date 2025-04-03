/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useScreenView } from "@triplex/ux";
import { useState } from "react";
import { Button, ButtonLink } from "../../components/button";
import { useSubscription } from "../../hooks/ws";
import { sendVSCE } from "../../util/bridge";

export function WebXRNeedsSetup() {
  const [isInstalling, setIsInstalling] = useState(false);
  const { pkgManager } = useSubscription("/project/dependencies");
  const command = `${pkgManager} i @react-three/xr @react-three/fiber`;

  useScreenView("webxr_needs_setup", "Dialog");

  return (
    <>
      <p className="select-none">
        View and edit 3D components in WebXR. To get started you'll need to
        install some dependencies and open a 3D component.
      </p>
      <div className="flex-start flex flex-col gap-1.5">
        <Button
          actionId="dialog_webxr_installdeps"
          isDisabled={isInstalling}
          onClick={() => {
            setIsInstalling(true);
            sendVSCE("terminal", { command });
          }}
          variant="cta"
        >
          Install Dependencies
        </Button>
        <ButtonLink
          actionId="dialog_webxr_learn"
          href="https://triplex.dev/docs/building-your-scene/scene/webxr"
        >
          Learn More
        </ButtonLink>
      </div>
      <p className="select-none">
        After installing dependencies you'll need to restart Triplex for VS
        Code.
      </p>
    </>
  );
}
