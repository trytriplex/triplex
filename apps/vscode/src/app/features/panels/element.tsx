/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { type JsxElementPositions } from "@triplex/server";
import {
  Suspense,
  useDeferredValue,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Pressable } from "../../components/button";
import { useOnSurfaceStateChange } from "../../components/surface";
import { useLazySubscription } from "../../hooks/ws";
import { useFilter } from "../../stores/filter-elements";
import { useSceneStore } from "../../stores/scene";

function matchesFilter(
  filter: string | undefined,
  element: JsxElementPositions,
) {
  if (!filter || element.name.toLowerCase().includes(filter.toLowerCase())) {
    return "exact";
  }

  const childMatches = element.children.some((child) =>
    matchesFilter(filter, child),
  );

  if (childMatches) {
    return "child";
  }

  return false;
}

export function SceneElement(props: JsxElementPositions & { level: number }) {
  const id = useId();
  const selected = useSceneStore((store) => store.selected);
  const focusElement = useSceneStore((store) => store.focusElement);
  const ref = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isUserExpanded, toggleExpanded] = useReducer((state) => !state, false);
  const isCustomComponent =
    props.type === "custom" && props.exportName && props.path;
  const isSelected =
    selected &&
    selected.column === props.column &&
    selected.line === props.line &&
    selected.path === props.parentPath;
  const filter = useFilter((state) => state.filter);
  const matches = matchesFilter(filter, props);
  const isExpanded = isUserExpanded || !!filter;

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
          matches == false && "hidden",
          matches === "child" && "opacity-50",
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
          labelledBy={id}
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
          vscodeContext={{
            column: props.column,
            line: props.line,
            parentPath: props.parentPath,
            preventDefaultContextMenuItems: true,
            webviewSection: "element-actions",
          }}
        />
        <span
          className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
          id={id}
        >
          {props.name}
          {isSelected && <span className="sr-only">selected</span>}
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

export function SceneElements({
  exportName: inExportName,
  level = 1,
  path,
}: {
  exportName: string;
  level?: number;
  path: string;
}) {
  const exportName = useDeferredValue(inExportName);
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
