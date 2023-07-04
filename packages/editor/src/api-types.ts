/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export type Type =
  | UnionType
  | UndefinedType
  | TupleType
  | NumberType
  | StringType
  | BooleanType
  | UnknownType;

export interface UnionType {
  type: "union";
  value: string;
  values: Type[];
}

export interface UndefinedType {
  type: "undefined";
}

export interface TupleType {
  type: "tuple";
  values: Type[];
}

export interface NumberType {
  type: "number";
  value?: number;
  label?: string;
  required?: boolean;
}

export interface StringType {
  type: "string";
  value?: string;
  label?: string;
  required?: boolean;
}

export interface BooleanType {
  type: "boolean";
  label?: string;
  required?: boolean;
}

export interface UnknownType {
  type: "unknown";
}

export interface PropType {
  name: string;
  required: boolean;
  declared: boolean;
  description: string | undefined;
  type: Type;
  tags: Record<string, string | boolean | number>;
}

export type Prop =
  | StringProp
  | IdentifierProp
  | ArrayProp
  | NumberProp
  | BooleanProp
  | SpreadProp
  | UnionProp
  | UnhandledProp;

export interface BaseProp {
  column: number;
  line: number;
  name: string;
  required: boolean;
  description: string | undefined;
  tags: Record<string, string | number | boolean>;
}

export interface StringProp {
  value?: string;
  type: "string";
  label?: string;
  required?: boolean;
}

export interface UnhandledProp {
  value: string;
  type: "unhandled";
  required?: boolean;
}

export interface BooleanProp {
  value: boolean;
  type: "boolean";
  label?: string;
  required?: boolean;
}

export interface IdentifierProp {
  value: string | undefined;
  type: "identifier";
  required?: boolean;
}

export interface SpreadProp {
  value: string;
  type: "spread";
  required?: boolean;
}

export interface ArrayProp {
  value: Prop[];
  type: "array";
  required?: boolean;
}

export interface UnionProp {
  values: Prop[];
  value?: string;
  type: "union";
  required?: boolean;
}

export interface NumberProp {
  value?: number;
  type: "number";
  label?: string;
  required?: boolean;
}

export interface GetSceneObjectTypes {
  propTypes: PropType[];
  transforms: {
    translate: boolean;
    rotate: boolean;
    scale: boolean;
  };
}

export type GetSceneObject = SceneObjectHost | SceneObjectCustom;

export interface SceneObjectHost {
  name: string;
  type: "host";
  props: (Prop & BaseProp)[];
}

export interface SceneObjectCustom {
  exportName: string;
  name: string;
  type: "custom";
  path: string;
  props: (Prop & BaseProp)[];
}

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

export type GetProjectComponents = (
  | ProjectHostComponent
  | ProjectCustomComponent
  | ProjectAsset
)[];

export interface Folder {
  name: string;
  path: string;
  files: number;
  children: Folder[];
}

export type GetProjectComponentFolders = Folder[];
