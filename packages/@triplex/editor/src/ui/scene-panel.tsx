/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  BoxIcon,
  CaretDownIcon,
  CaretRightIcon,
  ExitIcon,
  MixerHorizontalIcon,
  MixerVerticalIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import type { JsxElementPositions } from "@triplex/server";
import { useLazySubscription } from "@triplex/ws/react";
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
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { Pressable } from "../ds/pressable";
import { ScrollContainer } from "../ds/scroll-container";
import { PanelSkeleton } from "../ds/skeleton";
import { useAssetsDrawer } from "../stores/assets-drawer";
import { useEditor } from "../stores/editor";
import { useProviderStore } from "../stores/provider";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { IDELink } from "../util/ide";
import { ErrorBoundary } from "./error-boundary";
import { StringInput } from "./string-input";

export function ScenePanel() {
  const { exportName, path } = useEditor();

  return (
    <div className="pointer-events-auto relative w-full flex-grow overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/[97%]">
      <ErrorBoundary keys={[path, exportName]}>
        <Suspense fallback={<PanelSkeleton />}>
          <SceneContents />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ComponentHeading() {
  const { exportName, newComponent, path, set } = useEditor();
  const projectState = useLazySubscription("/project/state");
  const scene = useLazySubscription("/scene/:path/:exportName", {
    exportName,
    path,
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
        className={cn([
          "ml-auto h-2.5 w-2.5 flex-shrink-0 rounded-full",
          projectState.isDirty ? "bg-yellow-400" : "bg-neutral-800",
        ])}
        title={projectState.isDirty ? "Unsaved changes" : undefined}
      />
    </h2>
  );
}

function AssetsDrawerButton() {
  const show = useAssetsDrawer((store) => () => store.show());

  return (
    <IconButton
      icon={PlusIcon}
      onClick={show}
      testId="open-assets-drawer"
      title="Add element"
    />
  );
}

function SceneContents() {
  const { enteredComponent, exitComponent, exportName, newFile, path } =
    useEditor();
  const [filter, setFilter] = useState<string | undefined>();

  return (
    <div className="flex h-full flex-shrink flex-col">
      <ComponentHeading />

      <div className="-mt-0.5 mb-2.5 px-4">
        <IDELink column={1} line={1} path={path}>
          View source
        </IDELink>
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <div className="flex px-2 py-1">
        <AssetsDrawerButton />
        <ComponentSandboxButton />
        {import.meta.env.VITE_TEST && (
          <IconButton
            icon={BoxIcon}
            onClick={newFile}
            testId="new-file"
            title="Debug: New file"
          />
        )}
        <div className="ml-auto" />
        <IconButton
          className="-scale-x-100"
          icon={ExitIcon}
          isDisabled={!enteredComponent}
          onClick={exitComponent}
          title="Exit selection"
        />
        <ProviderConfigButton />
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <div className="px-3 py-2">
        <StringInput
          label="Filter elements..."
          name="filter-elements"
          onChange={setFilter}
        />
      </div>

      <ScrollContainer>
        <ReactErrorBoundary
          fallbackRender={(e) => (
            <div
              className="bg-red-500/10 py-1 text-center text-xs italic text-red-400"
              title={e.error.message}
            >
              Error loading elements
            </div>
          )}
          resetKeys={[path, exportName]}
        >
          <JsxElements
            exportName={exportName}
            filter={filter}
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
  const { blur, focus } = useScene();
  const { exportName, path, target } = useEditor();
  const hasState = useSceneState((store) => store.hasState(path + exportName));
  const isSelected = target?.column === -1 && target?.line === -1;

  return (
    <IconButton
      icon={MixerHorizontalIcon}
      isSelected={isSelected || (hasState ? "partial" : false)}
      onClick={() => {
        if (isSelected) {
          blur();
        } else {
          focus({ column: -1, line: -1, parentPath: "", path });
        }
      }}
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
      icon={MixerVerticalIcon}
      isSelected={isOpen || (hasState ? "partial" : false)}
      onClick={toggle}
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
  exportName,
  filter = "",
  level,
  path,
}: {
  exportName: string;
  filter?: string;
  level: number;
  path: string;
}) {
  const scene = useLazySubscription("/scene/:path/:exportName", {
    exportName,
    path,
  });

  return (
    <>
      {scene.sceneObjects.map((element) => {
        return (
          <JsxElementButton
            element={element}
            exportName={exportName}
            filter={filter}
            key={element.name + element.column + element.line}
            level={level}
          />
        );
      })}
    </>
  );
}

function JsxElementButton({
  element,
  exportName,
  filter,
  level,
}: {
  element: JsxElementPositions;
  exportName: string;
  filter?: string;
  level: number;
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
          className={cn([
            match === false && "hidden",
            selected
              ? "border-l-blue-400 bg-white/5 text-blue-400"
              : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
            "group flex w-[242px] cursor-default items-center gap-1 border-l-2 border-transparent px-3 py-1.5 text-left text-sm -outline-offset-1",
          ])}
          onPress={() => {
            focus({
              column: element.column,
              line: element.line,
              parentPath: element.parentPath,
              path: "path" in element ? element.path || "" : "",
            });
          }}
          ref={ref}
          style={{ paddingLeft: level === 1 ? 13 : level * 13 }}
          testId={`${element.name}-L${element.line}C${element.column}`}
          title={element.name}
        >
          {showExpander ? (
            <Pressable
              className="-ml-1 rounded px-0.5 py-0.5 text-inherit hover:bg-white/5 active:bg-white/10"
              onPress={() => {
                startTransition(() => {
                  setIsExpanded((prev) => !prev);
                });
              }}
              title={isExpanded ? "Hide child elements" : "View child elements"}
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
            className="ml-auto rounded px-0.5 py-0.5 text-inherit opacity-0 hover:bg-white/5 focus:opacity-100 active:bg-white/10 group-hover:opacity-100"
            onPress={() =>
              show({
                column: element.column,
                exportName,
                line: element.line,
                path: element.parentPath,
              })
            }
            testId={`add-${element.name}-L${element.line}C${element.column}`}
            title="Add child element"
          >
            <PlusIcon />
          </Pressable>
        </Pressable>

        {isExpanded && showExpander && element.path && (
          <ReactErrorBoundary
            fallbackRender={(e) => (
              <div
                className="bg-red-500/10 py-1 text-center text-xs italic text-red-400"
                title={e.error.message}
              >
                Error loading elements
              </div>
            )}
            resetKeys={[element.path, element.exportName]}
          >
            <JsxElements
              exportName={element.exportName}
              filter={filter}
              level={level + 1}
              path={element.path}
            />
          </ReactErrorBoundary>
        )}
      </Suspense>

      {element.children.map((child) => (
        <JsxElementButton
          element={child}
          exportName={exportName}
          filter={filter}
          key={child.name + child.column + child.line}
          level={level + 1}
        />
      ))}
    </Fragment>
  );
}
