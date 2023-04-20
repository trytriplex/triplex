import { PlusIcon } from "@radix-ui/react-icons";
import { ReactNode, Suspense, useState } from "react";
import { useLazySubscription } from "@triplex/ws-client";
import { IconButton } from "../ds/button";
import { useScene } from "../stores/scene";
import { Drawer } from "../ds/drawer";
import { cn } from "../ds/cn";
import { ScrollContainer } from "../ds/scroll-container";
import { camelToStartCase } from "../util/string";
import {
  ComponentType,
  GetProjectComponentFolders,
  GetProjectComponents,
} from "../api-types";

function Component({
  name,
  data,
  onClick,
}: {
  name: string;
  data: ComponentType;
  onClick: () => void;
}) {
  const { addComponent } = useScene();

  const onClickHandler = () => {
    if (data.type === "host") {
      addComponent({
        type: "host",
        name,
        props: {},
      });
    } else {
      addComponent({
        exportName: data.exportName,
        type: "custom",
        name: data.name,
        path: data.path,
        props: {},
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
        {camelToStartCase(name)}
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
          ? "bg-white/5 text-blue-400"
          : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
        "w-full rounded px-2 py-1 text-start text-sm",
      ])}
    >
      {children}
    </button>
  );
}

function ComponentFolder({
  folderPath,
  onClose,
}: {
  folderPath: string;
  onClose: () => void;
}) {
  const folderComponents = useLazySubscription<GetProjectComponents>(
    `/scene/components/${encodeURIComponent(folderPath)}`
  );

  return (
    <ScrollContainer>
      <div className="flex w-full flex-wrap gap-2 py-2 pr-2">
        {folderComponents.map((element) =>
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
  const componentFolders =
    useLazySubscription<GetProjectComponentFolders>("/scene/components");

  return (
    <Drawer mode="transparent" attach="bottom" open onClose={onClose}>
      <div className="flex h-full gap-2">
        <div className="w-40 flex-shrink-0 border-r border-neutral-800">
          <ScrollContainer>
            <div className="h-2" />
            <div className="px-2">
              <Folder
                onClick={() => onSelected("host")}
                isSelected={selected === "host"}
              >
                Built-in Elements
              </Folder>
            </div>

            {componentFolders.length ? (
              <div className="my-2 border-t border-neutral-800" />
            ) : null}

            <div className="px-2">
              {componentFolders.map((folder) => (
                <Folder
                  key={folder.path}
                  onClick={() => onSelected(folder.path)}
                  isSelected={selected === folder.path}
                >
                  {camelToStartCase(folder.name)}
                </Folder>
              ))}
            </div>
            <div className="h-2" />
          </ScrollContainer>
        </div>
        <Suspense fallback={null}>
          <ComponentFolder onClose={onClose} folderPath={selected} />
        </Suspense>
      </div>
    </Drawer>
  );
}

export function ProjectComponents() {
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
        title="Add component"
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
