/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  CameraIcon,
  CaretDownIcon,
  CaretRightIcon,
  Crosshair1Icon,
  ExclamationTriangleIcon,
  ExitIcon,
  MixerVerticalIcon,
  Pencil2Icon,
  PlusIcon,
  TrashIcon,
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
import { useScreenView } from "../analytics";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { Pressable } from "../ds/pressable";
import { ScrollContainer } from "../ds/scroll-container";
import { PanelSkeleton } from "../ds/skeleton";
import { useEnvironment } from "../environment";
import { useAssetsDrawer } from "../stores/assets-drawer";
import { useEditor } from "../stores/editor";
import { useProviderStore } from "../stores/provider";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { IDELink } from "../util/ide";
import { ErrorBoundary } from "./error-boundary";
import { ProviderConfig } from "./provider-config";
import { StringInput } from "./string-input";

export function ScenePanel() {
  const { exportName, path } = useEditor();
  useScreenView("scene", "Panel");

  return (
    <div
      className="pointer-events-auto relative w-full flex-grow overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/[97%]"
      data-testid="scene-panel"
    >
      <ErrorBoundary keys={[path, exportName]}>
        <SceneContents />
      </ErrorBoundary>
    </div>
  );
}

function ComponentHeading() {
  const { exportName, newComponent, path, set } = useEditor();
  const { config } = useEnvironment();
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
      <label className="relative mr-auto flex items-center gap-1.5 overflow-hidden rounded pl-2 pr-1 outline-1 outline-offset-1 outline-blue-400 focus-within:outline hover:bg-white/5 active:bg-white/10">
        <span
          className="overflow-hidden text-ellipsis rounded"
          data-testid="scene-panel-heading"
        >
          {scene.name}
        </span>

        <CaretDownIcon className="flex-shrink-0" />

        <select
          className="absolute inset-0 text-sm opacity-0 [color-scheme:dark] [width:-moz-available]"
          data-testid="component-select-input"
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

      {!scene.matchesFilesGlob && (
        <IconButton
          actionId="component_outside_of_project_files"
          className="-mr-1.5 ml-1 text-orange-400"
          icon={ExclamationTriangleIcon}
          label="Warning: This component is outside of your declared project files. Click to learn more."
          onClick={() =>
            window.triplex.openLink(
              "https://triplex.dev/docs/supporting/component-outside-of-project-files?meta=" +
                encodeURIComponent(
                  JSON.stringify({
                    files: config.files.map((file) =>
                      file.replace(config.cwd, "..")
                    ),
                    path: scene.path.replace(config.cwd, ".."),
                  })
                )
            )
          }
        />
      )}
    </h2>
  );
}

function AssetsDrawerButton() {
  const show = useAssetsDrawer((store) => () => store.show());

  return (
    <IconButton
      actionId="open_assets_drawer"
      icon={PlusIcon}
      label="Add element"
      onClick={show}
      testId="open-assets-drawer"
    />
  );
}

function SceneContents() {
  const { enteredComponent, exitComponent, exportName, path } = useEditor();
  const [filter, setFilter] = useState<string | undefined>();

  return (
    <div className="flex h-full flex-shrink flex-col">
      <div className="flex p-1">
        <ProviderConfigButton />
      </div>

      <div className="max-h-40">
        <ScrollContainer>
          <ProviderConfig />
        </ScrollContainer>
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <Suspense fallback={<PanelSkeleton />}>
        <ComponentHeading />

        <div className="-mt-0.5 mb-2.5 px-4">
          <IDELink column={1} line={1} path={path}>
            View source
          </IDELink>
        </div>

        <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

        <div className="flex py-2 pl-3 pr-2">
          <StringInput
            label="Filter elements..."
            name="filter-elements"
            onChange={setFilter}
          />
          <div className="w-1 flex-shrink-0" />
          {enteredComponent && (
            <IconButton
              actionId="exit_component"
              className="-scale-x-100"
              icon={ExitIcon}
              label="Exit selection"
              onClick={exitComponent}
            />
          )}
          <LiveEditPropsButton />
          <AssetsDrawerButton />
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
      </Suspense>
    </div>
  );
}

function LiveEditPropsButton() {
  const { blur, focus } = useScene();
  const { exportName, path, target } = useEditor();
  const hasState = useSceneState((store) => store.hasState(path + exportName));
  const isSelected = target?.column === -1 && target?.line === -1;

  return (
    <IconButton
      actionId="live_edit_props"
      icon={Pencil2Icon}
      isSelected={isSelected || (hasState ? "partial" : false)}
      label="Live edit props"
      onClick={() => {
        if (isSelected) {
          blur();
        } else {
          focus({ column: -1, line: -1, parentPath: "", path });
        }
      }}
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
      actionId="provider_controls"
      icon={MixerVerticalIcon}
      isSelected={isOpen || (hasState ? "partial" : false)}
      label="Provider controls"
      onClick={toggle}
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
  const { enterCamera, focus, jumpTo, navigateTo } = useScene();
  const { deleteComponent, target } = useEditor();
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
            "group relative flex w-[274px] cursor-default items-center gap-1 border-l-2 border-transparent px-3 py-1.5 text-left text-sm -outline-offset-1",
          ])}
          doublePressActionId="navigate_to_element"
          onDoublePress={() => {
            navigateTo();
          }}
          onPress={() => {
            focus({
              column: element.column,
              line: element.line,
              parentPath: element.parentPath,
              path: "path" in element ? element.path || "" : "",
            });
          }}
          pressActionId="focus_element"
          ref={ref}
          style={{ paddingLeft: level === 1 ? 13 : level * 13 }}
          testId="scene-element"
          title={element.name}
        >
          {showExpander ? (
            <IconButton
              actionId={
                isExpanded ? "hide_child_elements" : "show_child_elements"
              }
              className="-my-1 -ml-2"
              color="inherit"
              icon={isExpanded ? CaretDownIcon : CaretRightIcon}
              label={isExpanded ? "Hide child elements" : "View child elements"}
              onClick={() => {
                startTransition(() => {
                  setIsExpanded((prev) => !prev);
                });
              }}
              size="sm"
              testId="expand"
            />
          ) : (
            <span className="w-4 flex-shrink-0" />
          )}

          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {element.name}
          </span>

          <div
            className={cn([
              selected ? "opacity-100" : "absolute opacity-0",
              "-my-1 -mr-0.5 ml-auto flex items-center focus-within:static focus-within:opacity-100 group-hover:static group-hover:opacity-100",
            ])}
          >
            {element.name.includes("Camera") && (
              // Most likely a camera component. It might not be though.
              // A better implementation later would be to traverse this scene objects children
              // And see if a camera exists, if it does enable the button.
              <IconButton
                actionId="enter_camera"
                color="inherit"
                icon={CameraIcon}
                label="Enter camera"
                onClick={() =>
                  enterCamera({
                    column: element.column,
                    line: element.line,
                    path: element.parentPath,
                  })
                }
                size="sm"
                testId="enter-camera"
              />
            )}
            <IconButton
              actionId="delete_element"
              color="inherit"
              icon={TrashIcon}
              label="Delete"
              onClick={() =>
                deleteComponent({
                  column: element.column,
                  line: element.line,
                  parentPath: element.parentPath,
                })
              }
              size="sm"
              testId="delete"
            />
            <IconButton
              actionId="jump_to_element"
              color="inherit"
              icon={Crosshair1Icon}
              label="Jump to this element"
              onClick={() =>
                jumpTo({
                  column: element.column,
                  line: element.line,
                  path: element.parentPath,
                })
              }
              size="sm"
              testId="jump-to"
            />
            <IconButton
              actionId="add_child_element"
              color="inherit"
              icon={PlusIcon}
              label="Add child element"
              onClick={() =>
                show({
                  column: element.column,
                  exportName,
                  line: element.line,
                  path: element.parentPath,
                })
              }
              size="sm"
              testId="add"
            />
          </div>
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
