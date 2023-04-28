import { PlusIcon } from "@radix-ui/react-icons";
import { ReactNode, Suspense, useState } from "react";
import { useLazySubscription } from "@triplex/ws-client";
import { IconButton } from "../ds/button";
import { useScene } from "../stores/scene";
import { Drawer } from "../ds/drawer";
import { cn } from "../ds/cn";
import { ScrollContainer } from "../ds/scroll-container";
import { titleCase } from "../util/string";
import {
  ComponentType,
  GetProjectComponentFolders,
  GetProjectComponents,
} from "../api-types";
import { useEditor } from "../stores/editor";
import { StringInput } from "./string-input";

function Component({
  name,
  data,
  onClick,
}: {
  name: string;
  data: ComponentType;
  onClick: () => void;
}) {
  const { target } = useEditor();
  const { addComponent } = useScene();

  const onClickHandler = () => {
    const targetData = target
      ? ({ action: "child", column: target.column, line: target.line } as const)
      : undefined;

    if (data.type === "host") {
      addComponent({
        type: { type: "host", name, props: {} },
        target: targetData,
      });
    } else {
      addComponent({
        type: {
          exportName: data.exportName,
          type: "custom",
          name: data.name,
          path: data.path,
          props: {},
        },
        target: targetData,
      });
    }

    onClick();
  };

  return (
    <button
      onClick={onClickHandler}
      type="button"
      title={name}
      className="relative h-24 w-24 cursor-pointer rounded bg-white/5 hover:bg-white/10 active:bg-white/20"
    >
      <span className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center overflow-hidden text-ellipsis p-1 text-sm text-neutral-400">
        {titleCase(name)}
      </span>
    </button>
  );
}

function Folder({
  isSelected,
  children,
  onClick,
}: {
  isSelected?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn([
        isSelected
          ? "cursor-default bg-white/5 text-blue-400"
          : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
        "w-full rounded-md px-2 py-1 text-start text-sm",
      ])}
    >
      {children}
    </button>
  );
}

function ComponentFolder({
  folderPath,
  onClose,
  filter,
}: {
  filter: string;
  folderPath: string;
  onClose: () => void;
}) {
  const components = useLazySubscription<GetProjectComponents>(
    `/scene/components/${encodeURIComponent(folderPath)}`
  );
  const normalizedFilter = filter.replace(/ /g, "");
  const filteredComponents = components.filter((component) =>
    // Ensure the name is lower case and has no spaces
    component.name.toLowerCase().replace(/ /g, "").includes(normalizedFilter)
  );

  return (
    <ScrollContainer className="min-h-0">
      <div className="flex flex-wrap gap-2 py-2 pr-2">
        {filteredComponents.map((element) =>
          element.type === "host" ? (
            <Component
              onClick={onClose}
              data={{ type: "host", name: element.name, props: {} }}
              name={element.name}
              key={element.name}
            />
          ) : (
            <Component
              key={element.path + element.exportName}
              onClick={onClose}
              name={element.name}
              data={{
                exportName: element.exportName,
                path: element.path,
                name: element.name,
                props: {},
                type: "custom",
              }}
            />
          )
        )}
      </div>
    </ScrollContainer>
  );
}

function ComponentsDrawer({
  onSelected,
  onClose,
  selected,
}: {
  onClose: () => void;
  onSelected: (selected: string) => void;
  selected: string;
}) {
  const { target } = useEditor();
  const { blur } = useScene();
  const [filter, setFilter] = useState("");

  const componentFolders =
    useLazySubscription<GetProjectComponentFolders>("/scene/components");

  const handleFilterChange = (value: string | undefined) => {
    setFilter(value || "");
  };

  return (
    <Drawer mode="transparent" attach="bottom" open onClose={onClose}>
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-grow gap-2">
          <div className="w-40 flex-shrink-0 border-r border-neutral-800">
            <div className="p-2">
              <StringInput
                onChange={handleFilterChange}
                label="Filter elements..."
                name="filter-elements"
              />
            </div>

            <div className="border-t border-neutral-800" />

            <ScrollContainer>
              <div className="h-2" />
              <div className="px-2">
                <Folder
                  onClick={() => onSelected("host")}
                  isSelected={selected === "host"}
                >
                  Built-in Elements
                </Folder>

                {componentFolders.map((folder) => (
                  <Folder
                    key={folder.path}
                    onClick={() => onSelected(folder.path)}
                    isSelected={selected === folder.path}
                  >
                    {titleCase(folder.name)}
                  </Folder>
                ))}
              </div>
              <div className="h-2" />
            </ScrollContainer>
          </div>
          <Suspense fallback={null}>
            <ComponentFolder
              filter={filter}
              onClose={onClose}
              folderPath={selected}
            />
          </Suspense>
        </div>
        {target && (
          <div className="flex flex-grow-0 items-center gap-1 border-t border-neutral-800 px-4">
            <span className="py-1 text-xs text-neutral-400">
              Adding to the{" "}
              <span className="text-blue-400">selected element</span> as a child
              component.
            </span>

            <button
              onClick={blur}
              type="submit"
              className="rounded px-2 py-0.5 text-xs text-neutral-400 hover:bg-white/5 active:bg-white/10"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export function AddComponentDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);
  const [selectedFolder, setSelectedFolder] = useState("host");

  return (
    <>
      <IconButton
        onClick={toggle}
        isSelected={isOpen}
        icon={PlusIcon}
        title="Add Element"
      />

      <Suspense fallback={null}>
        {isOpen && (
          <ComponentsDrawer
            onClose={close}
            onSelected={setSelectedFolder}
            selected={selectedFolder}
          />
        )}
      </Suspense>
    </>
  );
}
