/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export type Type =
  | UnionType
  | TupleType
  | NumberType
  | NumberLiteralType
  | StringType
  | StringLiteralType
  | BooleanType
  | UnhandledType;

export interface UnionType {
  kind: "union";
  shape: Type[];
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
  literal: string;
  label?: string;
  required?: boolean;
}

export interface NumberLiteralType {
  kind: "number";
  literal: number;
  label?: string;
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

type TupleValue = string | number | boolean | TupleValue[];

export interface TypeValueMap {
  unhandled: { value: string };
  boolean: { value: boolean };
  string: { value: string };
  number: { value: number };
  tuple: { value: TupleValue[] };
  union: { value: string | number };
}

export type PropWithValue<TType extends Type> = {
  column: number;
  line: number;
  description: string | undefined;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
} & TType &
  TypeValueMap[TType["kind"]];

export type RemapPropWithValue<TType> = TType extends Type
  ? PropWithValue<TType>
  : never;

export type DeclaredProp = RemapPropWithValue<Type>;

export type Prop = {
  description: string | undefined;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
} & Type;

export type ComponentType =
  | {
      type: "custom";
      path: string;
      name: string;
      exportName: string;
      props: Record<string, unknown>;
    }
  | {
      type: "host";
      name: string;
      props: Record<string, unknown>;
    };

export type ComponentRawType =
  | {
      type: "custom";
      path: string;
      exportName: string;
      props: Record<string, unknown>;
    }
  | {
      type: "host";
      name: string;
      props: Record<string, unknown>;
    };

export interface ComponentTarget {
  line: number;
  column: number;
  action: "child";
}

export interface ProjectHostComponent {
  category: string;
  name: string;
  type: "host";
}

export interface ProjectCustomComponent {
  category: string;
  exportName: string;
  path: string;
  name: string;
  type: "custom";
}

export interface ProjectAsset {
  path: string;
  name: string;
  type: "asset";
  extname: string;
}

export interface Folder {
  name: string;
  path: string;
  files: number;
  children: Folder[];
}
