/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  Cross2Icon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@radix-ui/react-icons";
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  MouseEventHandler,
} from "react";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { sentenceCase } from "../util/string";
import { usePropTags } from "./prop-input";

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
  modifiers: { ctrl: boolean; shift: boolean }
) {
  let iterations = Math.abs(delta);

  if (modifiers.ctrl) {
    return 1;
  }

  return iterations;
}

export function NumberInput({
  defaultValue,
  label,
  name,
  onChange,
  onConfirm,
  required,
  transformValue = { in: (value) => value, out: (value) => value },
}: {
  defaultValue?: number;
  label?: string;
  name: string;
  onChange: (value: number | undefined) => void;
  onConfirm: (value: number | undefined) => void;
  required?: boolean;
  transformValue?: {
    in: (value: number | undefined) => number | undefined;
    out: (value: number | undefined) => number | undefined;
  };
}) {
  const [isPointerLock, setIsPointerLock] = useState(false);
  const [modifier, setModifier] = useState({ shift: false, ctrl: false });
  const step = stepModifier(modifier);
  const isDragging = useRef(false);
  const ref = useRef<HTMLInputElement>(null!);
  const tags = usePropTags();
  const transformedDefaultValue = transformValue.in(defaultValue);

  const onChangeHandler = useCallback(() => {
    const nextValue = Number.isNaN(ref.current.valueAsNumber)
      ? undefined
      : ref.current.valueAsNumber;

    onChange(transformValue.out(nextValue));
  }, [onChange, transformValue]);

  const onBlurHandler = useCallback(() => {
    const nextValue = Number.isNaN(ref.current.valueAsNumber)
      ? undefined
      : ref.current.valueAsNumber;

    if (nextValue === undefined && required) {
      // Skip handler if the next value is undefined and it's required
      return;
    }

    if (defaultValue !== nextValue) {
      onConfirm(transformValue.out(nextValue));
    }
  }, [defaultValue, onConfirm, required, transformValue]);

  const clearInputValue = useCallback(() => {
    onChange(undefined);
    onConfirm(undefined);
  }, [onChange, onConfirm]);

  const onMouseMoveHandler: MouseEventHandler = useCallback(
    (e) => {
      if (isPointerLock) {
        isDragging.current = true;
        const iterations = getIterations(e.movementX, modifier);
        const stepFunc = getStepFunc(e.movementX, ref.current);

        for (let i = 0; i < iterations; i++) {
          // Call the step function for each pixel of movement.
          // The further the distance the more times the step func
          // Is called.
          stepFunc();
        }

        onChangeHandler();
      }
    },
    [isPointerLock, modifier, onChangeHandler]
  );

  const onMouseUpHandler: MouseEventHandler = useCallback(async () => {
    if (!isDragging.current) {
      // A drag was never started so focus on the input instead.
      ref.current.focus();
      ref.current.select();
    }

    if (isPointerLock) {
      await document.exitPointerLock();
      setIsPointerLock(false);
      onBlurHandler();
    } else {
      // The pointer lock was aborted with escape, nothing to do.
    }

    isDragging.current = false;
  }, [isPointerLock, onBlurHandler]);

  const onMouseDownHandler: MouseEventHandler = useCallback(async (e) => {
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
    await ref.current.requestPointerLock({
      unadjustedMovement: true,
    });
    setIsPointerLock(true);
  }, []);

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

  return (
    <div
      className={cn([
        "group relative flex w-full items-center rounded-md border border-transparent bg-white/5 focus-within:border-blue-400 hover:bg-white/10",
        !required
          ? "focus-within:pl-1 focus-within:pr-0.5"
          : "focus-within:px-1",
        "pl-4 pr-4",
      ])}
    >
      <input
        className="peer w-full cursor-col-resize text-ellipsis bg-transparent py-0.5 text-center text-sm text-neutral-300 outline-none [color-scheme:dark] [font-variant-numeric:tabular-nums] placeholder:italic placeholder:text-neutral-500 focus:cursor-text focus:text-left"
        data-testid={`number-${defaultValue}`}
        defaultValue={transformedDefaultValue}
        id={name}
        key={defaultValue}
        max={typeof tags.max === "boolean" ? undefined : tags.max}
        min={typeof tags.min === "boolean" ? undefined : tags.min}
        onBlur={onBlurHandler}
        onChange={onChangeHandler}
        onMouseDown={onMouseDownHandler}
        onMouseMove={onMouseMoveHandler}
        onMouseUp={onMouseUpHandler}
        placeholder={label ? sentenceCase(label) : undefined}
        ref={ref}
        required={required}
        step={step}
        type="number"
      />

      <button
        className="absolute bottom-0 left-0 top-0 flex w-4 cursor-default items-center justify-center text-neutral-400 opacity-30 hover:bg-white/5 hover:opacity-100 focus:opacity-100 active:bg-white/10 peer-hover:opacity-100 peer-focus:opacity-0"
        onBlur={onBlurHandler}
        onClick={incrementDown}
        tabIndex={-1}
        type="button"
      >
        <CaretLeftIcon />
      </button>

      <button
        className="absolute bottom-0 right-0 top-0 flex w-4 cursor-default items-center justify-center text-neutral-400 opacity-30 hover:bg-white/5 hover:opacity-100 focus:opacity-100 active:bg-white/10 peer-hover:opacity-100 peer-focus:opacity-0"
        onBlur={onBlurHandler}
        onClick={incrementUp}
        tabIndex={-1}
        type="button"
      >
        <CaretRightIcon />
      </button>

      {!required && (
        <IconButton
          className="hidden peer-focus:block"
          icon={Cross2Icon}
          onClick={clearInputValue}
          size="tight"
          title="Clear value"
        />
      )}
    </div>
  );
}
