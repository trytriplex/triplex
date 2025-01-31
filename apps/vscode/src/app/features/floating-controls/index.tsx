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
  StopIcon,
} from "@radix-ui/react-icons";
import {
  on,
  send,
  type Controls,
  type MenuControl,
} from "@triplex/bridge/host";
import { cn } from "@triplex/lib";
import {
  ButtonControl,
  ButtonGroupControl,
  Menu,
  MenuOption,
  MenuTrigger,
  ToggleButtonControl,
  useTelemetry,
} from "@triplex/ux";
import { useEffect, useState } from "react";
import { IconButton } from "../../components/button";
import { Separator } from "../../components/separator";
import { Surface } from "../../components/surface";
import { onVSCE } from "../../util/bridge";
import { useSceneEvents, useScenePlayState } from "../app-root/context";

export function FloatingControls() {
  const [controls, setControls] = useState<Controls>();
  const [settingsOptions, setSettingsOptions] = useState<
    MenuControl["options"]
  >([]);
  const play = useScenePlayState();
  const { setPlayState: dispatch } = useSceneEvents();
  const telemetry = useTelemetry();

  useEffect(() => {
    return on("set-extension-points", (data) => {
      if (data.area === "scene") {
        setControls(data.controls);
      }

      if (data.area === "settings") {
        setSettingsOptions(data.options);
      }
    });
  }, []);

  useEffect(() => {
    send("request-state-change", play);
  }, [play]);

  useEffect(() => {
    return onVSCE("vscode:play-camera", ({ name }) => {
      telemetry.event(`scene_controls_camera_${name}`);
      dispatch(name === "default" ? "camera-default" : "camera-editor");
    });
  }, [dispatch, telemetry]);

  if (!controls) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 top-1.5 flex justify-center gap-1"
      data-vscode-context={JSON.stringify({
        preventDefaultContextMenuItems: true,
      })}
    >
      {controls.length > 0 && (
        <Surface
          bg="overlay"
          className="border p-0.5"
          direction="horizontal"
          isHidden={play.state === "play"}
        >
          {controls.map((control, index) => {
            switch (control.type) {
              case "separator": {
                return <Separator key={control.type + index} />;
              }

              case "button-group": {
                return (
                  <ButtonGroupControl
                    control={control}
                    key={control.groupId}
                    scope="scene"
                  >
                    {({
                      Icon,
                      accelerator,
                      id,
                      isSelected,
                      label,
                      onClick,
                    }) => (
                      <div
                        className={cn([
                          "relative -my-0.5 flex py-0.5",
                          isSelected &&
                            "after:border-b-selected after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b",
                        ])}
                        key={label}
                      >
                        <IconButton
                          accelerator={accelerator}
                          actionId={`scene_controls_${id}`}
                          icon={Icon}
                          isSelected={isSelected}
                          label={label}
                          onClick={onClick}
                        />
                      </div>
                    )}
                  </ButtonGroupControl>
                );
              }

              case "toggle-button": {
                return (
                  <ToggleButtonControl
                    control={control}
                    key={control.groupId}
                    scope="scene"
                  >
                    {({ Icon, accelerator, id, label, onClick }) => (
                      <IconButton
                        accelerator={accelerator}
                        actionId={`scene_controls_${id}`}
                        icon={Icon}
                        key={label}
                        label={label}
                        onClick={onClick}
                      />
                    )}
                  </ToggleButtonControl>
                );
              }

              case "button": {
                return (
                  <ButtonControl
                    control={control}
                    key={control.id}
                    scope="scene"
                  >
                    {({ Icon, accelerator, id, label, onClick }) => (
                      <IconButton
                        accelerator={accelerator}
                        actionId={`scene_controls_${id}`}
                        icon={Icon}
                        key={label}
                        label={label}
                        onClick={onClick}
                      />
                    )}
                  </ButtonControl>
                );
              }

              default:
                return null;
            }
          })}
        </Surface>
      )}

      <Surface bg="overlay" className="border p-0.5" direction="horizontal">
        <IconButton
          actionId="scene_frame_reset"
          icon={ResetIcon}
          label="Reset"
          onClick={() => send("request-refresh-scene", undefined)}
        />
        {play.state !== "edit" && (
          <IconButton
            actionId="scene_frame_stop"
            icon={StopIcon}
            label="Stop"
            onClick={() => dispatch("state-edit")}
          />
        )}
        {play.state === "play" && (
          <IconButton
            actionId="scene_frame_pause"
            icon={PauseIcon}
            label="Pause"
            onClick={() => dispatch("state-pause")}
          />
        )}
        {play.state !== "play" && (
          <IconButton
            actionId="scene_frame_play"
            icon={PlayIcon}
            label="Play"
            onClick={() => dispatch("state-play")}
          />
        )}
        <Separator />
        <Menu
          onSelect={(value) => {
            switch (value) {
              case "camera_default":
                dispatch("camera-default");
                break;

              case "camera_editor":
                dispatch("camera-editor");
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
          <MenuTrigger className="outline-default outline-selected peer-hover:bg-hover rounded peer-focus-visible:outline">
            <IconButton
              actionId={"(UNSAFE_SKIP)"}
              icon={GearIcon}
              label="Settings"
              onClick={() => {}}
            />
          </MenuTrigger>
          {settingsOptions.map((option, index) =>
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
          )}
        </Menu>
      </Surface>
    </div>
  );
}
