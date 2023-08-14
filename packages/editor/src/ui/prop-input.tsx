/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import type { Prop } from "@triplex/server";
import { MathUtils } from "three";
import { IDELink } from "../util/ide";
import { ColorInput } from "./color-input";
import { StringInput } from "./string-input";
import { BooleanInput } from "./boolean-input";
import { NumberInput } from "./number-input";
import { ArrayInput } from "./array-input";
import { LiteralUnionInput } from "./literal-union-input";
import { UnionInput } from "./union-input";
import { createContext, useContext } from "react";

export const PropTagContext = createContext<
  Record<string, string | number | boolean | undefined>
>({});

export const usePropTags = () => {
  return useContext(PropTagContext);
};

function isColorProp(name: string) {
  const includeList = ["emissive"];
  if (name.toLowerCase().endsWith("color")) {
    return true;
  }

  if (includeList.includes(name)) {
    return true;
  }

  return false;
}

export function PropInput({
  prop,
  path,
  name,
  column,
  line,
  onChange,
  onConfirm,
  required,
}: {
  name: string;
  column?: number;
  line?: number;
  prop: Prop;
  path: string;
  required?: boolean;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
}) {
  if (prop.type === "union") {
    const isLiteralUnion = prop.values.every(
      (value) =>
        (value.type === "string" || value.type === "number") &&
        value.value !== undefined
    );

    if (isLiteralUnion) {
      return (
        <LiteralUnionInput
          required={required}
          defaultValue={prop.value}
          values={prop.values}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );
    } else {
      return (
        <UnionInput
          line={line}
          column={column}
          required={required}
          defaultValue={prop.value}
          path={path}
          values={prop.values}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );
    }
  }

  if (prop.type === "array") {
    return (
      <ArrayInput
        required={required}
        values={prop.value}
        name={name}
        path={path}
        column={column}
        line={line}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  }

  if (prop.type === "number" && name.startsWith("rotation")) {
    // We handle rotation differently because we need to convert rads to degs.
    return (
      <NumberInput
        required={required}
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        label={prop.label}
        // There may be cases where this isn't desirable. Perhaps someone
        // Already does this in userland and it will result in a double conversion.
        // If this becomes a problem we can add the ability to turn it off but that
        // Will require a larger overall refactor for how we handle prop inputs.
        transformValue={{
          in: (value) => value && MathUtils.radToDeg(value),
          out: (value) => value && MathUtils.degToRad(value),
        }}
      />
    );
  } else if (prop.type === "number") {
    return (
      <NumberInput
        required={required}
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        label={prop.label}
      />
    );
  } else if (prop.type === "boolean") {
    return (
      <BooleanInput
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        label={prop.label}
      />
    );
  } else if (prop.type === "string" && isColorProp(name)) {
    return (
      <ColorInput
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  } else if (prop.type === "string") {
    return (
      <StringInput
        required={required}
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        label={prop.label}
      />
    );
  }

  return (
    <IDELink
      path={path}
      column={column || -1}
      line={line || -1}
      title="This prop is controlled by code."
      className="flex h-[26px] items-center gap-0.5 overflow-hidden rounded-md border border-transparent bg-white/5 px-1 py-0.5 text-sm hover:bg-white/10 focus-visible:border-blue-400"
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-neutral-400">{`{${prop.value}}`}</span>
      <div className="ml-auto flex-shrink-0 text-orange-600">
        <ExclamationTriangleIcon />
      </div>
    </IDELink>
  );
}
