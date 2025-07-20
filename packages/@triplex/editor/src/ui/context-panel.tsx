/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Cross2Icon, EraserIcon } from "@radix-ui/react-icons";
import { send } from "@triplex/bridge/host";
import { useScreenView } from "@triplex/ux";
import { Suspense, useDeferredValue, useEffect, useState } from "react";
import { IconButton } from "../ds/button";
import { ExternalLink } from "../ds/external-link";
import { ScrollContainer } from "../ds/scroll-container";
import { PanelSkeleton } from "../ds/skeleton";
import { useEditor, type FocusedObject } from "../stores/editor";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { IDELink } from "../util/ide";
import { useLazySubscription } from "../util/ws";
import { ErrorBoundary } from "./error-boundary";
import { PropField } from "./prop-field";
import { PropInput, PropTagContext } from "./prop-input";
import { ProviderConfig } from "./provider-config";
import { StringInput } from "./string-input";

function SelectedSceneObjectPanel({
  filter,
  setFilter,
  target,
}: {
  filter: string | undefined;
  setFilter: (filter: string | undefined) => void;
  target: FocusedObject;
}) {
  useScreenView("component_props", "Panel");

  const { setPropValue } = useScene();
  const { persistPropValue } = useEditor();

  const data = useLazySubscription("/scene/:path/object/:line/:column", {
    column: target.column,
    line: target.line,
    path: target.parentPath,
  });

  useEffect(() => {
    send("element-focused-props", {
      props: data?.props.map((props) => props.name) || [],
    });

    return () => {
      send("element-focused-props", { props: [] });
    };
  }, [data?.props]);

  return (
    <>
      <h2
        className="px-4 pt-3 text-sm font-medium text-neutral-300"
        data-testid="context-panel-heading"
      >
        <div className="overflow-hidden text-ellipsis">{data?.name}</div>
      </h2>

      <div className="-mt-0.5 mb-2.5 px-4">
        <IDELink
          actionId="contextpanel_element_usage"
          column={target.column}
          line={target.line}
          path={target.parentPath}
        >
          View usage
        </IDELink>

        {data?.type === "custom" && data.path && (
          <>
            <span className="mx-1.5 text-xs text-neutral-400">•</span>

            <IDELink
              actionId="contextpanel_element_source"
              column={1}
              line={1}
              path={data.path}
            >
              View source
            </IDELink>
          </>
        )}
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      {data && data.props.length > 0 && (
        <div className="px-3 py-2">
          <StringInput
            actionId="contextpanel_input_componentprops_filter"
            defaultValue={filter}
            label="Filter props..."
            name="prop-filter"
            onChange={setFilter}
          />
        </div>
      )}

      <ScrollContainer>
        {data?.props.length === 0 && (
          <div className="px-4 py-3 text-xs italic text-neutral-400">
            This element has no props.
          </div>
        )}

        {data?.props.map((prop) => {
          if (!prop.name.toLowerCase().includes(filter?.toLowerCase() || "")) {
            return null;
          }

          const column = "column" in prop ? prop.column : -1;
          const line = "line" in prop ? prop.line : -1;
          const value = "value" in prop ? prop.value : prop.defaultValue?.value;

          return (
            <PropField
              description={prop.description}
              htmlFor={prop.name}
              key={`${prop.name}${column}${line}`}
              label={prop.name}
              labelAlignment={prop.kind === "tuple" ? "start" : "center"}
              tags={prop.tags}
            >
              <PropTagContext.Provider value={prop.tags}>
                <PropInput
                  column={column}
                  line={line}
                  name={prop.name}
                  onChange={(value) => {
                    setPropValue({
                      column: target.column,
                      line: target.line,
                      path: target.parentPath,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                  onConfirm={(value) => {
                    persistPropValue({
                      column: target.column,
                      line: target.line,
                      path: target.parentPath,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                  path={target.parentPath}
                  prop={Object.assign({}, prop, { value })}
                  required={prop.required}
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

function ComponentSandboxPanel({
  filter,
  setFilter,
}: {
  filter: string | undefined;
  setFilter: (filter: string | undefined) => void;
}) {
  useScreenView("component_controls", "Panel");
  const { exportName, path } = useEditor();
  const data = useLazySubscription("/scene/:path/:exportName/props", {
    exportName,
    path,
  });
  const storeKey = path + exportName;
  const { setPropValue } = useScene();
  const values = useSceneState((state) => state.get(storeKey));
  const setValues = useSceneState((state) => state.set);
  const hasValues = useSceneState((state) => state.hasState(storeKey));
  const clearValues = useSceneState((state) => state.clear);

  return (
    <>
      <h2 className="px-4 pt-3 text-sm font-medium text-neutral-300">
        <div className="overflow-hidden text-ellipsis">Component Controls</div>
      </h2>
      <div className="-mt-0.5 mb-2.5 px-4">
        <ExternalLink
          actionId="contextpanel_docs_componentcontrols"
          size="xs"
          to="https://triplex.dev/docs/building-your-scene/scene/component-controls"
          variant="subtle"
        >
          Learn more
        </ExternalLink>
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      {!!data?.props.length && (
        <div className="flex py-2 pl-3 pr-2">
          <StringInput
            actionId="contextpanel_input_controlsprops_filter"
            defaultValue={filter}
            label="Filter props..."
            name="prop-filter"
            onChange={setFilter}
          />
          <div className="w-1 flex-shrink-0" />
          <IconButton
            actionId="contextpanel_input_controlsprops_reset"
            icon={EraserIcon}
            isDisabled={!hasValues}
            label="Reset Props"
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
          />
        </div>
      )}

      <ScrollContainer>
        {!data?.props.length && (
          <div className="flex flex-col gap-2 px-4 py-3">
            <span className="text-xs text-neutral-400">
              Props declared on your component appear here that can be set
              temporarily during this session.
            </span>

            <ExternalLink
              actionId="contextpanel_docs_componentcontrols"
              size="xs"
              to="https://triplex.dev/docs/building-your-scene/scene/component-controls"
            >
              Learn how to use this feature.
            </ExternalLink>
          </div>
        )}

        {data?.props.map((prop) => {
          if (!prop.name.toLowerCase().includes(filter?.toLowerCase() || "")) {
            return null;
          }

          const value =
            prop.name in values ? values[prop.name] : prop.defaultValue?.value;

          return (
            <PropField
              description={prop.description}
              htmlFor={prop.name}
              key={prop.name}
              label={prop.name}
              tags={prop.tags}
            >
              <PropTagContext.Provider value={prop.tags}>
                <PropInput
                  column={-1}
                  key={String(values[prop.name])}
                  line={-1}
                  name={prop.name}
                  onChange={(value) => {
                    setPropValue({
                      column: -1,
                      line: -1,
                      path,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                  onConfirm={(value) => {
                    setValues(storeKey, prop.name, value);
                  }}
                  path={path}
                  prop={Object.assign({}, prop, { value })}
                  required={prop.required}
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
  const deferredTarget = useDeferredValue(target);
  const [filter, setFilter] = useState<string | undefined>();
  const closeActionId = deferredTarget
    ? deferredTarget.column > -1 && deferredTarget.line > -1
      ? "contextpanel_element_blur"
      : "contextpanel_controls_close"
    : "(UNSAFE_SKIP)";

  return (
    <div
      className="pointer-events-auto relative flex h-full w-full flex-col overflow-hidden rounded-[inherit] border border-neutral-800 bg-neutral-900/[97%]"
      data-testid="context-panel"
    >
      {deferredTarget && (
        <IconButton
          actionId={closeActionId}
          className="absolute right-1.5 top-3"
          icon={Cross2Icon}
          label="Close"
          onClick={blur}
        />
      )}

      <ErrorBoundary keys={[deferredTarget]}>
        <Suspense fallback={<PanelSkeleton />}>
          {deferredTarget ? (
            <>
              {deferredTarget.column > -1 && deferredTarget.line > -1 ? (
                <SelectedSceneObjectPanel
                  filter={filter}
                  key={
                    deferredTarget.path +
                    deferredTarget.column +
                    deferredTarget.line
                  }
                  setFilter={setFilter}
                  target={deferredTarget}
                />
              ) : (
                <ComponentSandboxPanel filter={filter} setFilter={setFilter} />
              )}
            </>
          ) : (
            <ProviderConfig />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
