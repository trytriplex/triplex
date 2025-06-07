/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type DragLocationHistory } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import { cn } from "@triplex/lib";
import { useTelemetry, type ActionContext } from "@triplex/ux";
import { useEffect, useRef, useState } from "react";
import { Surface } from "./surface";

const panelSize = {
  max: 2024,
  min: 128,
};

function getProposedWidth({
  initialWidth,
  location,
  splitterPosition,
}: {
  initialWidth: number;
  location: DragLocationHistory;
  splitterPosition: "start" | "end";
}): number {
  const diffX = location.current.input.clientX - location.initial.input.clientX;
  const proposedWidth =
    splitterPosition === "start" ? initialWidth - diffX : initialWidth + diffX;
  return Math.min(Math.max(panelSize.min, proposedWidth), panelSize.max);
}

export function ResizableSurface({
  actionId,
  children,
  className,
  initialWidth = 192,
  isDisabled,
  splitterPosition = "end",
}: {
  actionId: {
    resizeEnd: `${ActionContext}_resize_end`;
    resizeStart: `${ActionContext}_resize_start`;
  };
  children: React.ReactNode;
  className?: string;
  initialWidth?: number;
  isDisabled?: boolean;
  splitterPosition: "start" | "end";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [persistedWidth, setPersistedWidth] = useState(initialWidth);
  const [state, setState] = useState<"idle" | "drag">("idle");
  const telemetry = useTelemetry();

  useEffect(() => {
    if (!ref.current || isDisabled) {
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
          `${getProposedWidth({ initialWidth, location, splitterPosition })}px`,
        );
      },
      onDragStart() {
        telemetry.event(actionId.resizeStart);
        setState("drag");
      },
      onDrop({ location, source }) {
        const initialWidth: number = Number(source.data.width);

        telemetry.event(actionId.resizeEnd);
        setState("idle");
        preventUnhandled.stop();
        setPersistedWidth(
          getProposedWidth({ initialWidth, location, splitterPosition }),
        );
        containerRef.current?.style.removeProperty("--local-resizing-width");
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        disableNativeDragPreview({ nativeSetDragImage });
        preventUnhandled.start();
      },
    });
  }, [
    actionId.resizeEnd,
    actionId.resizeStart,
    isDisabled,
    splitterPosition,
    telemetry,
  ]);

  return (
    <div className="relative flex">
      <Surface
        className={cn([
          "flex flex-col",
          !isDisabled && "flex-shrink-0",
          className,
        ])}
        ref={containerRef}
        shape="square"
        style={{
          width: isDisabled
            ? undefined
            : `clamp(${panelSize.min}px, var(--local-resizing-width, ${persistedWidth}px), 50vw)`,
        }}
        testId="panels"
      >
        {children}
      </Surface>
      {!isDisabled && (
        <div
          className={cn([
            state === "drag" && "opacity-100",
            splitterPosition === "end" && "-right-1.5 border-l-4",
            splitterPosition === "start" && "-left-1.5 border-r-4",
            "absolute bottom-0 top-0 z-10 w-2 cursor-col-resize border-[var(--vscode-sash-hoverBorder)] opacity-0 delay-0 duration-100 hover:opacity-100 hover:transition-opacity hover:delay-200 hover:duration-150",
          ])}
          data-testid="panel-drag-handle"
          ref={ref}
        />
      )}
    </div>
  );
}
