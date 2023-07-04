/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CaretDownIcon, CaretRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { Suspense, createContext, useContext, useState } from "react";
import {
  useLazySubscription,
  useSubscription,
  preloadSubscription,
} from "@triplex/ws-client";
import { IconButton } from "../ds/button";
import { useScene } from "../stores/scene";
import { Drawer } from "../ds/drawer";
import { cn } from "../ds/cn";
import { ScrollContainer } from "../ds/scroll-container";
import { titleCase } from "../util/string";
import {
  Folder as FolderType,
  GetProjectComponentFolders,
  GetProjectComponents,
  ProjectAsset as ProjectAssetType,
  ProjectCustomComponent,
  ProjectHostComponent,
} from "../api-types";
import { useEditor } from "../stores/editor";
import { StringInput } from "./string-input";

function ProjectAsset({
  name,
  asset,
  onClick,
}: {
  name: string;
  asset: ProjectHostComponent | ProjectCustomComponent | ProjectAssetType;
  onClick: () => void;
}) {
  const { target } = useEditor();
  const { addComponent } = useScene();

  const onClickHandler = () => {
    const targetData = target
      ? ({ action: "child", column: target.column, line: target.line } as const)
      : undefined;

    switch (asset.type) {
      case "host":
        addComponent({
          type: { type: "host", name, props: {} },
          target: targetData,
        });
        break;

      case "custom":
        addComponent({
          type: {
            exportName: asset.exportName,
            type: "custom",
            name: asset.name,
            path: asset.path,
            props: {},
          },
          target: targetData,
        });
        break;

      case "asset":
        addComponent({
          type: {
            type: "custom",
            exportName: "Gltf",
            name: "Gltf",
            path: "@react-three/drei",
            props: { src: asset.path },
          },
        });
        break;
    }

    onClick();
  };

  return (
    <button
      onClick={onClickHandler}
      type="button"
      title={name}
      className="relative h-24 w-24 cursor-default rounded bg-white/5 outline-1 outline-offset-1 outline-blue-400 hover:bg-white/10 focus-visible:outline active:bg-white/20"
    >
      <span className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center overflow-hidden text-ellipsis p-1 text-sm text-neutral-400">
        {asset.type === "asset" ? name : titleCase(name)}
      </span>
    </button>
  );
}

const FolderContext = createContext(0);

function Folder({
  isSelected,
  children = [],
  onClick,
  text,
  filesCount = 0,
}: {
  isSelected?: boolean;
  children?: (JSX.Element | JSX.Element[])[];
  text: string;
  onClick?: () => void;
  filesCount?: number;
}) {
  const defaultExpanded =
    Array.isArray(children) && children.length > 5 ? false : true;
  const [isExpanded, setExpanded] = useState(defaultExpanded);
  const level = useContext(FolderContext);
  const hasChildrenFolders = children.length > 0;

  return (
    <FolderContext.Provider value={level + 1}>
      <button
        onClick={() => {
          if (hasChildrenFolders) {
            if (filesCount > 0 && !isSelected) {
              // Skip expanding but allow onClick to be called.
              onClick?.();
            } else {
              // Expand but don't allow onClick to be called.
              setExpanded((prev) => !prev);
            }
          } else {
            onClick?.();
          }
        }}
        type="button"
        style={{ paddingLeft: (level + 1) * 8 }}
        className={cn([
          "outline-1 -outline-offset-1 outline-blue-400 focus-visible:outline",
          children ? "px-1" : "px-2",
          isSelected
            ? "bg-white/5 text-blue-400 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-0.5 before:bg-blue-400"
            : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
          "relative flex w-full cursor-default items-center gap-0.5 whitespace-nowrap py-1 text-start text-sm",
        ])}
      >
        {hasChildrenFolders ? (
          <>
            {isExpanded ? (
              <CaretDownIcon className="-ml-[2px]" />
            ) : (
              <CaretRightIcon className="-ml-[2px]" />
            )}
          </>
        ) : (
          <CaretDownIcon className="-ml-[2px] opacity-0" />
        )}
        {text}
      </button>

      {hasChildrenFolders && isExpanded && (
        <div className="relative">
          <div
            className="absolute bottom-0 left-8 top-0 border-l border-white/5 opacity-0 group-hover:opacity-100"
            style={{ left: (level + 1) * 8 }}
          />
          {children}
        </div>
      )}
    </FolderContext.Provider>
  );
}

function renderFolder(
  folder: FolderType,
  { onClick, selected }: { onClick: (path: string) => void; selected?: string }
) {
  return (
    <Folder
      key={folder.path}
      text={folder.name}
      isSelected={folder.path === selected}
      filesCount={folder.files}
      onClick={() => onClick(folder.path)}
    >
      {folder.children.map((child) =>
        renderFolder(child, { onClick, selected })
      )}
    </Folder>
  );
}

function ComponentFolder({
  folderPath,
  onClose,
  filter,
}: {
  filter: string;
  folderPath: { path: string; category: "components" | "assets" };
  onClose: () => void;
}) {
  const components = useLazySubscription<GetProjectComponents>(
    `/scene/${folderPath.category}/${encodeURIComponent(folderPath.path)}`
  );
  const normalizedFilter = filter.replace(/ /g, "");
  const filteredComponents = components.filter((component) =>
    // Ensure the name is lower case and has no spaces
    component.name.toLowerCase().replace(/ /g, "").includes(normalizedFilter)
  );

  return (
    <ScrollContainer className="min-h-0">
      <div className="flex flex-wrap gap-2 px-2 py-2">
        {filteredComponents.map((element) => {
          switch (element.type) {
            case "asset":
              return (
                <ProjectAsset
                  key={element.path}
                  onClick={onClose}
                  name={element.name}
                  asset={element}
                />
              );

            case "custom":
              return (
                <ProjectAsset
                  key={element.path + element.exportName}
                  onClick={onClose}
                  name={element.name}
                  asset={element}
                />
              );

            case "host":
              return (
                <ProjectAsset
                  onClick={onClose}
                  asset={element}
                  name={element.name}
                  key={element.name}
                />
              );
          }
        })}
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
  onSelected: (_: { path: string; category: "components" | "assets" }) => void;
  selected?: { path: string; category: "components" | "assets" };
}) {
  const { target } = useEditor();
  const { blur } = useScene();
  const [filter, setFilter] = useState("");

  const componentFolders =
    useSubscription<GetProjectComponentFolders>("/scene/components");
  const assetFolders =
    useSubscription<GetProjectComponentFolders>("/scene/assets");

  const handleFilterChange = (value: string | undefined) => {
    setFilter(value || "");
  };

  return (
    <Drawer mode="transparent" attach="bottom" open onClose={onClose}>
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-grow">
          <div className="flex w-60 flex-shrink-0 flex-col border-r border-neutral-800">
            <div className="p-2">
              <StringInput
                onChange={handleFilterChange}
                label="Filter selection..."
                name="filter-elements"
              />
            </div>

            <div className="border-t border-neutral-800" />

            <ScrollContainer>
              <div className="h-1" />
              <div className="group flex flex-col">
                <Folder text="Assets">
                  {assetFolders.map((folder) =>
                    renderFolder(folder, {
                      selected: selected?.path,
                      onClick: (path: string) =>
                        onSelected({ path, category: "assets" }),
                    })
                  )}
                </Folder>

                <Folder text="Components">
                  <Folder
                    onClick={() =>
                      onSelected({ path: "host", category: "components" })
                    }
                    isSelected={selected?.path === "host"}
                    text="built-in"
                  />

                  {componentFolders.map((folder) =>
                    renderFolder(folder, {
                      selected: selected?.path,
                      onClick: (path: string) =>
                        onSelected({ path, category: "components" }),
                    })
                  )}
                </Folder>
              </div>
              <div className="h-1" />
            </ScrollContainer>
          </div>
          <Suspense fallback={null}>
            {selected && (
              <ComponentFolder
                filter={filter}
                onClose={onClose}
                folderPath={selected}
              />
            )}
          </Suspense>
        </div>
        {target && (
          <div className="flex flex-grow-0 items-center gap-1 border-t border-neutral-800 px-2">
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

export function AssetsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);
  const [selectedFolder, setSelectedFolder] = useState<{
    path: string;
    category: "components" | "assets";
  }>();

  preloadSubscription(["/scene/assets", "/scene/components"]);

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
