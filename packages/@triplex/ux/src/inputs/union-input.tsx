/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { Type } from "@triplex/server";
import { useCallback, useLayoutEffect, useReducer, useRef } from "react";
import { PropInput } from "./prop-input";
import { type RenderInputsWithAction } from "./types";

export function UnionInput({
  children,
  defaultValue,
  description,
  name,
  onChange,
  onConfirm,
  path,
  persistedValue,
  required,
  tags,
  values,
}: {
  children: RenderInputsWithAction<{ toggle: () => void }>;
  defaultValue?: string | number | boolean | unknown[];
  description?: string;
  name: string;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
  path: string;
  persistedValue?: string | number | boolean | unknown[];
  required?: boolean;
  tags?: Record<string, string | number | boolean>;
  values: Type[];
}) {
  const [index, toggle] = useReducer((prev: number) => prev + 1, 0);
  const value = values[index % values.length];
  const ref = useRef<HTMLDivElement>(null);
  const hasToggled = useRef(false);

  const cycleThroughPropTypes = useCallback(() => {
    hasToggled.current = true;
    toggle();
  }, []);

  useLayoutEffect(() => {
    if (hasToggled.current && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" });
    }
  }, [index]);

  return (
    <>
      <PropInput
        onChange={onChange}
        onConfirm={onConfirm}
        path={path}
        prop={
          Object.assign(
            { description, name, required, tags },
            value,
            defaultValue !== undefined ? { value: defaultValue } : {},
            persistedValue !== undefined ? { value: persistedValue } : {},
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as any
        }
      >
        {(props) => children(props, { toggle: cycleThroughPropTypes })}
      </PropInput>
      <div ref={ref} />
    </>
  );
}
