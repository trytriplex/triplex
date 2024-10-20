/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useBeginDownloadURL } from "../util/download";

interface Asset {
  browser_download_url: string;
  name: string;
}

export function DownloadButton() {
  const [platform, setPlatform] = useState<
    "macOS" | "Windows" | "Linux" | "Unsupported"
  >("macOS");
  const [assets, setAssets] = useState<Asset[]>([]);
  const beginDownload = useBeginDownloadURL();

  useEffect(() => {
    if (navigator.platform.match("Mac")) {
      setPlatform("macOS");
    } else if (navigator.platform.match("Win")) {
      setPlatform("Windows");
    } else if (navigator.platform.match("Linux")) {
      setPlatform("Linux");
    } else {
      setPlatform("Unsupported");
    }
  }, []);

  useEffect(() => {
    async function req() {
      const res = await fetch(
        "https://api.github.com/repos/trytriplex/triplex/releases/latest",
      );
      const json = await res.json();

      if (navigator.platform.match("Mac")) {
        const macOS: Asset[] = json.assets.filter((asset: Asset) =>
          asset.name.endsWith(".dmg"),
        );

        setAssets(macOS);
      } else if (navigator.platform.match("Win")) {
        const windows: Asset[] = json.assets.filter((asset: Asset) =>
          asset.name.endsWith(".exe"),
        );

        setAssets(windows);
      } else if (navigator.platform.match("Linux")) {
        const linux: Asset[] = json.assets.filter((asset: Asset) =>
          asset.name.endsWith(".AppImage"),
        );

        setAssets(linux);
      }
    }

    req();
  }, []);

  const downloadURL = assets[0] ? assets[0].browser_download_url : "#";

  return (
    <Link
      className="z-10 cursor-pointer bg-blue-400 px-8 py-4 text-center text-2xl font-medium text-neutral-900"
      href={platform === "Unsupported" ? "/download" : downloadURL}
      onClick={(e) => {
        if (platform !== "Unsupported") {
          beginDownload(e, `/docs/overview?dl=${platform.toLowerCase()}`);
        }
      }}
      target={platform === "Unsupported" ? undefined : "_blank"}
    >
      {platform === "Unsupported"
        ? "Download Triplex"
        : `Download for ${platform}`}
    </Link>
  );
}
