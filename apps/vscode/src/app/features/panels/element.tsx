/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { compose, on, send } from "@triplex/bridge/host";
import { cn } from "@triplex/lib";
import { fg } from "@triplex/lib/fg";
import { type JsxElementPositions } from "@triplex/server";
import { bind } from "bind-event-listener";
import {
  Suspense,
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useTransition,
} from "react";
import { ButtonLink } from "../../components/button";
import { Pressable } from "../../components/pressable";
import { useOnSurfaceStateChange } from "../../components/surface";
import { useLazySubscription } from "../../hooks/ws";
import { useFilter } from "../../stores/filter-elements";
import { createCodeLink } from "../../util/commands";
import { useSceneEvents, useSceneSelected } from "../app-root/context";
import { WarningElementProps } from "../warnings/warning-element-props";

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
  const selected = useSceneSelected();
  const { focusElement } = useSceneEvents();
  const ref = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isForciblyHovered, setForciblyHovered] = useState(false);
  const [isUserExpanded, toggleExpanded] = useReducer((state) => !state, false);
  const isCustomComponent =
    props.type === "custom" && props.exportName && props.path;
  const isSelected =
    selected &&
    "column" in selected &&
    selected.column === props.column &&
    selected.line === props.line &&
    selected.path === props.parentPath;
  const filter = useFilter((state) => state.filter);
  const matches = matchesFilter(filter, props);
  const isExpanded = isUserExpanded || !!filter;
  const [, startTransition] = useTransition();

  useOnSurfaceStateChange((active) => {
    setIsActive(active);
  });

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    return compose([
      on("element-hint", (element) => {
        const matches =
          !!element &&
          element.column === props.column &&
          element.line === props.line &&
          element.path === props.parentPath;

        setForciblyHovered(matches);
      }),
      bind(ref.current, {
        listener: () => {
          send("element-hint", {
            column: props.column,
            line: props.line,
            parentPath: props.parentPath,
            path: props.parentPath,
          });
        },
        type: "mouseover",
      }),
    ]);
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
          !isSelected &&
            isForciblyHovered &&
            "bg-list-hovered text-list-hovered",
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
            className="z-10 -ml-[5px] px-0.5"
            describedBy={id}
            onClick={toggleExpanded}
          >
            {isExpanded ? (
              <ChevronDownIcon aria-label="Hide Children" />
            ) : (
              <ChevronRightIcon aria-label="Show Children" />
            )}
          </Pressable>
        ) : (
          <span className="w-[14px] flex-shrink-0" />
        )}
        <Pressable
          actionId="scenepanel_element_focus"
          className="outline-offset-inset absolute inset-0"
          labelledBy={id}
          onClick={() => {
            startTransition(() => {
              focusElement({
                column: props.column,
                line: props.line,
                parentPath: props.parentPath,
                path: props.parentPath,
              });
            });
          }}
          ref={ref}
          title={props.name}
          vscodeContext={{
            column: props.column,
            line: props.line,
            path: props.parentPath,
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
        {fg("element_props_indicator") && (
          <Suspense>
            <WarningElementProps
              column={props.column}
              line={props.line}
              name={props.name}
              path={props.parentPath}
            />
          </Suspense>
        )}
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

  if (elements.sceneObjects.length === 0) {
    return (
      <div className="flex flex-col gap-3 px-4 py-2">
        <span>Get started by adding elements to your component.</span>
        <ButtonLink
          actionId="scenepanel_element_createcta"
          href={createCodeLink(path, {
            column: elements.column,
            line: elements.line,
          })}
          variant="cta"
        >
          Go to Component
        </ButtonLink>
      </div>
    );
  }

  return elements.sceneObjects.map((element) => (
    <SceneElement
      key={element.column + element.line}
      level={level}
      {...element}
    />
  ));
}
