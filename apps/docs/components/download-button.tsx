import { useEffect, useState } from "react";

interface Asset {
  browser_download_url: string;
  name: string;
}

export function DownloadButton() {
  const [platform, setPlatform] = useState("macOS");
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setPlatform(navigator.platform.match("Mac") ? "macOS" : "Windows");
  }, []);

  useEffect(() => {
    async function req() {
      const res = await fetch(
        "https://api.github.com/repos/try-triplex/releases/releases/latest"
      );
      const json = await res.json();

      const macOS: Asset[] = json.assets.filter((asset: Asset) =>
        asset.name.endsWith(".dmg")
      );
      const windows: Asset[] = json.assets.filter((asset: Asset) =>
        asset.name.endsWith(".exe")
      );

      const isMac = !!navigator.platform.match("Mac");

      if (isMac) {
        setAssets(macOS);
      } else {
        setAssets(windows);
      }
    }

    req();
  }, []);

  return (
    <>
      <a
        href={assets[0]?.browser_download_url}
        target="_blank"
        className="mt-10 min-w-[280px] cursor-pointer rounded-full bg-blue-400 px-12 py-3 text-center font-semibold text-neutral-900 hover:bg-blue-500 active:bg-blue-600"
      >
        Download for {platform}
      </a>

      {assets.map((asset) => (
        <a
          key={asset.name}
          href={asset.browser_download_url}
          target="_blank"
          className="pt-2 text-center text-sm text-neutral-500 hover:text-neutral-300"
        >
          {asset.name}
        </a>
      ))}
    </>
  );
}