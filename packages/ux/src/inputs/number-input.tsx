/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import {
  applyStepModifiers,
  useEvent,
  useStepModifiers,
  type Modifiers,
} from "@triplex/lib";
import { bindAll } from "bind-event-listener";
import {
  useEffect,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type PointerEventHandler,
} from "react";
import { useTelemetry, type ActionIdSafe } from "../telemetry";
import { type RenderInput } from "./types";

function getStepFunc(delta: number, element: HTMLInputElement) {
  if (delta > 0) {
    return () => element.stepUp();
  }

  if (delta < 0) {
    return () => element.stepDown();
  }

  return () => {};
}

function getIterations(delta: number, modifiers: Modifiers) {
  const iterations = Math.abs(delta);

  if (modifiers.ctrl) {
    return 1;
  }

  return iterations;
}

function toNumber(
  num: string | number | boolean | undefined,
  defaultValue: number,
): number {
  if (typeof num === "number") {
    return num;
  }

  if (typeof num === "string") {
    return Number(num);
  }

  return defaultValue;
}

type DragState =
  | {
      state: "idle";
    }
  | { state: "dragging" }
  | { initialScreenX: number; state: "testing" };

const DRAG_START_DELTA = 5;

export function NumberInput({
  actionId,
  children,
  defaultValue,
  label,
  name,
  onChange,
  onConfirm,
  persistedValue,
  pointerMode = "lock",
  required,
  transformValue = { in: (value) => value, out: (value) => value },
  ...tags
}: {
  actionId: ActionIdSafe;
  children: RenderInput<
    {
      defaultValue: number | undefined;
      max: number;
      min: number;
      onBlur: FocusEventHandler<HTMLInputElement>;
      onKeyDown: KeyboardEventHandler<HTMLInputElement>;
      onPointerDown: PointerEventHandler<HTMLInputElement>;
      onPointerMove: PointerEventHandler<HTMLInputElement>;
      onPointerUp: PointerEventHandler<HTMLInputElement>;
      placeholder?: string;
      step: "any" | number;
    },
    HTMLInputElement,
    {
      clear: () => void;
      decrement: () => void;
      increment: () => void;
      isActive: boolean;
    }
  >;
  defaultValue?: number;
  label?: string;
  max?: number;
  min?: number;
  name: string;
  onChange: (value: number | undefined) => void;
  onConfirm: (value: number | undefined) => void;
  persistedValue?: number;
  pointerMode?: "capture" | "lock";
  required?: boolean;
  step?: number;
  testId?: string;
  transformValue?: {
    in: (value: number | undefined) => number | undefined;
    out: (value: number | undefined) => number | undefined;
  };
}) {
  const telemetry = useTelemetry();
  const pointerCaptureFallback =
    pointerMode === "capture" || navigator.platform.startsWith("Linux");
  const [isPointerLock, setIsPointerLock] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const modifiers = useStepModifiers({
    isDisabled: !isPointerLock && !isFocused,
  });
  const dragState = useRef<DragState>({ state: "idle" });
  const activePointerCaptureId = useRef<number | undefined>(undefined);
  const ref = useRef<HTMLInputElement>(null!);
  const step = applyStepModifiers(toNumber(tags.step, 0.02), modifiers);
  const max = toNumber(tags.max, Number.POSITIVE_INFINITY);
  const min = toNumber(tags.min, Number.NEGATIVE_INFINITY);
  const actualValue = transformValue.in(persistedValue ?? defaultValue);
  const isActive = isFocused || isPointerLock;

  useEffect(() => {
    ref.current.value = actualValue !== undefined ? `${actualValue}` : "";
  }, [actualValue]);

  const onChangeHandler = useEvent(() => {
    const nextValue = Number.isNaN(ref.current.valueAsNumber)
      ? undefined
      : transformValue.out(ref.current.valueAsNumber);

    if (typeof nextValue === "number" && (min > nextValue || max < nextValue)) {
      // Next value is outside the min / max range so skip the handler.
      return;
    }

    onChange(nextValue);
  });

  const onConfirmHandler = useEvent(() => {
    const nextValue = Number.isNaN(ref.current.valueAsNumber)
      ? undefined
      : transformValue.out(ref.current.valueAsNumber);

    if (nextValue === undefined && required) {
      // Skip handler if the next value is undefined and it's required
      return;
    }

    if (typeof nextValue === "number" && (min > nextValue || max < nextValue)) {
      // Next value is outside the min / max range so skip the handler.
      return;
    }

    if (actualValue !== nextValue) {
      onConfirm(nextValue);
      telemetry.event(`${actionId}_confirm`);
    }
  });

  const clearInputValue = useEvent(() => {
    if (persistedValue !== undefined) {
      onChange(undefined);
      onConfirm(undefined);
      telemetry.event(`${actionId}_clear`);
    }

    ref.current.focus();
  });

  const onPointerMoveHandler: PointerEventHandler = useEvent((e) => {
    if (isPointerLock) {
      if (dragState.current.state === "idle") {
        dragState.current = {
          initialScreenX: e.screenX,
          state: "testing",
        };
      } else if (dragState.current.state === "testing") {
        const delta = e.screenX - dragState.current.initialScreenX;

        if (Math.abs(delta) > DRAG_START_DELTA) {
          dragState.current = { state: "dragging" };
        }
      } else if (dragState.current.state === "dragging") {
        const movement =
          // When running tests we use clientX purely as JSDOM doesn't support
          // Setting movementX. It's shit but at least this let's test things.
          // See: https://github.com/jsdom/jsdom/issues/3209
          process.env.NODE_ENV === "test" ? e.clientX : e.movementX;
        const iterations = getIterations(movement, modifiers);
        const stepFunc = getStepFunc(movement, ref.current);

        for (let i = 0; i < iterations; i++) {
          // Call the step function for each pixel of movement.
          // The further the distance the more times the step func
          // Is called.
          stepFunc();
        }

        onChangeHandler();
      }
    }
  });

  const onPointerUpHandler: PointerEventHandler = useEvent(async (e) => {
    if (dragState.current.state !== "dragging") {
      // A drag was never started so focus on the input instead.
      ref.current.focus();
      ref.current.select();
    }

    if (isPointerLock) {
      if (pointerCaptureFallback) {
        ref.current.releasePointerCapture(e.pointerId);
      } else {
        await document.exitPointerLock?.();
      }
      setIsPointerLock(false);
      onConfirmHandler();
    } else {
      // The pointer lock was aborted with escape, nothing to do.
    }

    dragState.current = { state: "idle" };
  });

  const onPointerDownHandler: PointerEventHandler = useEvent(async (e) => {
    if (document.activeElement === ref.current || e.button !== 0) {
      // We're focused in the input already, bail out!
      return;
    }

    e.preventDefault();

    if (document.activeElement?.tagName === "IFRAME") {
      // If it's an iframe blur so the events get captured for mouse down / mouse up.
      const element: HTMLIFrameElement =
        document.activeElement as HTMLIFrameElement;
      element.blur();
    }

    if (pointerCaptureFallback) {
      activePointerCaptureId.current = e.pointerId;
      ref.current.setPointerCapture(e.pointerId);
    } else {
      await ref.current.requestPointerLock?.({
        // We use unadjusted movement as on Windows odd behavior occurs without it, such as
        // mouse move events being fired before moving the mouse, and HUGE values for e.movementX.
        unadjustedMovement: true,
      });
    }

    setIsPointerLock(true);
  });

  const onKeyDownHandler: KeyboardEventHandler<HTMLInputElement> = useEvent(
    (e) => {
      if (
        e.key === "Enter" &&
        e.currentTarget.valueAsNumber >= min &&
        e.currentTarget.valueAsNumber <= max
      ) {
        ref.current.blur();
      }
    },
  );

  const incrementUp = useEvent(() => {
    ref.current.stepUp();
    onChangeHandler();
  });

  const incrementDown = useEvent(() => {
    ref.current.stepDown();
    onChangeHandler();
  });

  const resetToInitialValue = useEvent(() => {
    if (typeof actualValue === "number") {
      ref.current.valueAsNumber = actualValue;
    } else {
      ref.current.value = "";
    }

    onChangeHandler();
  });

  useEffect(() => {
    const element = ref.current;

    return bindAll(element, [
      {
        listener: () => {
          setIsFocused(true);
        },
        type: "focus",
      },
      {
        listener: () => {
          setIsFocused(false);
        },
        type: "blur",
      },
    ]);
  }, []);

  useEffect(() => {
    if (!isPointerLock) {
      return;
    }

    return bindAll(document, [
      {
        listener: () => {
          if (document.pointerLockElement !== ref.current) {
            setIsPointerLock(false);
            resetToInitialValue();
          }
        },
        type: "pointerlockchange",
      },
      {
        listener: (e) => {
          if (e.key === "Escape" && activePointerCaptureId.current) {
            e.stopPropagation();
            setIsPointerLock(false);
            ref.current.releasePointerCapture(activePointerCaptureId.current);
            resetToInitialValue();
          }
        },
        type: "keydown",
      },
    ]);
  }, [isPointerLock, onChangeHandler, actualValue, resetToInitialValue]);

  return children(
    {
      defaultValue: actualValue,
      id: name,
      max,
      min,
      onBlur: onConfirmHandler,
      onChange: onChangeHandler,
      onKeyDown: onKeyDownHandler,
      onPointerDown: onPointerDownHandler,
      onPointerMove: onPointerMoveHandler,
      onPointerUp: onPointerUpHandler,
      placeholder: label ? `${label} (number)` : "number",
      ref,
      required,
      // We conditionally apply this as the step attribute brings along validation
      // which we can't control. Since we use step here as only a modifier / guide and
      // not validation it's set to "any" when not active.
      step: isActive ? step : "any",
    },
    {
      clear: clearInputValue,
      decrement: incrementDown,
      increment: incrementUp,
      isActive: isFocused || isPointerLock,
    },
  );
}
