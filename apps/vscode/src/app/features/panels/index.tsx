/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { LayersIcon } from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { Suspense, useState } from "react";
import { IconButton } from "../../components/button";
import { Surface } from "../../components/surface";
import { ElementsPanel } from "./panel-elements";
import { SelectionPanel } from "./panel-selection";

export function Panels() {
  const [shown, setShown] = useState<"elements" | undefined>(undefined);

  return (
    <div
      className={cn([
        "border-overlay flex flex-col border-r",
        shown && "w-48 flex-shrink-0",
      ])}
    >
      <div
        className={cn([
          !shown &&
            "bg-overlay border-overlay absolute left-[5px] top-[5px] gap-1 rounded border p-0.5",
          shown && "p-1.5",
          "z-10 flex flex-col items-start opacity-90",
        ])}
      >
        <IconButton
          actionId="scenepanel_elements_toggle"
          icon={LayersIcon}
          isSelected={shown === "elements"}
          label="View Scene Elements"
          onClick={() =>
            setShown(shown === "elements" ? undefined : "elements")
          }
          spacing={shown ? "spacious" : "default"}
        />
      </div>

      {shown === "elements" && (
        <Suspense>
          <Surface
            className="grid w-full flex-1 flex-shrink-0 grid-rows-[1fr_2fr] overflow-hidden"
            shape="square"
          >
            <ElementsPanel />
            <Suspense>
              <SelectionPanel />
            </Suspense>
          </Surface>
        </Suspense>
      )}
    </div>
  );
}
