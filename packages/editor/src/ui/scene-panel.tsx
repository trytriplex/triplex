import {
  ChangeEventHandler,
  Fragment,
  Suspense,
  useDeferredValue,
} from "react";
import { cn } from "../ds/cn";
import { useLazySubscription } from "@triplex/ws-client";
import { IDELink } from "../util/ide";
import { useEditor } from "../stores/editor";
import { useScene } from "../stores/scene";
import { ScrollContainer } from "../ds/scroll-container";
import { ProjectComponents } from "./project-components";
import { CaretDownIcon, ExitIcon } from "@radix-ui/react-icons";
import { IconButton } from "../ds/button";
import { ErrorBoundary } from "./error-boundary";

function SceneComponent({
  name,
  selected,
  onClick,
  level = 1,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
  level?: number;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      title={name}
      style={{ paddingLeft: level === 1 ? 13 : level * 13 }}
      className={cn([
        selected
          ? "border-l-blue-400 bg-white/5 text-blue-400"
          : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
        "block w-[208px] cursor-default overflow-hidden text-ellipsis border-l-2 border-transparent py-1.5 px-3 text-left text-sm -outline-offset-1",
      ])}
    >
      {name}
    </button>
  );
}

interface JsxElementPositions {
  column: number;
  line: number;
  name: string;
  children: JsxElementPositions[];
  type: "host" | "custom";
}

export function ScenePanel() {
  const { path, exportName } = useEditor();

  return (
    <div className="pointer-events-auto w-full flex-grow overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/[97%] shadow-2xl shadow-black/50">
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
  const file = useLazySubscription<{ isSaved: boolean }>(
    `/scene/${encodeURIComponent(path)}`
  );
  const scene = useLazySubscription<{
    path: string;
    name: string;
    sceneObjects: JsxElementPositions[];
    exports: { name: string; exportName: string }[];
  }>(`/scene/${encodeURIComponent(path)}/${exportName}`);

  const onChangeComponentHandler: ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    const nextValue = e.target.value;
    if (nextValue === "new-component") {
      newComponent();
    } else {
      set({
        encodedProps: "",
        exportName: nextValue,
        path,
      });
    }
  };

  return (
    <h2 className="flex flex-row items-center pl-2 pr-4 pt-3 text-2xl font-medium text-neutral-300">
      <label className="relative flex items-center gap-1.5 overflow-hidden rounded pl-2 pr-1 hover:bg-white/5 active:bg-white/10">
        <span className="overflow-hidden text-ellipsis rounded">
          {scene.name}
        </span>

        <CaretDownIcon className="flex-shrink-0" />

        <select
          className="absolute inset-0 opacity-0 [width:-moz-available]"
          onChange={onChangeComponentHandler}
          value={exportName}
        >
          <optgroup className="m-0 text-xs" label={path.split("/").at(-1)}>
            {scene.exports.map((exp) => (
              <option
                className="text-sm"
                key={exp.exportName}
                value={exp.exportName}
              >
                {exp.name}
              </option>
            ))}
          </optgroup>
          <option value="new-component" className="text-sm">
            New component...
          </option>
        </select>
      </label>

      <span
        aria-label={file.isSaved ? undefined : "Unsaved changes"}
        title="Unsaved changes"
        className={cn([
          "ml-auto h-2 w-2 flex-shrink-0 rounded-full",
          file.isSaved ? "bg-neutral-800" : "bg-yellow-400",
        ])}
      />
    </h2>
  );
}

function SceneContents() {
  const { path, exportName, enteredComponent, exitComponent } = useEditor();

  const scene = useLazySubscription<{
    path: string;
    name: string;
    sceneObjects: JsxElementPositions[];
    exports: { name: string; exportName: string }[];
  }>(`/scene/${encodeURIComponent(path)}/${exportName}`);

  return (
    <div className="flex h-full flex-shrink flex-col">
      <ComponentHeading />

      <div className="mb-2.5 -mt-0.5 px-4">
        <IDELink path={path} column={1} line={1}>
          View source
        </IDELink>
      </div>

      <div className="h-[1px] bg-neutral-800" />

      <div className="flex py-1 px-2">
        <ProjectComponents />
        {enteredComponent && (
          <IconButton
            className="ml-auto -scale-x-100"
            onClick={exitComponent}
            icon={ExitIcon}
            title="Exit component"
          />
        )}
      </div>

      <div className="h-[1px] bg-neutral-800" />

      <ScrollContainer>
        <div className="h-2" />
        <SceneObjectButtons sceneObjects={scene.sceneObjects} />
        <div className="h-2" />
      </ScrollContainer>
    </div>
  );
}

function SceneObjectButtons({
  sceneObjects,
  level = 1,
}: {
  sceneObjects: JsxElementPositions[];
  level?: number;
}) {
  const { focus } = useScene();
  const { target, path } = useEditor();
  const deferredFocus = useDeferredValue(target);

  return (
    <>
      {sceneObjects.map((child) => (
        <Fragment key={child.name + child.column + child.line}>
          <SceneComponent
            onClick={() => {
              focus({
                column: child.column,
                line: child.line,
                ownerPath: path,
              });
            }}
            level={level}
            selected={
              !!deferredFocus &&
              deferredFocus.column === child.column &&
              deferredFocus.line === child.line
            }
            name={child.name}
          />
          <SceneObjectButtons sceneObjects={child.children} level={level + 1} />
        </Fragment>
      ))}
    </>
  );
}
