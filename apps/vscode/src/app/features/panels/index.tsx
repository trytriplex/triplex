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
import { LayersIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { fg } from "@triplex/lib/fg";
import { SubsequentSuspense, useScreenView, useTelemetry } from "@triplex/ux";
import { Suspense, useEffect, useRef, useState } from "react";
import { IconButton } from "../../components/button";
import { ScrollContainer } from "../../components/scroll-container";
import { SkeletonList, SkeletonText } from "../../components/skeleton";
import { Surface } from "../../components/surface";
import {
  useSceneContext,
  useSceneEvents,
  useScenePlayState,
  useSceneSelected,
} from "../app-root/context";
import { HasWarningsDot } from "../warnings/warning-has-warnings";
import { WarningRequiredProps } from "../warnings/warning-required-props";
import { ElementSelect } from "./element-select";
import { ElementsPanel, FilterElements } from "./panel-elements";
import { ProviderControlsPanel } from "./panel-provider";
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
          "flex flex-col",
          isExpanded && "flex-shrink-0 border-r",
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
            "absolute -right-1.5 bottom-0 top-0 z-10 w-2 cursor-col-resize border-l-4 border-[var(--vscode-sash-hoverBorder)] opacity-0 delay-0 duration-100 hover:opacity-100 hover:transition-opacity hover:delay-200 hover:duration-150",
          ])}
          data-testid="panel-drag-handle"
          ref={ref}
        />
      )}
    </div>
  );
}

export function Panels() {
  const [shown, setShown] = useState<"elements" | undefined>("elements");
  const play = useScenePlayState();
  const { blurElement, focusElement } = useSceneEvents();
  const context = useSceneContext();
  const selected = useSceneSelected();
  const isComponentControlsShown = selected && "exportName" in selected;
  const ref = useRef<HTMLDivElement>(null);

  useScreenView("scene", "Panel", shown === "elements");

  useEffect(() => {
    ref.current?.scroll({ top: 0 });
  }, [selected]);

  if (play.state === "play") {
    return null;
  }

  return (
    <PanelContainer isExpanded={!!shown}>
      <div
        className={cn([
          shown
            ? "relative gap-1 p-1.5"
            : "bg-overlay border-overlay absolute left-[5px] top-[5px] rounded border p-0.5",
          "z-20 flex items-start opacity-90",
        ])}
      >
        <IconButton
          actionId={
            shown === "elements"
              ? "scenepanel_elements_close"
              : "scenepanel_elements_open"
          }
          icon={LayersIcon}
          isSelected={!!selected || shown === "elements"}
          label="View Scene Elements"
          onClick={() =>
            setShown(shown === "elements" ? undefined : "elements")
          }
          spacing={shown ? "spacious" : "default"}
        />
        <div className={shown ? "contents" : "hidden"}>
          <ElementSelect />
          <IconButton
            actionId="scenepanel_component_controls"
            icon={Pencil2Icon}
            isSelected={isComponentControlsShown}
            label={
              isComponentControlsShown
                ? "Close Component Controls"
                : "Open Component Controls"
            }
            onClick={() => {
              if (isComponentControlsShown) {
                blurElement();
              } else {
                focusElement({
                  column: -1,
                  exportName: context.exportName,
                  line: -1,
                  parentPath: "",
                  path: context.path,
                });
              }
            }}
            spacing="spacious"
          >
            {fg("required_props_indicator") && (
              <Suspense>
                <WarningRequiredProps />
              </Suspense>
            )}
          </IconButton>
          <FilterElements />
        </div>
        {!shown && <HasWarningsDot />}
      </div>

      <div
        className={shown ? "flex h-full flex-col overflow-hidden" : "hidden"}
      >
        <SubsequentSuspense
          fallback={
            <div className="flex flex-col px-4 py-1.5">
              <SkeletonList>
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
              </SkeletonList>
            </div>
          }
        >
          <ScrollContainer className="h-1/2">
            <ElementsPanel />
            <div className="h-1.5" />
          </ScrollContainer>
          <ScrollContainer className="border-overlay h-1/2 border-t" ref={ref}>
            {selected && <SelectionPanel />}
            <div className={selected ? "hidden" : undefined}>
              <ProviderControlsPanel />
            </div>
            <div className="h-1.5" />
          </ScrollContainer>
        </SubsequentSuspense>
      </div>
    </PanelContainer>
  );
}
