/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  BoxIcon,
  Cross1Icon,
  DesktopIcon,
  EnterFullScreenIcon,
  LaptopIcon,
  MobileIcon,
} from "@radix-ui/react-icons";
import { compose } from "@triplex/bridge/host";
import { useEvent } from "@triplex/lib";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { IconButton } from "./ds/button";
import { cn } from "./ds/cn";
import { Pressable } from "./ds/pressable";
import { useCanvasStage } from "./stores/canvas-stage";

const EMPTY_ORIGIN = [0, 0];
const FRAME_SIZES = {
  desktop: [1600, 900],
  laptop: [1280, 720],
  mobile: [390, 844],
  square: [600, 600],
} satisfies Record<string, [number, number]>;

export function Stage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null!);
  const canvasRef = useRef<HTMLDivElement>(null!);
  const deltaFromOrigin = useRef(EMPTY_ORIGIN);
  const initialMousePosition = useRef<false | [number, number]>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [frameSize, setFrameSize] = useState<[number, number]>(
    FRAME_SIZES.square,
  );
  const frame = useCanvasStage((store) => store.frame);
  const setFrame = useCanvasStage((store) => store.setFrame);
  const zoom = useCanvasStage((store) => store.canvasZoom);
  const setCanvasZoom = useCanvasStage((store) => store.setCanvasZoom);
  const canvasZoomRef = useRef<number>(undefined);
  const resetZoomCounter = useCanvasStage((store) => store.resetZoomCounter);
  const increaseZoom = useCanvasStage((store) => store.increaseZoom);
  const decreaseZoom = useCanvasStage((store) => store.decreaseZoom);
  const fitFrameToViewportCounter = useCanvasStage(
    (store) => store.fitFrameToViewportCounter,
  );
  const normalizedZoom = zoom / 100;
  const frameRatio =
    frameSize[0] / frameSize[1] > 1 ? "horizontal" : "vertical";

  useEffect(() => {
    if (frame === "expanded") {
      return;
    }

    return compose([
      window.triplex.accelerator("CommandOrCtrl+=", increaseZoom),
      window.triplex.accelerator("CommandOrCtrl+-", decreaseZoom),
    ]);
  }, [decreaseZoom, frame, increaseZoom]);

  const sizeFrameToCanvas = useEvent((opts?: { zoomIn: boolean }) => {
    const nextZoom = Math.min(
      Math.round(
        (ref.current.clientWidth / canvasRef.current.clientWidth) * 100,
      ),
      Math.round(
        (ref.current.clientHeight / canvasRef.current.clientHeight) * 100,
      ),
    );

    const frameRatio = ref.current.clientWidth / ref.current.clientHeight;
    const canvasRatio =
      canvasRef.current.clientWidth / canvasRef.current.clientHeight;

    if (opts?.zoomIn || nextZoom <= 100) {
      // Only apply zoom > 100 if zoomIn is true.
      const mod1 = Math.max(frameRatio, canvasRatio);
      const mod2 = Math.min(frameRatio, canvasRatio);
      const zoomOffset = Math.floor((mod2 / mod1) * 10);

      setCanvasZoom(nextZoom - zoomOffset);
    } else {
      setCanvasZoom(100);
    }

    resetCanvasTransforms();
  });

  const resetCanvasTransforms = useEvent(() => {
    canvasRef.current.style.setProperty("--tw-translate-x", null);
    canvasRef.current.style.setProperty("--tw-translate-y", null);
    deltaFromOrigin.current = EMPTY_ORIGIN;
  });

  useEffect(() => {
    sizeFrameToCanvas({ zoomIn: true });
  }, [
    // fitFrameToViewportCounter isn't used directly but should trigger a resize when changed.
    fitFrameToViewportCounter,
    sizeFrameToCanvas,
  ]);

  useEffect(() => {
    sizeFrameToCanvas();
  }, [
    // frame isn't used directly but should trigger a resize when changed.
    frame,
    sizeFrameToCanvas,
  ]);

  useEffect(() => {
    // Apply this to a ref to access it later.
    canvasZoomRef.current = normalizedZoom;
  }, [normalizedZoom]);

  useEffect(() => {
    if (!resetZoomCounter) {
      return;
    }

    resetCanvasTransforms();
  }, [resetCanvasTransforms, resetZoomCounter]);

  useEffect(() => {
    if (frame === "expanded") {
      return;
    }

    const mouseDownHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        !ref.current.contains(target) ||
        target.parentElement?.hasAttribute("data-block-dragging")
      ) {
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

      const currentX = e.clientX;
      const currentY = e.clientY;
      const [startX, startY] = initialMousePosition.current;

      // Persist the delta so we can use it again later.
      deltaFromOrigin.current = [
        deltaFromOrigin.current[0] + (currentX - startX),
        deltaFromOrigin.current[1] + (currentY - startY),
      ];

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

  const onBlanketClickHandler = useEvent(() => {
    setIsActive(true);
  });

  const onCanvasClickHandler = useEvent(() => {
    setIsActive(false);
  });

  useEffect(() => {
    sizeFrameToCanvas();
  }, [frameSize, sizeFrameToCanvas]);

  return (
    <Pressable
      className="flex h-full w-full items-center justify-center"
      data-testid="stage"
      onPress={isDragging || !isActive ? undefined : onCanvasClickHandler}
      pressActionId="scene_frame_blur"
      ref={ref}
      tabIndex={-1}
    >
      <div
        className={cn([
          frame === "expanded" && "h-full w-full",
          "relative flex-shrink-0 transform-gpu bg-white/5 outline",
          isActive ? "outline-blue-400" : "outline-neutral-700",
          isDragging && "pointer-events-none",
        ])}
        data-testid="frame"
        ref={canvasRef}
        style={
          frame === "intrinsic"
            ? ({
                "--tw-scale-x": normalizedZoom,
                "--tw-scale-y": normalizedZoom,
                height: frameSize[1],
                outlineWidth: normalizedZoom < 1 ? 1 / normalizedZoom : 1,
                width: frameSize[0],
              } as CSSProperties)
            : undefined
        }
      >
        {frame === "intrinsic" && isActive && isDragging && (
          <div className="absolute inset-0" />
        )}

        {frame === "intrinsic" && !isActive && (
          <Pressable
            className="absolute inset-0 hover:outline"
            label="Activate Frame"
            onPress={onBlanketClickHandler}
            pressActionId="scene_frame_focus"
            style={{
              outlineWidth: normalizedZoom < 1 ? 1 / normalizedZoom : 1,
            }}
          />
        )}

        {frame === "intrinsic" && isActive && (
          <div
            className={cn([
              "absolute",
              frameRatio === "horizontal" &&
                "bottom-full left-0 mb-1.5 flex origin-bottom-left",
              frameRatio === "vertical" &&
                "right-full top-0 mr-1.5 origin-top-right",
            ])}
            data-block-dragging
            style={{
              transform: `perspective(1px) translateZ(0) scale(${
                1 / normalizedZoom
              })`,
            }}
          >
            <IconButton
              actionId="scene_frame_expand"
              icon={EnterFullScreenIcon}
              label="Expand Frame"
              onClick={() => {
                setFrame("expanded");
                deltaFromOrigin.current = [0, 0];
              }}
              size="sm"
            />
            <IconButton
              actionId="scene_frame_square"
              icon={BoxIcon}
              isSelected={frameSize === FRAME_SIZES.square}
              label="Set Square Frame"
              onClick={() => {
                setFrameSize(FRAME_SIZES.square);
              }}
              size="sm"
            />
            <IconButton
              actionId="scene_frame_mobile"
              icon={MobileIcon}
              isSelected={frameSize === FRAME_SIZES.mobile}
              label="Set Mobile Frame"
              onClick={() => {
                setFrameSize(FRAME_SIZES.mobile);
              }}
              size="sm"
            />
            <IconButton
              actionId="scene_frame_laptop"
              icon={LaptopIcon}
              isSelected={frameSize === FRAME_SIZES.laptop}
              label="Set Laptop Frame"
              onClick={() => {
                setFrameSize(FRAME_SIZES.laptop);
              }}
              size="sm"
            />
            <IconButton
              actionId="scene_frame_desktop"
              icon={DesktopIcon}
              isSelected={frameSize === FRAME_SIZES.desktop}
              label="Set Desktop Frame"
              onClick={() => {
                setFrameSize(FRAME_SIZES.desktop);
              }}
              size="sm"
            />
            {import.meta.env.VITE_TRIPLEX_ENV === "test" && (
              <IconButton
                actionId="(UNSAFE_SKIP)"
                icon={Cross1Icon}
                label="Deactivate Frame"
                onClick={onCanvasClickHandler}
                size="sm"
              />
            )}
          </div>
        )}

        {children}

        {frame === "intrinsic" && isActive && (
          <div
            className="flex origin-top justify-center"
            style={{
              transform: `perspective(1px) translateZ(0) scale(${
                1 / normalizedZoom
              })`,
            }}
          >
            <div className="flex items-center gap-0.5 rounded-b-sm bg-blue-400 px-2 py-1 text-xs leading-none text-neutral-900">
              <span>{frameSize[0]}</span>
              <span>×</span>
              <span>{frameSize[1]}</span>
            </div>
          </div>
        )}
      </div>
    </Pressable>
  );
}
