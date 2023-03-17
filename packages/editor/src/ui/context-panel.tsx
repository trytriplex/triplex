import { preloadSubscription, useLazySubscription } from "@triplex/ws-client";
import { ErrorBoundary } from "react-error-boundary";
import { getEditorLink } from "../util/ide";
import { Suspense, useDeferredValue, useEffect } from "react";
import { useEditor, FocusedObject } from "../stores/editor";
import { ScrollContainer } from "../ds/scroll-container";
import { Prop, PropInput } from "./prop-input";
import { useScene } from "../scence-bridge";
import { cn } from "../ds/cn";

function SelectedSceneObject({ target }: { target: FocusedObject }) {
  const { setProp } = useScene();
  const { persistPropValue } = useEditor();
  const data = useLazySubscription<{
    name: string;
    type: "custom" | "host";
    path: string;
    props: Prop[];
    propTypes: Record<
      string,
      {
        name: string;
        required: boolean;
        description: string | null;
        type: {
          type: string;
          value?: unknown;
        };
      }
    >;
  }>(
    `/scene/${encodeURIComponent(target.ownerPath)}/object/${target.line}/${
      target.column
    }`
  );

  useEffect(() => {
    if (data.type === "custom" && data.path) {
      preloadSubscription(`/scene/${encodeURIComponent(data.path)}`);
    }
  }, [data.path, data.type]);

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

        {data.path && (
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
            <div
              className={cn([
                prop.type === "array"
                  ? "-mt-2 py-2 hover:bg-white/[2%]"
                  : "mb-2",
                "flex w-full flex-shrink gap-2 px-4",
              ])}
              key={`${prop.name}${prop.column}${prop.line}`}
            >
              <div
                title={prop.name}
                className="h-7 w-[61px] overflow-hidden text-ellipsis pt-1 text-right text-sm text-neutral-400"
              >
                <label htmlFor={prop.name}>{prop.name}</label>
              </div>

              <div className="flex w-[139px] flex-shrink-0 flex-col justify-center gap-1">
                <PropInput
                  path={target.ownerPath}
                  prop={prop}
                  onConfirm={(value) =>
                    persistPropValue({
                      column: target.column,
                      line: target.line,
                      path: target.ownerPath,
                      propName: prop.name,
                      propValue: value,
                    })
                  }
                  onChange={(value) =>
                    setProp({
                      column: target.column,
                      line: target.line,
                      path: target.ownerPath,
                      propName: prop.name,
                      propValue: value,
                    })
                  }
                />
              </div>
            </div>
          ))}
        <div className="h-2" />
      </ScrollContainer>
    </>
  );
}

export function ContextPanel() {
  const { target } = useEditor();
  const deferredTarget = useDeferredValue(target);

  if (deferredTarget) {
    return (
      <div className="absolute top-4 right-4 bottom-4 flex w-60 flex-col overflow-hidden rounded-lg bg-neutral-900/[97%] shadow-2xl shadow-black/50">
        <ErrorBoundary
          resetKeys={[deferredTarget]}
          fallbackRender={() => (
            <div className="p-4 text-neutral-400">Error!</div>
          )}
        >
          <Suspense
            fallback={<div className="p-4 text-neutral-400">Loading...</div>}
          >
            <SelectedSceneObject target={deferredTarget} />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }

  return null;
}
