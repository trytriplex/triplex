/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEffect, useState } from "react";
import { cn } from "../util/cn";

interface Asset {
  browser_download_url: string;
  name: string;
}

export function DownloadButton() {
  const [platform, setPlatform] = useState("macOS");
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (navigator.platform.match("Mac")) {
      setPlatform("macOS");
    } else if (navigator.platform.match("Win")) {
      setPlatform("Windows");
    } else {
      setPlatform("Unsupported");
    }
  }, []);

  useEffect(() => {
    async function req() {
      const res = await fetch(
        "https://api.github.com/repos/try-triplex/triplex/releases/latest"
      );
      const json = await res.json();

      if (navigator.platform.match("Mac")) {
        const macOS: Asset[] = json.assets.filter((asset: Asset) =>
          asset.name.endsWith(".dmg")
        );

        setAssets(macOS);
      } else if (navigator.platform.match("Win")) {
        const windows: Asset[] = json.assets.filter((asset: Asset) =>
          asset.name.endsWith(".exe")
        );

        setAssets(windows);
      }
    }

    req();
  }, []);

  return (
    <>
      <a
        href={assets[0] ? assets[0].browser_download_url : "#"}
        target="_blank"
        className={cn([
          platform === "Unsupported"
            ? "cursor-not-allowed bg-neutral-500/80"
            : "cursor-pointer bg-blue-400",
          "mb-2 w-80 rounded-full py-4 text-center text-xl font-bold text-neutral-900",
        ])}
      >
        {platform === "Unsupported"
          ? "Unsupported Platform"
          : `Download For ${platform}`}
      </a>

      {platform === "Unsupported" && (
        <p className="pt-3 text-center text-sm text-neutral-500">
          Triplex supports macOS and Windows.
        </p>
      )}

      {assets.map((asset) => (
        <a
          key={asset.name}
          href={asset.browser_download_url}
          target="_blank"
          className="pt-3 text-center text-sm text-neutral-500 hover:text-neutral-300"
        >
          {asset.name}
        </a>
      ))}
    </>
  );
}
