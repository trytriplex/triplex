/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  CheckIcon,
  ExclamationTriangleIcon,
  SwitchIcon,
} from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { type DeclaredProp, type Prop } from "@triplex/server";
import {
  BooleanInput,
  ColorInput,
  LiteralUnionInput,
  NumberInput,
  resolveDefaultValue,
  StringInput,
  TupleInput,
  UnionInput,
  type RenderInputs,
} from "@triplex/ux/inputs";
import { IconButton } from "../../components/button";
import { Label } from "../../components/label";

const createIssueURL = (prop: DeclaredProp | Prop) =>
  encodeURI(
    "https://github.com/try-triplex/triplex/issues/new?title=Unsupported input request&body=Please describe your use case and what the prop type is here.\n\n---\n\nMeta:\n```\n" +
      JSON.stringify(prop, null, 2) +
      "\n```",
  );

const createCodeLink = (path: string, prop: DeclaredProp | Prop) => {
  if ("value" in prop) {
    return encodeURI(`vscode://file/${path}:${prop.line}:${prop.column}`);
  }

  return "";
};

export const renderPropInputs: RenderInputs = ({
  onChange,
  onConfirm,
  path,
  prop,
}) => {
  if (prop.type === "string") {
    if (/[Cc]olor/.test(prop.prop.name)) {
      const persistedValue = "value" in prop.prop ? prop.prop.value : undefined;

      return (
        <ColorInput
          actionId="scene_controls"
          defaultValue={resolveDefaultValue(prop.prop, "string")}
          name={prop.prop.name}
          onChange={onChange}
          onConfirm={onConfirm}
          persistedValue={persistedValue}
          required={prop.prop.required}
        >
          {({ ref, ...props }, { hasChanged }) => (
            <>
              <Label description={prop.prop.description} htmlFor={props.id}>
                {prop.prop.name}
              </Label>
              <div className="mb-1 flex items-center gap-1">
                <input
                  {...props}
                  className={cn([
                    !hasChanged &&
                      !persistedValue &&
                      "[&::-webkit-color-swatch]:bg-[transparent!important]",
                    "text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder h-[26px] w-[26px] rounded-sm border focus:outline-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none",
                  ])}
                  ref={ref}
                  type="color"
                />
              </div>
            </>
          )}
        </ColorInput>
      );
    }

    return (
      <StringInput
        actionId="scene_controls"
        defaultValue={resolveDefaultValue(prop.prop, "string")}
        label={prop.prop.label}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
      >
        {({ onChange, ref, ...props }) => (
          <>
            <Label description={prop.prop.description} htmlFor={props.id}>
              {prop.prop.name}
            </Label>
            <input
              {...props}
              className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder mb-1 h-[26px] w-full rounded-sm border px-[9px] focus:outline-none"
              onChange={onChange}
              ref={ref}
            />
          </>
        )}
      </StringInput>
    );
  }

  if (prop.type === "number") {
    return (
      <NumberInput
        actionId="scene_controls"
        defaultValue={resolveDefaultValue(prop.prop, "number")}
        label={prop.prop.label}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
        shouldDisablePointerLock
      >
        {({ ref, ...props }) => (
          <>
            <Label description={prop.prop.description} htmlFor={props.id}>
              {prop.prop.name}
            </Label>
            <input
              {...props}
              aria-label={prop.prop.label}
              className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder mb-1 h-[26px] w-full rounded-sm border px-[9px] focus:outline-none"
              ref={ref}
              type="number"
            />
          </>
        )}
      </NumberInput>
    );
  }

  if (prop.type === "boolean") {
    return (
      <BooleanInput
        actionId="scene_controls"
        defaultValue={resolveDefaultValue(prop.prop, "boolean")}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : false}
      >
        {({ onChange, ref, ...props }) => (
          <>
            <Label description={prop.prop.description} htmlFor={props.id}>
              {prop.prop.name}
            </Label>
            <div className="text-input focus-within:border-selected bg-input border-input mb-1 grid h-5 w-5 rounded-sm border">
              <input
                {...props}
                className="grid-col peer h-full w-full appearance-none opacity-0 [grid-column:1] [grid-row:1]"
                onChange={onChange}
                ref={ref}
                type="checkbox"
              />
              <CheckIcon className="pointer-events-none h-full w-full opacity-0 [grid-column:1] [grid-row:1] peer-checked:opacity-100" />
            </div>
          </>
        )}
      </BooleanInput>
    );
  }

  if (prop.type === "union") {
    return (
      <UnionInput
        description={prop.prop.description}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        path={path}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        values={prop.prop.shape}
      >
        {(props, actions) => (
          <div
            className="grid grid-flow-col gap-x-1 [grid-template:'input_.'_'input_action']"
            style={{ gridTemplateColumns: "auto 1fr" }}
          >
            {renderPropInputs(props)}
            <div className="flex self-start [grid-area:action]">
              <IconButton
                actionId="contextpanel_input_union_switch"
                icon={SwitchIcon}
                label="Switch prop type"
                onClick={actions.toggle}
                spacing="spacious"
              />
            </div>
          </div>
        )}
      </UnionInput>
    );
  }

  if (prop.type === "tuple") {
    return (
      <>
        <Label description={prop.prop.description} htmlFor="">
          {prop.prop.name}
        </Label>
        <div>
          <TupleInput
            onChange={onChange}
            onConfirm={onConfirm}
            path={path}
            persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
            values={prop.prop.shape}
          >
            {renderPropInputs}
          </TupleInput>
        </div>
      </>
    );
  }

  if (prop.type === "union-literal") {
    return (
      <LiteralUnionInput
        actionId="scene_controls"
        defaultValue={resolveDefaultValue(prop.prop, "string")}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
        values={prop.prop.shape}
      >
        {({ onChange, options, ref, ...props }) => (
          <>
            <Label description={prop.prop.description} htmlFor={props.id}>
              {prop.prop.name}
            </Label>
            <select
              {...props}
              className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder mb-1 h-[26px] w-full rounded-sm border px-1.5 focus:outline-none"
              onChange={onChange}
              ref={ref}
            >
              {options.map(([label, value], index) => (
                <option key={`${label}-${value}-${index}`} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </>
        )}
      </LiteralUnionInput>
    );
  }

  const isControlledInCode = "value" in prop.prop && prop.prop.value;

  return (
    <>
      <Label description={prop.prop.description} htmlFor="">
        {prop.prop.name}
      </Label>
      <a
        className="hover:text-input text-input focus:border-selected bg-input border-input mb-1 flex h-[26px] w-full cursor-pointer items-center rounded-sm border px-[9px] focus:outline-none"
        href={
          isControlledInCode
            ? createCodeLink(path, prop.prop)
            : createIssueURL(prop.prop)
        }
        title={
          isControlledInCode
            ? "This prop is controlled by code."
            : "This field is not supported, please raise an issue on Github."
        }
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-neutral-400">
          {"value" in prop.prop && prop.prop.value ? (
            `{${prop.prop.value}}`
          ) : (
            <i>Unsupported</i>
          )}
        </span>
        <div
          className={cn([
            "ml-auto flex-shrink-0",
            isControlledInCode ? "text-warning" : "text-error",
          ])}
        >
          <ExclamationTriangleIcon />
        </div>
      </a>
    </>
  );
};
