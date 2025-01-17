/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Image from "next/image";
import { useRouter } from "next/router";

export function DownloadThanks({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  if (typeof router.query["dl"] !== "string") {
    return null;
  }

  const type = ["vsce", "winget"].includes(router.query["dl"])
    ? "Installing"
    : "Downloading";

  return (
    <div className="bg-neutral flex flex-col gap-2.5 px-6 py-8">
      <span className="text-default flex gap-4 text-xl font-medium">
        <Image alt="" height={24} src="/logos/logo-icon.svg" width={24} />
        Thanks For {type}
      </span>{" "}
      <span className="text-subtle pl-10 text-lg [&>*:first-child]:mt-0">
        {children}
      </span>
    </div>
  );
}
