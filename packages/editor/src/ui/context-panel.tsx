import { preloadSubscription, useLazySubscription } from "@triplex/ws-client";
import { IDELink } from "../util/ide";
import { Suspense, useEffect } from "react";
import { useEditor, FocusedObject } from "../stores/editor";
import { ScrollContainer } from "../ds/scroll-container";
import { PropInput, PropTagContext } from "./prop-input";
import { useScene } from "../stores/scene";
import { PropField } from "./prop-field";
import { GetSceneObject } from "../api-types";
import {
  CameraIcon,
  Crosshair1Icon,
  EnterIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { IconButton } from "../ds/button";
import { ErrorBoundary } from "./error-boundary";

function SelectedSceneObject({ target }: { target: FocusedObject }) {
  const { setPropValue, getPropValue, navigateTo, jumpTo, viewFocusedCamera } =
    useScene();
  const { persistPropValue, deleteComponent } = useEditor();
  const data = useLazySubscription<GetSceneObject>(
    `/scene/${encodeURIComponent(target.ownerPath)}/object/${target.line}/${
      target.column
    }`
  );
  // Most likely a camera component. It might not though be though.
  // A better implementation later would be to traverse this scene objects children
  // And see if a camera exists, if it does enable the button.
  const isCamera = data.name.includes("Camera");
  const filteredProps = data.props.filter((prop) => prop.type !== "spread");

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

      <div className="-mt-0.5 mb-2.5 px-4">
        <IDELink
          path={target.ownerPath}
          column={target.column}
          line={target.line}
        >
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

      <div className="h-[1px] bg-neutral-800" />

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

      <div className="h-[1px] bg-neutral-800" />

      <ScrollContainer>
        <div className="h-3" />

        {filteredProps.length === 0 && (
          <div className="px-4 text-sm italic text-neutral-400">
            This element has no props.
          </div>
        )}

        {filteredProps.map((prop) => (
          <PropField
            htmlFor={prop.name}
            label={prop.name}
            description={prop.description}
            tags={prop.tags}
            key={`${prop.name}${prop.column}${prop.line}`}
          >
            <PropTagContext.Provider value={prop.tags}>
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
            </PropTagContext.Provider>
          </PropField>
        ))}
        <div className="h-1" />
      </ScrollContainer>
    </>
  );
}

export function ContextPanel() {
  const { target } = useEditor();
  if (!target) {
    return null;
  }

  return (
    <div className="pointer-events-none flex w-full flex-col gap-3">
      <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/[97%]">
        <ErrorBoundary keys={[target]}>
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
    </div>
  );
}
