/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Image from "next/image";
import { Fragment, Suspense } from "react";
import { suspend } from "suspend-react";
import { cn } from "../util/cn";
import { useBeginDownloadURL } from "../util/download";
import { DownloadButton } from "./download-button";

interface Release {
  assets: {
    browser_download_url: string;
    id: number;
    name: string;
    size: number;
  }[];
  published_at: string;
  tag_name: string;
}

function extname(path: string) {
  return path.split(".").at(-1) || "";
}

const logos = {
  apple: <Image alt="macOS" height={40} src="/logos/mac.svg" width={40} />,
  linux: <Image alt="Linux" height={40} src="/logos/linux.png" width={40} />,
  vscode: (
    <Image
      alt="Visual Studio Code"
      height={40}
      priority
      src="/logos/vscode.svg"
      width={40}
    />
  ),
  windows: (
    <Image alt="Windows" height={40} src="/logos/windows.svg" width={40} />
  ),
};

function AssetDownload({
  action,
  logo,
  subtitle,
  title,
  variant = "default",
}: {
  action: React.ReactNode;
  logo: React.ReactNode;
  subtitle: React.ReactNode;
  title: React.ReactNode;
  variant?: "default" | "highlight";
}) {
  return (
    <div
      className={cn([
        "flex items-center gap-4 rounded-md p-4",
        variant === "highlight"
          ? "border-2 border-blue-400"
          : "border border-neutral-700",
      ])}
    >
      <div className="w-9 text-neutral-400">{logo}</div>
      <div className="flex flex-col">
        <span className="font-medium text-neutral-200">{title}</span>
        <span className="text-neutral-400">{subtitle}</span>
      </div>
      {action}
    </div>
  );
}

function List() {
  const beginDownload = useBeginDownloadURL();
  const release: Release = suspend(
    () =>
      fetch(
        "https://api.github.com/repos/try-triplex/triplex/releases/latest",
      ).then((res) => res.json()),
    [],
  );

  const downloadableAssets = release.assets
    .filter((asset) => ["AppImage", "exe", "dmg"].includes(extname(asset.name)))
    .sort((a, b) =>
      new Intl.Collator().compare(extname(b.name), extname(a.name)),
    );

  return (
    <>
      {downloadableAssets.map((asset) => {
        let logo: React.ReactNode = null;
        let forwardURL = "";

        if (asset.name.includes("AppImage")) {
          logo = logos.linux;
          forwardURL = "/docs/overview?dl=linux";
        } else if (asset.name.includes("dmg")) {
          logo = logos.apple;
          forwardURL = "/docs/overview?dl=macos";
        } else if (asset.name.includes("exe")) {
          logo = logos.windows;
          forwardURL = "/docs/overview?dl=windows";
        }

        const winget = asset.name.includes("exe") && (
          <AssetDownload
            action={
              <a
                className="ml-auto flex-shrink-0 rounded bg-blue-400 px-3 py-1 font-medium text-neutral-900"
                href="https://winstall.app/apps/Triplex.Triplex"
                onClick={(e) => {
                  beginDownload(e, "/docs/overview?dl=winget");
                }}
                rel="noreferrer"
                target="_blank"
              >
                Visit winstall
              </a>
            }
            logo={logos.windows}
            subtitle="Use the CLI command available on Windows."
            title="Install with WinGet"
          />
        );

        return (
          <Fragment key={asset.name}>
            <AssetDownload
              action={
                <a
                  className="ml-auto rounded bg-blue-400 px-3 py-1 font-medium text-neutral-900"
                  href={asset.browser_download_url}
                  onClick={(e) => {
                    beginDownload(e, forwardURL);
                  }}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download
                </a>
              }
              logo={logo}
              subtitle={`${Math.round(asset.size / 1024 / 1024)} MB`}
              title={asset.name}
            />
            {winget}
          </Fragment>
        );
      })}
    </>
  );
}

const fallbackListItems = Array(6)
  .fill(undefined)
  .map((_, i) => (
    <AssetDownload
      action={<div />}
      key={i}
      logo={<div />}
      subtitle={<div className="opacity-0">Loading...</div>}
      title={<div className="opacity-0">Loading...</div>}
    />
  ));

export function DownloadList() {
  const beginDownload = useBeginDownloadURL();
  return (
    <div className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-6">
      <div className="mb-6 flex justify-center">
        <DownloadButton />
      </div>
      <AssetDownload
        action={
          <a
            className="ml-auto flex-shrink-0 rounded bg-blue-400 px-3 py-1 font-medium text-neutral-900"
            href="https://forms.gle/tgM5JJNFrhEC32n98"
            onClick={(e) => {
              beginDownload(e, "/docs/overview?dl=vsce");
            }}
            rel="noreferrer"
            target="_blank"
          >
            Visit marketplace
          </a>
        }
        logo={logos.vscode}
        subtitle="Available on the VS Code marketplace."
        title="Install for VS Code"
      />
      <Suspense fallback={fallbackListItems}>
        <List />
      </Suspense>
    </div>
  );
}
