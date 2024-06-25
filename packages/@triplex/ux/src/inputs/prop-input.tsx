/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { noop } from "@triplex/lib";
import type {
  BooleanLiteralType,
  DeclaredProp,
  NumberLiteralType,
  PropWithValue,
  StringLiteralType,
  UndeclaredProp,
  UnionLiteralType,
} from "@triplex/server";
import { Fragment } from "react";
import { type RenderInputs } from "./types";

export function PropInput({
  children,
  onChange,
  onConfirm,
  props,
}: {
  children: RenderInputs;
  onChange: (propName: string, value: unknown) => void;
  onConfirm: (propName: string, value: unknown) => void;
  props: (DeclaredProp | UndeclaredProp)[];
}) {
  return props.map((prop) => {
    const isUnhandled =
      ("valueKind" in prop &&
        (prop.valueKind === "unhandled" || prop.valueKind === "identifier")) ||
      prop.kind === "unhandled";

    if (isUnhandled) {
      return (
        <Fragment key={prop.name}>
          {children({
            onChange: noop,
            onConfirm: noop,
            prop: {
              prop,
              type: "unhandled",
            },
          })}
        </Fragment>
      );
    } else if (prop.kind === "union") {
      const isLiteralUnion = prop.shape.every(
        (
          value,
        ): value is
          | NumberLiteralType
          | StringLiteralType
          | BooleanLiteralType =>
          (value.kind === "string" ||
            value.kind === "number" ||
            value.kind === "boolean") &&
          "literal" in value,
      );

      if (isLiteralUnion) {
        return (
          <Fragment key={prop.name}>
            {children({
              onChange: (value) => onChange(prop.name, value),
              onConfirm: (value) => onConfirm(prop.name, value),
              prop: {
                prop: prop as PropWithValue<UnionLiteralType>,
                type: "union-literal",
              },
            })}
          </Fragment>
        );
      } else {
        return (
          <Fragment
            // If the order of the values change blow re-mount the component so
            // it resets to displaying the first element in the shape array.
            key={prop.name + JSON.stringify(prop.shape[0])}
          >
            {children({
              onChange: (value) => onChange(prop.name, value),
              onConfirm: (value) => onConfirm(prop.name, value),
              prop: {
                prop,
                type: "union",
              },
            })}
          </Fragment>
        );
      }
    } else if (prop.kind === "tuple") {
      return (
        <Fragment key={prop.name}>
          {children({
            onChange: (value) => onChange(prop.name, value),
            onConfirm: (value) => onConfirm(prop.name, value),
            prop: {
              prop,
              type: "tuple",
            },
          })}
        </Fragment>
      );
    } else if (prop.kind === "number") {
      return (
        <Fragment key={prop.name}>
          {children({
            onChange: (value) => onChange(prop.name, value),
            onConfirm: (value) => onConfirm(prop.name, value),
            prop: {
              prop,
              type: "number",
            },
          })}
        </Fragment>
      );
    } else if (prop.kind === "boolean") {
      return (
        <Fragment key={prop.name}>
          {children({
            onChange: (value) => onChange(prop.name, value),
            onConfirm: (value) => onConfirm(prop.name, value),
            prop: {
              prop,
              type: "boolean",
            },
          })}
        </Fragment>
      );
    } else if (prop.kind === "string") {
      return (
        <Fragment key={prop.name}>
          {children({
            onChange: (value) => onChange(prop.name, value),
            onConfirm: (value) => onConfirm(prop.name, value),
            prop: {
              prop,
              type: "string",
            },
          })}
        </Fragment>
      );
    }

    throw new Error("invariant: unexpected please raise an issue");
  });
}
