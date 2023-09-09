/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "@triplex/ws-client";
import { IDELink } from "../util/ide";
import { Suspense } from "react";
import { useEditor, FocusedObject } from "../stores/editor";
import { ScrollContainer } from "../ds/scroll-container";
import { PropInput, PropTagContext } from "./prop-input";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { PropField } from "./prop-field";
import {
  CameraIcon,
  Cross2Icon,
  Crosshair1Icon,
  EnterIcon,
  EraserIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { IconButton } from "../ds/button";
import { ErrorBoundary } from "./error-boundary";

function SelectedSceneObjectPanel({ target }: { target: FocusedObject }) {
  const { setPropValue, getPropValue, navigateTo, jumpTo, viewFocusedCamera } =
    useScene();
  const { persistPropValue, deleteComponent } = useEditor();

  const data = useLazySubscription("/scene/:path/object/:line/:column", {
    column: target.column,
    line: target.line,
    path: target.path,
  });

  // Most likely a camera component. It might not though be though.
  // A better implementation later would be to traverse this scene objects children
  // And see if a camera exists, if it does enable the button.
  const isCamera = data.name.includes("Camera");

  return (
    <>
      <h2 className="px-4 pt-3 text-xl font-medium text-neutral-300">
        <div className="overflow-hidden text-ellipsis">{data.name}</div>
      </h2>

      <div className="-mt-0.5 mb-2.5 px-4">
        <IDELink path={target.path} column={target.column} line={target.line}>
          View usage
        </IDELink>

        {data.type === "custom" && data.path && (
          <>
            <span className="mx-1.5 text-xs text-neutral-400">•</span>

            <IDELink path={data.path} column={1} line={1}>
              View source
            </IDELink>
          </>
        )}
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <div className="flex px-2 py-1">
        <IconButton
          onClick={() => navigateTo()}
          icon={EnterIcon}
          isDisabled={data.type === "host" || !data.path}
          title="Enter component"
        />
        <IconButton
          onClick={jumpTo}
          icon={Crosshair1Icon}
          title="Focus camera"
        />
        {isCamera && (
          <IconButton
            onClick={viewFocusedCamera}
            icon={CameraIcon}
            title="View camera"
          />
        )}
        <IconButton
          className="ml-auto"
          onClick={deleteComponent}
          icon={TrashIcon}
          title="Delete"
        />
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <ScrollContainer>
        <div className="h-3" />

        {data.props.length === 0 && (
          <div className="px-4 text-sm italic text-neutral-400">
            This element has no props.
          </div>
        )}

        {data.props.map((prop) => {
          const column = "column" in prop ? prop.column : -1;
          const line = "line" in prop ? prop.line : -1;

          return (
            <PropField
              htmlFor={prop.name}
              label={prop.name}
              description={prop.description}
              tags={prop.tags}
              key={`${prop.name}${column}${line}`}
            >
              <PropTagContext.Provider value={prop.tags}>
                <PropInput
                  name={prop.name}
                  column={column}
                  line={line}
                  path={target.path}
                  prop={prop}
                  required={prop.required}
                  onConfirm={async (value) => {
                    const currentValue = await getPropValue({
                      column: target.column,
                      line: target.line,
                      path: target.path,
                      propName: prop.name,
                    });

                    persistPropValue({
                      column: target.column,
                      line: target.line,
                      path: target.path,
                      propName: prop.name,
                      currentPropValue: currentValue.value,
                      nextPropValue: value,
                    });
                  }}
                  onChange={(value) => {
                    setPropValue({
                      column: target.column,
                      line: target.line,
                      path: target.path,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                />
              </PropTagContext.Provider>
            </PropField>
          );
        })}
        <div className="h-1" />
      </ScrollContainer>
    </>
  );
}

function ComponentSandboxPanel() {
  const { path, exportName } = useEditor();
  const data = useLazySubscription("/scene/:path/:exportName/props", {
    path,
    exportName,
  });
  const storeKey = path + exportName;
  const { setPropValue } = useScene();
  const values = useSceneState((state) => state.get(storeKey));
  const setValues = useSceneState((state) => state.set);
  const hasValues = useSceneState((state) => state.hasState(storeKey));
  const clearValues = useSceneState((state) => state.clear);

  return (
    <>
      <h2 className="px-4 pt-3 text-xl font-medium text-neutral-300">
        <div className="overflow-hidden text-ellipsis">Live Edit Props</div>
      </h2>
      <div className="mt-1 px-4 pb-3 text-xs text-neutral-400">
        Editing values here will modify the props given to {exportName} and
        persist only for the duration of this session.
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <div className="flex px-2 py-1">
        <IconButton
          onClick={() => {
            Object.keys(values).forEach((key) => {
              setPropValue({
                column: -1,
                line: -1,
                path,
                propName: key,
                propValue: undefined,
              });
            });

            clearValues(storeKey);
          }}
          icon={EraserIcon}
          isDisabled={!hasValues}
          title="Clear props"
        />
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <ScrollContainer>
        <div className="h-3" />

        {data.props.length === 0 && (
          <div className="px-4 text-sm italic text-neutral-400">
            This component has no props.
          </div>
        )}

        {data.props.map((prop) => {
          return (
            <PropField
              htmlFor={prop.name}
              label={prop.name}
              description={prop.description}
              tags={prop.tags}
              key={prop.name}
            >
              <PropTagContext.Provider value={prop.tags}>
                <PropInput
                  name={prop.name}
                  column={-1}
                  line={-1}
                  path={path}
                  key={String(values[prop.name])}
                  prop={Object.assign(
                    {},
                    prop,
                    values[prop.name] ? { value: values[prop.name] } : {}
                  )}
                  required={prop.required}
                  onConfirm={(value) => {
                    setValues(storeKey, prop.name, value);
                  }}
                  onChange={(value) => {
                    setPropValue({
                      column: -1,
                      line: -1,
                      path,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                />
              </PropTagContext.Provider>
            </PropField>
          );
        })}
        <div className="h-1" />
      </ScrollContainer>
    </>
  );
}

export function ContextPanel() {
  const { target } = useEditor();
  const { blur } = useScene();
  if (!target) {
    return null;
  }

  const isSceneObject = target.column > -1 && target.line > -1;

  return (
    <div className="pointer-events-none flex w-full flex-col gap-3">
      <div className="pointer-events-auto relative flex h-full flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/[97%]">
        <IconButton
          className="absolute -left-10 top-0"
          onClick={blur}
          icon={Cross2Icon}
          title="Close"
        />

        <ErrorBoundary keys={[target]}>
          <Suspense
            fallback={<div className="p-4 text-neutral-400">Loading...</div>}
          >
            {isSceneObject ? (
              <SelectedSceneObjectPanel
                key={target.path + target.column + target.line}
                target={target}
              />
            ) : (
              <ComponentSandboxPanel />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
