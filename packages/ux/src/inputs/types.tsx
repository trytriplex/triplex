/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
import { type FormEventHandler, type JSX, type RefObject } from "react";

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
      ref: RefObject<TElement | null>;
      required?: boolean;
    } & Props,
    actions: Actions,
  ): JSX.Element;
}

export interface RenderInputs {
  (props: {
    onChange: (value: unknown) => void;
    onConfirm: (value: unknown) => void;
    path: string;
    prop: InputTypes;
  }): JSX.Element | null;
}

export interface RenderInputsWithAction<TActions> {
  (
    props: {
      onChange: (value: unknown) => void;
      onConfirm: (value: unknown) => void;
      path: string;
      prop: InputTypes;
    },
    actions: TActions,
  ): JSX.Element | null;
}
