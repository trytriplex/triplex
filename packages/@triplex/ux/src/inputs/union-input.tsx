/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { Type } from "@triplex/server";
import { useState } from "react";
import { PropInput } from "./prop-input";
import { type RenderInputs } from "./types";

export function UnionInput({
  children,
  onChange,
  onConfirm,
  persistedValue,
  values,
}: {
  children: RenderInputs;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
  persistedValue?: string | number | boolean;
  values: Type[];
}) {
  const [index] = useState(0);
  const value = values[index % values.length];

  return (
    <PropInput
      onChange={onChange}
      onConfirm={onConfirm}
      props={[
        Object.assign(
          {},
          value,
          persistedValue ? { value: persistedValue } : {}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any,
      ]}
    >
      {children}
    </PropInput>
  );
}
