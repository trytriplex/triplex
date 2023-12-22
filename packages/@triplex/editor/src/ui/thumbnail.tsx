/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CodeIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import {
  type ProjectAsset,
  type ProjectCustomComponent,
  type ProjectHostComponent,
} from "@triplex/server";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { Interactive } from "../ds/interactive";
import { Pressable } from "../ds/pressable";
import { titleCase } from "../util/string";

export function AssetThumbnail({
  actionId,
  asset,
  onClick,
}: {
  actionId: string;
  asset: ProjectHostComponent | ProjectCustomComponent | ProjectAsset;
  onClick: () => void;
}) {
  return (
    <Pressable
      className="relative h-24 w-24 rounded bg-white/5"
      onPress={onClick}
      pressActionId={actionId}
    >
      {asset.type === "custom" && (
        <img
          className="absolute inset-0 h-full w-full rounded-[inherit] object-cover"
          data-testid={`Thumbnail(${asset.name})`}
          loading="lazy"
          src={`http://localhost:${
            window.triplex.env.ports.server
          }/thumbnail/${encodeURIComponent(asset.path)}/${asset.exportName}`}
        />
      )}
      <div
        className={cn([
          asset.type === "custom"
            ? "bottom-0.5 left-0 right-0"
            : "inset-0 items-center",
          "absolute flex justify-center break-words p-0.5 text-center text-xs",
        ])}
      >
        <div>
          <span className="rounded bg-neutral-900 box-decoration-clone px-0.5 text-neutral-300">
            {asset.type === "asset" ? asset.name : titleCase(asset.name)}
          </span>
        </div>
      </div>
      <Interactive />
      <div className="absolute right-0 top-0 flex p-0.5">
        {process.env.NODE_ENV === "development" && asset.type === "custom" && (
          <IconButton
            actionId="open_render_debug"
            icon={OpenInNewWindowIcon}
            label="Debug: Open thumbnail render"
            onClick={() =>
              window.triplex.openLink(
                `http://localhost:${
                  window.triplex.env.ports.client
                }/__thumbnail?path=${encodeURIComponent(
                  asset.path
                )}&exportName=${asset.exportName}`
              )
            }
            size="sm"
          />
        )}
        {asset.type === "custom" && (
          <IconButton
            actionId="view_source_assets_drawer"
            icon={CodeIcon}
            label="View source"
            onClick={() => window.triplex.openIDE(asset.path)}
            size="sm"
          />
        )}
      </div>
    </Pressable>
  );
}
