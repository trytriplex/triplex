/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ExclamationTriangleIcon, SwitchIcon } from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { type DeclaredProp, type Prop } from "@triplex/server";
import {
  BooleanInput,
  LiteralUnionInput,
  NumberInput,
  StringInput,
  TupleInput,
  UnionInput,
  type RenderInputs,
} from "@triplex/ux/inputs";
import {
  VSCodeCheckbox,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { IconButton } from "../../components/button";
import { type SuppressVSCodeError } from "../../types";

const createIssueURL = (prop: DeclaredProp | Prop) =>
  encodeURI(
    "https://github.com/try-triplex/triplex/issues/new?title=Unsupported input request&body=Please describe your use case and what the prop type is here.\n\n---\n\nMeta:\n```\n" +
      JSON.stringify(prop, null, 2) +
      "\n```",
  );

export const renderPropInputs: RenderInputs = ({
  onChange,
  onConfirm,
  prop,
}) => {
  if (prop.type === "string") {
    return (
      <StringInput
        actionId="scene_controls"
        label={prop.prop.label}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
      >
        {({ onChange, ref, ...props }) => (
          <VSCodeTextField
            {...props}
            className="mb-1 w-full"
            onInput={onChange as SuppressVSCodeError}
            ref={ref as SuppressVSCodeError}
          >
            {prop.prop.name}
          </VSCodeTextField>
        )}
      </StringInput>
    );
  }

  if (prop.type === "number") {
    return (
      <NumberInput
        actionId="scene_controls"
        label={prop.prop.label}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
        shouldDisablePointerLock
      >
        {({ ref, ...props }) => (
          <div>
            {prop.prop.name && (
              <label className="block" htmlFor={props.id}>
                {prop.prop.name}
              </label>
            )}
            <input
              {...props}
              className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder mb-1 h-[26px] w-full rounded-sm border px-[9px] focus:outline-none"
              ref={ref}
              type="number"
            />
          </div>
        )}
      </NumberInput>
    );
  }

  if (prop.type === "boolean") {
    return (
      <BooleanInput
        actionId="scene_controls"
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : false}
      >
        {({ onChange, ref, ...props }) => (
          <div>
            <label className="block" htmlFor={props.id}>
              {prop.prop.name}
            </label>
            <VSCodeCheckbox
              {...props}
              className="m-0"
              onChange={onChange as SuppressVSCodeError}
              ref={ref as SuppressVSCodeError}
            />
          </div>
        )}
      </BooleanInput>
    );
  }

  if (prop.type === "union") {
    return (
      <div>
        <label className="block">{prop.prop.name}</label>
        <UnionInput
          onChange={onChange}
          onConfirm={onConfirm}
          persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
          values={prop.prop.shape}
        >
          {(props, actions) => (
            <div className="flex items-start gap-1">
              {renderPropInputs(props)}
              <IconButton
                actionId="contextpanel_input_union_switch"
                icon={SwitchIcon}
                label="Switch prop type"
                onClick={actions.toggle}
                spacing="spacious"
              />
            </div>
          )}
        </UnionInput>
      </div>
    );
  }

  if (prop.type === "tuple") {
    return (
      <div>
        <label className="block">{prop.prop.name}</label>
        <TupleInput
          onChange={onChange}
          onConfirm={onConfirm}
          persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
          values={prop.prop.shape}
        >
          {renderPropInputs}
        </TupleInput>
      </div>
    );
  }

  if (prop.type === "union-literal") {
    return (
      <LiteralUnionInput
        actionId="scene_controls"
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
        values={prop.prop.shape}
      >
        {({ onChange, options, ref, ...props }) => (
          <div>
            <label className="block" htmlFor={props.id}>
              {prop.prop.name}
            </label>
            <VSCodeDropdown
              {...props}
              className="mb-1 w-full"
              onChange={onChange as SuppressVSCodeError}
              ref={ref as SuppressVSCodeError}
            >
              {options.map(([label, value], index) => (
                <VSCodeOption key={`${label}-${value}-${index}`} value={value}>
                  {label}
                </VSCodeOption>
              ))}
            </VSCodeDropdown>
          </div>
        )}
      </LiteralUnionInput>
    );
  }

  const isControlledInCode = "value" in prop.prop && prop.prop.value;

  return (
    <div>
      <label className="block">{prop.prop.name}</label>
      <a
        className="hover:text-input text-input focus:border-selected bg-input border-input mb-1 flex h-[26px] w-full cursor-pointer items-center rounded-sm border px-[9px] focus:outline-none"
        href={isControlledInCode ? undefined : createIssueURL(prop.prop)}
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
    </div>
  );
};
