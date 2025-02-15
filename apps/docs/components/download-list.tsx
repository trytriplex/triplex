/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
  apple: (
    <object
      aria-label="macOS"
      className="pointer-events-none h-10 w-10"
      data="/logos/mac.svg"
      role="img"
      type="image/svg+xml"
    />
  ),
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
          ? "border-brand border-2"
          : "border-neutral border",
      ])}
    >
      <div className="text-subtlest w-9 flex-shrink-0">{logo}</div>
      <div className="flex flex-col">
        <span className="text-default text-base font-medium">{title}</span>
        <span className="text-subtlest text-base">{subtitle}</span>
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
          forwardURL = "/docs/get-started?dl=linux";
        } else if (asset.name.includes("dmg")) {
          logo = logos.apple;
          forwardURL = "/docs/get-started?dl=macos";
        } else if (asset.name.includes("exe")) {
          logo = logos.windows;
          forwardURL = "/docs/get-started?dl=windows";
        }

        const winget = asset.name.includes("exe") && (
          <AssetDownload
            action={
              <a
                className="text-inverse bg-brand ml-auto flex-shrink-0 rounded px-4 py-1 text-base font-medium"
                href="https://winstall.app/apps/Triplex.Triplex"
                onClick={(e) => {
                  beginDownload(e, "/docs/get-started?dl=winget");
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
                  className="text-inverse bg-brand ml-auto rounded px-4 py-1 text-base font-medium"
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
            className="text-inverse bg-brand ml-auto flex-shrink-0 rounded px-4 py-1 text-base font-medium"
            href="https://marketplace.visualstudio.com/items?itemName=trytriplex.triplex-vsce"
            onClick={(e) => {
              beginDownload(e, "/docs/get-started?dl=vsce");
            }}
            rel="noreferrer"
            target="_blank"
          >
            Visit marketplace
          </a>
        }
        logo={logos.vscode}
        subtitle={
          <>
            Find on the Visual Studio marketplace. Using Cursor?{" "}
            <a
              className="text-link text-base hover:underline"
              href="https://www.cursor.com/how-to-install-extension"
              rel="noreferrer"
              target="_blank"
            >
              Follow their installation guide.
            </a>
          </>
        }
        title="Install for Visual Studio Code / Cursor"
      />
      <Suspense fallback={fallbackListItems}>
        <List />
      </Suspense>
    </div>
  );
}
