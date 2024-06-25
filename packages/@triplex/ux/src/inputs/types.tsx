/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  type BooleanType,
  type DeclaredProp,
  type NumberType,
  type Prop,
  type PropWithoutValue,
  type PropWithValue,
  type StringType,
  type TupleType,
  type UnionLiteralType,
  type UnionType,
} from "@triplex/server";
import { type FormEventHandler, type RefObject } from "react";

type InputTypes =
  | {
      prop: DeclaredProp | Prop;
      type: "unhandled";
    }
  | {
      prop: PropWithValue<UnionType> | PropWithoutValue<UnionType>;
      type: "union";
    }
  | {
      prop:
        | PropWithValue<UnionLiteralType>
        | PropWithoutValue<UnionLiteralType>;
      type: "union-literal";
    }
  | {
      prop: PropWithValue<TupleType> | PropWithoutValue<TupleType>;
      type: "tuple";
    }
  | {
      prop: PropWithValue<NumberType> | PropWithoutValue<NumberType>;
      type: "number";
    }
  | {
      prop: PropWithValue<BooleanType> | PropWithoutValue<BooleanType>;
      type: "boolean";
    }
  | {
      prop: PropWithValue<StringType> | PropWithoutValue<StringType>;
      type: "string";
    };

export interface RenderInput<
  Props,
  TElement = HTMLInputElement,
  Actions = object,
> {
  (
    props: {
      id: string;
      onChange: FormEventHandler<TElement>;
      ref: RefObject<TElement>;
      required?: boolean;
    } & Props,
    actions: Actions,
  ): JSX.Element;
}

export interface RenderInputs {
  (props: {
    onChange: (value: unknown) => void;
    onConfirm: (value: unknown) => void;
    prop: InputTypes;
  }): JSX.Element | null;
}
