/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Component1Icon,
} from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { type JsxElementPositions } from "@triplex/server";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { Suspense, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useLazySubscription } from "../hooks/ws";
import { useSceneStore } from "../stores/scene";
import { IconButton, Pressable } from "./button";
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

  return (
    <Surface
      className="w-48 flex-shrink-0 overflow-auto border-r pb-1.5"
      shape="square"
    >
      <div className="flex border-t border-t-transparent p-1.5">
        <VSCodeTextField
          className="w-full opacity-70 focus:opacity-100"
          onFocus={(e) => e.stopPropagation()}
          placeholder="Filter elements..."
        />
      </div>
      <ul>
        <SceneElements exportName={context.exportName} path={context.path} />
      </ul>
    </Surface>
  );
}

export function ScenePanel() {
  const [shown, setShown] = useState<"elements" | undefined>(undefined);

  return (
    <>
      <div
        className={cn([
          !shown && "absolute left-1.5 top-1.5 gap-1 rounded border p-0.5",
          shown && "border-l border-r border-t border-t-transparent p-1.5",
          "bg-overlay border-overlay z-10 flex flex-col items-start opacity-90",
        ])}
      >
        <IconButton
          actionId="scenepanel_elements_toggle"
          icon={Component1Icon}
          isSelected={shown === "elements"}
          label="View Scene Elements"
          onClick={() =>
            setShown(shown === "elements" ? undefined : "elements")
          }
          spacing={shown ? "spacious" : "default"}
        />
      </div>

      {shown === "elements" && (
        <Suspense>
          <ElementsPanel />
        </Suspense>
      )}
    </>
  );
}
