/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import {
  type ProjectAsset,
  type ProjectCustomComponent,
  type ProjectHostComponent,
} from "@triplex/server";
import { type ActionId } from "@triplex/ux";
import { IconButton } from "../ds/button";
import { Interactive } from "../ds/interactive";
import { Pressable } from "../ds/pressable";
import { titleCase } from "../util/string";

export function AssetThumbnail({
  actionId,
  asset,
  onClick,
}: {
  actionId: ActionId;
  asset: ProjectHostComponent | ProjectCustomComponent | ProjectAsset;
  onClick: () => void;
}) {
  const label = asset.type === "asset" ? asset.name : titleCase(asset.name);

  return (
    <div className="flex w-24 flex-col gap-1">
      <Pressable
        className="relative h-24 w-24 rounded-sm bg-white/5"
        label={label}
        onPress={onClick}
        pressActionId={actionId}
      >
        <div className="absolute inset-0 ml-[50%] mt-[50%] h-12 w-12 translate-x-[-50%] translate-y-[-50%] rotate-45 border border-neutral-400" />

        <Interactive />

        <div className="absolute right-0 top-0 flex p-0.5 opacity-0 hover:opacity-100">
          {process.env.NODE_ENV === "development" &&
            asset.type === "custom" && (
              <IconButton
                actionId="(UNSAFE_SKIP)"
                icon={OpenInNewWindowIcon}
                label="Debug: Open Render"
                onClick={() =>
                  window.triplex.openLink(
                    `http://localhost:${
                      window.triplex.env.ports.client
                    }/__thumbnail?path=${encodeURIComponent(
                      asset.path,
                    )}&exportName=${asset.exportName}`,
                  )
                }
                size="sm"
              />
            )}
        </div>
      </Pressable>

      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-neutral-400">
        {label}
      </div>
    </div>
  );
}
