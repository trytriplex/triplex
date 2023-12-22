/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";
import type {
  Folder as FolderType,
  ProjectAsset as ProjectAssetType,
  ProjectCustomComponent,
  ProjectHostComponent,
} from "@triplex/server";
import {
  preloadSubscription,
  useLazySubscription,
  useSubscription,
} from "@triplex/ws/react";
import { createContext, Suspense, useContext, useState } from "react";
import { cn } from "../ds/cn";
import { Drawer } from "../ds/drawer";
import { Pressable } from "../ds/pressable";
import { ScrollContainer } from "../ds/scroll-container";
import { useAssetsDrawer } from "../stores/assets-drawer";
import { useEditor } from "../stores/editor";
import useEvent from "../util/use-event";
import { StringInput } from "./string-input";
import { AssetThumbnail } from "./thumbnail";

function ProjectAsset({
  asset,
  onClick,
}: {
  asset: ProjectHostComponent | ProjectCustomComponent | ProjectAssetType;
  onClick: () => void;
}) {
  const { addComponent } = useEditor();
  const target = useAssetsDrawer((store) => store.shown);

  const onClickHandler = () => {
    const targetData =
      typeof target === "object"
        ? ({ action: "child", ...target } as const)
        : undefined;

    switch (asset.type) {
      case "host":
        addComponent({
          target: targetData,
          type: { name: asset.name, props: {}, type: "host" },
        });
        break;

      case "custom":
        addComponent({
          target: targetData,
          type: {
            exportName: asset.exportName,
            name: asset.name,
            path: asset.path,
            props: {},
            type: "custom",
          },
        });
        break;

      case "asset":
        addComponent({
          type: {
            exportName: "Gltf",
            name: "Gltf",
            path: "@react-three/drei",
            props: { src: asset.path },
            type: "custom",
          },
        });
        break;
    }

    onClick();
  };

  return (
    <AssetThumbnail
      actionId="confirm_add_element"
      asset={asset}
      onClick={onClickHandler}
    />
  );
}

const FolderContext = createContext(0);

function Folder({
  children = [],
  filesCount = 0,
  isSelected,
  onClick,
  text,
}: {
  children?: (JSX.Element | JSX.Element[])[];
  filesCount?: number;
  isSelected?: boolean;
  onClick?: () => void;
  text: string;
}) {
  const defaultExpanded =
    Array.isArray(children) && children.length > 5 ? false : true;
  const [isExpanded, setExpanded] = useState(defaultExpanded);
  const level = useContext(FolderContext);
  const hasChildrenFolders = children.length > 0;

  return (
    <FolderContext.Provider value={level + 1}>
      <Pressable
        className={cn([
          children ? "px-1" : "px-2",
          isSelected
            ? "bg-white/5 text-blue-400 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-0.5 before:bg-blue-400"
            : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
          "relative flex w-full cursor-default items-center gap-0.5 whitespace-nowrap py-1 text-start text-sm",
        ])}
        focusRing="inset"
        onPress={() => {
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
        pressActionId={
          isExpanded ? "expand_asset_folder" : "collapse_asset_folder"
        }
        style={{ paddingLeft: (level + 1) * 8 }}
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
      </Pressable>

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
      filesCount={folder.files}
      isSelected={folder.path === selected}
      key={folder.path}
      onClick={() => onClick(folder.path)}
      text={folder.name}
    >
      {folder.children.map((child) =>
        renderFolder(child, { onClick, selected })
      )}
    </Folder>
  );
}

function ComponentFolder({
  filter,
  folderPath,
  onClose,
}: {
  filter: string;
  folderPath: { category: "components" | "assets"; path: string };
  onClose: () => void;
}) {
  const components = useLazySubscription(
    `/scene/${folderPath.category}/:folderPath`,
    {
      folderPath: folderPath.path,
    }
  );
  const normalizedFilter = filter.replaceAll(" ", "");
  const filteredComponents = components.map((component) =>
    // Ensure the name is lower case and has no spaces
    component.name.toLowerCase().replaceAll(" ", "").includes(normalizedFilter)
      ? component
      : null
  );

  if (components.length === 0) {
    const message = {
      assets: [
        "No assets exist in this folder.",
        "https://triplex.dev/docs/api-reference/config#assets-directory",
      ],
      components: [
        "No custom components were found to add to your scene.",
        "https://triplex.dev/docs/api-reference/config#components",
      ],
    }[folderPath.category];

    return (
      <div className="m-auto text-center text-sm text-neutral-400">
        {message[0]}
        <br />
        <a
          className="text-blue-400"
          href="#"
          onClick={() => window.triplex.openLink(message[1])}
        >
          Learn more
        </a>
        .
      </div>
    );
  }

  return (
    <ScrollContainer className="min-h-0">
      <div className="flex flex-wrap gap-2 px-2 py-2">
        {filteredComponents.map((element) => {
          if (element === null) {
            return null;
          }

          switch (element.type) {
            case "asset":
              return (
                <ProjectAsset
                  asset={element}
                  key={element.path}
                  onClick={onClose}
                />
              );

            case "custom":
              return (
                <ProjectAsset
                  asset={element}
                  key={element.path + element.exportName}
                  onClick={onClose}
                />
              );

            case "host":
              return (
                <ProjectAsset
                  asset={element}
                  key={element.name}
                  onClick={onClose}
                />
              );
          }
        })}
      </div>
    </ScrollContainer>
  );
}

function ComponentsDrawer({
  onClose,
  onSelected,
  selected,
}: {
  onClose: () => void;
  onSelected: (_: { category: "components" | "assets"; path: string }) => void;
  selected?: { category: "components" | "assets"; path: string };
}) {
  const [filter, setFilter] = useState("");
  const componentFolders = useSubscription("/scene/components");
  const assetFolders = useSubscription("/scene/assets");

  const handleFilterChange = useEvent((value: string | undefined) => {
    setFilter(value || "");
  });

  return (
    <Drawer
      attach="bottom"
      label="assets"
      mode="transparent"
      onClose={onClose}
      open
    >
      <div className="flex h-full flex-col" data-testid="assets-drawer">
        <div className="flex min-h-0 flex-grow">
          <div className="flex w-60 flex-shrink-0 flex-col border-r border-neutral-800">
            <div className="p-2">
              <StringInput
                label="Filter selection..."
                name="filter-elements"
                onChange={handleFilterChange}
              />
            </div>

            <div className="border-t border-neutral-800" />

            <ScrollContainer>
              <div className="h-1" />
              <div className="group flex flex-col">
                <Folder text="Components">
                  <Folder
                    isSelected={selected?.path === "host"}
                    onClick={() =>
                      onSelected({ category: "components", path: "host" })
                    }
                    text="built-in"
                  />

                  {componentFolders.map((folder) =>
                    renderFolder(folder, {
                      onClick: (path: string) =>
                        onSelected({ category: "components", path }),
                      selected: selected?.path,
                    })
                  )}
                </Folder>
                <Folder text="Assets">
                  {assetFolders.map((folder) =>
                    renderFolder(folder, {
                      onClick: (path: string) =>
                        onSelected({ category: "assets", path }),
                      selected: selected?.path,
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
                folderPath={selected}
                onClose={onClose}
              />
            )}
          </Suspense>
        </div>
      </div>
    </Drawer>
  );
}

export function AssetsDrawer() {
  const isShown = useAssetsDrawer((store) => store.shown);
  const close = useAssetsDrawer((store) => store.hide);
  const [selectedFolder, setSelectedFolder] = useState<{
    category: "components" | "assets";
    path: string;
  }>();

  preloadSubscription("/scene/assets");
  preloadSubscription("/scene/components");

  return (
    <Suspense fallback={null}>
      {isShown && (
        <ComponentsDrawer
          onClose={close}
          onSelected={setSelectedFolder}
          selected={selectedFolder}
        />
      )}
    </Suspense>
  );
}
