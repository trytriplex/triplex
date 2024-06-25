/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
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
import { type SuppressVSCodeError } from "../../types";

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
            className="w-full"
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
      >
        {({ onChange, ref, ...props }) => (
          <div>
            {prop.prop.name && (
              <label className="block" htmlFor={props.id}>
                {prop.prop.name}
              </label>
            )}
            <input
              {...props}
              className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder mb-1 h-[26px] w-full rounded-sm border px-[9px] focus:outline-none"
              onInput={onChange}
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
          {renderPropInputs}
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
              className="w-full"
              onChange={onChange as SuppressVSCodeError}
              ref={ref as SuppressVSCodeError}
            >
              {options.map((option) => (
                <VSCodeOption key={option[0]} value={option[1]}>
                  {option[0]}
                </VSCodeOption>
              ))}
            </VSCodeDropdown>
          </div>
        )}
      </LiteralUnionInput>
    );
  }

  return null;
};
