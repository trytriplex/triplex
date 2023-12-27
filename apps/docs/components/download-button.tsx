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
      setPlatform("macOS (ARM64)");
    } else if (navigator.platform.match("Win")) {
      setPlatform("Windows");
    } else if (navigator.platform.match("Linux")) {
      setPlatform("Linux (ARM64)");
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
      } else if (navigator.platform.match("Linux")) {
        const linux: Asset[] = json.assets.filter((asset: Asset) =>
          asset.name.endsWith(".AppImage")
        );

        setAssets(linux);
      }
    }

    req();
  }, []);

  return (
    <>
      <a
        className={cn([
          platform === "Unsupported"
            ? "cursor-not-allowed bg-neutral-500/80"
            : "cursor-pointer bg-blue-400",
          "mb-2 rounded-full px-12 py-4 text-center text-xl font-bold tracking-tight text-neutral-900",
        ])}
        href={assets[0] ? assets[0].browser_download_url : "#"}
        rel="noreferrer"
        target="_blank"
      >
        {platform === "Unsupported"
          ? "Unsupported Platform"
          : `Download for ${platform}`}
      </a>

      {platform === "Unsupported" && (
        <p className="pt-3 text-center text-sm text-neutral-400">
          Triplex supports macOS, Windows, and Linux.
        </p>
      )}

      {assets.map((asset) => (
        <a
          className="pt-3 text-center text-sm text-neutral-400 hover:text-neutral-300"
          href={asset.browser_download_url}
          key={asset.name}
          rel="noreferrer"
          target="_blank"
        >
          {asset.name}
        </a>
      ))}
    </>
  );
}
