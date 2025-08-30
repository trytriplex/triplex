/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Image from "next/image";
import { cn } from "../util/cn";
import { useBeginDownloadURL } from "../util/download";

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
        "flex flex-col items-start gap-4 rounded-md p-4 md:flex-row md:items-center",
        variant === "highlight"
          ? "border-brand border-2"
          : "border-neutral border",
      ])}
    >
      <div className="text-subtlest w-9 flex-shrink-0">{logo}</div>
      <div className="mr-auto flex flex-col">
        <span className="text-default text-base font-medium">{title}</span>
        <span className="text-subtlest text-base">{subtitle}</span>
      </div>
      {action}
    </div>
  );
}

export function DownloadList() {
  const beginDownload = useBeginDownloadURL();
  return (
    <div className="mx-auto mt-16 flex w-full max-w-xl flex-col gap-6 pb-20">
      <AssetDownload
        action={
          <a
            className="text-inverse bg-brand flex-shrink-0 rounded px-4 py-1 text-base font-medium"
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
        subtitle="Find on the Visual Studio marketplace."
        title="Install for Visual Studio Code"
      />
    </div>
  );
}
