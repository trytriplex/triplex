/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export type FGEnvironment = "production" | "staging" | "development" | "local";

export type Type =
  | UnionType
  | TupleType
  | NumberType
  | NumberLiteralType
  | StringType
  | StringLiteralType
  | BooleanType
  | BooleanLiteralType
  | UnhandledType;

export interface UnionType {
  kind: "union";
  shape: Type[];
}

export interface UnionLiteralType {
  kind: "union";
  shape: (StringLiteralType | NumberLiteralType | BooleanLiteralType)[];
}

export interface TupleType {
  kind: "tuple";
  shape: Type[];
}

export interface NumberType {
  kind: "number";
  label?: string;
  required?: boolean;
}

export interface StringType {
  kind: "string";
  label?: string;
  required?: boolean;
}

export interface StringLiteralType {
  kind: "string";
  label?: string;
  literal: string;
  required?: boolean;
}

export interface BooleanLiteralType {
  kind: "boolean";
  label?: string;
  literal: boolean;
  required?: boolean;
}

export interface NumberLiteralType {
  kind: "number";
  label?: string;
  literal: number;
  required?: boolean;
}

export interface BooleanType {
  kind: "boolean";
  label?: string;
  required?: boolean;
}

export interface UnhandledType {
  kind: "unhandled";
}

export type ValueKind =
  | "unhandled"
  | "identifier"
  | "string"
  | "boolean"
  | "number"
  | "undefined"
  | "array";

export type Prop = {
  defaultValue?: ExpressionValue;
  description: string | undefined;
  group: string;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
} & Type;

export type ExpressionValue = {
  kind: ValueKind;
  value: AttributeValue;
};

export type AttributeValue =
  | number
  | string
  | boolean
  | undefined
  | AttributeValue[];

export type PropWithValue<TType extends Type> = {
  column: number;
  description: string | undefined;
  group: string;
  line: number;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
  valueKind: ValueKind;
} & TType &
  TypeValueMap[TType["kind"]];

export type PropWithoutValue<TType extends Type> = {
  defaultValue?: ExpressionValue;
  description: string | undefined;
  group: string;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
} & TType;

export type RemapPropWithValue<TType> = TType extends Type
  ? PropWithValue<TType>
  : never;

export type RemapPropWithoutValue<TType> = TType extends Type
  ? PropWithoutValue<TType>
  : never;

export type DeclaredProp = RemapPropWithValue<Type>;

export type UndeclaredProp = RemapPropWithoutValue<Type>;

export type TupleValue = string | number | boolean | TupleValue[];

export interface TypeValueMap {
  boolean: { value: boolean };
  number: { value: number };
  string: { value: string };
  tuple: { value: TupleValue[] };
  unhandled: { value: string };
  union: { value: string | number };
}
