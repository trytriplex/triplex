/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
  path,
  prop,
}: {
  children: RenderInputs;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
  path: string;
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
      path,
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
        path,
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
            path,
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
      path,
      prop: {
        prop,
        type: "tuple",
      },
    });
  } else if (prop.kind === "number") {
    return children({
      onChange,
      onConfirm,
      path,
      prop: {
        prop,
        type: "number",
      },
    });
  } else if (prop.kind === "boolean") {
    return children({
      onChange,
      onConfirm,
      path,
      prop: {
        prop,
        type: "boolean",
      },
    });
  } else if (prop.kind === "string") {
    return children({
      onChange,
      onConfirm,
      path,
      prop: {
        prop,
        type: "string",
      },
    });
  }

  throw new Error("invariant: unexpected please raise an issue");
}
