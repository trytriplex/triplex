/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  CaretLeftIcon,
  CaretRightIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { IconButton } from "../ds/button";
import { Pressable } from "../ds/pressable";
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
  const iterations = Math.abs(delta);

  if (modifiers.ctrl) {
    return 1;
  }

  return iterations;
}

function toNumber(
  num: string | number | boolean | undefined,
  defaultValue: number
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
  defaultValue,
  label,
  name,
  onChange,
  onConfirm,
  required,
  testId,
  transformValue = { in: (value) => value, out: (value) => value },
}: {
  defaultValue?: number;
  label?: string;
  name: string;
  onChange: (value: number | undefined) => void;
  onConfirm: (value: number | undefined) => void;
  required?: boolean;
  testId?: string;
  transformValue?: {
    in: (value: number | undefined) => number | undefined;
    out: (value: number | undefined) => number | undefined;
  };
}) {
  const [isPointerLock, setIsPointerLock] = useState(false);
  const [modifier, setModifier] = useState({ ctrl: false, shift: false });
  const step = stepModifier(modifier);
  const isDragging = useRef(false);
  const ref = useRef<HTMLInputElement>(null!);
  const tags = usePropTags();
  const max = toNumber(tags.max, Number.POSITIVE_INFINITY);
  const min = toNumber(tags.min, Number.NEGATIVE_INFINITY);
  const transformedDefaultValue = transformValue.in(defaultValue);

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

  const onBlurHandler = useCallback(() => {
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
    }
  }, [transformValue, required, min, max, transformedDefaultValue, onConfirm]);

  const clearInputValue = useCallback(() => {
    if (defaultValue !== undefined) {
      onChange(undefined);
      onConfirm(undefined);
    }

    ref.current.focus();
  }, [defaultValue, onChange, onConfirm]);

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
    [isPointerLock, modifier, onChangeHandler]
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
      onBlurHandler();
    } else {
      // The pointer lock was aborted with escape, nothing to do.
    }

    isDragging.current = false;
  }, [isPointerLock, onBlurHandler]);

  const onMouseDownHandler: MouseEventHandler = useCallback(async (e) => {
    if (document.activeElement === ref.current) {
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
      className="group relative flex w-full items-center rounded-md border border-transparent bg-white/5 px-4 focus-within:border-blue-400 focus-within:pl-1 focus-within:pr-0.5 hover:bg-white/10"
      data-testid={isPointerLock ? "pointer-lock" : undefined}
    >
      <input
        className="peer w-full cursor-col-resize text-ellipsis bg-transparent py-0.5 text-center text-sm text-neutral-300 outline-none [color-scheme:dark] [font-variant-numeric:tabular-nums] placeholder:italic placeholder:text-neutral-500 focus:cursor-text focus:text-left"
        data-testid={testId || `number-${defaultValue}`}
        defaultValue={transformedDefaultValue}
        id={name}
        key={defaultValue}
        max={max}
        min={min}
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

      <div className="pointer-events-none absolute -inset-[1px] hidden rounded-md border border-red-400 border-transparent peer-invalid:block peer-focus:hidden" />

      <Pressable
        className="absolute bottom-0 left-0 top-0 flex w-4 cursor-default items-center justify-center text-neutral-300 opacity-20 hover:flex hover:bg-white/5 hover:opacity-100 focus:flex active:bg-white/10 peer-hover:opacity-100 peer-focus:hidden"
        label={`Decrease by ${step}`}
        onBlur={onBlurHandler}
        onPress={incrementDown}
        pressActionId="decrement_number_input"
        tabIndex={-1}
        testId={testId && `${testId}-decrement`}
      >
        <CaretLeftIcon />
      </Pressable>

      <Pressable
        className="absolute bottom-0 right-0 top-0 flex w-4 cursor-default items-center justify-center text-neutral-300 opacity-20 hover:flex hover:bg-white/5 hover:opacity-100 focus:flex active:bg-white/10 peer-hover:opacity-100 peer-focus:hidden"
        label={`Increase by ${step}`}
        onBlur={onBlurHandler}
        onPress={incrementUp}
        pressActionId="increment_number_input"
        tabIndex={-1}
        testId={testId && `${testId}-increment`}
      >
        <CaretRightIcon />
      </Pressable>

      {!required && (
        <IconButton
          actionId="clear_number_input"
          className="z-50 hidden group-focus-within:block"
          icon={Cross2Icon}
          label="Clear value"
          onClick={clearInputValue}
          size="xs"
          testId={testId && `${testId}-clear`}
        />
      )}
    </div>
  );
}
