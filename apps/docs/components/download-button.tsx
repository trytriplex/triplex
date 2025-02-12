/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "../util/cn";
import { useBeginDownloadURL } from "../util/download";

interface Asset {
  browser_download_url: string;
  name: string;
}

export function DownloadButton({
  variant = "button",
}: {
  variant?: "button" | "link";
}) {
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
      className={cn([
        variant === "link" &&
          "text-subtle font-default hover:text-default text-base underline",
        variant === "button" &&
          "text-inverse bg-brand cursor-pointer px-8 py-4 text-center font-mono text-2xl font-medium",
      ])}
      href={platform === "Unsupported" ? "/download" : downloadURL}
      onClick={(e) => {
        if (platform !== "Unsupported") {
          beginDownload(e, `/docs/overview?dl=${platform.toLowerCase()}`);
        }
      }}
      target={platform === "Unsupported" ? undefined : "_blank"}
    >
      {platform === "Unsupported"
        ? "Download Standalone"
        : `Download for ${platform}`}
    </Link>
  );
}
