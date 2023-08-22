/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useState } from "react";
import { SwitchIcon } from "@radix-ui/react-icons";
import type { Type } from "@triplex/server";
import { PropInput } from "./prop-input";
import { IconButton } from "../ds/button";

export function UnionInput({
  values,
  name,
  onChange,
  onConfirm,
  path,
  defaultValue,
  required,
  line,
  column,
}: {
  line?: number;
  column?: number;
  required?: boolean;
  defaultValue?: string | number;
  path: string;
  name: string;
  values: Type[];
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
}) {
  const [index, setIndex] = useState(0);
  const value = values[index % values.length];
  const incrementIndex = () => {
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-1">
        <PropInput
          required={required}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
          path={path}
          line={line}
          column={column}
          prop={
            Object.assign(
              {},
              value,
              defaultValue ? { value: defaultValue } : {}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any
          }
        />
      </div>
      <div className="self-start">
        <IconButton
          icon={SwitchIcon}
          title="Switch prop type"
          onClick={incrementIndex}
        />
      </div>
    </div>
  );
}
