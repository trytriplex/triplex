/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import type {
  BooleanLiteralType,
  DeclaredProp,
  NumberLiteralType,
  Prop,
  StringLiteralType,
} from "@triplex/server";
import { MathUtils } from "three";
import { IDELink } from "../util/ide";
import { ColorInput } from "./color-input";
import { StringInput } from "./string-input";
import { BooleanInput } from "./boolean-input";
import { NumberInput } from "./number-input";
import { TupleInput } from "./array-input";
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
  testId,
}: {
  name: string;
  column?: number;
  line?: number;
  prop: DeclaredProp | Prop;
  path: string;
  required?: boolean;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
  testId?: string;
}) {
  const isUnhandled =
    ("valueKind" in prop &&
      (prop.valueKind === "unhandled" || prop.valueKind === "identifier")) ||
    prop.kind === "unhandled";

  if (isUnhandled) {
    return (
      <IDELink
        path={path}
        column={column || -1}
        line={line || -1}
        title={
          "value" in prop && prop.value
            ? "This prop is controlled by code."
            : "This field is not supported, please raise an issue on Github."
        }
        className="flex h-[26px] items-center gap-0.5 overflow-hidden rounded-md border border-transparent bg-white/5 px-1 py-0.5 text-sm hover:bg-white/10 focus-visible:border-blue-400"
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-neutral-400">
          {"value" in prop && prop.value ? (
            `{${prop.value}}`
          ) : (
            <i className="text-neutral-500">Unsupported</i>
          )}
        </span>
        <div className="ml-auto flex-shrink-0 text-orange-600">
          <ExclamationTriangleIcon />
        </div>
      </IDELink>
    );
  }

  if (prop.kind === "union") {
    const isLiteralUnion = prop.shape.every(
      (
        value
      ): value is NumberLiteralType | StringLiteralType | BooleanLiteralType =>
        (value.kind === "string" ||
          value.kind === "number" ||
          value.kind === "boolean") &&
        "literal" in value
    );

    if (isLiteralUnion) {
      return (
        <LiteralUnionInput
          required={required}
          defaultValue={"value" in prop ? prop.value : undefined}
          values={prop.shape as (NumberLiteralType | StringLiteralType)[]}
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
          defaultValue={"value" in prop ? prop.value : undefined}
          path={path}
          // If the order of the values change blow re-mount the component so
          // it resets to displaying the first element in the shape array.
          key={JSON.stringify(prop.shape[0])}
          values={prop.shape}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );
    }
  }

  if (prop.kind === "tuple") {
    return (
      <TupleInput
        required={required}
        values={prop.shape}
        name={name}
        value={"value" in prop ? prop.value : []}
        path={path}
        column={column}
        line={line}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  }

  if (prop.kind === "number" && name.startsWith("rotation")) {
    // We handle rotation differently because we need to convert rads to degs.
    return (
      <NumberInput
        required={required}
        defaultValue={"value" in prop ? prop.value : undefined}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        label={prop.label}
        testId={testId}
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
  } else if (prop.kind === "number") {
    return (
      <NumberInput
        testId={testId}
        required={required}
        defaultValue={"value" in prop ? prop.value : undefined}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        label={prop.label}
      />
    );
  } else if (prop.kind === "boolean") {
    return (
      <BooleanInput
        defaultValue={"value" in prop ? prop.value : false}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        label={prop.label}
      />
    );
  } else if (prop.kind === "string") {
    if (isColorProp(name)) {
      return (
        <ColorInput
          defaultValue={"value" in prop ? prop.value : undefined}
          required={prop.required}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );
    }

    return (
      <StringInput
        required={required}
        defaultValue={"value" in prop ? prop.value : undefined}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        label={prop.label}
      />
    );
  }

  throw new Error("invariant");
}
