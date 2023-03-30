import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { getEditorLink } from "../util/ide";
import { ColorInput } from "./color-input";
import { StringInput } from "./string-input";
import { BooleanInput } from "./boolean-input";
import { NumberInput } from "./number-input";
import { ArrayInput } from "./array-input";
import { LiteralUnionInput } from "./literal-union-input";
import { UnionInput } from "./union-input";
import { Prop } from "../api-types";

function isColorProp(name: string) {
  const includeList = ["emissive"];
  if (name.toLowerCase().endsWith("color")) {
    return true;
  }

  if (includeList.includes(name)) {
    return true;
  }

  return false;
}

export function PropInput({
  prop,
  path,
  name,
  column,
  line,
  onChange,
  onConfirm,
  required,
}: {
  name: string;
  column?: number;
  line?: number;
  prop: Prop;
  path: string;
  required?: boolean;
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
}) {
  if (prop.type === "union") {
    const isLiteralUnion = prop.values.every(
      (value) =>
        (value.type === "string" || value.type === "number") &&
        value.value !== undefined
    );

    if (isLiteralUnion) {
      return (
        <LiteralUnionInput
          required={required}
          defaultValue={prop.value}
          values={prop.values}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );
    } else {
      return (
        <UnionInput
          path={path}
          values={prop.values}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );
    }
  }

  if (prop.type === "array") {
    return (
      <ArrayInput
        values={prop.value}
        name={name}
        path={path}
        column={column}
        line={line}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  }

  if (prop.type === "number") {
    return (
      <NumberInput
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  } else if (prop.type === "boolean") {
    return (
      <BooleanInput
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  } else if (prop.type === "string" && isColorProp(name)) {
    return (
      <ColorInput
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  } else if (prop.type === "string") {
    return (
      <StringInput
        defaultValue={prop.value}
        name={name}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  }

  // Fallback - this is assumed to be controlled in code.
  return (
    <a
      href={getEditorLink({
        path,
        column,
        line,
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
