/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import type {
  BooleanLiteralType,
  DeclaredProp,
  NumberLiteralType,
  Prop,
  StringLiteralType,
} from "@triplex/lib/types";
import { createContext, useContext } from "react";
import { MathUtils } from "three";
import { IDELink } from "../util/ide";
import { TupleInput } from "./array-input";
import { BooleanInput } from "./boolean-input";
import { ColorInput } from "./color-input";
import { LiteralUnionInput } from "./literal-union-input";
import { NumberInput } from "./number-input";
import { StringInput } from "./string-input";
import { UnionInput } from "./union-input";

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
  column,
  line,
  name,
  onChange,
  onConfirm,
  path,
  prop,
  required,
  testId,
}: {
  column?: number;
  line?: number;
  name: string;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
  path: string;
  prop: DeclaredProp | Prop;
  required?: boolean;
  testId?: string;
}) {
  const isUnhandled =
    ("valueKind" in prop &&
      (prop.valueKind === "unhandled" || prop.valueKind === "identifier")) ||
    prop.kind === "unhandled";

  if (isUnhandled) {
    return (
      <IDELink
        actionId={
          "value" in prop && prop.value
            ? "contextpanel_element_viewpropcodecontrolled"
            : "contextpanel_element_viewpropunsupported"
        }
        className="flex h-[26px] items-center gap-0.5 overflow-hidden rounded-md bg-white/5 px-1 py-0.5 text-sm hover:bg-white/10"
        column={column || -1}
        line={line || -1}
        path={path}
        title={
          "value" in prop && prop.value
            ? "This prop is controlled by code."
            : "This field is not supported, please raise an issue on Github."
        }
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
        value,
      ): value is NumberLiteralType | StringLiteralType | BooleanLiteralType =>
        (value.kind === "string" ||
          value.kind === "number" ||
          value.kind === "boolean") &&
        "literal" in value,
    );

    if (isLiteralUnion) {
      return (
        <LiteralUnionInput
          actionId="contextpanel_input_literalunion"
          defaultValue={"value" in prop ? prop.value : undefined}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
          required={required}
          values={prop.shape as (NumberLiteralType | StringLiteralType)[]}
        />
      );
    } else {
      return (
        <UnionInput
          actionId="contextpanel_input_union"
          column={column}
          defaultValue={"value" in prop ? prop.value : undefined}
          // If the order of the values change blow re-mount the component so
          // it resets to displaying the first element in the shape array.
          key={JSON.stringify(prop.shape[0])}
          line={line}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
          path={path}
          required={required}
          values={prop.shape}
        />
      );
    }
  }

  if (prop.kind === "tuple") {
    return (
      <TupleInput
        actionId="contextpanel_input_tuple"
        column={column}
        line={line}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        path={path}
        required={required}
        value={"value" in prop ? prop.value : []}
        values={prop.shape}
      />
    );
  }

  if (prop.kind === "number" && name.startsWith("rotation")) {
    // We handle rotation differently because we need to convert rads to degs.
    return (
      <NumberInput
        actionId="contextpanel_input_number"
        defaultValue={"value" in prop ? prop.value : undefined}
        label={prop.label}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        required={required}
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
        actionId="contextpanel_input_number"
        defaultValue={"value" in prop ? prop.value : undefined}
        label={prop.label}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        required={required}
        testId={testId}
      />
    );
  } else if (prop.kind === "boolean") {
    return (
      <BooleanInput
        actionId="contextpanel_input_boolean"
        defaultValue={"value" in prop ? prop.value : false}
        label={prop.label}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  } else if (prop.kind === "string") {
    if (isColorProp(name)) {
      return (
        <ColorInput
          actionId="contextpanel_input_color"
          defaultValue={"value" in prop ? prop.value : undefined}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
          required={prop.required}
        />
      );
    }

    return (
      <StringInput
        actionId="contextpanel_input_string"
        defaultValue={"value" in prop ? prop.value : undefined}
        label={prop.label}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
        required={required}
      />
    );
  }

  throw new Error("invariant");
}
