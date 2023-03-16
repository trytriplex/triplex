import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { getEditorLink } from "../util/ide";
import { ColorInput } from "./color-input";
import { StringInput } from "./string-input";
import { BooleanInput } from "./boolean-input";
import { NumberInput } from "./number-input";
import { ArrayInput } from "./array-input";

export type Prop =
  | (StringProp & BaseProp)
  | (IdentifierProp & BaseProp)
  | (ArrayProp & BaseProp)
  | (NumberProp & BaseProp)
  | (BooleanProp & BaseProp)
  | (SpreadProp & BaseProp)
  | (UnhandledProp & BaseProp);

export interface BaseProp {
  column: number;
  line: number;
  name: string;
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
  value: string;
  type: "identifier";
}

export interface SpreadProp {
  value: string;
  type: "spread";
}

export interface ArrayProp {
  value: (
    | NumberProp
    | IdentifierProp
    | StringProp
    | ArrayProp
    | UnhandledProp
  )[];
  type: "array";
}

export interface NumberProp {
  value: number;
  type: "number";
}

export function PropInput({
  prop,
  path,
  onChange,
  onConfirm,
}: {
  prop: Prop;
  path: string;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
}) {
  if (prop.type === "array") {
    return (
      <ArrayInput
        values={prop.value}
        name={prop.name}
        path={path}
        column={prop.column}
        line={prop.line}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  }

  if (prop.type === "number") {
    return (
      <NumberInput
        defaultValue={prop.value}
        name={prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  } else if (prop.type === "boolean") {
    return (
      <BooleanInput
        defaultValue={prop.value}
        name={prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  } else if (
    prop.type === "string" &&
    prop.name.toLowerCase().endsWith("color")
  ) {
    return (
      <ColorInput
        defaultValue={prop.value}
        name={prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  } else if (prop.type === "string") {
    return (
      <StringInput
        defaultValue={prop.value}
        name={prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  }

  // Fallback - this is assumed to be controlled in code.
  return (
    <a
      href={getEditorLink({
        path: path,
        column: prop.column,
        line: prop.line,
        editor: "vscode",
      })}
      title="This prop is controlled in code."
      className="flex h-[26px] items-center gap-0.5 overflow-hidden rounded-md border border-transparent bg-white/5 py-0.5 px-1 text-sm hover:bg-white/10 focus-visible:border-blue-400"
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-neutral-400">{`{${prop.value}}`}</span>
      <div className="ml-auto flex-shrink-0 text-orange-300">
        <ExclamationTriangleIcon />
      </div>
    </a>
  );
}
