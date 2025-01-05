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
  StopIcon,
} from "@radix-ui/react-icons";
import { on, send, type Controls } from "@triplex/bridge/host";
import { cn } from "@triplex/lib";
import {
  ButtonControl,
  ButtonGroupControl,
  ToggleButtonControl,
  useTelemetry,
  type ActionId,
} from "@triplex/ux";
import { useEffect, useState } from "react";
import { IconButton } from "../../components/button";
import { Separator } from "../../components/separator";
import { Surface } from "../../components/surface";
import { onVSCE } from "../../util/bridge";
import { useSceneEvents, useScenePlayState } from "../app-root/context";

export function FloatingControls() {
  const [controls, setControls] = useState<Controls>();
  const play = useScenePlayState();
  const { setPlayState: dispatch } = useSceneEvents();
  const telemetry = useTelemetry();

  useEffect(() => {
    return on("set-extension-points", (data) => {
      setControls(data.scene);
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
                          actionId={("scene_controls_" + id) as ActionId}
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
                        actionId={("scene_controls_" + id) as ActionId}
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
                        actionId={("scene_controls_" + id) as ActionId}
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
        <Separator />
        {play.state !== "edit" && (
          <IconButton
            actionId="scene_frame_stop"
            icon={StopIcon}
            label="Stop"
            onClick={() => dispatch("state-edit")}
          />
        )}

        <div className="hover:bg-hover flex">
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

          <IconButton
            actionId="scene_frame_playoptions"
            icon={CaretDownIcon}
            label={
              play.camera === "default"
                ? "Set Play Camera (Default)"
                : "Set Play Camera (Editor)"
            }
            onClick={(e) => {
              if ("clientX" in e && e.target) {
                e.target.dispatchEvent(
                  new MouseEvent("contextmenu", {
                    bubbles: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                  }),
                );
              }
            }}
            spacing="thin"
            vscodeContext={{
              path: window.triplex.initialState.path,
              webviewSection: "play-camera",
            }}
          />
        </div>
      </Surface>
    </div>
  );
}
