/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import {
  GearIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  SizeIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import {
  on,
  send,
  type Controls,
  type MenuControl,
} from "@triplex/bridge/host";
import {
  groupOptionsByGroup,
  Menu,
  MenuOption,
  MenuOptionGroup,
  MenuTrigger,
} from "@triplex/ux";
import { Fragment, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button as DSButton, IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { Separator } from "../ds/separator";
import { useCanvasStage } from "../stores/canvas-stage";
import { useScene } from "../stores/scene";
import { Button, ButtonGroup, ToggleButton } from "./ecosystem/buttons";

export function ControlsMenu() {
  const refresh = useScene((store) => store.refresh);
  const playState = useScene((store) => store.playState);
  const setPlayState = useScene((store) => store.setPlayState);
  const setPlayCamera = useScene((store) => store.setPlayCamera);
  const [controls, setControls] = useState<Controls>();
  const [settings, setSettings] = useState<MenuControl["options"]>([]);
  const zoom = useCanvasStage((store) => store.canvasZoom);
  const frame = useCanvasStage((store) => store.frame);
  const resetZoom = useCanvasStage((store) => store.resetZoom);
  const fitFrameToViewport = useCanvasStage(
    (store) => store.fitFrameToViewport,
  );

  useEffect(() => {
    return on("set-extension-points", (data) => {
      if (data.area === "scene") {
        setControls(data.controls);
      } else if (data.area === "settings") {
        setSettings(data.options);
      }
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
                    scope="scene"
                  />
                );
              }

              case "button-group": {
                return (
                  <ButtonGroup
                    actionId="scene_controls"
                    control={control}
                    key={control.groupId}
                    scope="scene"
                  />
                );
              }

              case "toggle-button": {
                return (
                  <ToggleButton
                    actionId="scene_controls"
                    control={control}
                    key={control.groupId}
                    scope="scene"
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

      <div className="flex rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1 text-sm text-neutral-400">
        <IconButton
          actionId="scene_frame_reset"
          icon={ResetIcon}
          label="Reset Scene"
          onClick={refresh}
        />
        {playState !== "edit" && (
          <IconButton
            actionId="scene_frame_stop"
            icon={StopIcon}
            label="Stop Scene"
            onClick={() => setPlayState("edit")}
          />
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
        <Separator />
        <Menu
          onSelect={(value) => {
            switch (value) {
              case "camera_default":
                setPlayCamera("default");
                break;

              case "camera_editor":
                setPlayCamera("editor");
                break;

              default:
                send("extension-point-triggered", {
                  id: value,
                  scope: "scene",
                });
                break;
            }
          }}
        >
          <MenuTrigger className="rounded outline-1 outline-offset-1 outline-blue-400 peer-hover:bg-white/5 peer-focus-visible:outline">
            <IconButton
              actionId={"(UNSAFE_SKIP)"}
              icon={GearIcon}
              label="Settings"
              onClick={() => {}}
            />
          </MenuTrigger>
          {groupOptionsByGroup(settings)?.map(([groupName, options], index) => {
            const optionsJsx = options.map((option) =>
              "type" in option ? (
                <hr key={index} />
              ) : (
                <MenuOption
                  actionId={`scene_config_${option.id}`}
                  key={option.id}
                  value={option.id}
                >
                  {option.label}
                </MenuOption>
              ),
            );

            if (groupName) {
              return (
                <MenuOptionGroup key={groupName} label={groupName}>
                  {optionsJsx}
                </MenuOptionGroup>
              );
            } else {
              return <Fragment key={index}>{optionsJsx}</Fragment>;
            }
          })}
        </Menu>
      </div>
    </div>
  );
}
