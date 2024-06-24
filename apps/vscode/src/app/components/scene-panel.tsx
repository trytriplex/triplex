/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  ChevronDownIcon,
  ChevronRightIcon,
  LayersIcon,
} from "@radix-ui/react-icons";
import { send } from "@triplex/bridge/host";
import { cn } from "@triplex/lib";
import { type JsxElementPositions } from "@triplex/server";
import {
  BooleanInput,
  LiteralUnionInput,
  NumberInput,
  PropInput,
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
import { Suspense, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useLazySubscription } from "../hooks/ws";
import { useSceneStore, type ElementLocation } from "../stores/scene";
import { type SuppressVSCodeError } from "../types";
import { sendVSCE } from "../util/bridge";
import { IconButton, Pressable } from "./button";
import { ScrollContainer } from "./scroll-container";
import { Surface, useOnSurfaceStateChange } from "./surface";

function SceneElement(props: JsxElementPositions & { level: number }) {
  const selected = useSceneStore((store) => store.selected);
  const focusElement = useSceneStore((store) => store.focusElement);
  const ref = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isExpanded, toggleExpanded] = useReducer((state) => !state, false);
  const isCustomComponent =
    props.type === "custom" && props.exportName && props.path;
  const isSelected =
    selected &&
    selected.column === props.column &&
    selected.line === props.line &&
    selected.path === props.parentPath;

  useOnSurfaceStateChange((active) => {
    setIsActive(active);
  });

  useLayoutEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  return (
    <li>
      <div
        className={cn([
          "relative flex items-stretch gap-1 py-[1px] pr-4",
          isSelected &&
            isActive &&
            "outline-selected outline-offset-inset outline-default bg-active-selected text-active-selected z-10 outline",
          isSelected && !isActive && "bg-inactive-selected",
          !isSelected && "hover:bg-list-hovered hover:text-list-hovered",
        ])}
        style={{ paddingLeft: props.level * 12 }}
      >
        {isCustomComponent ? (
          <Pressable
            actionId={
              isExpanded
                ? "scenepanel_element_collapse"
                : "scenepanel_element_expand"
            }
            className="z-10 -ml-1.5 px-0.5"
            onClick={toggleExpanded}
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Pressable>
        ) : (
          <span className="w-[14px]" />
        )}
        <Pressable
          actionId="scenepanel_element_focus"
          className="outline-offset-inset absolute inset-0"
          onClick={() => {
            focusElement({
              column: props.column,
              line: props.line,
              parentPath: props.parentPath,
              path: props.parentPath,
            });
          }}
          ref={ref}
          title={props.name}
        />
        <span className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {props.name}
        </span>
      </div>
      {(props.children.length > 0 || isCustomComponent) && (
        <ul>
          {props.children.map((element) => (
            <SceneElement
              key={element.column + element.line}
              level={props.level + 1}
              {...element}
            />
          ))}
          {isCustomComponent && isExpanded && (
            <Suspense>
              <SceneElements
                exportName={props.exportName}
                level={props.level + 1}
                path={props.path!}
              />
            </Suspense>
          )}
        </ul>
      )}
    </li>
  );
}

function SceneElements({
  exportName,
  level = 1,
  path,
}: {
  exportName: string;
  level?: number;
  path: string;
}) {
  const elements = useLazySubscription("/scene/:path/:exportName", {
    exportName,
    path,
  });

  return elements.sceneObjects.map((element) => (
    <SceneElement
      key={element.column + element.line}
      level={level}
      {...element}
    />
  ));
}

function ElementsPanel() {
  const context = useSceneStore((store) => store.context);
  const selected = useSceneStore((store) => store.selected);

  return (
    <Surface
      className="grid h-full w-48 flex-shrink-0 grid-rows-[1fr_2fr] overflow-hidden border-r pb-1.5"
      shape="square"
    >
      <ScrollContainer>
        <div className="min-w-0">
          <div className="bg-overlay flex border-t border-t-transparent p-1.5">
            <VSCodeTextField
              className="w-full opacity-70 focus:opacity-100"
              onFocus={(e) => e.stopPropagation()}
              placeholder="Filter elements..."
            />
          </div>
          <ul>
            <Suspense>
              <SceneElements
                exportName={context.exportName}
                path={context.path}
              />
            </Suspense>
          </ul>
        </div>
      </ScrollContainer>
      <ScrollContainer className="border-overlay border-t">
        <Suspense>{selected && <Selection selected={selected} />}</Suspense>
      </ScrollContainer>
    </Surface>
  );
}

const renderPropInputs: RenderInputs = ({ onChange, onConfirm, prop }) => {
  if (prop.type === "string") {
    return (
      <StringInput
        actionId="scene_controls"
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
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
      >
        {({ onChange, ref, ...props }) => (
          <div>
            <label className="block">{prop.prop.name}</label>
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
          <VSCodeCheckbox
            {...props}
            className="m-0"
            onChange={onChange as SuppressVSCodeError}
            ref={ref as SuppressVSCodeError}
          >
            {prop.prop.name}
          </VSCodeCheckbox>
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

export function Selection({ selected }: { selected: ElementLocation }) {
  const props = useLazySubscription(
    "/scene/:path/object/:line/:column",
    selected
  );

  return (
    <>
      <div className="bg-overlay flex border-t border-t-transparent p-1.5">
        <VSCodeTextField
          className="w-full opacity-70 focus:opacity-100"
          onFocus={(e) => e.stopPropagation()}
          placeholder="Filter props..."
        />
      </div>
      <div className="flex flex-col gap-1.5 px-2">
        <PropInput
          onChange={(propName, propValue) =>
            send("request-set-element-prop", {
              ...selected,
              propName,
              propValue,
            })
          }
          onConfirm={(propName, propValue) => {
            sendVSCE("element-set-prop", { ...selected, propName, propValue });
          }}
          props={props.props}
        >
          {renderPropInputs}
        </PropInput>
      </div>
    </>
  );
}

export function ScenePanel() {
  const [shown, setShown] = useState<"elements" | undefined>(undefined);

  return (
    <div className="flex flex-col">
      <div
        className={cn([
          !shown && "absolute left-[5px] top-[5px] gap-1 rounded border p-0.5",
          shown && "border-b border-r p-1.5",
          "bg-overlay border-overlay z-10 flex flex-col items-start opacity-90",
        ])}
      >
        <IconButton
          actionId="scenepanel_elements_toggle"
          icon={LayersIcon}
          isSelected={shown === "elements"}
          label="View Scene Elements"
          onClick={() =>
            setShown(shown === "elements" ? undefined : "elements")
          }
          spacing={shown ? "spacious" : "default"}
        />
      </div>

      {shown === "elements" && <ElementsPanel />}
    </div>
  );
}
