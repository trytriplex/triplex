/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import {
  CaretDownIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  SizeIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import { on, send, type Controls } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button as DSButton, IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { Menu, MenuRadioGroup, MenuRadioItem } from "../ds/menu";
import { Separator } from "../ds/separator";
import { useCanvasStage } from "../stores/canvas-stage";
import { useScene } from "../stores/scene";
import { Button, ButtonGroup, ToggleButton } from "./ecosystem/buttons";

export function ControlsMenu() {
  const refresh = useScene((store) => store.refresh);
  const playState = useScene((store) => store.playState);
  const setPlayState = useScene((store) => store.setPlayState);
  const setPlayCamera = useScene((store) => store.setPlayCamera);
  const playCamera = useScene((store) => store.playCamera);
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
      className="pointer-events-auto mx-auto mb-auto mt-3 flex gap-0.5"
      data-testid="controls-menu"
    >
      <div
        className={cn([
          playState === "play" && "hidden",
          "flex rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1 text-neutral-400",
        ])}
        // @ts-expect-error — updating React types will make this go away
        inert={playState === "play" ? "true" : undefined}
      >
        <ErrorBoundary fallbackRender={() => null} resetKeys={[controls]}>
          {controls.map((control, index) => {
            switch (control.type) {
              case "button": {
                return (
                  <Button
                    actionId="scene_controls"
                    control={control}
                    key={control.id}
                    onClick={(id) => send("control-triggered", { id })}
                  />
                );
              }

              case "button-group": {
                return (
                  <ButtonGroup
                    actionId="scene_controls"
                    control={control}
                    key={control.id}
                    onClick={(id) => send("control-triggered", { id })}
                  />
                );
              }

              case "toggle-button": {
                return (
                  <ToggleButton
                    actionId="scene_controls"
                    control={control}
                    key={control.id}
                    onClick={(id) => send("control-triggered", { id }, true)}
                  />
                );
              }

              case "separator": {
                return <Separator key={index + "separator"} />;
              }
            }
          })}
        </ErrorBoundary>

        {frame === "intrinsic" && (
          <>
            <Separator />

            <DSButton
              actionId="scene_frame_zoom_reset"
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
              actionId="scene_frame_fittoviewport"
              icon={SizeIcon}
              label="Fit Frame To Viewport"
              onClick={fitFrameToViewport}
            />
          </>
        )}
      </div>

      <div className="flex rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1 text-neutral-400">
        {playState !== "edit" && (
          <>
            <IconButton
              actionId="scene_frame_reset"
              icon={ResetIcon}
              label="Reset Scene"
              onClick={refresh}
            />
            <Separator />
            <IconButton
              actionId="scene_frame_stop"
              icon={StopIcon}
              label="Stop Scene"
              onClick={() => setPlayState("edit")}
            />
          </>
        )}

        {playState === "play" && (
          <IconButton
            actionId="scene_frame_pause"
            icon={PauseIcon}
            label="Pause Scene"
            onClick={() => setPlayState("pause")}
          />
        )}

        {playState !== "play" && (
          <IconButton
            actionId="scene_frame_play"
            icon={PlayIcon}
            label="Play Scene"
            onClick={() => setPlayState("play")}
          />
        )}

        <Menu
          trigger={
            <IconButton
              actionId="scene_frame_playoptions"
              icon={CaretDownIcon}
              label="Play Options"
              size="flush"
            />
          }
        >
          <MenuRadioGroup onChange={setPlayCamera} value={playCamera}>
            <MenuRadioItem actionId="scene_frame_camera_editor" value="editor">
              Editor camera
            </MenuRadioItem>
            <MenuRadioItem
              actionId="scene_frame_camera_default"
              value="default"
            >
              Default camera
            </MenuRadioItem>
          </MenuRadioGroup>
        </Menu>
      </div>
    </div>
  );
}
