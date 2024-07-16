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
import { useSceneStore } from "../../stores/scene";
import { ElementSelect } from "./element-select";
import { ElementsPanel, FilterElements } from "./panel-elements";
import { SelectionPanel } from "./panel-selection";

export function Panels() {
  const [shown, setShown] = useState<"elements" | undefined>(undefined);
  const play = useSceneStore((store) => store.playState);
  const selected = useSceneStore((store) => store.selected);

  if (play.state === "play") {
    return null;
  }

  return (
    <Surface
      className={cn([
        "border-overlay flex flex-col border-r",
        shown && "w-48 flex-shrink-0",
      ])}
      shape="square"
      testId="panels"
    >
      <div
        className={cn([
          !shown &&
            "bg-overlay border-overlay absolute left-[5px] top-[5px] rounded border p-0.5",
          shown && "relative gap-1 p-1.5",
          "z-20 flex items-start opacity-90",
        ])}
      >
        <IconButton
          actionId="scenepanel_elements_toggle"
          icon={LayersIcon}
          isSelected={!!selected || shown === "elements"}
          label="View Scene Elements"
          onClick={() =>
            setShown(shown === "elements" ? undefined : "elements")
          }
          spacing={shown ? "spacious" : "default"}
        />
        {shown && (
          <>
            <ElementSelect />
            <FilterElements />
          </>
        )}
      </div>

      {shown === "elements" && (
        <Suspense>
          <div className="grid h-full overflow-hidden [grid-auto-rows:1fr_2fr]">
            <ElementsPanel />
            <Suspense>
              <SelectionPanel />
            </Suspense>
          </div>
        </Suspense>
      )}
    </Surface>
  );
}
