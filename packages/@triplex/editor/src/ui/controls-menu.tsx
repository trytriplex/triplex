/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { ResetIcon } from "@radix-ui/react-icons";
import { on, send, type Controls } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { IconButton } from "../ds/button";
import { useScene } from "../stores/scene";
import { Button, ButtonGroup, ToggleButton } from "./ecosystem/buttons";

export function ControlsMenu() {
  const { refresh } = useScene();
  const [controls, setControls] = useState<Controls>([]);

  useEffect(() => {
    return on("set-controls", (data) => {
      setControls(data.controls);
    });
  });

  if (controls.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-auto mx-auto mt-auto flex rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1 text-neutral-400"
      data-testid="controls-menu"
    >
      <IconButton
        actionId="refresh_scene"
        icon={ResetIcon}
        label="Reset Scene"
        onClick={refresh}
      />

      <div className="-my-1 mx-1 w-[1px] bg-neutral-800" />

      <ErrorBoundary fallbackRender={() => null} resetKeys={[controls]}>
        {controls.map((control, index) => {
          switch (control.type) {
            case "button": {
              return (
                <Button
                  control={control}
                  key={control.id}
                  onClick={(id) => send("control-triggered", { id })}
                />
              );
            }

            case "button-group": {
              return (
                <ButtonGroup
                  control={control}
                  key={control.id}
                  onClick={(id) => send("control-triggered", { id })}
                />
              );
            }

            case "toggle-button": {
              return (
                <ToggleButton
                  control={control}
                  key={control.id}
                  onClick={(id) => send("control-triggered", { id }, true)}
                />
              );
            }

            case "separator": {
              return (
                <div
                  className="-my-1 mx-1 w-[1px] bg-neutral-800"
                  key={index + "separator"}
                />
              );
            }
          }
        })}
      </ErrorBoundary>
    </div>
  );
}
