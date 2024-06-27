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
  prop,
}: {
  children: RenderInputs;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
  prop: DeclaredProp | UndeclaredProp;
}) {
  const isUnhandled =
    ("valueKind" in prop &&
      (prop.valueKind === "unhandled" || prop.valueKind === "identifier")) ||
    prop.kind === "unhandled";

  if (isUnhandled) {
    return children({
      onChange: noop,
      onConfirm: noop,
      prop: {
        prop,
        type: "unhandled",
      },
    });
  } else if (prop.kind === "union") {
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
      return children({
        onChange,
        onConfirm,
        prop: {
          prop: prop as PropWithValue<UnionLiteralType>,
          type: "union-literal",
        },
      });
    } else {
      return (
        <Fragment
          // If the order of the values change blow re-mount the component so
          // it resets to displaying the first element in the shape array.
          key={prop.name + JSON.stringify(prop.shape[0])}
        >
          {children({
            onChange,
            onConfirm,
            prop: {
              prop,
              type: "union",
            },
          })}
        </Fragment>
      );
    }
  } else if (prop.kind === "tuple") {
    return children({
      onChange,
      onConfirm,
      prop: {
        prop,
        type: "tuple",
      },
    });
  } else if (prop.kind === "number") {
    return children({
      onChange,
      onConfirm,
      prop: {
        prop,
        type: "number",
      },
    });
  } else if (prop.kind === "boolean") {
    return children({
      onChange,
      onConfirm,
      prop: {
        prop,
        type: "boolean",
      },
    });
  } else if (prop.kind === "string") {
    return children({
      onChange,
      onConfirm,
      prop: {
        prop,
        type: "string",
      },
    });
  }

  throw new Error("invariant: unexpected please raise an issue");
}
