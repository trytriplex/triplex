/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import { type DragLocationHistory } from "@atlaskit/pragmatic-drag-and-drop/types";
import { LayersIcon } from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { useTelemetry } from "@triplex/ux";
import { Suspense, useEffect, useRef, useState } from "react";
import { IconButton } from "../../components/button";
import { Surface } from "../../components/surface";
import { useSceneStore } from "../../stores/scene";
import { ElementSelect } from "./element-select";
import { ElementsPanel, FilterElements } from "./panel-elements";
import { SelectionPanel } from "./panel-selection";

const panelSize = {
  max: 2024,
  min: 128,
};

function getProposedWidth({
  initialWidth,
  location,
}: {
  initialWidth: number;
  location: DragLocationHistory;
}): number {
  const diffX = location.current.input.clientX - location.initial.input.clientX;
  const proposedWidth = initialWidth + diffX;
  return Math.min(Math.max(panelSize.min, proposedWidth), panelSize.max);
}

export function PanelContainer({
  children,
  isExpanded,
}: {
  children: React.ReactNode;
  isExpanded: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [persistedWidth, setPersistedWidth] = useState(192);
  const [state, setState] = useState<"idle" | "drag">("idle");
  const telemetry = useTelemetry();

  useEffect(() => {
    if (!ref.current || !isExpanded) {
      return;
    }

    return draggable({
      element: ref.current,
      getInitialData() {
        const width = containerRef.current?.getBoundingClientRect().width;
        if (!width) {
          throw new Error("invariant: container resolved to no width");
        }

        return { width };
      },
      onDrag({ location, source }) {
        const initialWidth: number = Number(source.data.width);

        containerRef.current?.style.setProperty(
          "--local-resizing-width",
          `${getProposedWidth({ initialWidth, location })}px`,
        );
      },
      onDragStart() {
        telemetry.event("scenepanel_resize_start");
        setState("drag");
      },
      onDrop({ location, source }) {
        const initialWidth: number = Number(source.data.width);

        telemetry.event("scenepanel_resize_end");
        setState("idle");
        preventUnhandled.stop();
        setPersistedWidth(getProposedWidth({ initialWidth, location }));
        containerRef.current?.style.removeProperty("--local-resizing-width");
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        disableNativeDragPreview({ nativeSetDragImage });
        preventUnhandled.start();
      },
    });
  }, [isExpanded, telemetry]);

  return (
    <div className="relative flex">
      <Surface
        className={cn([
          "border-overlay flex flex-col border-r",
          isExpanded && "flex-shrink-0",
        ])}
        ref={containerRef}
        shape="square"
        style={{
          width: isExpanded
            ? `clamp(${panelSize.min}px, var(--local-resizing-width, ${persistedWidth}px), 50vw)`
            : undefined,
        }}
        testId="panels"
      >
        {children}
      </Surface>
      {isExpanded && (
        <div
          className={cn([
            state === "drag" && "opacity-100",
            "absolute -right-0.5 bottom-0 top-0 z-10 w-1 cursor-col-resize bg-[var(--vscode-sash-hoverBorder)] opacity-0 delay-0 duration-100 hover:opacity-100 hover:transition-opacity hover:delay-200 hover:duration-150",
          ])}
          data-testid="panel-drag-handle"
          ref={ref}
        />
      )}
    </div>
  );
}

export function Panels() {
  const [shown, setShown] = useState<"elements" | undefined>(undefined);
  const play = useSceneStore((store) => store.playState);
  const selected = useSceneStore((store) => store.selected);

  if (play.state === "play") {
    return null;
  }

  return (
    <PanelContainer isExpanded={!!shown}>
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
    </PanelContainer>
  );
}
