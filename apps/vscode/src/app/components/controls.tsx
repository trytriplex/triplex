/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CaretDownIcon, PlayIcon } from "@radix-ui/react-icons";
import { on, type Controls } from "@triplex/bridge/host";
import {
  ButtonControl,
  ButtonGroupControl,
  cn,
  ToggleButtonControl,
} from "@triplex/ux";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";

export function Controls() {
  const [controls, setControls] = useState<Controls>();

  useEffect(() => {
    return on("set-controls", (data) => {
      setControls(data.controls);
    });
  }, []);

  if (!controls) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-2 z-10 flex justify-center gap-1">
      <div className="bg-overlay border-overlay shadow-overlay pointer-events-auto flex rounded border p-0.5">
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
        <div className="hover:bg-hover flex">
          <VSCodeButton appearance="icon">
            <PlayIcon />
          </VSCodeButton>
          <VSCodeButton appearance="icon" className="-ml-0.5">
            <CaretDownIcon className="-mx-1" />
          </VSCodeButton>
        </div>
      </div>
    </div>
  );
}
