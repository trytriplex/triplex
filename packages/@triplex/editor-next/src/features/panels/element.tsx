/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ComponentInstanceIcon,
} from "@radix-ui/react-icons";
import { compose, on, send } from "@triplex/bridge/host";
import { cn } from "@triplex/lib";
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
} from "react";
import { ButtonLink } from "../../components/button";
import { Pressable } from "../../components/pressable";
import { useOnSurfaceStateChange } from "../../components/surface";
import { useLazySubscription } from "../../hooks/ws";
import { useFilter } from "../../stores/filter-elements";
import { sendVSCE } from "../../util/bridge";
import { createCodeLink } from "../../util/commands";
import {
  attachInstruction,
  extractInstruction,
  type Instruction,
  type InstructionType,
} from "../../util/dnd";
import { useSceneEvents, useSceneSelected } from "../app-root/context";

const blockAll: InstructionType[] = [
  "make-child",
  "move-after",
  "move-before",
  "reparent",
];

const IDENT = 12;

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

export function SceneElement(
  props: JsxElementPositions & { level: number; owningExportName: string },
) {
  const id = useId();
  const selected = useSceneSelected();
  const { focusElement } = useSceneEvents();
  const ref = useRef<HTMLButtonElement>(null);
  const [_isActive, setIsActive] = useState(false);
  const [isForciblyHovered, setForciblyHovered] = useState(false);
  const [isUserExpanded, toggleExpanded] = useReducer((state) => !state, false);
  const [dropState, setDropState] = useState<false | Instruction>(false);
  const [isDragging, setIsDragging] = useState(false);
  const isCustomComponent =
    props.type === "custom" && props.exportName && props.path;
  const isActive = _isActive && !isDragging;
  const isSelected =
    !isDragging &&
    selected &&
    "column" in selected &&
    selected.column === props.column &&
    selected.line === props.line &&
    selected.path === props.parentPath;
  const filter = useFilter((state) => state.filter);
  const matches = matchesFilter(filter, props);
  const isExpanded = isUserExpanded || !!filter;
  const hasChildSelected = props.children.some(
    (child) =>
      selected &&
      "column" in selected &&
      selected.column === child.column &&
      selected.line === child.line &&
      selected.path === child.parentPath,
  );

  interface DragData {
    column: number;
    exportName: string;
    level: number;
    line: number;
    parentPath: string;
  }

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

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    return dropTargetForElements({
      canDrop: (args) => {
        return args.source.element !== ref.current;
      },
      element: ref.current,
      getData: (args) => {
        const dragData = args.source.data as unknown as DragData;
        const isWithinSameComponent =
          dragData.parentPath === props.parentPath &&
          dragData.exportName === props.owningExportName;

        let block: InstructionType[] | undefined = undefined;

        if (!isWithinSameComponent) {
          block = blockAll;
        }

        return attachInstruction(
          {},
          {
            block,
            currentLevel: props.level,
            element: args.element,
            indentPerLevel: 13,
            input: args.input,
            mode: "standard",
          },
        );
      },
      onDrag: (args) => {
        const instruction = extractInstruction(args.self.data);
        if (instruction) {
          setDropState(instruction);
        }
      },
      onDragLeave: () => setDropState(false),
      onDrop: (args) => {
        const instruction = extractInstruction(args.self.data);
        const dragData = args.source.data as unknown as DragData;

        if (instruction && !instruction.blocked) {
          sendVSCE("element-move", {
            action: instruction.type,
            destination: {
              column: props.column,
              line: props.line,
            },
            path: dragData.parentPath,
            source: {
              column: dragData.column,
              line: dragData.line,
            },
          });
        }

        setDropState(false);
      },
    });
  }, [
    props.column,
    props.owningExportName,
    props.level,
    props.line,
    props.parentPath,
  ]);

  useEffect(() => {
    return monitorForElements({
      onDragStart: () => {
        setIsDragging(true);
      },
      onDrop: () => {
        setIsDragging(false);
      },
    });
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    return draggable({
      element: ref.current,
      getInitialData: () => ({
        column: props.column,
        exportName: props.owningExportName,
        level: props.level,
        line: props.line,
        parentPath: props.parentPath,
      }),
    });
  }, [
    props.column,
    props.owningExportName,
    props.level,
    props.line,
    props.parentPath,
  ]);

  return (
    <li className="relative">
      {(props.children.length > 0 || isCustomComponent) && (
        <div
          className={cn([
            isActive && !hasChildSelected && "opacity-20",
            !isActive && !hasChildSelected && "group-hover:opacity-20",
            hasChildSelected && "opacity-60",
            "border-indent pointer-events-none absolute bottom-0 top-[21.5px] z-20 border-l opacity-0 transition-opacity",
          ])}
          style={{ left: props.level * IDENT + 4 }}
        />
      )}
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
        style={{ paddingLeft: props.level * IDENT }}
      >
        {dropState && (
          <div
            className={cn([
              dropState.blocked
                ? "border-danger outline-danger"
                : "border-selected outline-selected",
              dropState.type === "make-child" && "outline",
              dropState.type === "move-before" && "border-t",
              dropState.type === "move-after" && "border-b",
              "outline-default absolute -bottom-0.5 -left-0.5 right-0 top-0 -outline-offset-[1px]",
            ])}
          />
        )}
        {isCustomComponent && (
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
        )}
        {!isCustomComponent && (
          <div
            className={cn([
              "-ml-[5px] flex flex-shrink-0 items-center px-0.5",
              props.children.length > 0 ? "opacity-60" : "opacity-0",
            ])}
          >
            <ComponentInstanceIcon />
          </div>
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
      </div>
      {(props.children.length > 0 || isCustomComponent) && (
        <ul>
          {props.children.map((element) => (
            <SceneElement
              {...element}
              key={element.column + element.line}
              level={props.level + 1}
              owningExportName={props.owningExportName}
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

  if (!elements) {
    return (
      <div className="flex flex-col gap-3 px-4 py-2">
        <span className="italic">
          Component data was lost. Is the component still exported?
        </span>
      </div>
    );
  }

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
      {...element}
      key={element.column + element.line}
      level={level}
      owningExportName={exportName}
    />
  ));
}
