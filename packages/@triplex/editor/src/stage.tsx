/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  Cross1Icon,
  DimensionsIcon,
  EnterFullScreenIcon,
} from "@radix-ui/react-icons";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
} from "react";
import { IconButton } from "./ds/button";
import { cn } from "./ds/cn";
import { useCanvasStage } from "./stores/canvas-stage";
import useEvent from "./util/use-event";

const EMPTY_ORIGIN = [0, 0];
const FRAME_SIZES: [number, number][] = [
  [200, 500],
  [600, 400],
];

export function Stage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null!);
  const canvasRef = useRef<HTMLDivElement>(null!);
  const deltaFromOrigin = useRef(EMPTY_ORIGIN);
  const initialMousePosition = useRef<false | [number, number]>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [frameSizeIndex, setFrameSizeIndex] = useState<number>();
  const frame = useCanvasStage((store) => store.frame);
  const setFrame = useCanvasStage((store) => store.setFrame);
  const canvasZoom = useCanvasStage((store) => store.canvasZoom);
  const canvasZoomRef = useRef<number>();
  const frameSize = FRAME_SIZES[frameSizeIndex || 0];

  useEffect(() => {
    // Apply this to a ref to access it later.
    canvasZoomRef.current = canvasZoom;
  }, [canvasZoom]);

  useEffect(() => {
    if (frame === "expanded") {
      return;
    }

    const mouseDownHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!ref.current.contains(target) || target.role === "button") {
        // Ensure only elements inside the stage can be dragged.
        return;
      }

      initialMousePosition.current = [e.clientX, e.clientY];
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!initialMousePosition.current) {
        return;
      }

      setIsDragging(true);

      const currentX = e.clientX;
      const currentY = e.clientY;
      const [startX, startY] = initialMousePosition.current;
      const deltaX = deltaFromOrigin.current[0] + (currentX - startX);
      const deltaY = deltaFromOrigin.current[1] + (currentY - startY);

      canvasRef.current.style.setProperty("--tw-translate-x", `${deltaX}px`);
      canvasRef.current.style.setProperty("--tw-translate-y", `${deltaY}px`);
    };

    const mouseUpHandler = (e: MouseEvent) => {
      if (!initialMousePosition.current) {
        return;
      }

      e.stopImmediatePropagation();

      const currentX = e.clientX;
      const currentY = e.clientY;
      const [startX, startY] = initialMousePosition.current;

      // Persist the delta so we can use it again later.
      deltaFromOrigin.current[0] =
        deltaFromOrigin.current[0] + (currentX - startX);
      deltaFromOrigin.current[1] =
        deltaFromOrigin.current[1] + (currentY - startY);

      initialMousePosition.current = false;

      requestAnimationFrame(() => {
        setIsDragging(false);
      });
    };

    document.addEventListener("mousedown", mouseDownHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    return () => {
      document.removeEventListener("mousedown", mouseDownHandler);
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
  }, [frame]);

  const onBlanketClickHandler: MouseEventHandler<HTMLButtonElement> = useEvent(
    (e) => {
      e.stopPropagation();
      setIsActive(true);
    }
  );

  const onCanvasClickHandler = useEvent(() => {
    setIsActive(false);
  });

  useEffect(() => {
    canvasRef.current.style.setProperty("--tw-translate-x", null);
    canvasRef.current.style.setProperty("--tw-translate-y", null);
  }, [frame]);

  useLayoutEffect(() => {
    if (frameSizeIndex === undefined || FRAME_SIZES.length <= 1) {
      // Size hasn't been set during this session yet, bail out!
      return;
    }

    const zoom = canvasZoomRef.current;
    if (zoom === undefined) {
      throw new Error("invariant");
    }

    // We use the index directly as we want to get the previous
    // value to do some calculations for keeping the top right edge
    // of the frames aligned at all times when switching sizes.
    const current = FRAME_SIZES.at(frameSizeIndex)!;
    const previous = FRAME_SIZES.at(frameSizeIndex - 1)!;
    const currentFramePoint = [
      (current[0] / 2) * zoom,
      (current[1] / 2) * zoom,
    ];
    const previousFramePoint = [
      (previous[0] / 2) * zoom,
      (previous[1] / 2) * zoom,
    ];
    const framePointDiff = [
      currentFramePoint[0] - previousFramePoint[0],
      currentFramePoint[1] - previousFramePoint[1],
    ];

    const deltaX = framePointDiff[0] + deltaFromOrigin.current[0];
    const deltaY = framePointDiff[1] + deltaFromOrigin.current[1];

    canvasRef.current.style.setProperty("--tw-translate-x", `${deltaX}px`);
    canvasRef.current.style.setProperty("--tw-translate-y", `${deltaY}px`);
    deltaFromOrigin.current = [deltaX, deltaY];
  }, [frameSizeIndex]);

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      data-testid="stage"
      onClick={isDragging ? undefined : onCanvasClickHandler}
      ref={ref}
    >
      <div
        className={cn([
          frame === "expanded" && "h-full w-full",
          "relative flex-shrink-0 transform-gpu bg-white/5 outline",
          isActive
            ? "outline-2 outline-blue-400"
            : "outline-1 outline-neutral-700",
          isDragging && "pointer-events-none",
        ])}
        data-testid="frame"
        ref={canvasRef}
        style={
          frame === "intrinsic"
            ? ({
                "--tw-scale-x": canvasZoom,
                "--tw-scale-y": canvasZoom,
                height: frameSize[1],
                width: frameSize[0],
              } as CSSProperties)
            : undefined
        }
      >
        {frame === "intrinsic" && !isActive && (
          <button
            aria-label="Activate Frame"
            className="absolute inset-0 cursor-default outline outline-1 outline-transparent hover:outline-blue-400"
            onClick={onBlanketClickHandler}
          />
        )}

        {children}

        {frame === "intrinsic" && isActive && (
          <>
            <div
              className="absolute -top-1 right-full mr-1.5 origin-top-right"
              style={{
                transform: `perspective(1px) translateZ(0) scale(${
                  1 / canvasZoom
                })`,
              }}
            >
              <IconButton
                actionId="set_frame_size"
                icon={DimensionsIcon}
                label="Set Frame Size"
                onClick={() => {
                  setFrameSizeIndex(
                    (prev = 0) => (prev + 1) % FRAME_SIZES.length
                  );
                }}
                size="sm"
              />
              <IconButton
                actionId="expand_frame"
                icon={EnterFullScreenIcon}
                label="Expand Frame"
                onClick={() => {
                  setFrame("expanded");
                  deltaFromOrigin.current = [0, 0];
                }}
                size="sm"
              />
              <IconButton
                actionId="deactivate_frame"
                className="mt-3"
                icon={Cross1Icon}
                label="Deactivate Frame"
                onClick={onCanvasClickHandler}
                size="sm"
              />
            </div>
            <div
              className="flex origin-top justify-center"
              style={{
                transform: `perspective(1px) translateZ(0) scale(${
                  1 / canvasZoom
                })`,
              }}
            >
              <div className="flex items-center gap-0.5 rounded-b-sm bg-blue-400 px-2 py-1 text-xs leading-none text-neutral-900">
                <span>{frameSize[0]}</span>
                <span>×</span>
                <span>{frameSize[1]}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
