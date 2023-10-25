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
  | BooleanLiteralType
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

type TupleValue = string | number | boolean | TupleValue[];

export interface TypeValueMap {
  boolean: { value: boolean };
  number: { value: number };
  string: { value: string };
  tuple: { value: TupleValue[] };
  unhandled: { value: string };
  union: { value: string | number };
}

export type ValueKind =
  | "unhandled"
  | "identifier"
  | "string"
  | "boolean"
  | "number"
  | "undefined"
  | "array";

export type PropWithValue<TType extends Type> = {
  column: number;
  description: string | undefined;
  line: number;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
  valueKind: ValueKind;
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
      exportName: string;
      name: string;
      path: string;
      props: Record<string, unknown>;
      type: "custom";
    }
  | {
      name: string;
      props: Record<string, unknown>;
      type: "host";
    };

export type ComponentRawType =
  | {
      exportName: string;
      path: string;
      props: Record<string, unknown>;
      type: "custom";
    }
  | {
      name: string;
      props: Record<string, unknown>;
      type: "host";
    };

export interface ComponentTarget {
  action: "child";
  column: number;
  exportName: string;
  line: number;
  path: string;
}

export interface ProjectHostComponent {
  category: string;
  name: string;
  type: "host";
}

export interface ProjectCustomComponent {
  category: string;
  exportName: string;
  name: string;
  path: string;
  type: "custom";
}

export interface ProjectAsset {
  extname: string;
  name: string;
  path: string;
  type: "asset";
}

export interface Folder {
  children: Folder[];
  files: number;
  name: string;
  path: string;
}

export type JsxElementPositions =
  | CustomJsxElementPosition
  | HostJsxElementPosition;

export interface CustomJsxElementPosition {
  children: JsxElementPositions[];
  column: number;
  exportName: string;
  line: number;
  name: string;
  parentPath: string;
  /**
   * Path will be defined if the jsx element exists in local source code.
   */
  path?: string;
  type: "custom";
}

export interface HostJsxElementPosition {
  children: JsxElementPositions[];
  column: number;
  line: number;
  name: string;
  parentPath: string;
  type: "host";
}

export interface SourceFileChangedEvent {
  existsOnFs: boolean;
  path: string;
}
