import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import tinycolor from "tinycolor2";
import { getEditorLink } from "../util/ide";

export type Prop =
  | (StringProp & BaseProp)
  | (IdentifierProp & BaseProp)
  | (ArrayProp & BaseProp)
  | (NumberProp & BaseProp)
  | (BooleanProp & BaseProp)
  | (SpreadProp & BaseProp)
  | (UnhandledProp & BaseProp);

interface BaseProp {
  column: number;
  line: number;
  name: string;
}

interface StringProp {
  value: string;
  type: "string";
}

interface UnhandledProp {
  value: string;
  type: "unhandled";
}

interface BooleanProp {
  value: boolean;
  type: "boolean";
}

interface IdentifierProp {
  value: string;
  type: "identifier";
}

interface SpreadProp {
  value: string;
  type: "spread";
}

interface ArrayProp {
  value: (NumberProp | IdentifierProp | StringProp | ArrayProp)[];
  type: "array";
}

interface NumberProp {
  value: number;
  type: "number";
}

export function PropInput({ prop, path }: { prop: Prop; path: string }) {
  if (prop.type === "array") {
    return (
      <>
        {prop.value.map((val, index) => (
          <PropInput path={path} key={index} prop={{ ...prop, ...val }} />
        ))}
      </>
    );
  }

  let normalizedValue: string | number = "";
  let type = "text";

  if (prop.type === "number") {
    normalizedValue = prop.value;
    type = "number";
  } else if (prop.type === "boolean") {
    return (
      <input
        id={prop.name}
        type="checkbox"
        className="self-start accent-blue-300 [color-scheme:dark]"
        readOnly
        checked={prop.value}
      />
    );
  } else if (prop.type === "string" && prop.name === "color") {
    return (
      <input
        id={prop.name}
        type="color"
        className="h-7 w-7 rounded border-2 border-neutral-700 p-1 outline-none [color-scheme:dark]"
        readOnly
        value={tinycolor(prop.value).toHexString()}
      />
    );
  } else if (prop.type === "string") {
    normalizedValue = prop.value;
  } else {
    return (
      <a
        href={getEditorLink({
          path: path,
          column: prop.column,
          line: prop.line,
          editor: "vscode",
        })}
        title="This prop is controlled in code."
        className="flex items-center gap-0.5 rounded border-2 border-neutral-700 py-0.5 px-1 text-sm text-neutral-300 hover:bg-neutral-700"
      >
        <span className="overflow-hidden text-ellipsis">{`{${prop.value}}`}</span>
        <div className="ml-auto flex-shrink-0 pt-0.5 text-orange-300">
          <ExclamationTriangleIcon />
        </div>
      </a>
    );
  }

  return (
    <div className="flex w-full items-center rounded border-2 border-neutral-700">
      <input
        id={prop.name}
        type={type}
        value={normalizedValue}
        readOnly
        className="w-full bg-transparent py-0.5 px-1 text-sm text-neutral-300 outline-none [color-scheme:dark]"
      />
    </div>
  );
}
