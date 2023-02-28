import { preloadSubscription, useLazySubscription } from "@triplex/ws-client";
import { ErrorBoundary } from "react-error-boundary";
import { getEditorLink } from "../util/ide";
import { Suspense, useDeferredValue, useEffect } from "react";
import { useEditor, FocusedObject } from "../stores/editor";
import { ScrollContainer } from "../ds/scroll-container";

interface Prop {
  column: number;
  line: number;
  name: string;
  value: unknown;
  type: "static" | "unhandled";
}

function Prop({ value, width = "100%" }: { value: unknown; width?: string }) {
  if (Array.isArray(value)) {
    return (
      <div className="flex gap-0.5">
        {value.map((val, index) => (
          <Prop key={index} width={`${100 / value.length}%`} value={val} />
        ))}
      </div>
    );
  }

  const isNumber = Number.isFinite(Number(value));

  let normalizedValue: string | number;

  if (isNumber) {
    const num = Number(value);
    const isDecimal = Math.abs(num) - Math.floor(Math.abs(num)) > 0;
    normalizedValue = isDecimal ? num.toFixed(2) : num;
  } else {
    normalizedValue = `{${value}}`;
  }

  return (
    <input
      style={{ width }}
      readOnly
      className="rounded border-2 border-neutral-700 bg-transparent py-0.5 px-1 text-neutral-400 outline-none"
      value={normalizedValue}
    />
  );
}

function SelectedSceneObject({ target }: { target: FocusedObject }) {
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
        type: unknown;
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
            column: target.column + 1,
            line: target.line + 1,
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

      <div className="h-0.5 bg-neutral-700" />

      <ScrollContainer className="pt-2">
        {data.props.map((prop) => (
          <div className="mb-2 px-4" key={`${prop.column}${prop.line}`}>
            <div>
              <a
                className="text-sm text-neutral-400"
                href={getEditorLink({
                  path: target.ownerPath,
                  // ts-morph/tsc lines start from zero - offset them.
                  column: prop.column + 2,
                  line: prop.line + 1,
                  editor: "vscode",
                })}
              >
                {prop.name}
              </a>
            </div>

            <Prop value={prop.value} />
          </div>
        ))}
        <div className="h-1" />
      </ScrollContainer>
    </>
  );
}

export function ContextPanel() {
  const { target } = useEditor();
  const deferredTarget = useDeferredValue(target);

  if (deferredTarget) {
    return (
      <div className="absolute top-4 right-4 bottom-4 flex w-60 flex-col overflow-hidden rounded-lg bg-neutral-800/90 shadow-2xl shadow-black/50">
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
