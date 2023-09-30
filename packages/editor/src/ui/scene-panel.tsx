/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  ChangeEventHandler,
  Fragment,
  Suspense,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { cn } from "../ds/cn";
import { useLazySubscription } from "@triplex/ws-client";
import { IDELink } from "../util/ide";
import { useEditor } from "../stores/editor";
import { useScene } from "../stores/scene";
import { ScrollContainer } from "../ds/scroll-container";
import {
  CaretDownIcon,
  CaretRightIcon,
  ExitIcon,
  MixerHorizontalIcon,
  MixerVerticalIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import type { JsxElementPositions } from "@triplex/server";
import { IconButton } from "../ds/button";
import { ErrorBoundary } from "./error-boundary";
import { useSceneState } from "../stores/scene-state";
import { Pressable } from "../ds/pressable";
import { useAssetsDrawer } from "../stores/assets-drawer";
import { StringInput } from "./string-input";
import { useProviderStore } from "../stores/provider";

export function ScenePanel() {
  const { path, exportName } = useEditor();

  return (
    <div className="pointer-events-auto w-full flex-grow overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/[97%]">
      <ErrorBoundary keys={[path, exportName]}>
        <Suspense
          fallback={<div className="p-4 text-neutral-400">Loading...</div>}
        >
          <SceneContents />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ComponentHeading() {
  const { path, exportName, newComponent, set } = useEditor();
  const projectState = useLazySubscription("/project/state");
  const scene = useLazySubscription("/scene/:path/:exportName", {
    path,
    exportName,
  });

  const onChangeComponentHandler: ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    const nextValue = e.target.value;

    switch (nextValue) {
      case "new-component": {
        newComponent();
        break;
      }

      default: {
        set({
          encodedProps: "",
          exportName: nextValue,
          path,
        });
      }
    }
  };

  return (
    <h2 className="flex flex-row items-center pl-2 pr-4 pt-3 text-2xl font-medium text-neutral-300">
      <label className="relative flex items-center gap-1.5 overflow-hidden rounded pl-2 pr-1 outline-1 outline-offset-1 outline-blue-400 focus-within:outline hover:bg-white/5 active:bg-white/10">
        <span className="overflow-hidden text-ellipsis rounded">
          {scene.name}
        </span>

        <CaretDownIcon className="flex-shrink-0" />

        <select
          className="absolute inset-0 text-sm opacity-0 [color-scheme:dark] [width:-moz-available]"
          onChange={onChangeComponentHandler}
          value={exportName}
        >
          {scene.exports.map((exp) => (
            <option key={exp.exportName} value={exp.exportName}>
              {exp.name}
            </option>
          ))}
          <option value="new-component">New Component...</option>
        </select>
      </label>

      <span
        aria-label={projectState.isDirty ? "Unsaved changes" : undefined}
        title={projectState.isDirty ? "Unsaved changes" : undefined}
        className={cn([
          "ml-auto h-2.5 w-2.5 flex-shrink-0 rounded-full",
          projectState.isDirty ? "bg-yellow-400" : "bg-neutral-800",
        ])}
      />
    </h2>
  );
}

function AssetsDrawerButton() {
  const show = useAssetsDrawer((store) => () => store.show());

  return <IconButton onClick={show} icon={PlusIcon} title="Add element" />;
}

function SceneContents() {
  const { path, exportName, enteredComponent, exitComponent } = useEditor();
  const [filter, setFilter] = useState<string | undefined>();

  return (
    <div className="flex h-full flex-shrink flex-col">
      <ComponentHeading />

      <div className="-mt-0.5 mb-2.5 px-4">
        <IDELink path={path} column={1} line={1}>
          View source
        </IDELink>
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <div className="flex px-2 py-1">
        <AssetsDrawerButton />
        <ComponentSandboxButton />
        <div className="ml-auto" />
        <IconButton
          isDisabled={!enteredComponent}
          className="-scale-x-100"
          onClick={exitComponent}
          icon={ExitIcon}
          title="Exit component"
        />
        <ProviderConfigButton />
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <div className="px-3 py-2">
        <StringInput
          onChange={setFilter}
          name="filter-elements"
          label="Filter elements..."
        />
      </div>

      <ScrollContainer>
        <ReactErrorBoundary
          resetKeys={[path, exportName]}
          fallbackRender={(e) => (
            <div
              title={e.error.message}
              className="bg-red-500/10 py-1 text-center text-xs italic text-red-400"
            >
              Error loading elements
            </div>
          )}
        >
          <JsxElements
            filter={filter}
            exportName={exportName}
            level={1}
            path={path}
          />
        </ReactErrorBoundary>

        <div className="h-1" />
      </ScrollContainer>
    </div>
  );
}

function ComponentSandboxButton() {
  const { focus, blur } = useScene();
  const { target, path, exportName } = useEditor();
  const hasState = useSceneState((store) => store.hasState(path + exportName));
  const isSelected = target?.column === -1 && target?.line === -1;

  return (
    <IconButton
      isSelected={isSelected || (hasState ? "partial" : false)}
      onClick={() => {
        if (isSelected) {
          blur();
        } else {
          focus({ column: -1, line: -1, path, parentPath: "" });
        }
      }}
      icon={MixerHorizontalIcon}
      title="Live edit props"
    />
  );
}

function ProviderConfigButton() {
  const key = "__provider__";
  const hasState = useSceneState((store) => store.hasState(key));
  const isOpen = useProviderStore((store) => store.shown);
  const toggle = useProviderStore((store) => store.toggle);

  return (
    <IconButton
      onClick={toggle}
      isSelected={isOpen || (hasState ? "partial" : false)}
      icon={MixerVerticalIcon}
      title="View provider config"
    />
  );
}

function matchesFilter(
  filter: string | undefined,
  element: JsxElementPositions
) {
  if (!filter || element.name.toLowerCase().includes(filter.toLowerCase())) {
    return "exact";
  }

  const childMatches = element.children.some((child) =>
    matchesFilter(filter, child)
  );

  if (childMatches) {
    return "child";
  }

  return false;
}

function JsxElements({
  path,
  exportName,
  level,
  filter = "",
}: {
  path: string;
  exportName: string;
  level: number;
  filter?: string;
}) {
  const scene = useLazySubscription("/scene/:path/:exportName", {
    path,
    exportName,
  });

  return (
    <>
      {scene.sceneObjects.map((element) => {
        return (
          <JsxElementButton
            filter={filter}
            exportName={exportName}
            key={element.name + element.column + element.line}
            level={level}
            element={element}
          />
        );
      })}
    </>
  );
}

function JsxElementButton({
  element,
  level,
  exportName,
  filter,
}: {
  exportName: string;
  element: JsxElementPositions;
  level: number;
  filter?: string;
}) {
  const { focus } = useScene();
  const { target } = useEditor();
  const selected =
    !!target &&
    target.column === element.column &&
    target.line === element.line &&
    target.parentPath === element.parentPath;
  const showExpander =
    element.type === "custom" && element.exportName && element.path;
  const [isExpanded, setIsExpanded] = useState(false);
  const [, startTransition] = useTransition();
  const show = useAssetsDrawer((store) => store.show);
  const ref = useRef<HTMLDivElement>(null);
  const match = matchesFilter(filter, element);

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({ block: "nearest" });
    }
  }, [selected]);

  return (
    <Fragment>
      <Suspense>
        <Pressable
          ref={ref}
          onPress={() => {
            focus({
              column: element.column,
              line: element.line,
              parentPath: element.parentPath,
              path: "path" in element ? element.path || "" : "",
            });
          }}
          title={element.name}
          style={{ paddingLeft: level === 1 ? 13 : level * 13 }}
          className={cn([
            match === false && "hidden",
            selected
              ? "border-l-blue-400 bg-white/5 text-blue-400"
              : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
            "group flex w-[242px] cursor-default items-center gap-1 border-l-2 border-transparent px-3 py-1.5 text-left text-sm -outline-offset-1",
          ])}
        >
          {showExpander ? (
            <Pressable
              title={isExpanded ? "Hide child elements" : "View child elements"}
              onPress={() => {
                startTransition(() => {
                  setIsExpanded((prev) => !prev);
                });
              }}
              className="-ml-1 rounded px-0.5 py-0.5 text-inherit hover:bg-white/5 active:bg-white/10"
            >
              {isExpanded ? <CaretDownIcon /> : <CaretRightIcon />}
            </Pressable>
          ) : (
            <span className="w-4" />
          )}

          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {element.name}
          </span>

          <Pressable
            onPress={() =>
              show({
                exportName,
                path: element.parentPath,
                column: element.column,
                line: element.line,
              })
            }
            title="Add child element"
            className="ml-auto rounded px-0.5 py-0.5 text-inherit opacity-0 hover:bg-white/5 focus:opacity-100 active:bg-white/10 group-hover:opacity-100"
          >
            <PlusIcon />
          </Pressable>
        </Pressable>

        {isExpanded && showExpander && element.path && (
          <ReactErrorBoundary
            resetKeys={[element.path, element.exportName]}
            fallbackRender={(e) => (
              <div
                title={e.error.message}
                className="bg-red-500/10 py-1 text-center text-xs italic text-red-400"
              >
                Error loading elements
              </div>
            )}
          >
            <JsxElements
              filter={filter}
              level={level + 1}
              exportName={element.exportName}
              path={element.path}
            />
          </ReactErrorBoundary>
        )}
      </Suspense>

      {element.children.map((child) => (
        <JsxElementButton
          filter={filter}
          exportName={exportName}
          element={child}
          key={child.name + child.column + child.line}
          level={level + 1}
        />
      ))}
    </Fragment>
  );
}
