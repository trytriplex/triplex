/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { ReloadIcon, SizeIcon } from "@radix-ui/react-icons";
import { on, send, type Controls } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button as DSButton, IconButton } from "../ds/button";
import { useCanvasStage } from "../stores/canvas-stage";
import { useScene } from "../stores/scene";
import { Button, ButtonGroup, ToggleButton } from "./ecosystem/buttons";

export function ControlsMenu() {
  const { refresh } = useScene();
  const [controls, setControls] = useState<Controls>();
  const zoom = useCanvasStage((store) => store.canvasZoom);
  const frame = useCanvasStage((store) => store.frame);
  const resetZoom = useCanvasStage((store) => store.resetZoom);
  const fitFrameToViewport = useCanvasStage(
    (store) => store.fitFrameToViewport
  );

  useEffect(() => {
    return on("set-controls", (data) => {
      setControls(data.controls);
    });
  }, []);

  if (!controls) {
    // Hide controls until the renderer sets them. All renderers need to set them
    // For them to show up, even if they set an empty array.
    return null;
  }

  return (
    <div
      className="pointer-events-auto mx-auto mb-auto mt-3 flex rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1 text-neutral-400"
      data-testid="controls-menu"
    >
      <IconButton
        actionId="refresh_scene"
        icon={ReloadIcon}
        label="Refresh Scene"
        onClick={refresh}
      />

      {controls.length ? (
        <div className="-my-1 mx-1 w-[1px] bg-neutral-800" />
      ) : undefined}

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

      {frame === "intrinsic" && (
        <>
          <div className="-my-1 mx-1 w-[1px] bg-neutral-800" />

          <DSButton
            actionId="refresh_scene"
            aria-label="Reset Zoom"
            onClick={resetZoom}
            size="tight"
          >
            <span
              aria-hidden
              className="w-8 text-center text-xs text-neutral-400"
            >{`${zoom}%`}</span>
          </DSButton>

          <IconButton
            actionId="fit_frame_to_viewport"
            icon={SizeIcon}
            label="Fit Frame To Viewport"
            onClick={fitFrameToViewport}
          />
        </>
      )}
    </div>
  );
}
