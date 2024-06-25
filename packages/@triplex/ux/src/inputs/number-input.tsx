/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useEvent } from "@triplex/lib";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";
import { useTelemetry, type ActionIdSafe } from "../telemetry";
import { type RenderInput } from "./types";

function stepModifier(modifiers: { ctrl: boolean; shift: boolean }) {
  let step = 0.02;

  if (modifiers.ctrl) {
    step *= 25;
  }

  if (modifiers.shift) {
    step /= 10;
  }

  return step;
}

function getStepFunc(delta: number, element: HTMLInputElement) {
  if (delta > 0) {
    return () => element.stepUp();
  }

  if (delta < 0) {
    return () => element.stepDown();
  }

  return () => {};
}

function getIterations(
  delta: number,
  modifiers: { ctrl: boolean; shift: boolean },
) {
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

export function NumberInput({
  actionId,
  children,
  label,
  name,
  onChange,
  onConfirm,
  persistedValue,
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
      onMouseDown: MouseEventHandler<HTMLInputElement>;
      onMouseMove: MouseEventHandler<HTMLInputElement>;
      onMouseUp: MouseEventHandler<HTMLInputElement>;
      placeholder?: string;
      step: number;
    },
    HTMLInputElement,
    {
      clear: () => void;
      decrement: () => void;
      increment: () => void;
    }
  >;
  label?: string;
  max?: number;
  min?: number;
  name: string;
  onChange: (value: number | undefined) => void;
  onConfirm: (value: number | undefined) => void;
  persistedValue?: number;
  required?: boolean;
  step?: number;
  testId?: string;
  transformValue?: {
    in: (value: number | undefined) => number | undefined;
    out: (value: number | undefined) => number | undefined;
  };
}) {
  const telemetry = useTelemetry();
  const isLinux = navigator.platform.startsWith("Linux");
  const [isPointerLock, setIsPointerLock] = useState(false);
  const [modifier, setModifier] = useState({ ctrl: false, shift: false });
  const isDragging = useRef(false);
  const ref = useRef<HTMLInputElement>(null!);
  const step = toNumber(tags.step, stepModifier(modifier));
  const max = toNumber(tags.max, Number.POSITIVE_INFINITY);
  const min = toNumber(tags.min, Number.NEGATIVE_INFINITY);
  const transformedDefaultValue = transformValue.in(persistedValue);

  useEffect(() => {
    ref.current.value =
      transformedDefaultValue !== undefined ? `${transformedDefaultValue}` : "";
  }, [transformedDefaultValue]);

  const onChangeHandler = useCallback(() => {
    const nextValue = Number.isNaN(ref.current.valueAsNumber)
      ? undefined
      : transformValue.out(ref.current.valueAsNumber);

    if (typeof nextValue === "number" && (min > nextValue || max < nextValue)) {
      // Next value is outside the min / max range so skip the handler.
      return;
    }

    onChange(nextValue);
  }, [max, min, onChange, transformValue]);

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

    if (transformedDefaultValue !== nextValue) {
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

  const onMouseMoveHandler: MouseEventHandler = useCallback(
    (e) => {
      if (isPointerLock) {
        isDragging.current = true;
        const movement =
          // When running tests we use clientX purely as JSDOM doesn't support
          // Setting movementX. It's shit but at least this let's test things.
          // See: https://github.com/jsdom/jsdom/issues/3209
          process.env.NODE_ENV === "test" ? e.clientX : e.movementX;
        const iterations = getIterations(movement, modifier);
        const stepFunc = getStepFunc(movement, ref.current);

        for (let i = 0; i < iterations; i++) {
          // Call the step function for each pixel of movement.
          // The further the distance the more times the step func
          // Is called.
          stepFunc();
        }

        onChangeHandler();
      }
    },
    [isPointerLock, modifier, onChangeHandler],
  );

  const onMouseUpHandler: MouseEventHandler = useCallback(async () => {
    if (!isDragging.current) {
      // A drag was never started so focus on the input instead.
      ref.current.focus();
      ref.current.select();
    }

    if (isPointerLock) {
      await document.exitPointerLock?.();
      setIsPointerLock(false);
      onConfirmHandler();
    } else {
      // The pointer lock was aborted with escape, nothing to do.
    }

    isDragging.current = false;
  }, [isPointerLock, onConfirmHandler]);

  const onMouseDownHandler: MouseEventHandler = useCallback(
    async (e) => {
      if (isLinux || document.activeElement === ref.current) {
        // Pointer lock isn't well supported on Linux so we ignore it.
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

      // @ts-expect-error Unadjusted movement isn't available in DOM types currently.
      // We use unadjusted movement as on Windows odd behaviour occurs without it
      // Such as mouse move events being fired before moving the mouse, and HUGE values
      // For e.movementX.
      await ref.current.requestPointerLock?.({
        unadjustedMovement: true,
      });

      setIsPointerLock(true);
    },
    [isLinux],
  );

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

  const incrementUp = useCallback(() => {
    ref.current.stepUp();
    onChangeHandler();
  }, [onChangeHandler]);

  const incrementDown = useCallback(() => {
    ref.current.stepDown();
    onChangeHandler();
  }, [onChangeHandler]);

  useEffect(() => {
    if (!isPointerLock) {
      return;
    }

    const callback = () => {
      if (document.pointerLockElement !== ref.current) {
        setIsPointerLock(false);

        if (typeof transformedDefaultValue === "number") {
          ref.current.valueAsNumber = transformedDefaultValue;
        } else {
          ref.current.value = "";
        }

        onChangeHandler();
      }
    };

    document.addEventListener("pointerlockchange", callback);

    return () => {
      document.removeEventListener("pointerlockchange", callback);
    };
  }, [isPointerLock, onChangeHandler, transformedDefaultValue]);

  useEffect(() => {
    if (!isPointerLock) {
      return;
    }

    const keydownHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        setModifier((prev) => ({ ...prev, ctrl: true }));
      }

      if (e.shiftKey) {
        setModifier((prev) => ({ ...prev, shift: true }));
      }
    };

    const keyupHandler = (e: KeyboardEvent) => {
      setModifier({ ctrl: e.ctrlKey, shift: e.shiftKey });
    };

    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("keyup", keyupHandler);

    return () => {
      document.removeEventListener("keydown", keydownHandler);
      document.removeEventListener("keyup", keyupHandler);
    };
  }, [isPointerLock]);

  return children(
    {
      defaultValue: transformedDefaultValue,
      id: name,
      max,
      min,
      onBlur: onConfirmHandler,
      onChange: onChangeHandler,
      onKeyDown: onKeyDownHandler,
      onMouseDown: onMouseDownHandler,
      onMouseMove: onMouseMoveHandler,
      onMouseUp: onMouseUpHandler,
      placeholder: label,
      ref,
      required,
      step,
    },
    {
      clear: clearInputValue,
      decrement: incrementDown,
      increment: incrementUp,
    },
  );
}
