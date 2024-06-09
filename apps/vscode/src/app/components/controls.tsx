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
  type ActionId,
} from "@triplex/ux";
import { useEffect, useReducer, useState } from "react";
import { onVSCE } from "../util/bridge";
import { IconButton } from "./button";
import { Separator } from "./separator";

interface PlayState {
  camera: "default" | "editor";
  state: "play" | "pause" | "edit";
}

type StateAction =
  | "camera-default"
  | "camera-editor"
  | "state-play"
  | "state-pause"
  | "state-edit";

function playReducer(state: PlayState, action: StateAction): PlayState {
  switch (action) {
    case "camera-default":
      return { ...state, camera: "default" };

    case "camera-editor":
      return { ...state, camera: "editor" };

    case "state-play":
      return { ...state, state: "play" };

    case "state-pause":
      return { ...state, state: "pause" };

    case "state-edit":
      return { ...state, state: "edit" };

    default:
      return state;
  }
}

export function Controls() {
  const [controls, setControls] = useState<Controls>();
  const [play, dispatch] = useReducer(playReducer, {
    camera: "editor",
    state: "edit",
  });

  useEffect(() => {
    return on("set-controls", (data) => {
      setControls(data.controls);
    });
  }, []);

  useEffect(() => {
    send("request-state-change", play);
  }, [play]);

  useEffect(() => {
    return onVSCE("vscode:play-camera", ({ name }) => {
      dispatch(name === "default" ? "camera-default" : "camera-editor");
    });
  }, []);

  if (!controls) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 top-2 z-10 flex justify-center gap-1"
      data-vscode-context={JSON.stringify({
        preventDefaultContextMenuItems: true,
      })}
    >
      <div
        className={cn([
          "bg-overlay border-overlay shadow-overlay pointer-events-auto flex rounded border p-0.5",
          play.state === "play" && "hidden",
        ])}
        // @ts-expect-error — updating React types will make this go away
        inert={play.state === "play" ? "true" : undefined}
      >
        {controls.map((control, index) => {
          switch (control.type) {
            case "separator": {
              return <Separator key={control.type + index} />;
            }

            case "button-group": {
              return (
                <ButtonGroupControl control={control} key={control.id}>
                  {({ Icon, accelerator, id, isSelected, label, onClick }) => (
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
                <ToggleButtonControl control={control} key={control.id}>
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
                <ButtonControl control={control} key={control.id}>
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
      </div>

      <div className="bg-overlay border-overlay shadow-overlay pointer-events-auto flex rounded border p-0.5">
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
                  })
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
      </div>
    </div>
  );
}
