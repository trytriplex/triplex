/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useEffect, useLayoutEffect, useState } from "react";

export interface Modifiers {
  ctrl: boolean;
  shift: boolean;
}

export function applyStepModifiers(
  steps: number | { ctrl: number; default: number },
  modifiers: Modifiers,
) {
  let step: number;

  if (modifiers.ctrl) {
    if (typeof steps === "number") {
      step = steps * 25;
    } else {
      step = steps.ctrl;
    }
  } else {
    step = typeof steps === "number" ? steps : steps.default;
  }

  if (modifiers.shift) {
    step /= 10;
  }

  return step;
}

export function useStepModifiers({
  isDisabled,
}: { isDisabled?: boolean } = {}): Modifiers {
  const [modifiers, setModifiers] = useState<Modifiers>({
    ctrl: false,
    shift: false,
  });

  useLayoutEffect(() => {
    if (isDisabled) {
      return;
    }

    return () => {
      setModifiers({ ctrl: false, shift: false });
    };
  }, [isDisabled]);

  useEffect(() => {
    if (isDisabled) {
      return;
    }

    const keydownHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        setModifiers((prev) => ({ ...prev, ctrl: true }));
      }

      if (e.shiftKey) {
        setModifiers((prev) => ({ ...prev, shift: true }));
      }
    };

    const keyupHandler = (e: KeyboardEvent) => {
      setModifiers({ ctrl: e.ctrlKey, shift: e.shiftKey });
    };

    window.addEventListener("keydown", keydownHandler);
    window.addEventListener("keyup", keyupHandler);

    return () => {
      window.removeEventListener("keydown", keydownHandler);
      window.removeEventListener("keyup", keyupHandler);
    };
  }, [isDisabled]);

  return modifiers;
}
