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
}

export interface StringType {
  type: "string";
  value?: string;
}

export interface BooleanType {
  type: "boolean";
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
}

export interface StringProp {
  value: string;
  type: "string";
}

export interface UnhandledProp {
  value: string;
  type: "unhandled";
}

export interface BooleanProp {
  value: boolean;
  type: "boolean";
}

export interface IdentifierProp {
  value: string | undefined;
  type: "identifier";
}

export interface SpreadProp {
  value: string;
  type: "spread";
}

export interface ArrayProp {
  value: Prop[];
  type: "array";
}

export interface UnionProp {
  values: Prop[];
  value: string;
  type: "union";
}

export interface NumberProp {
  value: number;
  type: "number";
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
