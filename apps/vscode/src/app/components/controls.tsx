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
import {
  ButtonControl,
  ButtonGroupControl,
  cn,
  ToggleButtonControl,
} from "@triplex/ux";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useEffect, useReducer, useState } from "react";
import { onVSCE } from "../util/bridge";

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
      data-vscode-context='{"preventDefaultContextMenuItems": true}'
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
              return (
                <div
                  className="border-r-overlay -my-0.5 mx-0.5 border-r"
                  key={control.type + index}
                />
              );
            }

            case "button-group": {
              return (
                <ButtonGroupControl control={control} key={control.id}>
                  {({ Icon, isSelected, label, onClick }) => (
                    <div
                      className={cn([
                        "relative -my-0.5 flex py-0.5",
                        isSelected &&
                          "after:border-b-selected after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b",
                      ])}
                      key={label}
                    >
                      <VSCodeButton
                        appearance="icon"
                        aria-label={label}
                        className={
                          isSelected ? "bg-selected text-selected" : ""
                        }
                        onClick={onClick}
                        title={label}
                      >
                        <Icon />
                      </VSCodeButton>
                    </div>
                  )}
                </ButtonGroupControl>
              );
            }

            case "toggle-button": {
              return (
                <ToggleButtonControl control={control} key={control.id}>
                  {({ Icon, label, onClick }) => (
                    <VSCodeButton
                      appearance="icon"
                      aria-label={label}
                      key={label}
                      onClick={onClick}
                      title={label}
                    >
                      <Icon />
                    </VSCodeButton>
                  )}
                </ToggleButtonControl>
              );
            }

            case "button": {
              return (
                <ButtonControl control={control} key={control.id}>
                  {({ Icon, label, onClick }) => (
                    <VSCodeButton
                      appearance="icon"
                      aria-label={label}
                      key={label}
                      onClick={onClick}
                      title={label}
                    >
                      <Icon />
                    </VSCodeButton>
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
        {play.state !== "edit" && (
          <>
            <VSCodeButton
              appearance="icon"
              aria-label="Reset"
              onClick={() => send("request-refresh-scene", undefined)}
              title="Reset"
            >
              <ResetIcon />
            </VSCodeButton>
            <VSCodeButton appearance="icon" aria-label="Stop" title="Stop">
              <StopIcon onClick={() => dispatch("state-edit")} />
            </VSCodeButton>
          </>
        )}

        <div className="hover:bg-hover flex">
          {play.state === "play" && (
            <VSCodeButton appearance="icon" aria-label="Pause" title="Pause">
              <PauseIcon onClick={() => dispatch("state-pause")} />
            </VSCodeButton>
          )}
          {play.state !== "play" && (
            <VSCodeButton appearance="icon" aria-label="Play" title="Play">
              <PlayIcon onClick={() => dispatch("state-play")} />
            </VSCodeButton>
          )}

          <VSCodeButton
            appearance="icon"
            aria-label="Set Play Camera"
            className="-ml-0.5"
            data-vscode-context='{"webviewSection": "play-camera"}'
            onClick={(e) => {
              e.target.dispatchEvent(
                new MouseEvent("contextmenu", {
                  bubbles: true,
                  clientX: e.clientX,
                  clientY: e.clientY,
                })
              );
            }}
            title={
              play.camera === "default"
                ? "Set Play Camera (Default)"
                : "Set Play Camera (Editor)"
            }
          >
            <CaretDownIcon className="-mx-1" />
          </VSCodeButton>
        </div>
      </div>
    </div>
  );
}
