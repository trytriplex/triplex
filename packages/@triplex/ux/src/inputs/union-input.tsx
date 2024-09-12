/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { Type } from "@triplex/server";
import { useReducer } from "react";
import { PropInput } from "./prop-input";
import { type RenderInputsWithAction } from "./types";

export function UnionInput({
  children,
  description,
  name,
  onChange,
  onConfirm,
  path,
  persistedValue,
  tags,
  values,
}: {
  children: RenderInputsWithAction<{ toggle: () => void }>;
  description?: string;
  name: string;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
  path: string;
  persistedValue?: string | number | boolean;
  tags?: Record<string, string | number | boolean>;
  values: Type[];
}) {
  const [index, toggle] = useReducer((prev: number) => prev + 1, 0);
  const value = values[index % values.length];

  return (
    <PropInput
      onChange={onChange}
      onConfirm={onConfirm}
      path={path}
      prop={
        Object.assign(
          { description, name, tags },
          value,
          persistedValue ? { value: persistedValue } : {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any
      }
    >
      {(props) => children(props, { toggle })}
    </PropInput>
  );
}
