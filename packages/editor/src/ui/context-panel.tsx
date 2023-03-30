import { preloadSubscription, useLazySubscription } from "@triplex/ws-client";
import { ErrorBoundary } from "react-error-boundary";
import { getEditorLink } from "../util/ide";
import { Suspense, useEffect } from "react";
import { useEditor, FocusedObject } from "../stores/editor";
import { ScrollContainer } from "../ds/scroll-container";
import { PropInput } from "./prop-input";
import { useScene } from "../stores/scene";
import { PropField } from "./prop-field";
import { GetSceneObject } from "../api-types";

function SelectedSceneObject({ target }: { target: FocusedObject }) {
  const { setPropValue, getPropValue } = useScene();
  const { persistPropValue } = useEditor();
  const data = useLazySubscription<GetSceneObject>(
    `/scene/${encodeURIComponent(target.ownerPath)}/object/${target.line}/${
      target.column
    }`
  );

  useEffect(() => {
    if (data.type === "custom") {
      preloadSubscription(`/scene/${encodeURIComponent(data.path)}`);
    }
  }, [data]);

  return (
    <>
      <h2 className="px-4 pt-3 text-xl font-medium text-neutral-300">
        <div className="overflow-hidden text-ellipsis">{data.name}</div>
      </h2>

      <div className="mb-2.5 -mt-0.5 px-4">
        <a
          className="text-xs text-neutral-400"
          href={getEditorLink({
            path: target.ownerPath,
            column: target.column,
            line: target.line,
            editor: "vscode",
          })}
        >
          View usage
        </a>

        {data.type === "custom" && (
          <>
            <span className="mx-1.5 text-xs text-neutral-400">•</span>

            <a
              className="text-xs text-neutral-400"
              href={getEditorLink({
                path: data.path,
                column: 1,
                line: 1,
                editor: "vscode",
              })}
            >
              View source
            </a>
          </>
        )}
      </div>

      <div className="h-[1px] bg-neutral-800" />

      <ScrollContainer>
        <div className="h-4" />

        {data.props
          .filter((prop) => prop.type !== "spread")
          .map((prop) => (
            <PropField
              htmlFor={prop.name}
              label={prop.name}
              description={prop.description}
              key={`${prop.name}${prop.column}${prop.line}`}
            >
              <PropInput
                name={prop.name}
                column={prop.column}
                line={prop.line}
                path={target.ownerPath}
                prop={prop}
                required={prop.required}
                onConfirm={async (value) => {
                  const currentValue = await getPropValue({
                    column: target.column,
                    line: target.line,
                    path: target.ownerPath,
                    propName: prop.name,
                  });

                  persistPropValue({
                    column: target.column,
                    line: target.line,
                    path: target.ownerPath,
                    propName: prop.name,
                    currentPropValue: currentValue.value,
                    nextPropValue: value,
                  });
                }}
                onChange={(value) =>
                  setPropValue({
                    column: target.column,
                    line: target.line,
                    path: target.ownerPath,
                    propName: prop.name,
                    propValue: value,
                  })
                }
              />
            </PropField>
          ))}
        <div className="h-2" />
      </ScrollContainer>
    </>
  );
}

export function ContextPanel() {
  const { target } = useEditor();

  return (
    <div className="pointer-events-none absolute top-4 right-4 bottom-4 flex w-72 flex-col gap-3">
      {target && (
        <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/[97%] shadow-2xl shadow-black/50">
          <ErrorBoundary
            resetKeys={[target]}
            fallbackRender={() => (
              <div className="p-4 text-neutral-400">Error!</div>
            )}
          >
            <Suspense
              fallback={<div className="p-4 text-neutral-400">Loading...</div>}
            >
              <SelectedSceneObject
                key={target.ownerPath + target.column + target.line}
                target={target}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
